import React, { useState } from 'react';
import { 
    Coins, Sparkles, TrendingUp, X, Gem, Crosshair, Ticket, 
    Percent, Wallet, Package, RefreshCw, Crown, Target, 
    Flame, Zap, Headphones, Shield, History, ArrowUpRight, ArrowDownRight, CalendarDays, Loader, CheckCircle2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../pages/firebase'; 
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import axios from 'axios';

const REWARDS_CATALOG = [
    { id: 'cup_050', name: 'Cupón $0.50 USD', cost: 800, category: 'Economía', icon: Ticket, color: 'text-pink-500' },
    { id: 'cup_100', name: 'Cupón $1.00 USD', cost: 1500, category: 'Economía', icon: Ticket, color: 'text-pink-600' },
    { id: 'cup_3pct', name: 'Cupón 3% Descuento', cost: 500, category: 'Economía', icon: Percent, color: 'text-pink-400' },
    { id: 'tnb_050', name: 'Saldo TNB $0.50', cost: 1000, category: 'Economía', icon: Wallet, color: 'text-emerald-500' },
    { id: 'tnb_100', name: 'Saldo TNB $1.00', cost: 1800, category: 'Economía', icon: Wallet, color: 'text-emerald-600' },
    { id: 'box_tier1', name: 'Caja Mítica', cost: 600, category: 'Economía', icon: Package, color: 'text-purple-500' },
    { id: 'spin_extra', name: 'Giro Extra (Ruleta)', cost: 300, category: 'Beneficios VIP', icon: RefreshCw, color: 'text-indigo-500' },
    { id: 'ticket_vip', name: 'Soporte Prioritario', cost: 400, category: 'Beneficios VIP', icon: Headphones, color: 'text-blue-500' },
    { id: 'badge_hunter', name: 'Insignia "Cazador"', cost: 1000, category: 'Cosméticos', icon: Target, color: 'text-red-500' },
    { id: 'rank_prot', name: 'Protección de Rango', cost: 1200, category: 'Beneficios VIP', icon: Shield, color: 'text-indigo-400' },
    { id: 'mult_x2', name: 'Puntos x2 (24 horas)', cost: 2000, category: 'Beneficios VIP', icon: Zap, color: 'text-amber-500' },
    { id: 'badge_vip', name: 'Insignia VIP Dorada', cost: 2500, category: 'Cosméticos', icon: Crown, color: 'text-amber-600' },
    { id: 'neon_name', name: 'Gamertag Luminoso', cost: 3000, category: 'Cosméticos', icon: Sparkles, color: 'text-cyan-500' },
    { id: 'fire_frame', name: 'Marco de Fuego', cost: 3500, category: 'Cosméticos', icon: Flame, color: 'text-orange-600' },
];

const TecnoPoints = ({ points = 0, pointsPending = 0, onUpdate }) => {
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    const [transactions, setTransactions] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    
    // --- INYECCIÓN: ESTADOS DEL MODAL DE RECLAMO INTERACTIVO ---
    const [claimModal, setClaimModal] = useState({ isOpen: false, reward: null, step: 'confirm', playerData: '', resultMessage: '' });

    const openClaimModal = (reward) => {
        if (points < reward.cost) return;
        setClaimModal({ isOpen: true, reward, step: 'confirm', playerData: '', resultMessage: '' });
    };

    const handleConfirmClaim = async () => {
        const { reward, playerData } = claimModal;

        if (reward.requiresId && !playerData.trim()) {
            alert("Por favor, ingresa tu ID de Jugador para poder enviarte la recarga.");
            return;
        }

        setClaimModal(prev => ({ ...prev, step: 'processing' }));
        try {
            const response = await axios.post('https://api-paypal-secure.vercel.app/api/gamification/redeem-points', {
                userId: auth.currentUser.uid,
                rewardId: reward.id,
                playerData: playerData.trim()
            });

            if (response.data.success) {
                setClaimModal(prev => ({ ...prev, step: 'success', resultMessage: response.data.message }));
                if (onUpdate) onUpdate(); 
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error procesando el canje en el servidor.");
            setClaimModal(prev => ({ ...prev, step: 'confirm' })); // Vuelve atrás si falla
        }
    };

    const handleOpenHistory = async () => {
        setIsHistoryOpen(true);
        if (!auth.currentUser) return;
        
        setIsLoadingHistory(true);
        try {
            const q = query(collection(db, "usuarios", auth.currentUser.uid, "historial_puntos"), orderBy("timestamp", "desc"), limit(20));
            const querySnapshot = await getDocs(q);
            const historyData = [];
            querySnapshot.forEach((doc) => { historyData.push({ id: doc.id, ...doc.data() }); });
            setTransactions(historyData);
        } catch (error) {
            console.error("Error cargando el historial:", error);
        }
        setIsLoadingHistory(false);
    };

    const categories = ['Todos', 'Economía', 'Beneficios VIP', 'Cosméticos'];
    const filteredRewards = activeFilter === 'Todos' ? REWARDS_CATALOG : REWARDS_CATALOG.filter(r => r.category === activeFilter);

    return (
        <>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <Coins size={140} className="text-indigo-900" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
                            <Sparkles className="text-indigo-600 w-5 h-5" />
                        </div>
                        <h3 className="text-slate-800 font-bold tracking-tight text-lg">Mis Tecno Points</h3>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-black font-orbitron text-indigo-600 drop-shadow-sm">
                            {points.toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-bold text-sm">PTS</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg inline-flex mt-2 shadow-sm">
                        <TrendingUp size={14} className="text-emerald-500" />
                        <span>+{pointsPending} Pendientes de Validación</span>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsStoreOpen(true)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition-colors shadow-md uppercase tracking-wide"
                        >
                            Canjear Recompensas
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleOpenHistory}
                            className="px-6 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl text-xs border border-slate-200 transition-colors uppercase tracking-widest shadow-sm"
                        >
                            Historial
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* MODAL: TIENDA PRINCIPAL */}
            <AnimatePresence>
                {isStoreOpen && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0 window-header">
                                <div>
                                    <h2 className="text-2xl font-black font-orbitron text-indigo-800 flex items-center gap-3 tracking-tight">
                                        <Sparkles className="text-indigo-600" /> Tienda de Recompensas
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Usa tus TecnoPoints para obtener beneficios exclusivos.</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tu Saldo</span>
                                        <span className="text-xl font-black text-indigo-600 font-mono drop-shadow-sm">{points.toLocaleString()} PTS</span>
                                    </div>
                                    <button onClick={() => setIsStoreOpen(false)} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors shadow-sm"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="p-4 border-b border-slate-100 bg-white overflow-x-auto flex gap-3 hide-scrollbar shrink-0">
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${activeFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 overflow-y-auto bg-slate-50/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-fr">
                                    {filteredRewards.map((reward) => {
                                        const canAfford = points >= reward.cost;
                                        return (
                                            <motion.div whileHover={{ y: -5 }} key={reward.id} className={`bg-white border rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all shadow-sm h-full ${canAfford ? 'border-slate-200 hover:border-indigo-300 hover:shadow-lg' : 'border-slate-200 opacity-60 grayscale-[30%]'}`}>
                                                <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none z-0"><reward.icon size={120} /></div>
                                                <div className={`p-4 rounded-2xl bg-slate-50 w-fit mb-5 border border-slate-100 relative z-10 shadow-inner`}><reward.icon className={reward.color} size={28} /></div>
                                                <div className="relative z-10 flex-grow flex flex-col">
                                                    <h4 className="text-slate-800 font-black text-base leading-snug mb-1.5 line-clamp-2 min-h-[44px]">{reward.name}</h4>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4 block truncate">{reward.category}</span>
                                                </div>
                                                <div className="mt-auto relative z-10 w-full pt-4 border-t border-slate-50">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Precio</span>
                                                        <span className={`font-mono font-black text-lg ${canAfford ? 'text-indigo-600' : 'text-slate-400'}`}>{reward.cost.toLocaleString()} PTS</span>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => openClaimModal(reward)}
                                                        disabled={!canAfford}
                                                        className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${canAfford ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
                                                    >
                                                        {canAfford ? 'Seleccionar' : 'Insuficiente'}
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

            {/* --- INYECCIÓN: MODAL INTERACTIVO DE RECLAMO --- */}
            <AnimatePresence>
                {claimModal.isOpen && claimModal.reward && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
                            
                            {/* Cabecera del Modal */}
                            <div className="p-8 border-b border-slate-100 text-center relative bg-slate-50">
                                <button onClick={() => setClaimModal({ isOpen: false })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm"><X size={18}/></button>
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-200 shadow-sm">
                                    <claimModal.reward.icon className={claimModal.reward.color} size={36} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirmar Canje</h3>
                                <p className="text-sm font-medium text-slate-500">Estás a punto de adquirir <strong className="text-slate-800">{claimModal.reward.name}</strong></p>
                            </div>

                            {/* Cuerpo dinámico según el estado */}
                            <div className="p-8">
                                {claimModal.step === 'confirm' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Costo Total:</span>
                                            <span className="text-2xl font-black font-mono text-indigo-600 drop-shadow-sm">-{claimModal.reward.cost} PTS</span>
                                        </div>

                                        {/* Si es Free Fire o COD, pedimos el ID */}
                                        {claimModal.reward.requiresId && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-700 flex items-center gap-1.5">
                                                    <Target size={14} className="text-indigo-500" /> Ingresa tu ID de Jugador:
                                                </label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Ej: 12345678" 
                                                    value={claimModal.playerData}
                                                    onChange={(e) => setClaimModal(prev => ({...prev, playerData: e.target.value}))}
                                                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors shadow-sm font-medium"
                                                />
                                                <p className="text-[10px] text-slate-500 font-medium">Verifica bien tu ID, las recargas enviadas a IDs incorrectos no se pueden reembolsar.</p>
                                            </div>
                                        )}

                                        <button onClick={handleConfirmClaim} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-md text-sm uppercase tracking-wider mt-2">
                                            Confirmar y Pagar
                                        </button>
                                    </div>
                                )}

                                {claimModal.step === 'processing' && (
                                    <div className="py-10 text-center space-y-5">
                                        <Loader className="animate-spin text-indigo-600 mx-auto" size={56} />
                                        <p className="text-indigo-800 font-black animate-pulse text-lg tracking-tight">Procesando Canje de Recompensa...</p>
                                    </div>
                                )}

                                {claimModal.step === 'success' && (
                                    <div className="text-center space-y-5 py-4">
                                        <CheckCircle2 className="text-emerald-500 mx-auto drop-shadow-sm" size={72} strokeWidth={2} />
                                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">¡Recompensa Reclamada!</h4>
                                        
                                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-800 text-sm whitespace-pre-wrap font-bold shadow-inner">
                                            {claimModal.resultMessage}
                                        </div>

                                        <button onClick={() => setClaimModal({ isOpen: false })} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all mt-6 text-sm shadow-md">
                                            Entendido, Volver a la Tienda
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL HISTORIAL */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-black font-orbitron text-indigo-700 flex items-center gap-3 tracking-tight"><History className="text-indigo-500" /> Historial de Movimientos</h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Registro de tus créditos y débitos de TecnoPoints.</p>
                                </div>
                                <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-500 transition-colors shadow-sm"><X size={20} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-3 hide-scrollbar min-h-[200px] relative bg-slate-50/50">
                                {isLoadingHistory ? (
                                    <div className="absolute inset-0 flex items-center justify-center"><Loader className="animate-spin text-indigo-600" size={32} /></div>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl flex items-center justify-center shadow-inner ${tx.type === 'credit' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'} transition-colors`}>
                                                    {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-slate-800 font-bold text-sm mb-1 tracking-tight">{tx.source}</h4>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest"><CalendarDays size={12} /> {tx.date}</div>
                                                </div>
                                            </div>
                                            <div className={`font-mono font-black text-xl ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}{tx.amount} <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">PTS</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                                        <History size={64} className="mx-auto text-slate-300 mb-4" />
                                        <h3 className="text-slate-700 font-bold mb-1 text-lg">Aún no hay movimientos</h3>
                                        <p className="text-sm font-medium text-slate-500">Aquí aparecerá el registro de tus TecnoPoints ganados y gastados.</p>
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
