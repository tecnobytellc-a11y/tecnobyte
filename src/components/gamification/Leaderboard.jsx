import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, X, Loader, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase'; // INYECCIÓN: Importamos la base de datos
import { collection, getDocs } from 'firebase/firestore';

// 🔥 CEREBRO DE DATOS MASIVO
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

const RANGOS = [
    { name: 'Gran Maestro', min: 50000, max: 999999, color: 'text-purple-500' },
    { name: 'Diamante', min: 15000, max: 49999, color: 'text-cyan-400' },
    { name: 'Oro', min: 10000, max: 14999, color: 'text-yellow-400' },
    { name: 'Plata', min: 5000, max: 9999, color: 'text-gray-300' },
    { name: 'Bronce', min: 0, max: 4999, color: 'text-orange-400' } // Añadido para usuarios reales nuevos
];

const Leaderboard = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    
    // --- INYECCIÓN: ESTADOS PARA EL RANKING GLOBAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [realUsers, setRealUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Motor de simulación para los Top 5
    const generarJugadores = () => {
        let nuevosJugadores = [];
        let nombresDisponibles = [...NOMBRES];
        
        let puntosLocos = [];
        for (let i = 0; i < 5; i++) {
            puntosLocos.push(Math.floor(Math.random() * 77000) + 3000);
        }
        
        puntosLocos.sort((a, b) => b - a);

        for (let i = 0; i < 5; i++) {
            const nombreIndex = Math.floor(Math.random() * nombresDisponibles.length);
            const nombre = nombresDisponibles.splice(nombreIndex, 1)[0]; 
            const puntosAsignados = puntosLocos[i];

            nuevosJugadores.push({
                id: `sim-${i}-${Date.now()}`, 
                name: nombre,
                points: puntosAsignados,
                isSimulated: true,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`
            });
        }
        setTopPlayers(nuevosJugadores);
    };

    useEffect(() => {
        generarJugadores();
        const intervalo = setInterval(() => {
            generarJugadores();
        }, Math.floor(Math.random() * 7000) + 8000);
        return () => clearInterval(intervalo);
    }, []);

    // --- INYECCIÓN: TRAER USUARIOS REALES ---
    const fetchRealUsers = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            let users = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Priorizamos el acumulado histórico, si no tiene, usamos el actual
                const pts = data.tecnoPoints_acumulados || data.tecnoPoints || 0; 
                
                users.push({
                    id: doc.id,
                    name: data.gamertag || data.nombre_real || 'Jugador Nuevo',
                    points: pts,
                    isReal: true,
                    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.gamertag || doc.id}`
                });
            });
            setRealUsers(users);
        } catch (error) {
            console.error("Error al traer usuarios de Firebase:", error);
        }
        setIsLoading(false);
    };

    const handleOpenRanking = () => {
        setIsModalOpen(true);
        if (realUsers.length === 0) {
            fetchRealUsers();
        }
    };

    // --- INYECCIÓN: MEZCLAR Y ORDENAR (SIMULADOS + REALES) EN TIEMPO REAL ---
    const rankingCompleto = [...topPlayers, ...realUsers]
        .sort((a, b) => b.points - a.points)
        .map(player => {
            // Asignamos el rango matemáticamente a cada uno en la mezcla
            let rankInfo = RANGOS.find(r => player.points >= r.min && player.points <= r.max) || RANGOS[RANGOS.length - 1];
            return { ...player, rank: rankInfo.name, rankColor: rankInfo.color };
        });

    return (
        <>
            <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Trophy size={150} />
                </div>

                <div className="text-center mb-6 relative z-10">
                    <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-black font-orbitron text-white uppercase tracking-widest">Salón de la Fama</h2>
                    <p className="text-xs text-gray-400 mt-1">Los Top 5 clientes del mes en vivo.</p>
                </div>

                {/* VISTA RESUMIDA (SOLO LOS 5 PRIMEROS DE LA MEZCLA) */}
                <div className="space-y-3 relative z-10 min-h-[350px]">
                    <AnimatePresence mode="popLayout">
                        {rankingCompleto.slice(0, 5).map((player, index) => {
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
                                            <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 object-cover" />
                                            {index < 3 && (
                                                <div className="absolute -top-2 -right-2">
                                                    <PositionIcon size={14} className={iconColor} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                                {player.name}
                                                {player.isReal && <span className="bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Real</span>}
                                            </h4>
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
                
                <button 
                    onClick={handleOpenRanking}
                    className="w-full mt-6 py-2 border border-indigo-500/50 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-500 hover:text-white transition-colors relative z-10"
                >
                    Ver Ranking Completo
                </button>
            </div>

            {/* --- INYECCIÓN: MODAL DEL RANKING COMPLETO --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0f] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        >
                            {/* Cabecera del Modal */}
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#11111a] rounded-t-2xl shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-3">
                                        <Users className="text-cyan-400" /> Clasificación Global
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Todos los usuarios registrados y compitiendo en vivo.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => fetchRealUsers()} disabled={isLoading} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-cyan-400 transition-colors disabled:opacity-50">
                                        <Loader size={20} className={isLoading ? "animate-spin" : ""} />
                                    </button>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Lista Global Desplazable */}
                            <div className="p-6 overflow-y-auto hide-scrollbar space-y-2 relative min-h-[300px]">
                                {isLoading && realUsers.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/80 z-10">
                                        <Loader className="animate-spin text-cyan-400" size={40} />
                                    </div>
                                ) : (
                                    rankingCompleto.map((player, index) => {
                                        const isTop3 = index < 3;
                                        return (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                key={player.id}
                                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isTop3 ? 'bg-gray-900 border-gray-700' : 'bg-[#11111a] border-gray-800 hover:border-gray-700'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`font-black text-lg w-8 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                                        #{index + 1}
                                                    </div>
                                                    <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full bg-black border border-gray-700 object-cover" />
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                                            {player.name}
                                                            {player.isReal && <span className="text-[9px] px-1.5 py-0.5 rounded border border-indigo-500/30 text-indigo-400 bg-indigo-500/10">Cuenta Verificada</span>}
                                                        </h4>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${player.rankColor}`}>
                                                            {player.rank}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-mono font-bold text-white">
                                                        {player.points.toLocaleString()} <span className="text-[10px] text-gray-500">PTS</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Leaderboard;
