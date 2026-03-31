import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Zap, X, Coins, Sparkles, Loader, RefreshCw } from 'lucide-react';
import axios from 'axios';

const PRIZES = [
    { id: 1, name: "10 Tecno Points", color: "#6366f1", type: "points", value: 10 },
    { id: 2, name: "¡Sigue Intentando!", color: "#e2e8f0", type: "none", value: 0 },
    { id: 3, name: "Cupón 5%", color: "#ec4899", type: "coupon", value: 5 },
    { id: 4, name: "50 Tecno Points", color: "#10b981", type: "points", value: 50 },
    { id: 5, name: "¡Casi!", color: "#f8fafc", type: "none", value: 0 },
    { id: 6, name: "Cupón 10%", color: "#eab308", type: "coupon", value: 10 },
];

const DailyRoulette = ({ isOpen, onClose, userUid, onWin }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [wonPrize, setWonPrize] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const spinRoulette = async () => {
        if (isSpinning || isFetching) return;
        setWonPrize(null);
        setErrorMessage("");
        setIsFetching(true);

        try {
            const response = await axios.post('https://api-paypal-secure.vercel.app/api/gamification/spin-roulette', {
                userId: userUid
            });

            if (response.data.success) {
                const serverPrize = response.data.prize;
                const winIndex = response.data.prizeIndex;
                
                setIsFetching(false);
                setIsSpinning(true);

                const spinMultiplier = Math.floor(Math.random() * 5) + 5; 
                const segmentAngle = 360 / PRIZES.length;
                const targetRotation = (spinMultiplier * 360) + ((PRIZES.length - winIndex) * segmentAngle) - (segmentAngle / 2);
                
                setRotation(prev => prev + targetRotation); 
                
                setTimeout(() => {
                    setIsSpinning(false);
                    setWonPrize(serverPrize);
                    if (serverPrize.type !== 'none' && onWin) {
                        onWin(serverPrize);
                    }
                }, 4000);
            }
        } catch (error) {
            setIsFetching(false);
            setErrorMessage(error.response?.data?.message || "Error de conexión con el servidor.");
        }
    };

    if (!isOpen) return null;

    // Detectamos si puede volver a girar al instante
    const canSpinAgain = wonPrize?.name === "¡Sigue Intentando!";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                // Se agregó max-h-[90vh] y overflow-y-auto para evitar que se salga de la pantalla
                className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg relative overflow-y-auto max-h-[90vh] shadow-2xl scrollbar-hide"
            >
                <button onClick={onClose} disabled={isSpinning} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-20 bg-white border border-slate-200 p-1.5 rounded-full shadow-sm">
                    <X size={20} />
                </button>
                
                {/* Se redujo el padding de p-8 a p-6 para compactar la interfaz */}
                <div className="p-6 md:p-8 text-center relative z-10 bg-slate-50/50">
                    <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse drop-shadow-sm" />
                    <h2 className="text-2xl md:text-3xl font-orbitron font-black text-slate-800 mb-2 tracking-tight">RULETA DIARIA</h2>
                    <p className="text-slate-500 font-medium text-xs md:text-sm mb-6">Gira la ruleta y gana premios exclusivos. Tienes 1 intento exacto cada 24 horas.</p>
                    
                    {/* Se redujo la ruleta de 64 a 56 para que ocupe menos alto */}
                    <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto mb-8">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 pointer-events-none">
                            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-amber-500 drop-shadow-md"></div>
                        </div>

                        <motion.div 
                            className="w-full h-full rounded-full border-[6px] border-slate-200 overflow-hidden relative shadow-inner"
                            animate={{ rotate: rotation }}
                            transition={{ duration: 4, ease: [0.2, 0.8, 0.1, 1] }}
                        >
                            {PRIZES.map((prize, index) => {
                                const angle = (360 / PRIZES.length) * index;
                                const skew = 90 - (360 / PRIZES.length);
                                const isLightBackground = prize.color === '#e2e8f0' || prize.color === '#f8fafc';
                                return (
                                    <div 
                                        key={prize.id}
                                        className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-center border-l border-t border-white/20"
                                        style={{
                                            backgroundColor: prize.color,
                                            transform: `rotate(${angle}deg) skewY(-${skew}deg)`,
                                            borderTopLeftRadius: '100%',
                                        }}
                                    >
                                        <div 
                                            className={`absolute bottom-4 right-4 text-[9px] md:text-[10px] font-black whitespace-nowrap ${isLightBackground ? 'text-slate-600' : 'text-white'}`}
                                            style={{
                                                transform: `skewY(${skew}deg) rotate(${360 / PRIZES.length / 2}deg) translate(20px, -20px)`,
                                                textShadow: isLightBackground ? 'none' : '1px 1px 2px rgba(0,0,0,0.4)'
                                            }}
                                        >
                                            {prize.type === 'points' && <Coins size={12} className="inline mr-1" />}
                                            {prize.type === 'coupon' && <Zap size={12} className="inline mr-1" />}
                                            {prize.name}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 bg-white rounded-full border-[6px] border-indigo-200 flex items-center justify-center z-10 shadow-lg">
                            <Gift className="text-indigo-500 w-5 h-5 md:w-6 md:h-6 animate-bounce" />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mb-5 bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-xs font-bold shadow-sm">
                            {errorMessage}
                        </div>
                    )}

                    <motion.button 
                        whileHover={!(isSpinning || isFetching) ? { scale: 1.02 } : {}}
                        whileTap={!(isSpinning || isFetching) ? { scale: 0.98 } : {}}
                        onClick={spinRoulette} 
                        disabled={isSpinning || isFetching || (wonPrize && !canSpinAgain)}
                        className={`w-full max-w-[240px] font-black py-3.5 md:py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 mx-auto ${canSpinAgain ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed bg-none'}`}
                    >
                        {isFetching ? <Loader className="animate-spin" size={18} /> : null}
                        {isSpinning ? 'GIRANDO...' : isFetching ? 'CONECTANDO...' : canSpinAgain ? '¡GIRAR DE NUEVO!' : 'GIRAR AHORA'}
                    </motion.button>

                    {wonPrize && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 md:mt-8 p-5 rounded-2xl border shadow-sm ${wonPrize.type === 'none' ? (canSpinAgain ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200') : 'bg-emerald-50 border-emerald-200'}`}
                        >
                            <h3 className={`font-black tracking-tight text-lg md:text-xl ${wonPrize.type === 'none' ? (canSpinAgain ? 'text-amber-700' : 'text-slate-700') : 'text-emerald-700'}`}>
                                {wonPrize.type === 'none' ? (canSpinAgain ? '¡TIENES OTRA OPORTUNIDAD!' : '¡CASI!') : '¡FELICITACIONES!'}
                            </h3>
                            <p className="text-slate-600 font-medium mt-1.5 text-xs md:text-sm">Resultado: <span className="text-indigo-600 font-bold">{wonPrize.name}</span></p>
                            
                            {/* MOSTRAR CUPÓN GENERADO */}
                            {wonPrize.type === 'coupon' && wonPrize.generatedCode && (
                                <div className="mt-4 p-4 bg-fuchsia-50 border border-fuchsia-200 rounded-xl shadow-inner">
                                    <p className="text-[10px] md:text-xs text-fuchsia-700 uppercase tracking-widest font-black mb-2">Tu Código de Descuento</p>
                                    <p className="text-lg md:text-2xl font-black font-mono text-fuchsia-700 tracking-widest bg-white border border-fuchsia-100 shadow-sm py-2.5 rounded-lg selection:bg-fuchsia-200">{wonPrize.generatedCode}</p>
                                    <p className="text-[9px] md:text-[10px] text-fuchsia-600 font-medium mt-2.5">1 uso por usuario. Úsalo al pagar.</p>
                                </div>
                            )}

                            {/* MOSTRAR PUNTOS */}
                            {wonPrize.type === 'points' && (
                                <p className="text-[10px] md:text-xs text-emerald-600 mt-3 font-bold uppercase tracking-widest">✔ Puntos acreditados a tu billetera</p>
                            )}
                            
                            {/* MENSAJE DE COOLDOWN SI APLICA */}
                            {wonPrize.name === "¡Casi!" && (
                                <p className="text-[10px] md:text-xs text-slate-500 mt-3 font-bold uppercase tracking-widest">Vuelve mañana a intentarlo.</p>
                            )}
                            {canSpinAgain && (
                                <p className="text-[10px] md:text-xs text-amber-600 mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <RefreshCw size={14} /> ¡Gira arriba sin esperar!
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default DailyRoulette;
