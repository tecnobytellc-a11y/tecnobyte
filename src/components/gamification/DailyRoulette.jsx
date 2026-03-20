import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Zap, X, Coins, Sparkles } from 'lucide-react';

const PRIZES = [
    { id: 1, name: "10 Tecno Points", color: "#6366f1", type: "points", value: 10 },
    { id: 2, name: "¡Sigue Intentando!", color: "#1f2937", type: "none", value: 0 },
    { id: 3, name: "Cupón 5%", color: "#ec4899", type: "coupon", value: 5 },
    { id: 4, name: "50 Tecno Points", color: "#10b981", type: "points", value: 50 },
    { id: 5, name: "¡Casi!", color: "#374151", type: "none", value: 0 },
    { id: 6, name: "Cupón 10%", color: "#eab308", type: "coupon", value: 10 },
];

const DailyRoulette = ({ isOpen, onClose, onWin }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [wonPrize, setWonPrize] = useState(null);

    const spinRoulette = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setWonPrize(null);

        // Calculate random winner
        const winIndex = Math.floor(Math.random() * PRIZES.length);
        const spinMultiplier = Math.floor(Math.random() * 5) + 5; // 5 to 9 spins
        const segmentAngle = 360 / PRIZES.length;
        const targetRotation = (spinMultiplier * 360) + (winIndex * segmentAngle) + (segmentAngle / 2);
        
        setRotation(prev => prev - targetRotation); // Spin backwards for effect or forwards, adjusting the calculation
        
        // Wait for spin to finish (4s)
        setTimeout(() => {
            setIsSpinning(false);
            const prize = PRIZES[(PRIZES.length - winIndex) % PRIZES.length]; // Adjust based on draw direction
            setWonPrize(prize);
            if (prize.type !== 'none' && onWin) {
                onWin(prize);
            }
        }, 4000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-[#11111a] border border-indigo-500/50 rounded-3xl w-full max-w-lg relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.3)]"
            >
                <button onClick={onClose} disabled={isSpinning} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20">
                    <X size={24} />
                </button>
                
                <div className="p-8 text-center relative z-10">
                    <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-pulse" />
                    <h2 className="text-3xl font-orbitron font-bold text-white mb-2 tracking-wide">RULETA DIARIA</h2>
                    <p className="text-gray-400 text-sm mb-8">Gira la ruleta y gana premios exclusivos, descuentos y Tecno Points. ¡Tienes 1 intento diario!</p>
                    
                    <div className="relative w-64 h-64 mx-auto mb-8">
                        {/* Selector Pointer */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 pointer-events-none">
                            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>
                        </div>

                        {/* Roulette Wheel */}
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
                                            className="absolute bottom-4 right-4 text-[10px] font-bold text-white whitespace-nowrap"
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
                        
                        {/* Center Button Area */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 rounded-full border-[4px] border-indigo-500 flex items-center justify-center z-10 shadow-xl">
                            <Gift className="text-white w-6 h-6 animate-bounce" />
                        </div>
                    </div>

                    <motion.button 
                        whileHover={!isSpinning ? { scale: 1.05 } : {}}
                        whileTap={!isSpinning ? { scale: 0.95 } : {}}
                        onClick={spinRoulette} 
                        disabled={isSpinning}
                        className="w-full max-w-[200px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    >
                        {isSpinning ? 'Girando...' : 'GIRAR AHORA'}
                    </motion.button>

                    {wonPrize && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 p-4 rounded-xl border ${wonPrize.type === 'none' ? 'bg-gray-800/50 border-gray-600' : 'bg-green-900/20 border-green-500/50'}`}
                        >
                            <h3 className={`font-bold text-lg ${wonPrize.type === 'none' ? 'text-gray-300' : 'text-green-400'}`}>
                                {wonPrize.type === 'none' ? '¡CASI!' : '¡FELICITACIONES!'}
                            </h3>
                            <p className="text-white font-mono mt-1 text-sm">Has obtenido: <span className="text-cyan-400 font-bold">{wonPrize.name}</span></p>
                            {wonPrize.type !== 'none' && <p className="text-xs text-gray-400 mt-2">Ha sido acreditado a tu cuenta (Simulación).</p>}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default DailyRoulette;
