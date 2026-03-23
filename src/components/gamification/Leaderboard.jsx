import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 CEREBRO DE DATOS MASIVO: 70+ Nombres realistas para combinar
const NOMBRES = [
    "AlexGamer99", "ProSniperVzla", "MariaPaz", "DarkKnight", "GhostRider",
    "Juan_FF", "Ana_Pro", "Luis_VE", "Gabo_King", "Sofia_VIP", "Victor_Z", 
    "Cesar_X", "Andrea_Play", "Miguel_Sniper", "Diego_YT", "Lucia_M", 
    "Ninja_Caracas", "Alejandro_T", "Valeria_Win", "Shadow_99", "MataNoobs",
    "ReyDelHeadshot", "CazadorOscuro", "Elena_G", "Kiler_007", "ToxicBoy",
    "SavageGirl", "LoboSolitario", "Phantom_X", "Venom_Pro", "GatoNinja",
    "Panda_Asesino", "Dragon_Rojo", "Tigre_Blanco", "Fenix_Oscuro", "Titan_X",
    "Viper_Strike", "Nova_Gamer", "Cyber_Punk", "Neon_Rider", "Joker_XX",
    "Harley_Q", "Batman_Pro", "Superman_VE", "Flash_Gamer", "Arrow_X",
    "Aquaman_Z", "Cyborg_Pro", "Diana_Prince", "Arthur_King", "Barry_Allen",
    "Clark_K", "Bruce_W", "Hal_Jordan", "John_Stewart", "Guy_Gardner",
    "Kyle_Rayner", "Simon_Baz", "Jessica_Cruz", "Jo_Mullein", "Keli_Quintela",
    "Tai_Pham", "Teen_Titan", "Robin_Pro", "Nightwing_X", "Red_Hood",
    "Batgirl_VE", "Spoiler_G", "Orphan_X", "Huntress_Pro", "Flamebird_Z"
];

// RANGOS dinámicos para soportar la locura de puntos
const RANGOS = [
    { name: 'Gran Maestro', min: 50000, max: 999999, color: 'text-purple-500' },
    { name: 'Diamante', min: 15000, max: 49999, color: 'text-cyan-400' },
    { name: 'Oro', min: 10000, max: 14999, color: 'text-yellow-400' },
    { name: 'Plata', min: 0, max: 9999, color: 'text-gray-300' }
];

const Leaderboard = () => {
    const [topPlayers, setTopPlayers] = useState([]);

    const generarJugadores = () => {
        let nuevosJugadores = [];
        let nombresDisponibles = [...NOMBRES];
        
        // 1. Generar 5 cantidades de puntos "a lo loco" (Entre 3,000 y 80,000)
        let puntosLocos = [];
        for (let i = 0; i < 5; i++) {
            puntosLocos.push(Math.floor(Math.random() * 77000) + 3000);
        }
        
        // 2. Ordenar de mayor a menor para que el Salón de la Fama tenga sentido visual
        puntosLocos.sort((a, b) => b - a);

        // 3. Asignar esos puntos a 5 nombres al azar
        for (let i = 0; i < 5; i++) {
            const nombreIndex = Math.floor(Math.random() * nombresDisponibles.length);
            const nombre = nombresDisponibles.splice(nombreIndex, 1)[0]; 
            
            const puntosAsignados = puntosLocos[i];
            let rankInfo = RANGOS.find(r => puntosAsignados >= r.min && puntosAsignados <= r.max) || RANGOS[3];

            nuevosJugadores.push({
                id: `player-${i}-${Date.now()}`, // ID único para forzar animación fresca
                name: nombre,
                points: puntosAsignados,
                rank: rankInfo.name,
                rankColor: rankInfo.color,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`
            });
        }

        setTopPlayers(nuevosJugadores);
    };

    useEffect(() => {
        generarJugadores();

        // 🔥 MODO FRENÉTICO: Actualiza totalmente "a lo loco" entre 8 y 15 segundos
        const intervalo = setInterval(() => {
            generarJugadores();
        }, Math.floor(Math.random() * 7000) + 8000);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Trophy size={150} />
            </div>

            <div className="text-center mb-6 relative z-10">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h2 className="text-2xl font-black font-orbitron text-white uppercase tracking-widest">Salón de la Fama</h2>
                <p className="text-xs text-gray-400 mt-1">Los Top 5 clientes del mes en vivo.</p>
            </div>

            <div className="space-y-3 relative z-10 min-h-[350px]">
                <AnimatePresence mode="popLayout">
                    {topPlayers.map((player, index) => {
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
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
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
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${player.rankColor}`}>
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
                </AnimatePresence>
            </div>
            
            <button className="w-full mt-6 py-2 border border-indigo-500/50 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-500 hover:text-white transition-colors relative z-10">
                Ver Ranking Completo
            </button>
        </div>
    );
};

export default Leaderboard;
