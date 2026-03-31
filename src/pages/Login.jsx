import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// --- INYECCIÓN DE SEGURIDAD Y FIREBASE FIRESTORE ---
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'; // INYECCIÓN: Agregado updateDoc
import { signOut, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { loginConCorreo, loginConGoogle, recuperarContrasenaEmail, db, auth } from './firebase'; // Ajusta la ruta ('../../') si es necesario
import axios from 'axios';

// --- INYECCIÓN: LIBRERÍA SILENCIOSA DE GOOGLE ---
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

// ============================================================
// --- 🛡️ INYECCIÓN: DEPENDENCIAS PARA 2FA DE LOGIN ---
import { startAuthentication } from '@simplewebauthn/browser';
import { QrCode, Fingerprint, AlertTriangle, Key } from 'lucide-react';
// ============================================================

// ⚠️ Usamos tu ID de Google directamente aquí (puedes cambiarlo si necesitas)
const GOOGLE_CLIENT_ID = "727089895868-4p8kk8aliean850eafm61s2stjalbju3.apps.googleusercontent.com";

const LoginContent = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Nuevo estado para atrapar y mostrar errores de Firebase
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // ============================================================
    // --- 🛡️ INYECCIÓN: ESTADOS MAESTROS PARA LA BARRERA 2FA ---
    const [show2FA, setShow2FA] = useState(false);
    const [twoFAType, setTwoFAType] = useState(''); 
    const [twoFASecret, setTwoFASecret] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [isVerifying2FA, setIsVerifying2FA] = useState(false);
    const [twoFAError, setTwoFAError] = useState('');
    const [isFallbackMode, setIsFallbackMode] = useState(false);

    // FUNCIÓN INTERCEPTORA: Revisa si el usuario tiene 2FA antes de dejarlo pasar
    const check2FAAndNavigate = async (user) => {
        try {
            const userDoc = await getDoc(doc(db, "usuarios", user.uid));
            if (userDoc.exists() && userDoc.data().twoFactorSecret) {
                const tipo = userDoc.data().twoFactorType;
                setTwoFAType(tipo);
                setTwoFASecret(userDoc.data().twoFactorSecret);
                setShow2FA(true); // Levanta el escudo visual

                if (tipo === 'email') {
                    // Si es por correo, le disparamos el código de una vez
                    await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-generate', { userId: user.uid, email: user.email });
                } else if (tipo === 'passkey') {
                    // Si es huella, activamos el sensor
                    triggerPasskeyAuth(user);
                }
                return false; // NO navega al perfil
            }
            navigate('/perfil'); // Si no tiene 2FA, pasa libre
            return true;
        } catch (err) {
            console.error("Error validando 2FA:", err);
            navigate('/perfil'); // En caso de fallo de red, salvavidas para no dejarlo afuera
            return true;
        }
    };

    const triggerPasskeyAuth = async (user) => {
        setTwoFAError('');
        try {
            const resOpts = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-passkey-auth-start', { userId: user.uid });
            if (resOpts.data.success) {
                const asseResp = await startAuthentication(resOpts.data.options);
                const resFinish = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-passkey-auth-finish', { userId: user.uid, response: asseResp });
                if (resFinish.data.success) {
                    navigate('/perfil'); // Éxito biométrico
                } else {
                    setTwoFAError('Firma biométrica rechazada.');
                }
            } else {
                setTwoFAError('No se pudo iniciar la biometría.');
            }
        } catch (err) {
            setTwoFAError('La verificación por huella/rostro fue cancelada o falló.');
        }
    };

    const handleFallback2FA = async () => {
        setIsFallbackMode(true);
        setTwoFAError('');
        try {
            await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-generate', { userId: auth.currentUser.uid, email: auth.currentUser.email });
            alert("Código de emergencia enviado a tu correo registrado.");
        } catch (err) {
            setTwoFAError("Error al enviar código de emergencia.");
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setIsVerifying2FA(true);
        setTwoFAError('');

        try {
            let res;
            if (twoFAType === 'email' || isFallbackMode) {
                res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-verify', {
                    userId: auth.currentUser.uid,
                    codigo: twoFACode,
                    isSetup: false
                });
            } else if (twoFAType === 'app') {
                const idToken = await auth.currentUser.getIdToken(true);
                res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-verify', 
                    { codigo: twoFACode, secret: twoFASecret },
                    { headers: { 'Authorization': `Bearer ${idToken}` } }
                );
            }

            if (res.data.success) {
                if (isFallbackMode) {
                    // Si usó el salvavidas, eliminamos el método problemático
                    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), { twoFactorSecret: null, twoFactorType: null });
                    alert("⚠️ Hemos desactivado tu método 2FA anterior por seguridad. Por favor, reconfigúralo en tu perfil.");
                }
                navigate('/perfil'); // ¡Acceso concedido!
            } else {
                setTwoFAError('Código incorrecto o expirado.');
            }
        } catch (err) {
            setTwoFAError(err.response?.data?.message || 'Código incorrecto. Intenta de nuevo.');
        } finally {
            setIsVerifying2FA(false);
        }
    };

    const cancel2FA = async () => {
        await signOut(auth); // Lo desconectamos de verdad
        setShow2FA(false);
        setTwoFACode('');
        setIsFallbackMode(false);
    };
    // ============================================================

    // Lógica real de Firebase para Correo/Contraseña
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // Limpiamos errores previos
        try {
            await loginConCorreo(email, password);
            // --- 🛡️ INYECCIÓN: Reemplazamos la redirección directa por el escáner 2FA ---
            await check2FAAndNavigate(auth.currentUser);
            // navigate('/perfil'); // Envía al usuario a su panel si entra con éxito (COMENTADO)
        } catch (err) {
            setError('Credenciales inválidas o correo no registrado.');
        } finally {
            setIsLoading(false);
        }
    };

    // 🛡️ LÓGICA BLINDADA PARA GOOGLE (Filtro Zero-Trust Silencioso)
    const handleGoogleSilentLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError('');
            try {
                // 1. Extraemos el correo silenciosamente sin tocar Firebase Auth
                const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                
                const googleEmail = userInfoRes.data.email;

                // 2. Revisamos en Firestore si este correo ya hizo el registro legal
                const q = query(collection(db, "usuarios"), where("email", "==", googleEmail));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    // 🚨 FANTASMA DETECTADO: Como no tocamos Firebase Auth, no se creó basura.
                    alert("⚠️ Cuenta no encontrada en la base de datos de TecnoByte. Por favor, completa tu registro oficial primero.");
                    navigate('/registro');
                    return;
                }

                // ✅ CASO LEGAL: Tiene su Gamertag y datos completos. Convertimos el token a Firebase y lo dejamos pasar.
                const credential = GoogleAuthProvider.credential(null, tokenResponse.access_token);
                await signInWithCredential(auth, credential);
                
                // --- 🛡️ INYECCIÓN: Reemplazamos redirección directa de Google por el escáner 2FA ---
                await check2FAAndNavigate(auth.currentUser);
                // navigate('/perfil'); (COMENTADO)

            } catch (err) {
                console.error("Error en Google Silencioso:", err);
                setError('No se pudo validar tu cuenta de Google. Intenta nuevamente.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError('Conexión con Google cancelada o fallida.');
            setIsLoading(false);
        }
    });

    // Lógica real para recuperar contraseña
    const handleRecuperarPassword = async (e) => {
        e.preventDefault(); // Evita que la página salte
        if (!email) {
            setError('Guerrero, escribe tu correo en la casilla de arriba primero para enviarte el enlace.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            await recuperarContrasenaEmail(email);
            alert('¡Enlace enviado! Revisa tu bandeja de entrada o la carpeta de Spam.');
        } catch (err) {
            setError('Error: Verifica que el correo esté bien escrito o registrado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
            {/* Background elements */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] pointer-events-none opacity-60"></div>
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] pointer-events-none opacity-80"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10"
            >
                {/* ============================================================ */}
                {/* --- 🛡️ INYECCIÓN: INTERFAZ VISUAL DEL ESCUDO 2FA --- */}
                {show2FA ? (
                    <div className="text-center py-4 animate-fade-in">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
                            {twoFAType === 'email' || isFallbackMode ? <Mail size={40} className="text-indigo-600" /> : 
                             twoFAType === 'passkey' ? <Fingerprint size={40} className="text-blue-500" /> : 
                             <QrCode size={40} className="text-indigo-600" />}
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wider">Seguridad 2FA</h3>
                        
                        <p className="text-slate-500 text-sm mb-6 px-2 leading-relaxed">
                            {isFallbackMode ? "Modo de emergencia activo. Revisa tu correo." :
                             twoFAType === 'email' ? "Hemos enviado un código a tu correo registrado." :
                             twoFAType === 'passkey' ? "Esperando validación biométrica de tu dispositivo." :
                             "Abre tu App de Autenticación e ingresa el código de 6 dígitos."}
                        </p>

                        {twoFAError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs text-center p-3 rounded-lg font-mono font-bold">{twoFAError}</div>}

                        {twoFAType !== 'passkey' || isFallbackMode ? (
                            <form onSubmit={handleVerify2FA} className="space-y-4">
                                <input 
                                    type="text" 
                                    maxLength="6" 
                                    required 
                                    value={twoFACode} 
                                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))} 
                                    placeholder="000000" 
                                    className="w-full max-w-[200px] mx-auto bg-slate-50 border border-slate-200 rounded-xl py-3 text-center text-slate-800 tracking-[0.5em] font-mono text-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all block shadow-inner"
                                />
                                <button type="submit" disabled={isVerifying2FA || twoFACode.length < 6} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:bg-slate-300">
                                    {isVerifying2FA ? "Validando..." : "Autorizar Acceso"}
                                </button>
                            </form>
                        ) : (
                            <button onClick={() => triggerPasskeyAuth(auth.currentUser)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 mt-4">
                                Reintentar Huella / Rostro
                            </button>
                        )}

                        {/* EL SALVAVIDAS: Solo si es App o Passkey y no estamos ya en fallback */}
                        {(twoFAType === 'app' || twoFAType === 'passkey') && !isFallbackMode && (
                            <button type="button" onClick={handleFallback2FA} className="w-full mt-4 text-xs text-amber-600 hover:text-amber-700 font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors">
                                <AlertTriangle size={14} /> ¿Problemas con este método?
                            </button>
                        )}

                        <button onClick={cancel2FA} className="w-full mt-6 text-xs text-slate-400 hover:text-slate-600 transition-colors uppercase font-bold tracking-wider">
                            Cancelar e ir al Inicio
                        </button>
                    </div>
                ) : (
                    <>
                {/* ============================================================ */}

                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-white rounded-full border border-slate-100 flex items-center justify-center p-2 shadow-xl shadow-indigo-100">
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center shadow-inner">
                            <Bot className="text-white w-10 h-10" />
                        </div>
                    </div>
                </div>

                <div className="text-center mt-10 mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Inicia Sesión</h2>
                    <p className="text-slate-500 mt-2 text-sm">Bienvenido a TecnoByte, tu plataforma de confianza.</p>
                </div>

                {/* --- ALERTA VISUAL DE ERRORES --- */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 font-bold text-sm text-center p-3 rounded-lg font-mono">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm shadow-inner"
                                placeholder="tu@correo.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                            <a href="#" onClick={handleRecuperarPassword} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold tracking-wide transition-colors">¿Olvidaste tu clave?</a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm tracking-widest shadow-inner"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 mt-4 group disabled:opacity-70 disabled:bg-slate-300"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Autenticando...</span>
                        ) : (
                            <>Entrar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 relative flex items-center justify-center">
                    <div className="absolute border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-3 text-xs text-slate-400 relative z-10 font-bold uppercase tracking-wider">Acceso Rápido</span>
                </div>

                <div className="mt-6">
                    <button 
                        type="button"
                        onClick={() => handleGoogleSilentLogin()}
                        disabled={isLoading}
                        className="w-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-70 text-slate-700 font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Cargando...</span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continuar con Google
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-8">
                    ¿No tienes una cuenta? <Link to="/registro" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Regístrate gratis</Link>
                </p>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Autenticación encriptada de extremo a extremo
                </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

// Envolvemos el componente para la API de Google
const Login = () => {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <LoginContent />
        </GoogleOAuthProvider>
    );
};

export default Login;
