import React, { useState, useEffect } from 'react';
import { X, Trash2, Link as LinkIcon, Lock, ShoppingCart, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = ({ 
    isCartOpen, setIsCartOpen, cart, removeFromCart, finalTotal, 
    handleCheckoutStart, requiresGroupLink, paypalData, setPaypalData, coupon 
}) => {
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        if (!isCartOpen) {
            setTimeLeft(15 * 60);
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [isCartOpen]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    return (
        <AnimatePresence>
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setIsCartOpen(false)}
                    ></motion.div>
                    
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-gray-900 shadow-2xl border-l border-gray-800 p-6 flex flex-col h-full overflow-hidden"
                    >
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                    <h2 className="text-2xl font-bold text-white font-orbitron tracking-wide">Tu Carrito</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="text-gray-400 hover:text-white" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    {cart.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-400">
                                <Timer size={16} className={timeLeft < 60 ? "animate-pulse" : ""} />
                                <span className="text-xs font-bold uppercase tracking-wider">Artículos reservados</span>
                            </div>
                            <div className="font-mono text-red-500 font-bold bg-red-950/50 px-2 py-0.5 rounded border border-red-500/50">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    )}
                    
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-70">
                            <ShoppingCart size={48} className="mb-4" />
                            <p className="font-mono text-sm">El carrito está vacío</p>
                        </div>
                    ) : cart.map((item, idx) => ( 
                        <div key={idx} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-indigo-500/30 transition-colors group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-white font-bold leading-tight">{item.title}</h4>
                                    <p className="text-lg font-mono text-cyan-400 mt-1">${item.price.toFixed(2)}</p>
                                </div>
                                <button onClick={() => removeFromCart(idx)} className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            {item.exchangeData && item.type === 'usdt' && (
                                <p className="text-[10px] text-yellow-500 mt-3 bg-yellow-900/10 p-2 rounded border border-yellow-500/20 font-mono">
                                    Destino: {item.exchangeData.receiveAddress} <br/>({item.exchangeData.receiveType})
                                </p>
                            )}
                        </div> 
                    ))}
                    
                    {requiresGroupLink && (
                        <div className="mt-4 p-4 bg-indigo-900/10 border border-indigo-500/30 rounded-xl animate-scale-in">
                            <label className="text-xs text-indigo-300 font-bold mb-2 flex items-center gap-2 uppercase tracking-wide">
                                <LinkIcon size={14} /> Enlace de Grupo (Bot)
                            </label>
                            <input 
                                type="text" 
                                placeholder="https://chat.whatsapp.com/..." 
                                className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                                value={paypalData.groupLink || ''}
                                onChange={(e) => setPaypalData({...paypalData, groupLink: e.target.value})}
                            />
                            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">El bot se unirá a este grupo automáticamente tras el pago.</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-6 border-t border-gray-800 pt-6">
                    {coupon && ( 
                        <div className="flex justify-between items-center text-sm mb-3 bg-green-900/10 p-2 rounded-lg border border-green-500/20">
                            <span className="text-gray-400">Cupón ({coupon.code}):</span>
                            <span className="text-green-400 font-bold font-mono">-{coupon.percent}%</span>
                        </div> 
                    )}
                    
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total</span>
                        <span className="text-3xl font-bold text-white font-mono">${finalTotal.toFixed(2)}</span>
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={cart.length === 0} 
                        onClick={handleCheckoutStart} 
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex justify-center items-center gap-2 group border border-indigo-500"
                    >
                        Proceder al Pago <Lock size={18} className="group-hover:scale-110 transition-transform" />
                    </motion.button>
                </div>
            </motion.div>
        </div> 
        )}
        </AnimatePresence>
    );
};

export default CartDrawer;
