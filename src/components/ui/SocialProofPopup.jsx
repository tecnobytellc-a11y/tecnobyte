import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Zap } from 'lucide-react';

// 1. CEREBRO DE DATOS: Listas para combinar aleatoriamente
const NOMBRES = [
    "JuanP", "MariaGamer", "Shadow99", "Carlos_VE", "AnaPro", "LuisSniper", "GaboX", 
    "PedroFF", "Sofia_12", "DarkKnight", "ElenaM", "VictorZ", "Cesar_VIP", "AndreaPlay",
    "MiguelKing", "Diego_YT", "Lucia_G", "NinjaVE", "AlejandroT", "Valeria_Win"
];

const PRODUCTOS = [
    "100 Diamantes Free Fire", "Netflix 1 Pantalla", "Amazon Gift Card $10", 
    "Spotify Premium 1 Mes", "80 CPs Call of Duty", "Roblox 400 Robux", 
    "Admin Bot WhatsApp", "Recarga Saldo TNB", "Caja Mítica de TecnoPoints"
];

const CIUDADES = [
    "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", 
    "Ciudad Guayana", "San Cristóbal", "Maturín", "Mérida", "Calabozo"
];

const SocialProofPopup = () => {
    const [popupData, setPopupData] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Función que genera una compra falsa pero realista
        const generarCompraAleatoria = () => {
            const nombreAleatorio = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
            const productoAleatorio = PRODUCTOS[Math.floor(Math.random() * PRODUCTOS.length)];
            const ciudadAleatoria = CIUDADES[Math.floor(Math.random() * CIUDADES.length)];
            const tiempoAleatorio = Math.floor(Math.random() * 59) + 1; // Entre 1 y 59 minutos

            setPopupData({
                name: nombreAleatorio,
                product: productoAleatorio,
                location: ciudadAleatoria,
                time: `Hace ${tiempoAleatorio} min`
            });
            
            setIsVisible(true);

            // Ocultar el popup después de 5 segundos
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // Esperar 10 segundos antes de mostrar el primero al entrar a la web
        // 🔥 MODO FRENÉTICO: El primero sale a los 3 segundos rápido
        const primerTimeout = setTimeout(generarCompraAleatoria, 3000);

        // Repetir infinitamente cada 10 a 18 segundos
        const intervaloInfinito = setInterval(() => {
            if (!isVisible) {
                generarCompraAleatoria();
            }
        }, Math.floor(Math.random() * 8000) + 10000);

        return () => {
            clearTimeout(primerTimeout);
            clearInterval(intervaloInfinito);
        };
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && popupData && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 left-6 z-[100] bg-gray-900/95 backdrop-blur-md border border-indigo-500/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-sm flex items-start gap-4"
                >
                    <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-3 rounded-full shrink-0">
                        <ShoppingBag size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-300">
                            <strong className="text-white">{popupData.name}</strong> de {popupData.location}
                        </p>
                        <p className="text-cyan-400 font-bold text-sm mt-0.5">
                            Compró {popupData.product}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Zap size={10} className="text-yellow-500"/> {popupData.time}
                            </span>
                            <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                                <Star size={10} /> Verificado
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SocialProofPopup;
