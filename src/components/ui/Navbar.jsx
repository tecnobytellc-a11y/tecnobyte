import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { auth } from '../../pages/firebase'; // ⚠️ Asegúrate de que la ruta a tu firebase.js sea correcta
import { onAuthStateChanged } from 'firebase/auth';

const Navbar = ({ cartCount, onOpenCart }) => {
    // --- CEREBRO DE AUTENTICACIÓN ---
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);
    // --------------------------------

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
            <style>{`
                @keyframes logoGlow { 0%, 100% { filter: brightness(0) invert(1) drop-shadow(0 0 4px rgba(255,255,255,0.4)); } 50% { filter: brightness(0) invert(1) drop-shadow(0 0 18px rgba(255,255,255,1)); } } 
                .logo-glow-effect { animation: logoGlow 3s ease-in-out infinite; }
            `}</style>
            
            <div className="max-w-7xl mx-auto px-4 relative h-20">
                {/* Logo a la izquierda (INTACTO) */}
                <Link 
                    to="/"
                    className="absolute h-20 flex items-center justify-center cursor-pointer z-10" 
                    style={{ left: '0px', top: '0px', padding: '11.5px 0' }} 
                >
                    <img 
                        src="/logo.png" 
                        alt="TecnoByte" 
                        className="logo-glow-effect h-full w-auto max-w-[65vw] sm:max-w-sm object-contain" 
                        onError={(e) => { e.target.onerror = null; e.target.src = "/unnamed.png"; }} 
                    />
                </Link>

                {/* Actions: Profile + Cart */}
                <div className="flex items-center justify-end h-full gap-4">
                    
                    {/* BOTÓN INTELIGENTE: Cambia según si hay sesión iniciada o no */}
                    {currentUser ? (
                        <Link to="/perfil">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-cyan-400 font-bold py-2 px-4 rounded-full border border-indigo-500/50 transition-colors shadow-[0_0_10px_rgba(79,70,229,0.2)]"
                            >
                                <User size={18} />
                                <span className="hidden sm:inline text-sm">Mi Cuenta</span>
                            </motion.div>
                        </Link>
                    ) : (
                        <Link to="/login">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white font-bold py-2 px-4 rounded-full border border-gray-600 transition-colors"
                            >
                                <LogIn size={18} />
                                <span className="hidden sm:inline text-sm">Iniciar sesión / Registrarse</span>
                            </motion.div>
                        </Link>
                    )}

                    {/* Carrito (INTACTO) */}
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group cursor-pointer ml-2" 
                        onClick={onOpenCart}
                    >
                        <ShoppingCart className="w-7 h-7 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                        {cartCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-[0_0_10px_rgba(219,39,119,0.8)]"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
