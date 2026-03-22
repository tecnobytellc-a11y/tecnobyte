import React, { useState } from 'react';
import { PackageOpen, Sparkles, Gem, ShieldAlert, Lock } from 'lucide-react'; // Añadido Lock
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button'; // Assuming a generic Button exists, using inline class if not
import axios from 'axios'; // Añadido axios para conectar con el servidor

// --- INYECCIÓN: Agregamos boxCount y userUid a las propiedades ---
const MysteryBox = ({ isPremium = false, boxCount = 0, userUid, onOpen }) => {
    const [status, setStatus] = useState('closed'); // 'closed', 'opening', 'opened'
    const [reward, setReward] = useState(null);

    // --- INYECCIÓN: Lógica conectada al servidor Vercel ---
    const handleOpen = async () => {
        if (status !== 'closed' || boxCount <= 0) return;
        setStatus('opening');

        try {
            const response = await axios.post('https://api-paypal-secure.vercel.app/api/gamification/open-box', {
                userId: userUid,
                boxType: isPremium ? 'premium' : 'normal'
            });

            if (response.data.success) {
                const serverReward = response.data.prize;
                
                // Mantenemos la animación visual exacta que diseñaste
                setTimeout(() => {
                    setReward(serverReward);
                    setStatus('opened');
                    if (onOpen) onOpen(serverReward);
                }, 2800); // 2.8s sincronizado con tu barra de carga
            }
        } catch (error) {
            setStatus('closed');
            alert(error.response?.data?.message || "Error de conexión con la bóveda de cajas.");
        }
    };

    // --- INYECCIÓN: Inteligencia visual si el usuario tiene 0 cajas ---
    const isEmpty = boxCount <= 0;
    const gradientClass = isEmpty ? 'from-gray-700 to-gray-900' : (isPremium ? 'from-purple-600 to-pink-600' : 'from-cyan-500 to-blue-500');
    const borderClass = isEmpty ? 'border-gray-700/50' : (isPremium ? 'border-pink-500/50' : 'border-cyan-500/50');
    const glowClass = isEmpty ? 'shadow-none grayscale opacity-60' : (isPremium ? 'shadow-[0_0_40px_rgba(236,72,153,0.4)]' : 'shadow-[0_0_30px_rgba(6,182,212,0.3)]');

    return (
        <div className={`p-6 rounded-2xl bg-gray-900/60 backdrop-blur-md border ${borderClass} ${glowClass} flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px] transition-all`}>
            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10`}></div>
            
            {/* INYECCIÓN: Etiqueta de Inventario en la esquina superior izquierda */}
            <div className={`absolute top-0 left-0 p-2 text-[10px] font-bold uppercase tracking-wider rounded-br-lg border-b border-r z-20 ${isEmpty ? 'bg-gray-800 text-gray-500 border-gray-700' : (isPremium ? 'bg-pink-600/20 text-pink-400 border-pink-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30')}`}>
                Inventario: {boxCount}
            </div>

            {isPremium && (
                <div className="absolute top-0 right-0 p-2 bg-pink-600/20 text-pink-400 text-[9px] font-bold uppercase tracking-wider rounded-bl-lg border-b border-l border-pink-500/30">
                    Premium Box
                </div>
            )}

            <AnimatePresence mode="wait">
                {status === 'closed' && (
                    <motion.div 
                        key="closed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                        className="text-center z-10"
                    >
                        <motion.div 
                            animate={isEmpty ? { y: 0 } : { y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            {/* INYECCIÓN: Candado en vez de Caja si está vacío */}
                            {isEmpty ? (
                                <Lock size={80} className="mx-auto mb-4 text-gray-600" />
                            ) : (
                                <PackageOpen size={80} className={`mx-auto mb-4 ${isPremium ? 'text-pink-400' : 'text-cyan-400'}`} />
                            )}
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2 font-orbitron">
                            Caja {isPremium ? 'Mítica' : 'Misteriosa'}
                        </h3>
                        
                        {/* INYECCIÓN: Botón Gris y Bloqueado vs Botón Vivo */}
                        {isEmpty ? (
                            <>
                                <p className="text-xs text-gray-500 mb-6 max-w-[200px]">
                                    No tienes cajas de este tipo. Consíguelas en la tienda o con TecnoPoints.
                                </p>
                                <button 
                                    disabled
                                    className="px-6 py-2 rounded-full font-bold text-gray-500 tracking-widest text-sm uppercase bg-gray-800 border border-gray-700 cursor-not-allowed shadow-none"
                                >
                                    Bloqueado
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-gray-400 mb-6 max-w-[200px]">
                                    Desvela premios épicos, reembolsos o puntos extra.
                                </p>
                                <button 
                                    onClick={handleOpen}
                                    className={`px-6 py-2 rounded-full font-bold text-white tracking-widest text-sm uppercase transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r ${gradientClass}`}
                                >
                                    Abrir Caja
                                </button>
                            </>
                        )}
                    </motion.div>
                )}

                {status === 'opening' && (
                    <motion.div 
                        key="opening"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center z-10 w-full"
                    >
                        <motion.div 
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <Sparkles size={80} className={`mx-auto ${isPremium ? 'text-pink-400' : 'text-cyan-400'}`} />
                        </motion.div>
                        <div className="mt-8 relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.8, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${gradientClass}`}
                            ></motion.div>
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-2 uppercase">Desencriptando Botín...</p>
                    </motion.div>
                )}

                {status === 'opened' && reward && (
                    <motion.div 
                        key="opened"
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="text-center z-10"
                    >
                        <div className="relative inline-block mb-4">
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-r ${gradientClass} opacity-50`}
                            ></motion.div>
                            <Gem size={80} className={`relative z-10 ${isPremium ? 'text-pink-400' : 'text-cyan-400'} drop-shadow-2xl`} />
                        </div>
                        <h3 className="text-2xl font-black text-white font-orbitron mb-2 uppercase tracking-wide">
                            ¡BOTÍN ÉPICO!
                        </h3>
                        <p className={`text-lg font-bold mb-6 ${isPremium ? 'text-pink-400' : 'text-cyan-400'}`}>
                            {reward.name}
                        </p>
                        
                        {/* INYECCIÓN DE TEXTO SI GANÓ UN CUPÓN */}
                        {reward.generatedCode && (
                            <p className="text-xs font-mono text-cyan-400 bg-cyan-900/30 p-2 rounded mb-4 border border-cyan-500/50">
                                Código: {reward.generatedCode}
                            </p>
                        )}

                        <button 
                            onClick={() => setStatus('closed')}
                            className="text-xs font-bold text-gray-400 hover:text-white underline uppercase tracking-widest transition-colors"
                        >
                            Cerrar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MysteryBox;
