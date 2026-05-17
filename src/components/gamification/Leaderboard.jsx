import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, X, Loader, Users, BadgeCheck, Flame, Crosshair } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../pages/firebase'; 
import { collection, getDocs } from 'firebase/firestore';

// 🔥 LISTA VIP: Escribe aquí tu correo o tu Gamertag exactamente como aparece en tu perfil
const CUENTAS_VERIFICADAS = [
    "jesxsve16@gmail.com", 
    "Jesús Vera",
    "Jesxs_Ve"
];

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
    { name: 'Gran Maestro', min: 50000, max: 999999, color: 'text-purple-600' },
    { name: 'Diamante', min: 15000, max: 49999, color: 'text-cyan-600' },
    { name: 'Oro', min: 10000, max: 14999, color: 'text-amber-500' },
    { name: 'Plata', min: 5000, max: 9999, color: 'text-slate-500' },
    { name: 'Bronce', min: 0, max: 4999, color: 'text-orange-600' }
];

const Leaderboard = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [realUsers, setRealUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const generarJugadores = () => {
        let nuevosJugadores = [];
        let nombresDisponibles = [...NOMBRES];
        let puntosLocos = [];
        // INYECCIÓN: Ajustado a 30 puestos para los bots
        for (let i = 0; i < 30; i++) {
            puntosLocos.push(Math.floor(Math.random() * 77000) + 3000);
        }
        puntosLocos.sort((a, b) => b - a);

        // INYECCIÓN: Ajustado a 30 puestos para los bots
        for (let i = 0; i < 30; i++) {
            const nombreIndex = Math.floor(Math.random() * nombresDisponibles.length);
            const nombre = nombresDisponibles.splice(nombreIndex, 1)[0]; 
            const puntosAsignados = puntosLocos[i];

            nuevosJugadores.push({
                id: `sim-${i}-${Date.now()}`, 
                name: nombre,
                points: puntosAsignados,
                isSimulated: true,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}&backgroundColor=f1f5f9`,
                cosmeticoActivo: null // Los bots no tienen cosméticos
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

    const fetchRealUsers = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            let users = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const pts = data.tecnoPoints_acumulados || data.tecnoPoints || 0; 
                
                users.push({
                    id: doc.id,
                    name: data.gamertag || data.nombre_real || 'Jugador Nuevo',
                    email: data.email || data.correo || '', // Capturamos el correo de Firebase
                    points: pts,
                    isReal: true,
                    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.gamertag || doc.id}&backgroundColor=f1f5f9`,
                    // --- 💎 INYECCIÓN: Capturamos el cosmético si lo tiene ---
                    cosmeticoActivo: data.cosmetico_activo || null
                    // ---------------------------------------------------------
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

    // INYECCIÓN: Filtramos a los usuarios reales para que solo pasen los que tienen 5,000 puntos o más
    const rankingCompleto = [...topPlayers, ...realUsers.filter(user => user.points >= 5000)]
        .sort((a, b) => b.points - a.points)
        .map(player => {
            let rankInfo = RANGOS.find(r => player.points >= r.min && player.points <= r.max) || RANGOS[RANGOS.length - 1];
            return { ...player, rank: rankInfo.name, rankColor: rankInfo.color };
        });

    // --- FUNCIÓN DE VERIFICACIÓN ---
    const checkIsVerified = (player) => {
        if (!player.isReal) return false;
        // Verifica si el correo o el nombre coinciden con la Lista VIP
        return CUENTAS_VERIFICADAS.includes(player.email) || CUENTAS_VERIFICADAS.includes(player.name);
    };

    return (
        <>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-lg transition-all hover:shadow-xl group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Trophy size={200} className="text-amber-600" />
                </div>

                <div className="text-center mb-8 relative z-10">
                    <Crown className="w-10 h-10 text-amber-500 mx-auto mb-3 drop-shadow-sm" />
                    <h2 className="text-2xl font-black font-orbitron text-slate-800 uppercase tracking-widest">Salón de la Fama</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">Los Top 10 clientes del mes en vivo.</p>
                </div>

                <div className="space-y-3.5 relative z-10 min-h-[350px]">
                    <AnimatePresence mode="popLayout">
                        {rankingCompleto.slice(0, 10).map((player, index) => {
                            let PositionIcon;
                            let iconColor;
                            let bgGlow = '';
                            const isVerified = checkIsVerified(player);

                            if (index === 0) {
                                PositionIcon = Trophy;
                                iconColor = 'text-amber-500';
                                bgGlow = 'bg-amber-50 border-amber-200 shadow-sm';
                            } else if (index === 1) {
                                PositionIcon = Medal;
                                iconColor = 'text-slate-400';
                                bgGlow = 'bg-slate-50 border-slate-200';
                            } else if (index === 2) {
                                PositionIcon = Medal;
                                iconColor = 'text-orange-500';
                                bgGlow = 'bg-orange-50 border-orange-200';
                            } else {
                                PositionIcon = null;
                                iconColor = 'text-slate-400';
                                bgGlow = 'bg-white border-slate-100 hover:bg-slate-50 transition-colors shadow-sm';
                            }

                            // --- 💎 INYECCIÓN: Clases visuales dinámicas ---
                            let avatarStyles = "w-11 h-11 rounded-full bg-slate-100 object-cover relative z-10 border border-slate-200 shadow-sm";
                            let avatarWrapperStyles = "relative";
                            let CosmeticElement = null;

                            if (player.cosmeticoActivo === 'fire_tag') {
                                avatarStyles += " border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
                                CosmeticElement = <Flame className="absolute -bottom-2 -right-1 text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)] z-20 animate-pulse" size={18} />;
                            } else if (player.cosmeticoActivo === 'hunter_badge') {
                                avatarStyles += " border-2 border-emerald-500";
                                CosmeticElement = <Crosshair className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full p-0.5 z-20 shadow-sm" size={18} />;
                            } else if (player.cosmeticoActivo === 'golden_halo') {
                                avatarStyles += " border-2 border-amber-400 ring-4 ring-amber-100 ring-offset-1 ring-offset-white";
                            }
                            // ----------------------------------------------------------------------------------

                            return (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                    key={player.id}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${bgGlow}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`font-black font-orbitron text-xl w-6 text-center ${iconColor}`}>
                                            {index + 1}
                                        </div>
                                        <div className={avatarWrapperStyles}>
                                            <img src={player.avatar} alt={player.name} className={avatarStyles} />
                                            {CosmeticElement}
                                            {index < 3 && !CosmeticElement && (
                                                <div className="absolute -top-2 -right-2 z-20 bg-white rounded-full p-0.5 shadow-sm">
                                                    <PositionIcon size={16} className={iconColor} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-slate-800 font-bold text-sm flex items-center gap-1.5 tracking-tight">
                                                {player.name}
                                                {isVerified && (
                                                    <BadgeCheck size={16} className="text-white fill-blue-500" title="Cuenta Oficial" />
                                                )}
                                            </h4>
                                            <span className={`text-[9px] uppercase font-black tracking-widest ${player.rankColor}`}>
                                                Rango {player.rank}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-mono font-black text-indigo-600 drop-shadow-sm">
                                            {player.points.toLocaleString()}
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
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
                    className="w-full mt-8 py-3.5 border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-md relative z-10"
                >
                    Ver Ranking Completo
                </button>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black font-orbitron text-indigo-900 flex items-center gap-3 tracking-tight">
                                        <Users className="text-indigo-600" /> Clasificación Global
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Todos los usuarios registrados y compitiendo en vivo.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => fetchRealUsers()} disabled={isLoading} className="p-2 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm rounded-xl text-indigo-600 transition-colors disabled:opacity-50">
                                        <Loader size={20} className={isLoading ? "animate-spin" : ""} />
                                    </button>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto hide-scrollbar space-y-3 relative min-h-[300px] bg-slate-50/50">
                                {isLoading && realUsers.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                        <Loader className="animate-spin text-indigo-600" size={48} />
                                    </div>
                                ) : (
                                    // INYECCIÓN: Mostrar exactamente los 30 primeros en el modal
                                    rankingCompleto.slice(0, 30).map((player, index) => {
                                        const isTop3 = index < 3;
                                        const isVerified = checkIsVerified(player);

                                        // --- 💎 INYECCIÓN: Repetimos estilos cosméticos para el modal ---
                                        let avatarStylesModal = "w-11 h-11 rounded-full bg-slate-100 object-cover relative z-10 border border-slate-200";
                                        let CosmeticElementModal = null;

                                        if (player.cosmeticoActivo === 'fire_tag') {
                                            avatarStylesModal += " border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
                                            CosmeticElementModal = <Flame className="absolute -bottom-2 -right-1 text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)] z-20 animate-pulse" size={18} />;
                                        } else if (player.cosmeticoActivo === 'hunter_badge') {
                                            avatarStylesModal += " border-2 border-emerald-500";
                                            CosmeticElementModal = <Crosshair className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full p-0.5 z-20 shadow-sm" size={18} />;
                                        } else if (player.cosmeticoActivo === 'golden_halo') {
                                            avatarStylesModal += " border-2 border-amber-400 ring-4 ring-amber-100 ring-offset-1 ring-offset-white";
                                        }
                                        // ----------------------------------------------------------------

                                        return (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                key={player.id}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isTop3 ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={`font-black font-orbitron text-xl w-8 text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-500' : 'text-slate-400'}`}>
                                                        #{index + 1}
                                                    </div>
                                                    <div className="relative">
                                                        <img src={player.avatar} alt={player.name} className={avatarStylesModal} />
                                                        {CosmeticElementModal}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-slate-800 font-bold text-sm flex items-center gap-1.5 tracking-tight">
                                                            {player.name}
                                                            {isVerified && (
                                                                <BadgeCheck size={16} className="text-white fill-blue-500" title="Cuenta Oficial" />
                                                            )}
                                                        </h4>
                                                        <span className={`text-[9px] uppercase font-black tracking-widest ${player.rankColor}`}>
                                                            {player.rank}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-mono font-black text-indigo-600">
                                                        {player.points.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">PTS</span>
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
