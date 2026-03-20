import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const TOP_PLAYERS = [
    { id: 1, name: 'AlexGamer99', points: 15420, rank: 'Diamante', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: 2, name: 'ProSniperVzla', points: 14200, rank: 'Oro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProSniper' },
    { id: 3, name: 'MariaPaz', points: 12500, rank: 'Oro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
    { id: 4, name: 'DarkKnight', points: 9800, rank: 'Plata', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DarkKnight' },
    { id: 5, name: 'GhostRider', points: 8450, rank: 'Plata', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GhostRider' },
];

const Leaderboard = () => {
    return (
        <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Trophy size={150} />
            </div>

            <div className="text-center mb-6 relative z-10">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h2 className="text-2xl font-black font-orbitron text-white uppercase tracking-widest">Salón de la Fama</h2>
                <p className="text-xs text-gray-400 mt-1">Los Top 5 clientes del mes con más Tecno Points.</p>
            </div>

            <div className="space-y-3 relative z-10">
                {TOP_PLAYERS.map((player, index) => {
                    let PositionIcon;
                    let iconColor;
                    let bgGlow = '';

                    if (index === 0) {
                        PositionIcon = Trophy;
                        iconColor = 'text-yellow-400';
                        bgGlow = 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
                    } else if (index === 1) {
                        PositionIcon = Medal;
                        iconColor = 'text-gray-300';
                        bgGlow = 'bg-gray-400/10 border-gray-400/30';
                    } else if (index === 2) {
                        PositionIcon = Medal;
                        iconColor = 'text-orange-400';
                        bgGlow = 'bg-orange-500/10 border-orange-500/30';
                    } else {
                        PositionIcon = null;
                        iconColor = 'text-gray-500';
                        bgGlow = 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/80 transition-colors';
                    }

                    return (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-xl border ${bgGlow}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`font-black text-xl w-6 text-center ${iconColor}`}>
                                    {index + 1}
                                </div>
                                <div className="relative">
                                    <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700" />
                                    {index < 3 && (
                                        <div className="absolute -top-2 -right-2">
                                            <PositionIcon size={14} className={iconColor} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{player.name}</h4>
                                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                                        Rango {player.rank}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                                    {player.points.toLocaleString()}
                                </div>
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                    Puntos
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            <button className="w-full mt-6 py-2 border border-indigo-500/50 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-500 hover:text-white transition-colors">
                Ver Ranking Completo
            </button>
        </div>
    );
};

export default Leaderboard;
