import React, { useState } from 'react';
import { 
    Coins, Sparkles, TrendingUp, X, Gem, Crosshair, Ticket, 
    Percent, Wallet, Package, RefreshCw, Crown, Target, 
    Flame, Zap, Headphones, Shield, History, ArrowUpRight, ArrowDownRight, CalendarDays, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// --- INYECCIÓN: Importamos las herramientas de Firebase ---
import { auth, db } from '../firebase'; // Asegúrate de que la ruta a firebase.js sea correcta
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const REWARDS_CATALOG = [
    { id: 'ff_100', name: '100 Diamantes Free Fire', cost: 1500, category: 'Recargas', icon: Gem, color: 'text-blue-400' },
    { id: 'cod_80', name: '80 CPs Call of Duty', cost: 1500, category: 'Recargas', icon: Crosshair, color: 'text-yellow-400' },
    { id: 'cup_050', name: 'Cupón $0.50 USD', cost: 800, category: 'Economía', icon: Ticket, color: 'text-pink-400' },
    { id: 'cup_100', name: 'Cupón $1.00 USD', cost: 1500, category: 'Economía', icon: Ticket, color: 'text-pink-500' },
    { id: 'cup_3pct', name: 'Cupón 3% Descuento', cost: 500, category: 'Economía', icon: Percent, color: 'text-pink-300' },
    { id: 'tnb_050', name: 'Saldo TNB $0.50', cost: 1000, category: 'Economía', icon: Wallet, color: 'text-green-400' },
    { id: 'tnb_100', name: 'Saldo TNB $1.00', cost: 1800, category: 'Economía', icon: Wallet, color: 'text-green-500' },
    { id: 'box_tier1', name: 'Caja Mítica', cost: 600, category: 'Economía', icon: Package, color: 'text-purple-400' },
    { id: 'spin_extra', name: 'Giro Extra (Ruleta)', cost: 300, category: 'Beneficios VIP', icon: RefreshCw, color: 'text-indigo-400' },
    { id: 'ticket_vip', name: 'Soporte Prioritario', cost: 400, category: 'Beneficios VIP', icon: Headphones, color: 'text-blue-300' },
    { id: 'badge_hunter', name: 'Insignia "Cazador"', cost: 1000, category: 'Cosméticos', icon: Target, color: 'text-red-400' },
    { id: 'rank_prot', name: 'Protección de Rango', cost: 1200, category: 'Beneficios VIP', icon: Shield, color: 'text-indigo-300' },
    { id: 'mult_x2', name: 'Puntos x2 (24 horas)', cost: 2000, category: 'Beneficios VIP', icon: Zap, color: 'text-yellow-300' },
    { id: 'badge_vip', name: 'Insignia VIP Dorada', cost: 2500, category: 'Cosméticos', icon: Crown, color: 'text-yellow-500' },
    { id: 'neon_name', name: 'Gamertag Luminoso', cost: 3000, category: 'Cosméticos', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'fire_frame', name: 'Marco de Fuego', cost: 3500, category: 'Cosméticos', icon: Flame, color: 'text-orange-500' },
];

const TecnoPoints = ({ points = 0, pointsPending = 0 }) => {
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    // --- INYECCIÓN: Estados para el motor de producción ---
    const [transactions, setTransactions] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const handleRedeem = (reward) => {
        if (points < reward.cost) {
            alert("No tienes suficientes TecnoPoints para esta recompensa.");
            return;
        }
        alert(`Iniciando canje de: ${reward.name}. Conectando con Vercel...`);
    };

    // --- INYECCIÓN: Lógica para descargar el historial real de Firebase ---
    const handleOpenHistory = async () => {
        setIsHistoryOpen(true);
        if (!auth.currentUser) return;
        
        setIsLoadingHistory(true);
        try {
            // Buscamos en la subcolección 'historial_puntos' del usuario actual
            const q = query(
                collection(db, "usuarios", auth.currentUser.uid, "historial_puntos"),
                orderBy("timestamp", "desc"),
                limit(20)
            );
            
            const querySnapshot = await getDocs(q);
            const historyData = [];
            querySnapshot.forEach((doc) => {
                historyData.push({ id: doc.id, ...doc.data() });
            });
            
            setTransactions(historyData);
        } catch (error) {
            console.error("Error cargando el historial:", error);
        }
        setIsLoadingHistory(false);
    };

    const categories = ['Todos', 'Recargas', 'Economía', 'Beneficios VIP', 'Cosméticos'];
    
    const filteredRewards = activeFilter === 'Todos' 
        ? REWARDS_CATALOG 
        : REWARDS_CATALOG.filter(r => r.category === activeFilter);

    return (
        <>
            <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
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
                            onClick={() => setIsStoreOpen(true)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-lg"
                        >
                            Canjear Recompensas
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleOpenHistory} // <-- INYECCIÓN: Dispara la descarga de datos reales
                            className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 rounded-lg text-xs border border-gray-700 transition-colors"
                        >
                            Historial
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* MODAL: TIENDA DE RECOMPENSAS */}
            <AnimatePresence>
                {isStoreOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0f] border border-indigo-500/50 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(79,70,229,0.2)]"
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#11111a] rounded-t-2xl shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-3">
                                        <Sparkles className="text-cyan-400" /> Tienda de Recompensas
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Usa tus TecnoPoints para obtener beneficios exclusivos.</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tu Saldo</span>
                                        <span className="text-xl font-bold text-cyan-400 font-mono">{points.toLocaleString()} PTS</span>
                                    </div>
                                    <button onClick={() => setIsStoreOpen(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 border-b border-gray-800 bg-[#11111a]/50 overflow-x-auto flex gap-2 hide-scrollbar shrink-0">
                                {categories.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => setActiveFilter(cat)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
                                    {filteredRewards.map((reward) => {
                                        const canAfford = points >= reward.cost;
                                        return (
                                            <motion.div 
                                                whileHover={{ y: -5 }}
                                                key={reward.id} 
                                                className={`bg-gray-900 border rounded-xl p-5 flex flex-col relative overflow-hidden transition-colors h-full ${canAfford ? 'border-gray-700 hover:border-indigo-500' : 'border-red-900/30 opacity-70'}`}
                                            >
                                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none z-0">
                                                    <reward.icon size={100} />
                                                </div>
                                                
                                                <div className={`p-3 rounded-xl bg-gray-800/50 w-fit mb-4 border border-gray-700 relative z-10`}>
                                                    <reward.icon className={reward.color} size={24} />
                                                </div>
                                                
                                                <div className="relative z-10 flex-grow flex flex-col">
                                                    <h4 className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2 min-h-[40px]">
                                                        {reward.name}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4 block truncate">
                                                        {reward.category}
                                                    </span>
                                                </div>
                                                
                                                <div className="mt-auto relative z-10 w-full pt-2">
                                                    <div className="flex justify-between items-end mb-3">
                                                        <span className="text-xs text-gray-400">Precio</span>
                                                        <span className={`font-mono font-bold text-sm ${canAfford ? 'text-cyan-400' : 'text-red-400'}`}>
                                                            {reward.cost.toLocaleString()} PTS
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRedeem(reward)}
                                                        disabled={!canAfford}
                                                        className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}
                                                    >
                                                        {canAfford ? 'Canjear' : 'Puntos Insuficientes'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: HISTORIAL DE TRANSACCIONES EN PRODUCCIÓN */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0f] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#11111a] rounded-t-2xl shrink-0">
                                <div>
                                    <h2 className="text-xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-3">
                                        <History className="text-cyan-400" /> Historial de Movimientos
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Registro de tus créditos y débitos de TecnoPoints.</p>
                                </div>
                                <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-3 hide-scrollbar min-h-[200px] relative">
                                {/* Estado de Carga */}
                                {isLoadingHistory ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]">
                                        <Loader className="animate-spin text-cyan-400" size={32} />
                                    </div>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 border border-green-500/20 text-green-400 group-hover:bg-green-500/20' : 'bg-red-500/10 border border-red-500/20 text-red-400 group-hover:bg-red-500/20'} transition-colors`}>
                                                    {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-sm mb-1">{tx.source}</h4>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                                        <CalendarDays size={12} /> {tx.date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`font-mono font-bold text-lg ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}{tx.amount} <span className="text-xs text-gray-500">PTS</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <History size={48} className="mx-auto text-gray-700 mb-4" />
                                        <h3 className="text-gray-400 font-bold mb-1">Aún no hay movimientos</h3>
                                        <p className="text-sm text-gray-600">Aquí aparecerá el registro de tus TecnoPoints ganados y gastados.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TecnoPoints;
