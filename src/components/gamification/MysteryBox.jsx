import React, { useState } from 'react';
import { PackageOpen, Sparkles, Gem, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button'; // Assuming a generic Button exists, using inline class if not

const MysteryBox = ({ isPremium = false, onOpen }) => {
    const [status, setStatus] = useState('closed'); // 'closed', 'opening', 'opened'
    const [reward, setReward] = useState(null);

    const handleOpen = () => {
        if (status !== 'closed') return;
        setStatus('opening');

        // Simulate API call and animation
        setTimeout(() => {
            const randomReward = isPremium 
                ? { name: "1 Mes Xbox Game Pass", type: "premium" }
                : { name: "50 Diamantes Free Fire", type: "standard" };
            
            setReward(randomReward);
            setStatus('opened');
            if (onOpen) onOpen(randomReward);
        }, 3000);
    };

    const gradientClass = isPremium ? 'from-purple-600 to-pink-600' : 'from-cyan-500 to-blue-500';
    const borderClass = isPremium ? 'border-pink-500/50' : 'border-cyan-500/50';
    const glowClass = isPremium ? 'shadow-[0_0_40px_rgba(236,72,153,0.4)]' : 'shadow-[0_0_30px_rgba(6,182,212,0.3)]';

    return (
        <div className={`p-6 rounded-2xl bg-gray-900/60 backdrop-blur-md border ${borderClass} ${glowClass} flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px]`}>
            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10`}></div>
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
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <PackageOpen size={80} className={`mx-auto mb-4 ${isPremium ? 'text-pink-400' : 'text-cyan-400'}`} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2 font-orbitron">
                            Caja {isPremium ? 'Mítica' : 'Misteriosa'}
                        </h3>
                        <p className="text-xs text-gray-400 mb-6 max-w-[200px]">
                            Desvela premios épicos, reembolsos o puntos extra.
                        </p>
                        <button 
                            onClick={handleOpen}
                            className={`px-6 py-2 rounded-full font-bold text-white tracking-widest text-sm uppercase transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r ${gradientClass}`}
                        >
                            Abrir Caja
                        </button>
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
