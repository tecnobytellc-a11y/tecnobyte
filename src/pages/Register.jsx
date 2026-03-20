import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate Firebase Auth
        setTimeout(() => {
            setIsLoading(false);
            alert("Cuenta Creada Éxitosamente (Simulación). Bienvenido a la familia TecnoByte.");
            navigate('/perfil');
        }, 2000);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 tracking-wide uppercase">Forja tu Leyenda</h2>
                    <p className="text-gray-400 mt-2 text-sm">Únete a más de 10,000 gamers que ya confían en TecnoByte.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nombre de Usuario (Gamertag)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400 transition-colors">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono text-sm"
                                placeholder="Ej: ShadowNinja99"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm"
                                placeholder="tu@correo.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña de Seguridad</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm tracking-widest"
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
                        {password.length > 0 && password.length < 6 && (
                            <p className="text-[10px] text-red-500 mt-1 ml-2">La contraseña debe tener al menos 6 caracteres.</p>
                        )}
                    </div>

                    <div className="flex items-start mt-4 mb-2">
                        <div className="flex items-center h-5">
                            <input id="terms" type="checkbox" required className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-pink-500 focus:ring-pink-500 focus:ring-2" />
                        </div>
                        <label htmlFor="terms" className="ml-2 text-xs text-gray-400 leading-tight">
                            Acepto incondicionalmente los <a href="#" className="text-pink-400 hover:underline">Términos de Servicio</a> y la <a href="#" className="text-pink-400 hover:underline">Política de Privacidad</a> de TecnoByte.
                        </label>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading || (password.length > 0 && password.length < 6)}
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(219,39,119,0.4)] transition-all flex justify-center items-center gap-2 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Creando Perfil...</span>
                        ) : (
                            <>Crear Cuenta Ahora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 relative flex items-center justify-center">
                    <div className="absolute border-t border-gray-800 w-full"></div>
                    <span className="bg-gray-900 px-3 text-xs text-gray-500 relative z-10 font-bold uppercase tracking-wider">O usa Google</span>
                </div>

                <div className="mt-6">
                    <button className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Registro Rápido con Google
                    </button>
                </div>

                <p className="text-center text-sm text-gray-400 mt-8">
                    ¿Ya eres miembro? <Link to="/login" className="text-pink-400 hover:text-pink-300 font-bold transition-colors">Inicia Sesión aquí</Link>
                </p>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600 font-mono">
                    <ShieldCheck size={14} className="text-green-500" />
                    Tus datos están protegidos con encriptación de grado militar
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
