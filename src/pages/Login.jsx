import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// --- INYECCIÓN DE SEGURIDAD (Conectado a tu archivo Firebase) ---
import { loginConCorreo, loginConGoogle, recuperarContrasenaEmail } from './firebase'; // Ajusta la ruta ('../../') según dónde guardaste firebase.js

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Nuevo estado para atrapar y mostrar errores de Firebase
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Lógica real de Firebase para Correo/Contraseña
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // Limpiamos errores previos
        try {
            await loginConCorreo(email, password);
            navigate('/perfil'); // Envía al usuario a su panel si entra con éxito
        } catch (err) {
            setError('Credenciales inválidas o correo no registrado.');
        } finally {
            setIsLoading(false);
        }
    };

    // Lógica real de Firebase para Google
    const handleGoogleAuth = async () => {
        setError('');
        try {
            await loginConGoogle();
            navigate('/perfil');
        } catch (err) {
            setError('Error al iniciar sesión con Google. Intenta de nuevo.');
        }
    };

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
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10"
            >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-gray-900 rounded-full border border-gray-800 flex items-center justify-center p-2 shadow-xl shadow-cyan-500/20">
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center">
                            <Bot className="text-white w-10 h-10" />
                        </div>
                    </div>
                </div>

                <div className="text-center mt-10 mb-8">
                    <h2 className="text-3xl font-black font-orbitron text-white tracking-wide">Inicia Sesión</h2>
                    <p className="text-gray-400 mt-2 text-sm">Bienvenido de vuelta, Guerrero. Tu arsenal digital te espera.</p>
                </div>

                {/* --- ALERTA VISUAL DE ERRORES --- */}
                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center p-3 rounded-lg font-mono">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                                placeholder="tu@correo.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contraseña</label>
                            <a href="#" onClick={handleRecuperarPassword} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold tracking-wide transition-colors">¿Olvidaste tu clave?</a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm tracking-widest"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
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
                        className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex justify-center items-center gap-2 mt-4 group disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Autenticando...</span>
                        ) : (
                            <>Entrar al Nexo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 relative flex items-center justify-center">
                    <div className="absolute border-t border-gray-800 w-full"></div>
                    <span className="bg-gray-900 px-3 text-xs text-gray-500 relative z-10 font-bold uppercase tracking-wider">Acceso Rápido</span>
                </div>

                <div className="mt-6">
                    <button 
                        type="button"
                        onClick={handleGoogleAuth}
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>
                </div>

                <p className="text-center text-sm text-gray-400 mt-8">
                    ¿No tienes una cuenta? <Link to="/registro" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">Regístrate gratis</Link>
                </p>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600 font-mono">
                    <ShieldCheck size={14} className="text-green-500" />
                    Autenticación encriptada de extremo a extremo
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
