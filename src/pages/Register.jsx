import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, Phone, Hash } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// --- INYECCIÓN DE SEGURIDAD BANCARIA ---
import { registrarConPerfilSeguro, loginConGoogle, db, auth } from './firebase'; 
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'; // INYECCIÓN: Herramientas de Firestore
import { updatePassword } from 'firebase/auth'; // INYECCIÓN: Para actualizar la contraseña de Google
import axios from 'axios';

// ============================================================
// --- 🛡️ INYECCIÓN: CONFIGURACIÓN DE GOOGLE SILENCIOSO ---
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

// ⚠️ IMPORTANTE: Pon aquí tu Client ID de Google Cloud Console
const GOOGLE_CLIENT_ID = "727089895868-4p8kk8aliean850eafm61s2stjalbju3.apps.googleusercontent.com"; 
// ============================================================

// Renombramos internamente el componente para poder envolverlo en el Provider al final
const RegisterContent = () => {
    // Todos los estados para recolectar la información del usuario
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showKycPrompt, setShowKycPrompt] = useState(false); // Controla si mostramos la invitación de Didit
    const [userUid, setUserUid] = useState(null); // Guarda el ID secreto del usuario
    
    // --- INYECCIÓN: Control del flujo de Google ---
    const [isGoogleFlow, setIsGoogleFlow] = useState(false); 

    // ============================================================
    // --- 🛡️ INYECCIÓN: ESTADOS PARA VERIFICACIÓN OTP DE REGISTRO ---
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpError, setOtpError] = useState('');
    // ============================================================

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 🛡️ REGLA: VERIFICAR GAMERTAG ÚNICO ANTES DE CREAR LA CUENTA
            const gamertagBuscado = username.trim(); 
            const q = query(collection(db, "usuarios"), where("gamertag", "==", gamertagBuscado));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setError("Ese Gamertag ya está en uso. Por favor, elige uno diferente.");
                setIsLoading(false);
                return; // Detenemos la creación de la cuenta aquí mismo
            }

            const datosDelFormulario = {
                nombre_real: nombre,
                apellido_real: apellido,
                cedula_identidad: cedula,
                telefono: telefono,
                gamertag: gamertagBuscado, // Guardamos el nombre limpio de espacios
                origen_registro: isGoogleFlow ? "google_completado" : "formulario_completo"
            };
            
            // 🔹 CREACIÓN DE CUENTA DEFINITIVA (Para ambos flujos)
            // Aquí es donde realmente Firebase se entera de que existe el usuario y se guarda el expediente seguro
            const usuarioCreado = await registrarConPerfilSeguro(email, password, datosDelFormulario);
            
            if (isGoogleFlow) {
                // 🔹 FLUJO GOOGLE: El usuario ya está autenticado, solo guardamos sus datos y contraseña
                try {
                    // Le asignamos la contraseña autogenerada (o la que haya escrito) a su cuenta
                    await updatePassword(usuarioCreado, password);
                } catch (pwdErr) {
                    console.warn("La contraseña no se pudo enlazar, pero el registro continuará.", pwdErr);
                }

                // Creamos su perfil en la base de datos usando usuarioCreado.uid
                await setDoc(doc(db, "usuarios", usuarioCreado.uid), {
                    ...datosDelFormulario,
                    email: email,
                    saldo_tnb: 0,
                    tecnoPoints: 0,
                    tecnoPoints_acumulados: 0,
                    cajas_normales: 0,
                    cajas_miticas: 0,
                    kyc_verificado: false,
                    correo_verificado: false, // INYECCIÓN: Inicia como falso
                    fecha_registro: new Date()
                }, { merge: true });
            } else {
                // INYECCIÓN: Si no es flujo Google, igual aseguramos que tenga correo_verificado falso al inicio
                await setDoc(doc(db, "usuarios", usuarioCreado.uid), { correo_verificado: false }, { merge: true });
            }

            // Guardamos su ID 
            setUserUid(usuarioCreado.uid);
            
            // ============================================================
            // --- 🛡️ INYECCIÓN: ENVIAR OTP Y MOSTRAR PANTALLA DE VERIFICACIÓN ---
            try {
                await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-generate', { 
                    userId: usuarioCreado.uid, 
                    email: email 
                });
                setShowOtpVerification(true); // Mostramos el OTP en lugar del KYC
            } catch (err) {
                console.error("Error enviando OTP de registro:", err);
                // Si el correo falla por error del servidor, avanzamos al KYC temporalmente
                setShowKycPrompt(true); 
            }
            // ============================================================
            
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado. Intenta iniciar sesión en lugar de registrarte.');
            } else {
                setError('Error de seguridad al crear la cuenta. Verifica los datos.');
                console.error(err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================
    // --- 🛡️ INYECCIÓN: LÓGICA DE VERIFICACIÓN OTP ---
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsVerifyingOtp(true);
        setOtpError('');
        
        try {
            const res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-verify', { 
                userId: userUid, 
                codigo: otpCode, 
                isSetup: true 
            });
            
            if (res.data.success) {
                // Marcar correo como verificado en la Bóveda
                await setDoc(doc(db, "usuarios", userUid), { correo_verificado: true }, { merge: true });
                
                // Pasar a la pantalla de KYC
                setShowOtpVerification(false);
                setShowKycPrompt(true);
            } else {
                setOtpError('Código incorrecto o expirado.');
            }
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Código incorrecto. Intenta de nuevo.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };
    // ============================================================

    // --- LÓGICA OPCIONAL KYC (DIDIT) ---
    const handleStartKYC = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Llamamos al "puente" de tu servidor
            const response = await axios.post('https://api-paypal-secure.vercel.app/api/kyc/generate-session', {
                vendorData: userUid
            });
            
            if (response.data.success) {
                // Si el servidor nos da luz verde, lo mandamos al escáner de Didit
                window.location.href = response.data.verificationUrl;
            } else {
                setError('No se pudo conectar con el escáner de seguridad.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Error de conexión. Intenta hacer el KYC desde tu perfil más tarde.');
            setIsLoading(false);
        }
    };

    // ============================================================
    // --- 🥷 INYECCIÓN: LÓGICA DE GOOGLE SILENCIOSO ---
    // Esta función extrae los datos pero NO loguea al usuario en Firebase
    const handleGoogleSilent = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError('');
            try {
                // 1. Usamos el token para pedirle los datos directamente a Google (silenciosamente)
                const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                const googleUser = userInfoRes.data;
                
                if (googleUser) {
                    // 2. Extraemos nombre y apellido
                    const firstName = googleUser.given_name || '';
                    const lastName = googleUser.family_name || '';

                    // 3. Autollenamos las casillas visualmente
                    setNombre(firstName);
                    setApellido(lastName);
                    setEmail(googleUser.email);
                    
                    // 4. Generamos una contraseña fuerte automática y oculta para Firebase
                    // Esto permite que el usuario luego pueda loguearse con correo si quiere.
                    const autoPassword = "Tnb-" + Math.random().toString(36).slice(-8) + "!";
                    setPassword(autoPassword);
                    
                    setIsGoogleFlow(true); // Activamos el modo Google para la interfaz
                    
                    // 🚨 IMPORTANTE: NO redirigimos. Subimos la pantalla para que llene el Gamertag.
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (err) {
                console.error("Error en Google Silencioso:", err);
                setError('No se pudieron extraer los datos de tu cuenta de Google.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError('Conexión con Google cancelada o fallida.');
            setIsLoading(false);
        }
    });
    // ============================================================

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10"
            >
                {/* --- 🛡️ INYECCIÓN: PANTALLA OTP DE REGISTRO --- */}
                {showOtpVerification ? (
                    <div className="text-center py-6 animate-fade-in">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                            <Mail size={40} className="text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Verifica tu Correo</h3>
                        <p className="text-gray-400 text-sm mb-6 px-4">
                            Hemos enviado un código de 6 dígitos a <strong className="text-white">{email}</strong>. Ingrésalo para activar tu cuenta.
                        </p>
                        
                        {otpError && <div className="mb-4 text-red-400 text-xs font-mono">{otpError}</div>}

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <input 
                                type="text" 
                                maxLength="6" 
                                required 
                                value={otpCode} 
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                                placeholder="000000" 
                                className="w-full max-w-[200px] mx-auto bg-black/50 border border-purple-500/50 rounded-xl py-3 text-center text-white tracking-[0.5em] font-mono text-2xl focus:border-purple-400 outline-none transition-colors block"
                            />
                            <button type="submit" disabled={isVerifyingOtp || otpCode.length < 6} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-4 disabled:opacity-50">
                                {isVerifyingOtp ? "Verificando..." : "Activar Cuenta Segura"}
                            </button>
                        </form>
                    </div>
                ) : showKycPrompt ? (
                    <div className="text-center py-6 animate-fade-in">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <ShieldCheck size={40} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">¡Expediente Creado!</h3>
                        <p className="text-gray-400 text-sm mb-6 px-4">
                            Tu cuenta base está lista. Para desbloquear pagos ultra-rápidos con <strong>PayPal y Facebank</strong>, verifica tu identidad con Didit ahora. (Toma 1 minuto).
                        </p>
                        
                        {error && <div className="mb-4 text-red-400 text-xs font-mono">{error}</div>}

                        <div className="space-y-3">
                            <button onClick={handleStartKYC} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                                {isLoading ? "Conectando al Escáner..." : "Verificar Identidad Ahora"}
                            </button>
                            <button onClick={() => navigate('/perfil')} disabled={isLoading} className="w-full bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 py-3 rounded-xl transition-colors font-bold text-sm">
                                Omitir por ahora (Lo haré al pagar)
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 tracking-wide uppercase">Forja tu Leyenda</h2>
                    <p className="text-gray-400 mt-2 text-sm">Registro de seguridad Nivel 1 requerido.</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center p-3 rounded-lg font-mono">
                        {error}
                    </div>
                )}

                {/* --- INYECCIÓN: Alerta visual de flujo Google --- */}
                {isGoogleFlow && (
                    <div className="mb-4 bg-green-500/10 border border-green-500/50 text-green-400 text-sm text-center p-3 rounded-lg font-mono">
                        ¡Datos extraídos de Google! Completa las casillas vacías (Gamertag y Teléfono) para finalizar.
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    
                    {/* FILA 1: Nombre y Apellido (2 Columnas) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400">
                                    <User size={16} />
                                </div>
                                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono text-xs" placeholder="Tu nombre" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Apellido</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400">
                                    <User size={16} />
                                </div>
                                <input type="text" required value={apellido} onChange={(e) => setApellido(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono text-xs" placeholder="Tu apellido" />
                            </div>
                        </div>
                    </div>

                    {/* FILA 2: Cédula y Teléfono (2 Columnas) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Cédula / DNI</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400">
                                    <Hash size={16} />
                                </div>
                                <input type="text" required value={cedula} onChange={(e) => setCedula(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono text-xs" placeholder="Ej: 20123456" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Teléfono</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400">
                                    <Phone size={16} />
                                </div>
                                <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl py-2.5 pl-9 pr-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono text-xs" placeholder="+58 412 000000" />
                            </div>
                        </div>
                    </div>

                    {/* FILA 3: Gamertag */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nombre de Usuario (Gamertag)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400">
                                <User size={18} />
                            </div>
                            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono text-sm" placeholder="Ej: ShadowNinja99" />
                        </div>
                    </div>

                    {/* FILA 4: Correo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400">
                                <Mail size={18} />
                            </div>
                            {/* --- INYECCIÓN: Bloqueamos el input si viene de Google --- */}
                            <input type="email" required disabled={isGoogleFlow} value={email} onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm ${isGoogleFlow ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="tu@correo.com" />
                        </div>
                    </div>

                    {/* FILA 5: Contraseña */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña de Seguridad</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400">
                                <Lock size={18} />
                            </div>
                            {/* --- INYECCIÓN: Bloqueamos y ocultamos input si viene de Google --- */}
                            <input type={showPassword ? "text" : "password"} required disabled={isGoogleFlow} value={password} onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm tracking-widest ${isGoogleFlow ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="••••••••" />
                            
                            {/* Ocultamos el ojo si es flujo Google */}
                            {!isGoogleFlow && (
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>
                        {password.length > 0 && password.length < 6 && !isGoogleFlow && (
                            <p className="text-[10px] text-red-500 mt-1 ml-2">La contraseña debe tener al menos 6 caracteres.</p>
                        )}
                        {/* --- INYECCIÓN: Texto de ayuda para Google --- */}
                        {isGoogleFlow && (
                            <p className="text-[10px] text-green-400 mt-1 ml-2">↑ Hemos generado una contraseña segura por ti para proteger tu cuenta.</p>
                        )}
                    </div>

                    <div className="flex items-start mt-2 mb-2">
                        <div className="flex items-center h-5">
                            <input id="terms" type="checkbox" required className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-pink-500 focus:ring-pink-500 focus:ring-2" />
                        </div>
                        <label htmlFor="terms" className="ml-2 text-[10px] text-gray-400 leading-tight">
                            Declaro que la información proporcionada es real y acepto los <a href="#" className="text-pink-400 hover:underline">Términos de Servicio</a>.
                        </label>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        // Ajuste de deshabilitado para incluir flujo Google
                        disabled={isLoading || (!isGoogleFlow && password.length > 0 && password.length < 6)}
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(219,39,119,0.4)] transition-all flex justify-center items-center gap-2 mt-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Validando Identidad...</span>
                        ) : (
                            <>Crear Cuenta Segura <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </motion.button>
                </form>

                {/* --- INYECCIÓN: Ocultamos el botón inferior si ya extrajimos datos --- */}
                {!isGoogleFlow && (
                    <>
                        <div className="mt-6 relative flex items-center justify-center">
                            <div className="absolute border-t border-gray-800 w-full"></div>
                            <span className="bg-gray-900 px-3 text-[10px] text-gray-500 relative z-10 font-bold uppercase tracking-wider">O extrae tus datos con Google</span>
                        </div>

                        <div className="mt-4">
                            {/* Cambiamos la función al trigger silencioso */}
                            <button type="button" onClick={() => handleGoogleSilent()} className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-3 text-sm">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Autollenar con Google
                            </button>
                        </div>
                    </>
                )}

                <p className="text-center text-xs text-gray-400 mt-6">
                    ¿Ya eres miembro? <Link to="/login" className="text-pink-400 hover:text-pink-300 font-bold transition-colors">Inicia Sesión aquí</Link>
                </p>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono">
                    <ShieldCheck size={12} className="text-green-500" />
                    Tus datos están protegidos y monitoreados contra fraude
                </div>
            </>
        )}
                
            </motion.div>
        </div>
    );
};

// ============================================================
// --- 🛡️ INYECCIÓN: EXPORT FINAL ENVUELTO EN PROVIDER ---
export default function Register() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <RegisterContent />
        </GoogleOAuthProvider>
    );
}
// ============================================================
