import React, { useState, useEffect, useRef } from 'react';
import RankSystem from '../components/gamification/RankSystem';
import TecnoPoints from '../components/gamification/TecnoPoints';
import MysteryBox from '../components/gamification/MysteryBox';
import Leaderboard from '../components/gamification/Leaderboard';
import DailyRoulette from '../components/gamification/DailyRoulette';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from './firebase'; // Importamos storage
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Wallet, LogOut, Loader, Settings, Edit3, Store, Camera, Trash2, Smartphone, QrCode, UploadCloud, X } from 'lucide-react';

// Generamos 50 avatares con 5 estilos de arte diferentes
const PRESET_AVATARS = [
    ...Array.from({ length: 10 }, (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer${i}&backgroundColor=b6e3f4,c0aede,d1d4f9`),
    ...Array.from({ length: 10 }, (_, i) => `https://api.dicebear.com/7.x/bottts/svg?seed=Mecha${i}&backgroundColor=ffdfbf,c0aede`),
    ...Array.from({ length: 10 }, (_, i) => `https://api.dicebear.com/7.x/micah/svg?seed=Hero${i}&backgroundColor=ffdfbf,ffd5dc`),
    ...Array.from({ length: 10 }, (_, i) => `https://api.dicebear.com/7.x/lorelei/svg?seed=Legend${i}&backgroundColor=b6e3f4,c0aede`),
    ...Array.from({ length: 10 }, (_, i) => `https://api.dicebear.com/7.x/adventurer/svg?seed=Quest${i}&backgroundColor=ffd5dc,d1d4f9`)
];

const GamificationDashboard = () => {
    const [isRouletteOpen, setIsRouletteOpen] = useState(false);
    
    // --- ESTADOS PRINCIPALES ---
    const [activeTab, setActiveTab] = useState('billetera');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- ESTADOS DE EDICIÓN Y AVATAR ---
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ nombre_real: '', telefono: '', gamertag: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    // --- ESTADOS DE SEGURIDAD Y 2FA ---
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });
    const [twoFAMethod, setTwoFAMethod] = useState(null);

    // --- CARGA DE DATOS ---
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
            setPwdMessage({ type: 'error', text: 'Error: Debes haber iniciado sesión recientemente. Cierra sesión y vuelve a entrar.' });
        }
        setIsChangingPwd(false);
    };

    // --- MOTOR DE FOTOS DE PERFIL ---
    const handleUpdateAvatar = async (url) => {
        try {
            await updateProfile(auth.currentUser, { photoURL: url });
            await updateDoc(doc(db, "usuarios", auth.currentUser.uid), { avatar: url });
            setUserData(prev => ({ ...prev, avatar: url }));
            setShowAvatarModal(false);
            alert("¡Foto de perfil actualizada!");
        } catch (error) {
            alert("Error al actualizar la foto en la base de datos.");
        }
    };

    const handleDeleteAvatar = async () => {
        await handleUpdateAvatar(""); // Volver a la por defecto
    };

    const handleCustomUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Límite estricto de 5 Megabytes
        if (file.size > 5 * 1024 * 1024) {
            alert("⚠️ La imagen excede el límite de 5MB. Por favor, sube una foto más ligera.");
            e.target.value = '';
            return;
        }

        setIsUploadingPhoto(true);
        try {
            const storageRef = ref(storage, `avatars/${auth.currentUser.uid}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            await handleUpdateAvatar(downloadURL);
        } catch (error) {
            console.error(error);
            alert("Error al subir la imagen. Verifica que Firebase Storage esté activado.");
        }
        setIsUploadingPhoto(false);
        e.target.value = ''; // Limpiar el input
    };

    const handleStart2FASetup = (method) => {
        setTwoFAMethod(method);
        alert(`Iniciando configuración de 2FA por ${method === 'app' ? 'Google Authenticator' : 'SMS'}. (Conectando con Vercel...)`);
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><Loader className="animate-spin text-indigo-500" size={48} /></div>;
    }

    const TABS = [
        { id: 'billetera', name: 'Mi Billetera & Casino', icon: Wallet },
        { id: 'datos', name: 'Mis Datos', icon: User },
        { id: 'seguridad', name: 'Seguridad 2FA', icon: Shield },
    ];

    const currentPoints = userData?.tecnoPoints || 0;
    const currentAvatar = auth.currentUser?.photoURL || userData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.gamertag || 'User'}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                    Mi Perfil Gamer
                </h1>
                <p className="text-gray-400 mt-2">Gestiona tu cuenta, sube de nivel y obtén recompensas exclusivas.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* 📱 SIDEBAR / MENÚ LATERAL */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#11111a] border border-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
                        
                        <div className="flex flex-col items-center gap-4 mb-6 relative group">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-600 p-1 relative cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                                <img src={currentAvatar} alt="Avatar" className="w-full h-full rounded-full bg-gray-900 object-cover" />
                                <div className="absolute inset-1 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
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
                            
                            <div className="w-full h-px bg-gray-800 my-4"></div>

                            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20">
                                <Store size={18} /> Ir a la Tienda
                            </button>

                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-red-400 hover:bg-red-500/10 mt-2 border border-red-500/20">
                                <LogOut size={18} /> Cerrar Sesión
                            </button>
                        </nav>
                    </div>
                </div>

                {/* 🖥️ ÁREA DE CONTENIDO DINÁMICO */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">

                        {/* 💰 PESTAÑA: BILLETERA */}
                        {activeTab === 'billetera' && (
                            <motion.div key="billetera" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-6">
                                        
                                        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30 p-6 rounded-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={60} className="text-green-500" /></div>
                                            <h3 className="text-gray-300 font-bold tracking-wide mb-2 flex items-center gap-2"><Wallet className="text-green-400 w-5 h-5" /> Saldo TNB (USD)</h3>
                                            <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-4">${(userData?.saldo_tnb || 0).toFixed(2)}</div>
                                            <div className="mt-4 pt-4 border-t border-green-500/20">
                                                <p className="text-[10px] uppercase text-green-400 font-bold tracking-wider mb-2">Canjear Tarjeta de Regalo</p>
                                                <div className="flex gap-2">
                                                    <input type="text" placeholder="Código" className="w-full bg-black/50 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase outline-none" />
                                                    <button onClick={() => alert("Conectando con Vercel...")} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Canjear</button>
                                                </div>
                                            </div>
                                        </div>

                                        <TecnoPoints points={currentPoints} pointsPending={userData?.tecnoPoints_pendientes || 0} />
                                        <RankSystem userPoints={currentPoints} />
                                        
                                        <div className="bg-[#11111a] border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => setIsRouletteOpen(true)}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <h3 className="text-xl font-bold font-orbitron text-white mb-2 relative z-10">Ruleta Diaria</h3>
                                            <p className="text-sm text-gray-400 relative z-10 mb-4">Gira gratis y gana asegurado hoy.</p>
                                            <button className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg relative z-10 shadow-lg group-hover:bg-indigo-500 transition-colors">Jugar Ahora</button>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8">
                                        <div>
                                            <h2 className="text-2xl font-bold font-orbitron text-white mb-6 uppercase tracking-wider flex items-center gap-3"><span className="w-8 h-1 bg-cyan-400 rounded-full"></span> Cajas de Botín</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <MysteryBox isPremium={false} onOpen={(reward) => alert("Recibiste: " + reward.name)} />
                                                <MysteryBox isPremium={true} onOpen={(reward) => alert("Recibiste: " + reward.name)} />
                                            </div>
                                        </div>
                                        <div className="pt-6"><Leaderboard /></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 👤 PESTAÑA: DATOS PERSONALES */}
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

                        {/* 🔒 PESTAÑA: SEGURIDAD Y 2FA */}
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
                                    </form>

                                    <div className="bg-gradient-to-r from-gray-900 to-indigo-900/20 p-6 rounded-xl border border-indigo-500/30">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                            <div>
                                                <h3 className="font-bold text-indigo-400 mb-1 flex items-center gap-2"><Settings size={16}/> Verificación en 2 Pasos (2FA)</h3>
                                                <p className="text-sm text-gray-400">Añade una capa extra de seguridad a tu Saldo TNB y tus TecnoPoints.</p>
                                            </div>
                                            {userData?.twoFactorEnabled ? (
                                                <span className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/50 font-bold rounded-full text-xs flex items-center gap-2">
                                                    <Shield size={14} /> Activo
                                                </span>
                                            ) : (
                                                <span className="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/50 font-bold rounded-full text-xs">Desactivado</span>
                                            )}
                                        </div>

                                        {!userData?.twoFactorEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button onClick={() => handleStart2FASetup('app')} className="p-4 border border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/10 transition-all text-left flex items-start gap-4">
                                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><QrCode size={24} /></div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">App de Autenticación</h4>
                                                        <p className="text-xs text-gray-400 mt-1">Usa Google Authenticator o Authy (Recomendado).</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => handleStart2FASetup('sms')} className="p-4 border border-gray-700 rounded-xl hover:border-cyan-500 hover:bg-cyan-500/10 transition-all text-left flex items-start gap-4">
                                                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><Smartphone size={24} /></div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">Mensaje SMS</h4>
                                                        <p className="text-xs text-gray-400 mt-1">Recibe un código por mensaje de texto.</p>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MODAL DE SELECCIÓN DE AVATAR (AHORA CON SUBIDA LOCAL Y 50 OPCIONES) */}
            <AnimatePresence>
                {showAvatarModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#11111a] border border-gray-800 p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><User className="text-cyan-400"/> Personaliza tu Avatar</h3>
                                <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                            </div>

                            {/* ZONA DE SUBIDA LOCAL (Hasta 5MB) */}
                            <div className="mb-6 p-4 border-2 border-dashed border-indigo-500/30 rounded-xl bg-indigo-500/5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-white font-bold text-sm">Subir Foto Propia</h4>
                                    <p className="text-xs text-gray-400 mt-1">Sube una imagen desde tu dispositivo (Máx 5MB).</p>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleCustomUpload}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isUploadingPhoto ? <Loader className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                                    {isUploadingPhoto ? 'Subiendo...' : 'Seleccionar Archivo'}
                                </button>
                            </div>

                            {/* GRILLA DE 50 AVATARES */}
                            <div className="overflow-y-auto pr-2 hide-scrollbar">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">O Elige un Avatar Predeterminado</p>
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-4">
                                    {PRESET_AVATARS.map((url, idx) => (
                                        <img key={idx} src={url} alt={`Avatar ${idx}`} onClick={() => handleUpdateAvatar(url)} className="w-full aspect-square rounded-full bg-gray-900 border-2 border-transparent hover:border-cyan-400 cursor-pointer transition-all hover:scale-110" />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-4 shrink-0">
                                <button onClick={handleDeleteAvatar} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg transition-colors">
                                    <Trash2 size={16} /> Eliminar Foto
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DailyRoulette 
                isOpen={isRouletteOpen} 
                onClose={() => setIsRouletteOpen(false)} 
                userUid={auth.currentUser?.uid}
                onWin={async (prize) => {
                    const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
                    if(userDoc.exists()) setUserData(userDoc.data());
                }} 
            />
        </div>
    );
};

export default GamificationDashboard;
