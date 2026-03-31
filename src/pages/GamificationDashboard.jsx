import React, { useState, useEffect, useRef } from 'react';
import RankSystem from '../components/gamification/RankSystem';
import TecnoPoints from '../components/gamification/TecnoPoints';
import MysteryBox from '../components/gamification/MysteryBox';
import Leaderboard from '../components/gamification/Leaderboard';
import DailyRoulette from '../components/gamification/DailyRoulette';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from './firebase'; // Importamos storage
// INYECCIÓN: Agregadas herramientas de búsqueda de Firestore
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
// INYECCIÓN: Agregados iconos de historial
import axios from 'axios';
import { startRegistration } from '@simplewebauthn/browser';
import { User, Shield, Wallet, LogOut, Loader, Settings, Edit3, Store, Camera, Trash2, Smartphone, QrCode, UploadCloud, X, History, ArrowUpRight, ArrowDownRight, CalendarDays, Lock, CheckCircle2, AlertTriangle, Mail, Fingerprint } from 'lucide-react';

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
    
    // --- INYECCIÓN: ESTADOS PARA LÓGICA REAL DE 2FA ---
    const [twoFAMethod, setTwoFAMethod] = useState(null);
    const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
    const [setupStep, setSetupStep] = useState(1); // 1: QR, 2: Exito
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [tempSecret, setTempSecret] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [isProcessing2FA, setIsProcessing2FA] = useState(false);
    const [error2FA, setError2FA] = useState('');

    // --- ESTADOS PARA EL CANJE DE BILLETERA ---
    const [giftCode, setGiftCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    // --- ESTADOS PARA EL HISTORIAL DE BILLETERA ---
    const [isWalletHistoryOpen, setIsWalletHistoryOpen] = useState(false);
    const [walletHistory, setWalletHistory] = useState([]);
    const [isLoadingWalletHistory, setIsLoadingWalletHistory] = useState(false);

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

    // =================================================================
    // --- 🎁 INYECCIÓN: GATILLO SILENCIOSO PARA CAJA MENSUAL VIP ---
    // =================================================================
    useEffect(() => {
        const reclamarCajaMensual = async () => {
            // Solo intentamos si ya cargó el usuario y tenemos su ID
            if (auth.currentUser && userData) {
                try {
                    const response = await axios.post('https://api-paypal-secure.vercel.app/api/gamification/check-monthly-box', {
                        userId: auth.currentUser.uid
                    });

                    // Si el servidor dice que sí le tocaba y se la acaba de asignar:
                    if (response.data.success && response.data.claimed) {
                        // 1. Alerta de celebración
                        alert(`💎 ¡Beneficio VIP! ${response.data.message}\nRevisa tu inventario de cajas de botín.`);
                        
                        // 2. Refrescamos los datos en tiempo real para que la caja aparezca sin recargar la página
                        const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
                        if(userDoc.exists()) setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Escáner de caja mensual VIP falló silenciosamente:", error);
                }
            }
        };

        // Ejecutar el escáner (usamos un setTimeout pequeño para no entorpecer la carga principal)
        const temporizador = setTimeout(() => {
            reclamarCajaMensual();
        }, 2000);

        return () => clearTimeout(temporizador);
    }, [auth.currentUser?.uid]); 
    // =================================================================

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
        await handleUpdateAvatar(""); 
    };

    const handleCustomUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
        e.target.value = ''; 
    };

    const handleStart2FASetup = async (method) => {
        if (method === 'passkey') {
            setTwoFAMethod(method);
            setIs2FASetupOpen(true);
            setIsProcessing2FA(true);
            setError2FA('');
            
            try {
                // 1. Pedir el "Desafío" de seguridad al servidor
                const resOpts = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-passkey-register-start', {
                    userId: auth.currentUser.uid,
                    email: auth.currentUser.email || userData?.email
                });

                if (!resOpts.data.success) {
                    setError2FA('Error obteniendo parámetros de seguridad biométrica.');
                    setIsProcessing2FA(false);
                    return;
                }

                // 2. DESPERTAR LOS SENSORES DEL DISPOSITIVO (Huella, FaceID, PIN)
                let attResp;
                try {
                    attResp = await startRegistration(resOpts.data.options);
                } catch (error) {
                    if (error.name === 'NotAllowedError') {
                        setError2FA('Cancelaste la verificación o tu dispositivo la bloqueó.');
                    } else {
                        setError2FA('Tu dispositivo no soporta Llaves de Acceso o hubo un error.');
                    }
                    setIsProcessing2FA(false);
                    return;
                }

                // 3. Enviar la firma biométrica al servidor para guardarla
                const resFinish = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-passkey-register-finish', {
                    userId: auth.currentUser.uid,
                    response: attResp,
                    isSetup: true
                });

                if (resFinish.data.success) {
                    setSetupStep(2); // ¡Éxito! Pantalla verde.
                    setUserData(prev => ({ ...prev, twoFactorSecret: 'PASSKEY_ENABLED', twoFactorType: 'passkey' }));
                } else {
                    setError2FA('El servidor rechazó la firma biométrica.');
                }
            } catch (err) {
                setError2FA(err.response?.data?.message || 'Error de conexión con el servidor.');
            }
            setIsProcessing2FA(false);
            return;
        }

        setTwoFAMethod(method);
        setIs2FASetupOpen(true);
        setIsProcessing2FA(true);
        setError2FA('');
        setSetupStep(1);

        try {
            if (method === 'email') {
                // 1. Aseguramos que tenemos un correo al cual enviar
                const emailToSend = auth.currentUser.email || userData?.email;
                if (!emailToSend) {
                    setError2FA('Tu cuenta no tiene un correo electrónico válido registrado.');
                    setIsProcessing2FA(false);
                    return;
                }

                // 2. Usamos AXIOS (Adiós a los errores de paquetes vacíos)
                const res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-generate', { 
                    userId: auth.currentUser.uid, 
                    email: emailToSend 
                });
                
                // Si la respuesta es exitosa, se queda en el paso 1 esperando el código
                if (!res.data.success) {
                    setError2FA('Error enviando el correo.');
                }
            } 
            else if (method === 'app') {
                const idToken = await auth.currentUser.getIdToken(true);
                const res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-generate', 
                    {}, // Body vacío
                    { headers: { 'Authorization': `Bearer ${idToken}` } }
                );
                
                if (res.data.success) {
                    setQrCodeUrl(res.data.qrCodeUrl);
                    setTempSecret(res.data.secret);
                } else {
                    setError2FA('Error al generar el código QR.');
                }
            }
        } catch (err) {
            setError2FA(err.response?.data?.message || 'Error de conexión con el servidor.');
        }
        setIsProcessing2FA(false);
    };

    // --- INYECCIÓN: DESACTIVAR 2FA ---
    const handleDisable2FA = async () => {
        const confirmacion = window.confirm("⚠️ ¿Seguro que deseas desactivar la Verificación en 2 Pasos? Tu Saldo TNB y tus TecnoPoints quedarán menos protegidos frente a accesos no autorizados.");
        if (!confirmacion) return;

        try {
            await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
                twoFactorSecret: null,
                twoFactorType: null
            });
            setUserData(prev => ({ ...prev, twoFactorSecret: null, twoFactorType: null }));
            alert("✅ Seguridad 2FA desactivada correctamente.");
        } catch (error) {
            console.error("Error desactivando 2FA:", error);
            alert("Hubo un error al desactivar la seguridad.");
        }
    };

    const handleVerify2FACode = async (e) => {
        e.preventDefault();
        if (authCode.length < 6) return;
        setIsProcessing2FA(true);
        setError2FA('');

        try {
            let res;
            if (twoFAMethod === 'email') {
                // VERIFICACIÓN DE CORREO USANDO AXIOS
                res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-verify', { 
                    userId: auth.currentUser.uid, 
                    codigo: authCode, 
                    isSetup: true 
                });
            } else {
                // VERIFICACIÓN DE APP USANDO AXIOS
                const idToken = await auth.currentUser.getIdToken(true);
                res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-verify', 
                    { codigo: authCode, secret: tempSecret },
                    { headers: { 'Authorization': `Bearer ${idToken}` } }
                );
            }

            if (res.data.success) {
                setSetupStep(2);
                const secretValue = twoFAMethod === 'email' ? 'EMAIL_OTP_ENABLED' : tempSecret;
                setUserData(prev => ({ ...prev, twoFactorSecret: secretValue, twoFactorType: twoFAMethod })); 
            }
        } catch (err) {
            setError2FA(err.response?.data?.message || 'Código incorrecto. Intenta de nuevo.');
        }
        setIsProcessing2FA(false);
    };

    const handleRedeemGiftCard = async () => {
        if (!giftCode.trim()) {
            alert("Por favor, ingresa un código.");
            return;
        }

        setIsRedeeming(true);
        try {
            const response = await axios.post('https://api-paypal-secure.vercel.app/api/gamification/redeem-giftcard', {
                userId: auth.currentUser.uid,
                code: giftCode
            });

            if (response.data.success) {
                setUserData(prev => ({ ...prev, saldo_tnb: response.data.newBalance }));
                setGiftCode(''); 
                alert(response.data.message); 
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error de conexión con la bóveda de saldo.");
        }
        setIsRedeeming(false);
    };

    const handleOpenWalletHistory = async () => {
        setIsWalletHistoryOpen(true);
        if (!auth.currentUser) return;
        setIsLoadingWalletHistory(true);
        try {
            const q = query(
                collection(db, "usuarios", auth.currentUser.uid, "historial_billetera"),
                orderBy("timestamp", "desc"),
                limit(30)
            );
            const querySnapshot = await getDocs(q);
            const historyData = [];
            querySnapshot.forEach((doc) => {
                historyData.push({ id: doc.id, ...doc.data() });
            });
            setWalletHistory(historyData);
        } catch (error) {
            console.error("Error cargando historial de billetera:", error);
        }
        setIsLoadingWalletHistory(false);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="animate-spin text-indigo-600" size={48} /></div>;
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
                <h1 className="text-4xl md:text-6xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 uppercase tracking-widest drop-shadow-sm">
                    Mi Perfil Gamer
                </h1>
                <p className="text-slate-500 font-medium mt-3 text-lg">Gestiona tu cuenta, sube de nivel y obtén recompensas exclusivas.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* 📱 SIDEBAR / MENÚ LATERAL */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500"></div>
                        
                        <div className="flex flex-col items-center gap-4 mb-6 relative group">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 p-1 relative cursor-pointer shadow-md" onClick={() => setShowAvatarModal(true)}>
                                <img src={currentAvatar} alt="Avatar" className="w-full h-full rounded-full bg-slate-100 object-cover border-2 border-white" />
                                <div className="absolute inset-1 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">{userData?.gamertag || userData?.nombre_real || 'Usuario'}</h2>
                                <p className="text-xs text-slate-500 font-mono mt-1">{auth.currentUser?.email}</p>
                                {userData?.kyc_verificado && (
                                    <span className="inline-flex items-center justify-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mt-3 font-bold uppercase tracking-wider shadow-sm">
                                        <Shield size={10} className="text-emerald-500"/> KYC Nivel 1
                                    </span>
                                )}
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
                                >
                                    <tab.icon size={18} />
                                    {tab.name}
                                </button>
                            ))}
                            
                           {/* --- INYECCIÓN: BOTÓN VORTEX PAY ALINEADO --- */}
                            <button
                                onClick={() => window.location.href = 'https://www.tecnobyte.lat/vortex-pay'}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 shadow-sm"
                            >
                                <img src="/vertexpay.png" alt="Vortex Pay" className="w-[19px] h-[19px] object-contain drop-shadow-sm filter brightness-0" />
                                Vortex Pay
                            </button>

                            <div className="w-full h-px bg-slate-200 my-4"></div>

                            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-indigo-600 hover:bg-indigo-50 border border-indigo-100">
                                <Store size={18} /> Ir a la Tienda
                            </button>

                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-red-600 hover:bg-red-50 mt-2 border border-red-100">
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
                                        
                                        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl relative overflow-hidden group shadow-sm">
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={60} className="text-emerald-600" /></div>
                                            <h3 className="text-emerald-800 font-bold tracking-wide mb-2 flex items-center gap-2"><Wallet className="text-emerald-600 w-5 h-5" /> Saldo TNB (USD)</h3>
                                            
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">${(userData?.saldo_tnb || 0).toFixed(2)}</div>
                                                <button onClick={handleOpenWalletHistory} className="text-[10px] uppercase tracking-wider bg-white text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 font-bold shadow-sm">
                                                    <History size={14} /> Historial
                                                </button>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-emerald-200/60">
                                                <p className="text-[10px] uppercase text-emerald-700 font-bold tracking-wider mb-2">Canjear Tarjeta de Regalo</p>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Código" 
                                                        value={giftCode}
                                                        onChange={(e) => setGiftCode(e.target.value)}
                                                        className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono uppercase outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-inner" 
                                                    />
                                                    <button 
                                                        onClick={handleRedeemGiftCard} 
                                                        disabled={isRedeeming}
                                                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
                                                    >
                                                        {isRedeeming ? <Loader size={16} className="animate-spin" /> : 'Canjear'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <TecnoPoints 
                                            points={currentPoints} 
                                            pointsPending={userData?.tecnoPoints_pendientes || 0} 
                                            onUpdate={async () => {
                                                const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
                                                if(userDoc.exists()) setUserData(userDoc.data());
                                            }}
                                        />
                                        <RankSystem userPoints={userData?.tecnoPoints_acumulados || currentPoints} />
                                        
                                        <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-400 transition-colors cursor-pointer shadow-sm hover:shadow-md" onClick={() => setIsRouletteOpen(true)}>
                                            <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <h3 className="text-xl font-bold font-orbitron text-indigo-900 mb-2 relative z-10">Ruleta Diaria</h3>
                                            <p className="text-sm text-slate-500 font-medium relative z-10 mb-4">Gira gratis y gana asegurado hoy.</p>
                                            <button className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg relative z-10 shadow-md group-hover:bg-indigo-700 transition-colors">Jugar Ahora</button>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8">
                                        <div>
                                            <h2 className="text-2xl font-black font-orbitron text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-3"><span className="w-8 h-1 bg-cyan-500 rounded-full"></span> Cajas de Botín</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <MysteryBox 
                                                    isPremium={false} 
                                                    boxCount={userData?.cajas_normales || 0} 
                                                    userUid={auth.currentUser?.uid}
                                                    onOpen={async () => {
                                                        const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
                                                        if(userDoc.exists()) setUserData(userDoc.data());
                                                    }} 
                                                />
                                                <MysteryBox 
                                                    isPremium={true} 
                                                    boxCount={userData?.cajas_miticas || 0} 
                                                    userUid={auth.currentUser?.uid}
                                                    onOpen={async () => {
                                                        const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
                                                        if(userDoc.exists()) setUserData(userDoc.data());
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-6"><Leaderboard /></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 👤 PESTAÑA: DATOS PERSONALES */}
                        {activeTab === 'datos' && (
                            <motion.div key="datos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><User className="text-indigo-600"/> Mis Datos</h2>
                                    {!isEditing ? (
                                        <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-white hover:bg-indigo-600 text-sm font-bold flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg transition-colors"><Edit3 size={14}/> Editar</button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800 text-sm font-bold px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">Cancelar</button>
                                            <button onClick={handleSaveData} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                                                {isSaving ? <Loader size={14} className="animate-spin" /> : 'Guardar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Nombre Completo</p>
                                        {isEditing ? <input type="text" value={editForm.nombre_real} onChange={e => setEditForm({...editForm, nombre_real: e.target.value})} className="w-full bg-white border border-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg p-3 text-slate-800 shadow-sm" /> : <p className="font-mono text-slate-800 font-medium">{userData?.nombre_real || 'No registrado'}</p>}
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Teléfono</p>
                                        {isEditing ? <input type="tel" value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} className="w-full bg-white border border-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg p-3 text-slate-800 shadow-sm" /> : <p className="font-mono text-slate-800 font-medium">{userData?.telefono || 'No registrado'}</p>}
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-80">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Gamertag (No Editable)</p>
                                        <p className="font-mono text-slate-600 font-medium">{userData?.gamertag || 'No registrado'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-80">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Correo (No Editable)</p>
                                        <p className="font-mono text-slate-600 font-medium">{auth.currentUser?.email}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 🔒 PESTAÑA: SEGURIDAD Y 2FA */}
                        {activeTab === 'seguridad' && (
                            <motion.div key="seguridad" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-800 tracking-tight"><Shield className="text-emerald-500"/> Seguridad de la Cuenta</h2>
                                
                                <div className="space-y-6">
                                    <form onSubmit={handleChangePassword} className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                            <div>
                                                <h3 className="font-bold text-slate-800 mb-1 tracking-tight">Cambiar Contraseña</h3>
                                                <p className="text-sm text-slate-500 font-medium">Usa una contraseña fuerte y no la compartas.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <input type="password" required minLength={6} placeholder="Nueva Contraseña..." value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-3 text-slate-800 outline-none shadow-sm" />
                                            <button type="submit" disabled={isChangingPwd || !newPassword} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors whitespace-nowrap shadow-md">
                                                {isChangingPwd ? 'Actualizando...' : 'Actualizar'}
                                            </button>
                                        </div>
                                        {pwdMessage.text && <p className={`text-xs mt-3 font-bold ${pwdMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{pwdMessage.text}</p>}
                                    </form>

                                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden shadow-sm">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                                            <div>
                                                <h3 className="font-black text-indigo-800 mb-1 flex items-center gap-2 tracking-tight"><Settings size={18} className="text-indigo-600"/> Verificación en 2 Pasos (2FA)</h3>
                                                <p className="text-sm text-slate-600 font-medium">Añade una capa extra de seguridad a tu Saldo TNB y tus TecnoPoints.</p>
                                            </div>
                                            {userData?.twoFactorSecret ? (
                                                <div className="flex items-center gap-3">
                                                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-full text-xs flex items-center gap-2 shadow-sm">
                                                        <Shield size={14} className="text-emerald-500"/> Activo ({userData?.twoFactorType === 'email' ? 'Correo' : userData?.twoFactorType === 'passkey' ? 'Huella/Face ID' : 'App'})
                                                    </span>
                                                    <button onClick={handleDisable2FA} className="px-4 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 font-bold rounded-full text-xs flex items-center gap-2 transition-all shadow-sm">
                                                        <Trash2 size={14}/> Desactivar
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-full text-xs flex items-center gap-2 shadow-sm">
                                                    <AlertTriangle size={14} className="text-amber-500"/> Desactivado
                                                </span>
                                            )}
                                        </div>

                                        {!userData?.twoFactorSecret && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                                                {/* 1. APP AUTHENTICATOR */}
                                                <button onClick={() => handleStart2FASetup('app')} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col gap-3 shadow-sm">
                                                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 w-max border border-indigo-100"><QrCode size={24} /></div>
                                                    <div>
                                                        <h4 className="text-slate-800 font-bold text-sm tracking-tight">App de Autenticación</h4>
                                                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Google Auth / Authy.</p>
                                                    </div>
                                                </button>
                                                
                                                {/* 2. CORREO ELECTRÓNICO */}
                                                <button onClick={() => handleStart2FASetup('email')} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-pink-400 hover:shadow-md transition-all text-left flex flex-col gap-3 shadow-sm">
                                                    <div className="p-3 bg-pink-50 rounded-lg text-pink-600 w-max border border-pink-100"><Mail size={24} /></div>
                                                    <div>
                                                        <h4 className="text-slate-800 font-bold text-sm tracking-tight">Correo (OTP)</h4>
                                                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Recibe un código en tu email.</p>
                                                    </div>
                                                </button>

                                                {/* 3. PASSKEYS (HUELLA / FACE ID) */}
                                                <button onClick={() => handleStart2FASetup('passkey')} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-cyan-400 hover:shadow-md transition-all text-left flex flex-col gap-3 shadow-sm">
                                                    <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600 w-max border border-cyan-100"><Fingerprint size={24} /></div>
                                                    <div>
                                                        <h4 className="text-slate-800 font-bold text-sm tracking-tight">Llave de Acceso</h4>
                                                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Huella, Face ID o PIN.</p>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* MODAL INYECTADO DE CONFIGURACIÓN 2FA DENTRO DE LA PESTAÑA */}
                                        <AnimatePresence>
                                            {is2FASetupOpen && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-6 border-t border-slate-200">
                                                    <div className="bg-white border border-slate-200 shadow-md rounded-xl p-6 relative">
                                                        <button onClick={() => setIs2FASetupOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full p-1"><X size={20} /></button>
                                                        
                                                        {setupStep === 1 && (
                                                            <div className="space-y-6">
                                                                <h4 className="text-xl font-black text-slate-800 text-center flex items-center justify-center gap-2 tracking-tight">
                                                                    <QrCode className="text-indigo-600" /> Configurar Autenticador
                                                                </h4>
                                                                
                                                                {isProcessing2FA ? (
                                                                    <div className="flex justify-center py-8"><Loader className="animate-spin text-indigo-600" size={32} /></div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center space-y-4">
                                                                        {twoFAMethod === 'app' ? (
                                                                            <>
                                                                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                                                                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                                                                </div>
                                                                                <p className="text-xs text-slate-600 text-center max-w-xs font-medium">Escanea este código con tu aplicación de autenticación.</p>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Mail size={64} className="text-pink-500 mb-2 animate-bounce" />
                                                                                <p className="text-sm font-black text-pink-600 uppercase tracking-wide">Revisa tu bandeja de entrada</p>
                                                                                <p className="text-xs text-slate-600 text-center max-w-xs font-medium">Te hemos enviado un código de 6 dígitos a tu correo. Tienes 5 minutos para ingresarlo.</p>
                                                                            </>
                                                                        )}
                                                                        
                                                                        <form onSubmit={handleVerify2FACode} className="w-full max-w-xs mt-4">
                                                                            <div className="flex gap-2">
                                                                                <input 
                                                                                    type="text" 
                                                                                    maxLength="6" 
                                                                                    required 
                                                                                    placeholder="000000" 
                                                                                    value={authCode} 
                                                                                    onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))} 
                                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-center tracking-[0.5em] text-slate-800 font-mono text-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors shadow-inner" 
                                                                                />
                                                                            </div>
                                                                            {error2FA && <p className="text-xs font-bold text-red-600 text-center mt-2">{error2FA}</p>}
                                                                            <button type="submit" disabled={authCode.length < 6 || isProcessing2FA} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center shadow-md">
                                                                                {isProcessing2FA ? <Loader size={16} className="animate-spin" /> : 'Verificar y Activar'}
                                                                            </button>
                                                                        </form>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {setupStep === 2 && (
                                                            <div className="text-center py-8 space-y-4">
                                                                <CheckCircle2 className="text-emerald-500 mx-auto" size={72} strokeWidth={1.5} />
                                                                <h4 className="text-3xl font-black text-slate-800 tracking-tight">¡2FA Activado!</h4>
                                                                <p className="text-sm text-slate-600 font-medium">Tu cuenta ahora está protegida con seguridad de nivel bancario.</p>
                                                                <button onClick={() => setIs2FASetupOpen(false)} className="mt-4 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors shadow-md">Cerrar</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MODAL: HISTORIAL DE BILLETERA TNB */}
            <AnimatePresence>
                {isWalletHistoryOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black font-orbitron text-emerald-700 flex items-center gap-3 tracking-tight">
                                        <History className="text-emerald-500" /> Historial de Billetera
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Registro de tus recargas y compras con Saldo TNB.</p>
                                </div>
                                <button onClick={() => setIsWalletHistoryOpen(false)} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-500 transition-colors shadow-sm">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-3 hide-scrollbar min-h-[200px] relative bg-slate-50">
                                {isLoadingWalletHistory ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader className="animate-spin text-emerald-600" size={32} />
                                    </div>
                                ) : walletHistory.length > 0 ? (
                                    walletHistory.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'} transition-colors shadow-sm`}>
                                                    {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-slate-800 font-bold text-sm mb-1 tracking-tight">{tx.concept}</h4>
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 font-mono uppercase tracking-widest">
                                                        <CalendarDays size={12} /> {tx.date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`font-mono font-black text-xl ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                                        <Wallet size={64} className="mx-auto text-slate-300 mb-4" />
                                        <h3 className="text-slate-600 font-bold mb-1 text-lg">Billetera sin movimientos</h3>
                                        <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Aquí aparecerán tus recargas y compras pagadas con Saldo TNB.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE SELECCIÓN DE AVATAR */}
            <AnimatePresence>
                {showAvatarModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border border-slate-200 shadow-2xl p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><User className="text-indigo-600"/> Personaliza tu Avatar</h3>
                                <button onClick={() => setShowAvatarModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            <div className="mb-6 p-5 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-slate-800 font-bold text-sm">Subir Foto Propia</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Sube una imagen desde tu dispositivo (Máx 5MB).</p>
                                </div>
                                <input 
                                    type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleCustomUpload}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {isUploadingPhoto ? <Loader className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                                    {isUploadingPhoto ? 'Subiendo...' : 'Seleccionar Archivo'}
                                </button>
                            </div>

                            <div className="overflow-y-auto pr-2 hide-scrollbar">
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">O Elige un Avatar Predeterminado</p>
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-4">
                                    {PRESET_AVATARS.map((url, idx) => (
                                        <img key={idx} src={url} alt={`Avatar ${idx}`} onClick={() => handleUpdateAvatar(url)} className="w-full aspect-square rounded-full bg-slate-100 border-4 border-transparent hover:border-indigo-400 cursor-pointer transition-all hover:scale-110 shadow-sm" />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-2 shrink-0">
                                <button onClick={handleDeleteAvatar} className="flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-600 text-sm font-bold bg-white border border-red-200 px-5 py-2.5 rounded-xl transition-all shadow-sm">
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
