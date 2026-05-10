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
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                        onClick={() => setIsCartOpen(false)}
                    ></motion.div>
                    
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col h-full overflow-hidden"
                    >
                
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tu Carrito</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="text-slate-400 hover:text-slate-800" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    {cart.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-600">
                                <Timer size={16} className={timeLeft < 60 ? "animate-pulse" : ""} />
                                <span className="text-xs font-bold uppercase tracking-wider">Artículos reservados</span>
                            </div>
                            <div className="font-mono text-red-600 font-bold bg-red-100 px-2.5 py-1 rounded-md border border-red-200">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    )}
                    
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <ShoppingCart size={56} className="mb-4 opacity-50 text-slate-300" />
                            <p className="font-medium text-slate-500">El carrito está vacío</p>
                        </div>
                    ) : cart.map((item, idx) => ( 
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-slate-800 font-bold leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                    <p className="text-lg font-black text-indigo-600 mt-1">${item.price.toFixed(2)}</p>
                                </div>
                                <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            {item.exchangeData && item.type === 'usdt' && (
                                <p className="text-[10px] text-amber-700 mt-3 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-mono font-medium shadow-sm">
                                    Destino: {item.exchangeData.receiveAddress} <br/>({item.exchangeData.receiveType})
                                </p>
                            )}
                        </div> 
                    ))}
                    
                    {requiresGroupLink && (
                        <div className="mt-4 p-5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-inner animate-scale-in">
                            <label className="text-xs text-indigo-600 font-bold mb-2 flex items-center gap-2 uppercase tracking-wide">
                                <LinkIcon size={14} /> Enlace de Grupo (Bot)
                            </label>
                            <input 
                                type="text" 
                                placeholder="https://chat.whatsapp.com/..." 
                                className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-3 text-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                value={paypalData.groupLink || ''}
                                onChange={(e) => setPaypalData({...paypalData, groupLink: e.target.value})}
                            />
                            <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed">El bot se unirá a este grupo automáticamente tras el pago.</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-6 border-t border-slate-100 pt-6">
                    {coupon && ( 
                        <div className="flex justify-between items-center text-sm mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200 shadow-sm">
                            <span className="text-slate-600 font-medium">Cupón ({coupon.code}):</span>
                            <span className="text-emerald-600 font-bold font-mono">-{coupon.percent}%</span>
                        </div> 
                    )}
                    
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Final</span>
                        <span className="text-3xl font-black text-slate-800">${finalTotal.toFixed(2)}</span>
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={cart.length === 0} 
                        onClick={handleCheckoutStart} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent disabled:shadow-none disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 group border border-indigo-500"
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
