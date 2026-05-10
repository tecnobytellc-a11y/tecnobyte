import React, { useState } from 'react';
import { PackageOpen, Sparkles, Gem, ShieldAlert, Lock } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button'; 
import axios from 'axios'; 

const MysteryBox = ({ isPremium = false, boxCount = 0, userUid, onOpen }) => {
    const [status, setStatus] = useState('closed'); // 'closed', 'opening', 'opened'
    const [reward, setReward] = useState(null);

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
                
                setTimeout(() => {
                    setReward(serverReward);
                    setStatus('opened');
                    if (onOpen) onOpen(serverReward);
                }, 2800); 
            }
        } catch (error) {
            setStatus('closed');
            alert(error.response?.data?.message || "Error de conexión con la bóveda de cajas.");
        }
    };

    const isEmpty = boxCount <= 0;
    const gradientClass = isEmpty ? 'from-slate-100 to-slate-200' : (isPremium ? 'from-fuchsia-100 to-pink-100' : 'from-sky-50 to-indigo-100');
    const borderClass = isEmpty ? 'border-slate-200' : (isPremium ? 'border-pink-200' : 'border-indigo-200');
    const shadowClass = isEmpty ? 'shadow-sm' : (isPremium ? 'shadow-[0_4px_20px_rgba(236,72,153,0.15)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.25)]' : 'shadow-[0_4px_20px_rgba(79,70,229,0.15)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.25)]');

    return (
        <div className={`p-8 rounded-3xl bg-white border ${borderClass} ${shadowClass} flex flex-col items-center justify-center relative overflow-hidden group min-h-[320px] transition-all`}>
            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-80 z-0`}></div>
            
            {/* INYECCIÓN: Etiqueta de Inventario en la esquina superior izquierda */}
            <div className={`absolute top-0 left-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-br-2xl border-b border-r z-20 shadow-sm ${isEmpty ? 'bg-slate-50 text-slate-500 border-slate-200' : (isPremium ? 'bg-white text-pink-600 border-pink-200' : 'bg-white text-indigo-600 border-indigo-200')}`}>
                Inventario: <span className="text-sm font-mono ml-1">{boxCount}</span>
            </div>

            {isPremium && (
                <div className="absolute top-0 right-0 px-3 py-1.5 bg-white text-pink-600 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl border-b border-l border-pink-200 shadow-sm z-20">
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
                        className="text-center z-10 w-full"
                    >
                        <motion.div 
                            animate={isEmpty ? { y: 0 } : { y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            className="bg-white/80 p-4 rounded-3xl w-fit mx-auto shadow-sm border border-white mb-5 backdrop-blur-sm"
                        >
                            {isEmpty ? (
                                <Lock size={72} className="mx-auto text-slate-300 drop-shadow-sm" strokeWidth={1.5} />
                            ) : (
                                <PackageOpen size={72} className={`mx-auto drop-shadow-md ${isPremium ? 'text-pink-500' : 'text-indigo-500'}`} strokeWidth={1.5} />
                            )}
                        </motion.div>
                        <h3 className={`text-2xl font-black font-orbitron mb-2 tracking-tight ${isEmpty ? 'text-slate-400' : 'text-slate-800'}`}>
                            Caja {isPremium ? 'Mítica' : 'Misteriosa'}
                        </h3>
                        
                        {isEmpty ? (
                            <>
                                <p className="text-xs font-medium text-slate-500 mb-6 max-w-[220px] mx-auto leading-relaxed">
                                    No tienes cajas de este tipo. Consíguelas en la tienda o con TecnoPoints.
                                </p>
                                <button 
                                    disabled
                                    className="w-full max-w-[200px] py-3.5 rounded-xl font-black text-slate-400 tracking-widest text-xs uppercase bg-slate-100 border border-slate-200 cursor-not-allowed shadow-inner transition-colors mx-auto block"
                                >
                                    Bloqueado
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-xs font-medium text-slate-600 mb-6 max-w-[220px] mx-auto leading-relaxed">
                                    Desvela premios épicos, reembolsos o puntos extra.
                                </p>
                                <button 
                                    onClick={handleOpen}
                                    className={`w-full max-w-[200px] py-3.5 rounded-xl font-black text-white tracking-widest text-xs uppercase transition-all transform hover:scale-[1.02] shadow-md border mx-auto block ${isPremium ? 'bg-pink-600 hover:bg-pink-700 border-pink-700' : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700'}`}
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
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="bg-white/90 p-5 rounded-full w-fit mx-auto shadow-md border border-white"
                        >
                            <Sparkles size={64} className={`mx-auto ${isPremium ? 'text-pink-500' : 'text-indigo-500'}`} />
                        </motion.div>
                        <div className="mt-8 relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner flex border border-slate-300">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.8, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${isPremium ? 'from-pink-400 to-pink-600' : 'from-indigo-400 to-indigo-600'} shadow-sm`}
                            ></motion.div>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 mt-3 uppercase tracking-widest blink">Desencriptando Botín...</p>
                    </motion.div>
                )}

                {status === 'opened' && reward && (
                    <motion.div 
                        key="opened"
                        initial={{ opacity: 0, scale: 0.5, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="text-center z-10 w-full"
                    >
                        <div className="relative inline-block mb-4">
                            <motion.div 
                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                                className={`absolute inset-0 rounded-full blur-2xl ${isPremium ? 'bg-pink-400' : 'bg-indigo-400'}`}
                            ></motion.div>
                            <div className="bg-white p-5 rounded-full shadow-lg border border-slate-100 relative z-10">
                                <Gem size={64} className={`${isPremium ? 'text-pink-600' : 'text-indigo-600'} drop-shadow-sm`} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 font-orbitron mb-2 uppercase tracking-tight">
                            ¡BOTÍN ÉPICO!
                        </h3>
                        <p className={`text-lg font-black mb-5 tracking-tight ${isPremium ? 'text-pink-600' : 'text-indigo-600'}`}>
                            {reward.name}
                        </p>
                        
                        {reward.generatedCode && (
                            <div className="mx-auto w-fit">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Código Promocional</p>
                                <p className="text-lg font-mono font-black text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg mb-5 border border-indigo-200 shadow-inner">
                                    {reward.generatedCode}
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={() => setStatus('closed')}
                            className="text-[10px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-colors bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2 rounded-lg shadow-sm"
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
