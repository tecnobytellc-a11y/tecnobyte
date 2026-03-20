import React from 'react';
import { Shield, Star, Trophy, Target, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RANKS = [
    { id: 'bronze', name: 'Bronce', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', minPoints: 0, perks: ['Acceso base'] },
    { id: 'silver', name: 'Plata', icon: Star, color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/30', minPoints: 1000, perks: ['Soporte Prioritario', 'Ruleta x2'] },
    { id: 'gold', name: 'Oro', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', minPoints: 5000, perks: ['Cashback 2%', 'Cajas Misteriosas Mensuales'] },
    { id: 'diamond', name: 'Diamante', icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', minPoints: 15000, perks: ['Cashback 5%', 'Asesor Personal VIP', 'Acceso a Torneos'] },
];

const RankSystem = ({ userPoints = 1200 }) => {
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
            </div>
        </div>
    );
};

export default RankSystem;
