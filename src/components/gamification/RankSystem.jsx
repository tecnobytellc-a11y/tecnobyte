import React, { useState } from 'react';
import { Shield, Star, Trophy, Target, ChevronRight, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RANKS = [
    { id: 'bronze', name: 'Bronce', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', minPoints: 0, perks: ['Acceso base'] },
    { id: 'silver', name: 'Plata', icon: Star, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', minPoints: 1000, perks: ['Soporte Prioritario', 'Ruleta x2'] },
    { id: 'gold', name: 'Oro', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', minPoints: 5000, perks: ['Cashback 2%', 'Cajas Misteriosas Mensuales'] },
    { id: 'diamond', name: 'Diamante', icon: Target, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', minPoints: 15000, perks: ['Cashback 5%', 'Asesor Personal VIP', 'Acceso a Torneos'] },
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
            <div className={`p-8 rounded-3xl border bg-white shadow-lg relative overflow-hidden group ${currentRank.border}`}>
                {/* Background Glow */}
                <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-60 ${currentRank.bg.replace('bg-', 'bg-gradient-to-br from-white to-')} transition-transform duration-700 group-hover:scale-150 pointer-events-none`}></div>
                
                <div className="relative z-10 flex items-start justify-between mb-8">
                    <div>
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Rango Actual</h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className={`p-3.5 rounded-2xl ${currentRank.bg} border ${currentRank.border} shadow-sm`}>
                                <CurrentIcon className={`w-8 h-8 ${currentRank.color}`} />
                            </div>
                            <div>
                                <span className={`text-3xl font-black font-orbitron tracking-tight block leading-none mb-1 ${currentRank.color}`}>{currentRank.name}</span>
                                {/* INYECCIÓN: Etiqueta (Histórico) añadida sutilmente */}
                                <div className="text-slate-800 font-mono text-base font-bold flex items-baseline gap-1.5">{userPoints.toLocaleString()} <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">PTS (Histórico)</span></div>
                            </div>
                        </div>
                    </div>
                    {nextRank && (
                        <div className="text-right">
                            <h3 className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Siguiente Rango</h3>
                            <div className="flex items-center gap-1.5 text-slate-800 font-black text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm font-mono">
                                <span>{nextRank.minPoints.toLocaleString()}</span>
                                <ChevronRight size={14} className="text-indigo-500" />
                            </div>
                            <span className="text-[10px] text-indigo-600 font-bold block mt-1 uppercase tracking-wide">{nextRank.name}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {nextRank ? (
                    <div className="mb-8">
                        <div className="flex justify-between text-[11px] text-slate-500 font-black uppercase tracking-widest mb-2">
                            <span>Progreso al siguiente nivel</span>
                            <span className="text-indigo-600">{Math.round(progressToNext)}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNext}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-sm`}
                            ></motion.div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-right font-mono font-bold uppercase tracking-wider">Faltan {(nextRank.minPoints - userPoints).toLocaleString()} pts</p>
                    </div>
                ) : (
                    <div className="mb-8 text-center py-3 bg-amber-50 border border-amber-200 rounded-xl shadow-inner">
                        <span className="text-amber-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <Trophy size={16} className="text-amber-500" /> Rango Máximo Alcanzado <Trophy size={16} className="text-amber-500" />
                        </span>
                    </div>
                )}

                {/* Perks */}
                <div className="relative z-10 border-t border-slate-100 pt-5">
                    <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Tus Beneficios Activos</h4>
                    <ul className="space-y-2.5">
                        {currentRank.perks.map((perk, idx) => (
                            <motion.li 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="flex items-center gap-2.5 text-sm text-slate-700 font-medium"
                            >
                                <Shield size={16} className={currentRank.color} />
                                {perk}
                            </motion.li>
                        ))}
                    </ul>

                    {/* --- INYECCIÓN: BOTÓN VER ESTRUCTURA --- */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-black uppercase tracking-widest transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg border border-indigo-100"
                    >
                        <Info size={16} /> Ver estructura de rangos
                    </button>
                </div>
            </div>

            {/* --- INYECCIÓN: MODAL ESTRUCTURA DE RANGOS --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Header del Modal */}
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black font-orbitron text-indigo-900 flex items-center gap-3 tracking-tight">
                                        <Trophy className="text-indigo-600" /> Estructura de Rangos
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Beneficios y requisitos de cada nivel en TecnoByte.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-full text-slate-500 transition-colors shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Lista de Rangos */}
                            <div className="p-6 overflow-y-auto hide-scrollbar space-y-5 bg-slate-50/50">
                                {RANKS.map((rank) => {
                                    const isCurrent = rank.id === currentRank.id;
                                    const isLocked = userPoints < rank.minPoints;
                                    const RankIcon = rank.icon;
                                    
                                    return (
                                        <div 
                                            key={rank.id} 
                                            className={`flex flex-col md:flex-row gap-5 p-6 rounded-2xl border transition-all ${isCurrent ? `${rank.border} ${rank.bg} shadow-md scale-[1.02]` : 'border-slate-200 bg-white hover:border-indigo-300 shadow-sm'} ${isLocked ? 'opacity-75 bg-slate-100 grayscale-[20%]' : ''}`}
                                        >
                                            {/* Icono y Nombre */}
                                            <div className="flex items-center gap-5 md:w-1/3 shrink-0">
                                                <div className={`p-4 rounded-xl ${rank.bg} border ${rank.border} shadow-sm flex items-center justify-center`}>
                                                    <RankIcon className={`${rank.color} w-10 h-10`} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-black font-orbitron uppercase text-xl tracking-tight mb-1 ${rank.color}`}>{rank.name}</h3>
                                                    <p className="text-[11px] text-slate-500 font-mono font-bold uppercase tracking-widest bg-white border border-slate-200 px-2 py-1 rounded inline-block shadow-sm">
                                                        {rank.minPoints === 0 ? 'Desde 0 PTS' : `${rank.minPoints.toLocaleString()} PTS`}
                                                    </p>
                                                    {isCurrent && (
                                                        <span className="block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-inner w-fit">
                                                            Tu Rango Actual
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Beneficios listados */}
                                            <div className="md:w-2/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-3">Beneficios del rango:</p>
                                                <ul className="space-y-2.5">
                                                    {rank.perks.map((perk, bIndex) => (
                                                        <li key={bIndex} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                                                            <Shield size={16} className={isLocked ? "text-slate-400" : rank.color} />
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
