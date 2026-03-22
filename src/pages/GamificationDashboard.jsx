import React, { useState } from 'react';
import RankSystem from '../components/gamification/RankSystem';
import TecnoPoints from '../components/gamification/TecnoPoints';
import MysteryBox from '../components/gamification/MysteryBox';
import Leaderboard from '../components/gamification/Leaderboard';
import DailyRoulette from '../components/gamification/DailyRoulette';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut, updatePassword } from 'firebase/auth';

const GamificationDashboard = () => {
    const [isRouletteOpen, setIsRouletteOpen] = useState(false);
    const [points, setPoints] = useState(1250); // Simulated user points
    const [activeTab, setActiveTab] = useState('billetera');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- LÓGICA DE EDICIÓN DE DATOS ---
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ nombre_real: '', telefono: '', gamertag: '' });
    const [isSaving, setIsSaving] = useState(false);

    // --- LÓGICA DE SEGURIDAD (CONTRASEÑA) ---
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

    // Cuando los datos cargan, pre-llenamos el formulario
    useEffect(() => {
        if (userData) {
            setEditForm({
                nombre_real: userData.nombre_real || '',
                telefono: userData.telefono || '',
                gamertag: userData.gamertag || ''
            });
        }
    }, [userData]);

    const handleSaveData = async () => {
        setIsSaving(true);
        try {
            const userRef = doc(db, "usuarios", auth.currentUser.uid);
            await updateDoc(userRef, editForm);
            setUserData(prev => ({ ...prev, ...editForm }));
            setIsEditing(false);
            alert("¡Datos actualizados con éxito!");
        } catch (error) {
            alert("Error al guardar los datos.");
        }
        setIsSaving(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsChangingPwd(true);
        setPwdMessage({ type: '', text: '' });
        try {
            await updatePassword(auth.currentUser, newPassword);
            setPwdMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
            setNewPassword('');
        } catch (error) {
            setPwdMessage({ type: 'error', text: 'Error: Debes haber iniciado sesión recientemente para hacer esto. Cierra sesión y vuelve a entrar.' });
        }
        setIsChangingPwd(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                    Mi Perfil Gamer
                </h1>
                <p className="text-gray-400 mt-2">Sube de nivel, gana puntos y obtén recompensas exclusivas.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Rank */}
                <div className="lg:col-span-1 space-y-8">
                    <TecnoPoints points={points} pointsPending={150} />
                    <RankSystem userPoints={points} />
                    <div className="bg-[#11111a] border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => setIsRouletteOpen(true)}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-xl font-bold font-orbitron text-white mb-2 relative z-10">Ruleta Diaria</h3>
                        <p className="text-sm text-gray-400 relative z-10 mb-4">Gira gratis y gana asegurado hoy.</p>
                        <button className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg relative z-10 shadow-lg group-hover:bg-indigo-500 transition-colors">
                            Jugar Ahora
                        </button>
                    </div>
                </div>

                {/* Right Column: Loot Boxes & Leaderboard */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold font-orbitron text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                            <span className="w-8 h-1 bg-cyan-400 rounded-full"></span> 
                            Cajas de Botín
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MysteryBox isPremium={false} onOpen={(reward) => alert("Recibiste: " + reward.name)} />
                            <MysteryBox isPremium={true} onOpen={(reward) => alert("Recibiste: " + reward.name)} />
                        </div>
                    </div>

                    <div className="pt-6">
                        <Leaderboard />
                    </div>
                </div>
            </div>

            <DailyRoulette 
                isOpen={isRouletteOpen} 
                onClose={() => setIsRouletteOpen(false)} 
                onWin={(prize) => {
                    if (prize.type === 'points') setPoints(prev => prev + prize.value);
                }} 
            />
        </div>
    );
};

export default GamificationDashboard;
