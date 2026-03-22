import React, { useState, useEffect } from 'react';
import RankSystem from '../components/gamification/RankSystem';
import TecnoPoints from '../components/gamification/TecnoPoints';
import MysteryBox from '../components/gamification/MysteryBox';
import Leaderboard from '../components/gamification/Leaderboard';
import DailyRoulette from '../components/gamification/DailyRoulette';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Wallet, LogOut, Loader, Settings, Edit3 } from 'lucide-react';

const GamificationDashboard = () => {
    const [isRouletteOpen, setIsRouletteOpen] = useState(false);
    
    // --- ESTADOS PRINCIPALES ---
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

    // --- CARGA DE DATOS DESDE FIREBASE ---
    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error al cargar el perfil:", error);
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchUserData();
            else { setLoading(false); navigate('/login'); }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Cuando los datos cargan, pre-llenamos el formulario de edición
    useEffect(() => {
        if (userData) {
            setEditForm({
                nombre_real: userData.nombre_real || '',
                telefono: userData.telefono || '',
                gamertag: userData.gamertag || ''
            });
        }
    }, [userData]);

    // --- FUNCIONES DE ACCIÓN ---
    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

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

    if (loading) {
        return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><Loader className="animate-spin text-indigo-500" size={48} /></div>;
    }

    const TABS = [
        { id: 'billetera', name: 'Mi Billetera & Casino', icon: Wallet },
        { id: 'datos', name: 'Mis Datos', icon: User },
        { id: 'seguridad', name: 'Seguridad 2FA', icon: Shield },
    ];

    // Calculamos los puntos reales (si no tiene, mostramos 0, ya no simulamos)
    const currentPoints = userData?.tecnoPoints || 0;

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
                <p className="text-gray-400 mt-2">Gestiona tu cuenta, sube de nivel y obtén recompensas exclusivas.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* 📱 SIDEBAR / MENÚ LATERAL */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#11111a] border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-600 p-1">
                                <img src={auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.gamertag || 'User'}`} alt="Avatar" className="w-full h-full rounded-full bg-gray-900" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-white">{userData?.gamertag || userData?.nombre_real || 'Usuario'}</h2>
                                <p className="text-xs text-gray-400 font-mono">{auth.currentUser?.email}</p>
                                {userData?.kyc_verificado && (
                                    <span className="inline-flex items-center justify-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full mt-3 font-bold uppercase tracking-wider">
                                        <Shield size={10} /> KYC Nivel 1
                                    </span>
                                )}
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'}`}
                                >
                                    <tab.icon size={18} />
                                    {tab.name}
                                </button>
                            ))}
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-4 border border-red-500/20">
                                <LogOut size={18} /> Cerrar Sesión
                            </button>
                        </nav>
                    </div>
                </div>

                {/* 🖥️ ÁREA DE CONTENIDO DINÁMICO */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">

                        {/* 💰 PESTAÑA: BILLETERA Y CASINO (TU DISEÑO ORIGINAL) */}
                        {activeTab === 'billetera' && (
                            <motion.div key="billetera" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-8">
                                        <TecnoPoints points={currentPoints} pointsPending={userData?.tecnoPoints_pendientes || 0} />
                                        <RankSystem userPoints={currentPoints} />
                                        <div className="bg-[#11111a] border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => setIsRouletteOpen(true)}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <h3 className="text-xl font-bold font-orbitron text-white mb-2 relative z-10">Ruleta Diaria</h3>
                                            <p className="text-sm text-gray-400 relative z-10 mb-4">Gira gratis y gana asegurado hoy.</p>
                                            <button className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg relative z-10 shadow-lg group-hover:bg-indigo-500 transition-colors">
                                                Jugar Ahora
                                            </button>
                                        </div>
                                    </div>

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
                                        // Aquí en la Fase 4 cambiaremos esto para que conecte con Vercel
                                        alert("Ganaste: " + prize.name);
                                    }} 
                                />
                            </motion.div>
                        )}

                        {/* 👤 PESTAÑA: DATOS PERSONALES VIVOS */}
                        {activeTab === 'datos' && (
                            <motion.div key="datos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-3xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><User className="text-cyan-400"/> Mis Datos</h2>
                                    {!isEditing ? (
                                        <button onClick={() => setIsEditing(true)} className="text-cyan-400 hover:text-cyan-300 text-sm font-bold flex items-center gap-1 bg-cyan-500/10 px-4 py-2 rounded-lg"><Edit3 size={14}/> Editar</button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white text-sm font-bold px-4 py-2">Cancelar</button>
                                            <button onClick={handleSaveData} disabled={isSaving} className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                                {isSaving ? <Loader size={14} className="animate-spin" /> : 'Guardar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Nombre Completo</p>
                                        {isEditing ? <input type="text" value={editForm.nombre_real} onChange={e => setEditForm({...editForm, nombre_real: e.target.value})} className="w-full bg-black border border-cyan-500/50 rounded p-2 text-white" /> : <p className="font-mono text-white">{userData?.nombre_real || 'No registrado'}</p>}
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Teléfono</p>
                                        {isEditing ? <input type="tel" value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} className="w-full bg-black border border-cyan-500/50 rounded p-2 text-white" /> : <p className="font-mono text-white">{userData?.telefono || 'No registrado'}</p>}
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Gamertag</p>
                                        {isEditing ? <input type="text" value={editForm.gamertag} onChange={e => setEditForm({...editForm, gamertag: e.target.value})} className="w-full bg-black border border-cyan-500/50 rounded p-2 text-cyan-400" /> : <p className="font-mono text-cyan-400">{userData?.gamertag || 'No registrado'}</p>}
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 opacity-70">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Correo (No Editable)</p>
                                        <p className="font-mono text-gray-400">{auth.currentUser?.email}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 🔒 PESTAÑA: SEGURIDAD ACTIVA */}
                        {activeTab === 'seguridad' && (
                            <motion.div key="seguridad" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-3xl p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><Shield className="text-green-500"/> Seguridad de la Cuenta</h2>
                                
                                <div className="space-y-6">
                                    <form onSubmit={handleChangePassword} className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                            <div>
                                                <h3 className="font-bold text-white mb-1">Cambiar Contraseña</h3>
                                                <p className="text-sm text-gray-400">Usa una contraseña fuerte y no la compartas.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <input type="password" required minLength={6} placeholder="Nueva Contraseña..." value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black border border-gray-700 focus:border-indigo-500 rounded-lg p-3 text-white" />
                                            <button type="submit" disabled={isChangingPwd || !newPassword} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors whitespace-nowrap">
                                                {isChangingPwd ? 'Actualizando...' : 'Actualizar'}
                                            </button>
                                        </div>
                                        {pwdMessage.text && (
                                            <p className={`mt-3 text-sm font-bold ${pwdMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                                {pwdMessage.text}
                                            </p>
                                        )}
                                    </form>

                                    <div className="bg-gradient-to-r from-gray-900 to-indigo-900/20 p-6 rounded-xl border border-indigo-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h3 className="font-bold text-indigo-400 mb-1 flex items-center gap-2"><Settings size={16}/> Verificación en 2 Pasos (2FA)</h3>
                                            <p className="text-sm text-gray-400">Protege tus TecnoPoints de accesos no autorizados.</p>
                                        </div>
                                        <button className="px-6 py-2 bg-gray-800 text-gray-400 border border-gray-700 font-bold rounded-lg cursor-not-allowed whitespace-nowrap flex items-center gap-2">
                                            Próximamente
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default GamificationDashboard;
