import React from 'react';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const TecnoPoints = ({ points = 1200, pointsPending = 150 }) => {
    return (
        <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Coins size={120} className="text-cyan-500" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Sparkles className="text-cyan-400 w-5 h-5" />
                    </div>
                    <h3 className="text-gray-300 font-bold tracking-wide">Mis Tecno Points</h3>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                        {points.toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-mono text-sm font-bold">PTS</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-green-400 background-blur-md bg-green-500/10 border border-green-500/20 px-2 py-1 rounded inline-flex mt-2">
                    <TrendingUp size={12} />
                    <span>+{pointsPending} Pendientes de Validación</span>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800/50 flex gap-3">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-lg"
                    >
                        Canjear Recompensas
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 rounded-lg text-xs border border-gray-700 transition-colors"
                    >
                        Historial
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default TecnoPoints;
