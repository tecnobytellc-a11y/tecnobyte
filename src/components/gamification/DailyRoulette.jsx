import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Zap, X, Coins, Sparkles, Loader, RefreshCw } from 'lucide-react';
import axios from 'axios';

const PRIZES = [
    { id: 1, name: "10 Tecno Points", color: "#6366f1", type: "points", value: 10 },
    { id: 2, name: "¡Sigue Intentando!", color: "#1f2937", type: "none", value: 0 },
    { id: 3, name: "Cupón 5%", color: "#ec4899", type: "coupon", value: 5 },
    { id: 4, name: "50 Tecno Points", color: "#10b981", type: "points", value: 50 },
    { id: 5, name: "¡Casi!", color: "#374151", type: "none", value: 0 },
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                // Se agregó max-h-[90vh] y overflow-y-auto para evitar que se salga de la pantalla
                className="bg-[#11111a] border border-indigo-500/50 rounded-3xl w-full max-w-lg relative overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(79,70,229,0.3)] scrollbar-hide"
            >
                <button onClick={onClose} disabled={isSpinning} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 bg-black/50 p-1 rounded-full">
                    <X size={24} />
                </button>
                
                {/* Se redujo el padding de p-8 a p-6 para compactar la interfaz */}
                <div className="p-6 md:p-8 text-center relative z-10">
                    <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-pulse" />
                    <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-2 tracking-wide">RULETA DIARIA</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-4">Gira la ruleta y gana premios exclusivos. Tienes 1 intento exacto cada 24 horas.</p>
                    
                    {/* Se redujo la ruleta de 64 a 56 para que ocupe menos alto */}
                    <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto mb-6">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 pointer-events-none">
                            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>
                        </div>

                        <motion.div 
                            className="w-full h-full rounded-full border-4 border-indigo-900 overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.8)_inset]"
                            animate={{ rotate: rotation }}
                            transition={{ duration: 4, ease: [0.2, 0.8, 0.1, 1] }}
                        >
                            {PRIZES.map((prize, index) => {
                                const angle = (360 / PRIZES.length) * index;
                                const skew = 90 - (360 / PRIZES.length);
                                return (
                                    <div 
                                        key={prize.id}
                                        className="absolute w-1/2 h-1/2 origin-bottom-right"
                                        style={{
                                            backgroundColor: prize.color,
                                            transform: `rotate(${angle}deg) skewY(-${skew}deg)`,
                                            borderTopLeftRadius: '100%',
                                        }}
                                    >
                                        <div 
                                            className="absolute bottom-4 right-4 text-[9px] md:text-[10px] font-bold text-white whitespace-nowrap"
                                            style={{
                                                transform: `skewY(${skew}deg) rotate(${360 / PRIZES.length / 2}deg) translate(20px, -20px)`,
                                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
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
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 bg-gray-900 rounded-full border-[4px] border-indigo-500 flex items-center justify-center z-10 shadow-xl">
                            <Gift className="text-white w-5 h-5 md:w-6 md:h-6 animate-bounce" />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 bg-red-900/30 border border-red-500/50 p-3 rounded-lg text-red-400 text-xs font-bold">
                            {errorMessage}
                        </div>
                    )}

                    <motion.button 
                        whileHover={!(isSpinning || isFetching) ? { scale: 1.05 } : {}}
                        whileTap={!(isSpinning || isFetching) ? { scale: 0.95 } : {}}
                        onClick={spinRoulette} 
                        disabled={isSpinning || isFetching || (wonPrize && !canSpinAgain)}
                        className={`w-full max-w-[200px] font-bold py-2 md:py-3 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2 mx-auto ${canSpinAgain ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white animate-pulse' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        {isFetching ? <Loader className="animate-spin" size={16} /> : null}
                        {isSpinning ? 'GIRANDO...' : isFetching ? 'CONECTANDO...' : canSpinAgain ? '¡GIRAR DE NUEVO!' : 'GIRAR AHORA'}
                    </motion.button>

                    {wonPrize && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 md:mt-6 p-4 rounded-xl border ${wonPrize.type === 'none' ? (canSpinAgain ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-gray-800/50 border-gray-600') : 'bg-green-900/20 border-green-500/50'}`}
                        >
                            <h3 className={`font-bold text-sm md:text-lg ${wonPrize.type === 'none' ? (canSpinAgain ? 'text-yellow-400' : 'text-gray-300') : 'text-green-400'}`}>
                                {wonPrize.type === 'none' ? (canSpinAgain ? '¡TIENES OTRA OPORTUNIDAD!' : '¡CASI!') : '¡FELICITACIONES!'}
                            </h3>
                            <p className="text-white font-mono mt-1 text-xs md:text-sm">Resultado: <span className="text-cyan-400 font-bold">{wonPrize.name}</span></p>
                            
                            {/* MOSTRAR CUPÓN GENERADO */}
                            {wonPrize.type === 'coupon' && wonPrize.generatedCode && (
                                <div className="mt-3 p-3 bg-pink-500/20 border border-pink-500/50 rounded-lg">
                                    <p className="text-[10px] md:text-xs text-pink-300 uppercase tracking-widest font-bold mb-1">Tu Código de Descuento</p>
                                    <p className="text-lg md:text-xl font-black font-mono text-white tracking-widest bg-black/50 py-2 rounded selection:bg-pink-500">{wonPrize.generatedCode}</p>
                                    <p className="text-[9px] md:text-[10px] text-pink-400 mt-2">1 uso por usuario. Úsalo al pagar.</p>
                                </div>
                            )}

                            {/* MOSTRAR PUNTOS */}
                            {wonPrize.type === 'points' && (
                                <p className="text-[10px] md:text-xs text-green-400 mt-2 font-bold uppercase">✔ Puntos acreditados a tu billetera</p>
                            )}
                            
                            {/* MENSAJE DE COOLDOWN SI APLICA */}
                            {wonPrize.name === "¡Casi!" && (
                                <p className="text-[10px] md:text-xs text-gray-400 mt-2 font-bold uppercase">Vuelve mañana a intentarlo.</p>
                            )}
                            {canSpinAgain && (
                                <p className="text-[10px] md:text-xs text-yellow-400 mt-2 font-bold uppercase flex items-center justify-center gap-1">
                                    <RefreshCw size={12} /> ¡Gira arriba sin esperar!
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
