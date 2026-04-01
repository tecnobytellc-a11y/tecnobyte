import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, LogIn, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../../pages/firebase';

import { onAuthStateChanged } from 'firebase/auth';

const Navbar = ({ cartCount, onOpenCart, onOpenSidebar }) => {
    // --- DETECTOR DE RUTA ---
    const location = useLocation();
    const rutasPermitidas = ['/', '/checkout', '/perfil'];
    const mostrarNavbar = rutasPermitidas.includes(location.pathname);
    // --- CEREBRO DE AUTENTICACIÓN ---
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);
    // --------------------------------

    // Si no está en las rutas permitidas, el Navbar se oculta
    if (!mostrarNavbar) {
        return null;
    }

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-4 relative h-20 flex items-center justify-between">
                
                {/* Logo and Menu a la izquierda */}
                <div className="flex items-center h-full gap-4">
                    {onOpenSidebar && (
                        <button 
                            onClick={onOpenSidebar}
                            className="p-2 -ml-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <Menu size={24} />
                        </button>
                    )}
                    <Link to="/" className="h-20 flex items-center justify-center cursor-pointer py-3">
                        {/* Como solicitaste evitar modo oscuro, el logo si estaba invertido ahora no */}
                        <img 
                            src="/logo.png" 
                            alt="TecnoByte" 
                            className="h-full w-auto max-w-[65vw] sm:max-w-xs object-contain filter drop-shadow-sm" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "/unnamed.png"; }} 
                        />
                    </Link>
                </div>

                {/* Actions: Profile + Cart */}
                <div className="flex items-center h-full gap-2 sm:gap-4">

                    <a 
    href="#services" 
    className="hidden md:flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
>
    Ir a Tienda
</a>
                    
                    {/* BOTÓN INTELIGENTE: Cambia según si hay sesión iniciada o no */}
                    {currentUser ? (
                        <Link to="/perfil">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-full border border-slate-200 transition-colors shadow-sm"
                            >
                                <User size={18} className="text-indigo-600" />
                                <span className="hidden sm:inline text-sm">Mi Cuenta</span>
                            </motion.div>
                        </Link>
                    ) : (
                        <Link to="/login">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors"
                            >
                                <LogIn size={18} />
                                <span className="hidden sm:inline text-sm">Iniciar sesión / Registrarse</span>
                            </motion.div>
                        </Link>
                    )}

                    {/* Carrito (INTACTO lógicamente, rediseñado visualmente) */}
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group cursor-pointer ml-1 sm:ml-2 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors flex items-center justify-center" 
                        onClick={onOpenCart}
                    >
                        <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-indigo-600 transition-colors" />
                        {cartCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm border-2 border-white"
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
