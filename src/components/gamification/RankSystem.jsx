import React, { useState } from 'react';
import { Shield, Star, Trophy, Target, ChevronRight, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RANKS = [
    { id: 'bronze', name: 'Bronce', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', minPoints: 0, perks: ['Acceso base'] },
    { id: 'silver', name: 'Plata', icon: Star, color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/30', minPoints: 1000, perks: ['Soporte Prioritario', 'Ruleta x2'] },
    { id: 'gold', name: 'Oro', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', minPoints: 5000, perks: ['Cashback 2%', 'Cajas Misteriosas Mensuales'] },
    { id: 'diamond', name: 'Diamante', icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', minPoints: 15000, perks: ['Cashback 5%', 'Asesor Personal VIP', 'Acceso a Torneos'] },
];

const RankSystem = ({ userPoints = 1200 }) => {
    // --- INYECCIÓN: Estado del Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Determinar rango actual y siguiente
    let currentRankIndex = 0;
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (userPoints >= RANKS[i].minPoints) {
            currentRankIndex = i;
            break;
        }
    }

    const currentRank = RANKS[currentRankIndex];
    const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
    
    const progressToNext = nextRank 
        ? ((userPoints - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100 
        : 100;

    const CurrentIcon = currentRank.icon;

    return (
        <>
            <div className={`p-6 rounded-2xl border ${currentRank.border} ${currentRank.bg} backdrop-blur-sm relative overflow-hidden group`}>
                {/* Background Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${currentRank.bg.replace('/10', '')} transition-transform group-hover:scale-150`}></div>
                
                <div className="relative z-10 flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Rango Actual</h3>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${currentRank.bg} border ${currentRank.border}`}>
                                <CurrentIcon className={`w-6 h-6 ${currentRank.color}`} />
                            </div>
                            <div>
                                <span className={`text-2xl font-black font-orbitron tracking-wide ${currentRank.color}`}>{currentRank.name}</span>
                                <div className="text-white font-mono text-sm">{userPoints.toLocaleString()} <span className="text-gray-500 text-xs">PTS</span></div>
                            </div>
                        </div>
                    </div>
                    {nextRank && (
                        <div className="text-right">
                            <h3 className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Siguiente: {nextRank.name}</h3>
                            <div className="flex items-center gap-1 text-gray-400 text-xs font-mono">
                                <span>{nextRank.minPoints.toLocaleString()}</span>
                                <ChevronRight size={12} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {nextRank ? (
                    <div className="mb-6">
                        <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-2">
                            <span>Progreso para subir de rango</span>
                            <span>{Math.round(progressToNext)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-gray-800">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNext}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${currentRank.bg.replace('bg-', 'bg-gradient-to-r from-').replace('/10', ' to-white/50')}`}
                            ></motion.div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-right font-mono">Faltan {(nextRank.minPoints - userPoints).toLocaleString()} pts</p>
                    </div>
                ) : (
                    <div className="mb-6 text-center py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <Trophy size={14} /> Rrango Máximo Alcanzado <Trophy size={14} />
                        </span>
                    </div>
                )}

                {/* Perks */}
                <div>
                    <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Tus Beneficios Activos</h4>
                    <ul className="space-y-2">
                        {currentRank.perks.map((perk, idx) => (
                            <motion.li 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="flex items-center gap-2 text-sm text-gray-300"
                            >
                                <Shield size={14} className={currentRank.color} />
                                {perk}
                            </motion.li>
                        ))}
                    </ul>

                    {/* --- INYECCIÓN: BOTÓN VER ESTRUCTURA --- */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-5 flex items-center gap-1 text-[11px] text-gray-500 hover:text-white font-bold uppercase tracking-wider transition-colors"
                    >
                        <Info size={14} /> Ver estructura de rangos
                    </button>
                </div>
            </div>

            {/* --- INYECCIÓN: MODAL ESTRUCTURA DE RANGOS --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0f] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        >
                            {/* Header del Modal */}
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#11111a] rounded-t-2xl shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black font-orbitron text-white flex items-center gap-3">
                                        <Trophy className="text-indigo-500" /> Estructura de Rangos
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Beneficios y requisitos de cada nivel en TecnoByte.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Lista de Rangos */}
                            <div className="p-6 overflow-y-auto hide-scrollbar space-y-4">
                                {RANKS.map((rank) => {
                                    const isCurrent = rank.id === currentRank.id;
                                    const isLocked = userPoints < rank.minPoints;
                                    const RankIcon = rank.icon;
                                    
                                    return (
                                        <div 
                                            key={rank.id} 
                                            className={`flex flex-col md:flex-row gap-4 p-5 rounded-xl border transition-all ${isCurrent ? `${rank.border} ${rank.bg}` : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'} ${isLocked ? 'opacity-70 grayscale-[50%]' : ''}`}
                                        >
                                            {/* Icono y Nombre */}
                                            <div className="flex items-center gap-4 md:w-1/3 shrink-0">
                                                <div className={`p-4 rounded-xl ${rank.bg} border ${rank.border} flex items-center justify-center`}>
                                                    <RankIcon className={`${rank.color} w-8 h-8`} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-black font-orbitron uppercase text-lg ${rank.color}`}>{rank.name}</h3>
                                                    <p className="text-xs text-gray-400 font-mono font-bold mt-1">
                                                        {rank.minPoints === 0 ? 'Desde 0 PTS' : `${rank.minPoints.toLocaleString()} PTS`}
                                                    </p>
                                                    {isCurrent && (
                                                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            Tu Rango Actual
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Beneficios listados */}
                                            <div className="md:w-2/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-800 pt-3 md:pt-0 md:pl-5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Beneficios del rango:</p>
                                                <ul className="space-y-2">
                                                    {rank.perks.map((perk, bIndex) => (
                                                        <li key={bIndex} className="flex items-start gap-2 text-sm text-gray-300">
                                                            <Shield size={16} className={isLocked ? "text-gray-600" : rank.color} />
                                                            {perk}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RankSystem;
