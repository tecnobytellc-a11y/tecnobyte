import React, { useState } from 'react';
import { Zap, Check, Loader, Mail, QrCode } from 'lucide-react';
import { SERVER_URL } from '../../config/constants';

const BinanceAutomatedCheckout = ({ finalTotal, onVerified, onCancel, contactInfo }) => {
    const [transactionId, setTransactionId] = useState('');
    const [status, setStatus] = useState('idle'); 
    
    const handleVerify = async () => { 
        if (!transactionId) { alert("ID inválido"); return; } 
        setStatus('verifying'); 
        try { 
            const response = await fetch(`${SERVER_URL}/api/verify-binance-pay`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ orderId: transactionId, amount: finalTotal.toFixed(2) }) 
            }); 
            const result = await response.json(); 
            if (result.success) { 
                setStatus('success'); 
                setTimeout(() => onVerified(transactionId), 2000); 
            } else { 
                alert(result.message); 
                setStatus('idle'); 
            } 
        } catch (error) { 
            alert("Error de conexión"); 
            setStatus('idle'); 
        } 
    };

    return (
        <div className="bg-white border border-amber-200 rounded-2xl p-8 max-w-lg mx-auto animate-fade-in-up relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex justify-between items-start mb-6 relative z-10 border-b border-slate-100 pb-5">
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#FCD535] rounded-xl flex items-center justify-center text-slate-900 font-bold text-xl shadow-sm transform -rotate-3">
                         <Zap size={24} fill="currentColor" />
                     </div>
                     <div>
                         <h3 className="text-slate-800 font-black text-xl tracking-tight">Binance Pay</h3>
                         <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Verificación Automática</p>
                     </div>
                 </div>
             </div>
             
             {status === 'success' ? (
                 <div className="text-center py-10 animate-scale-in">
                     <div className="w-24 h-24 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                         <Check className="w-12 h-12 text-emerald-500" strokeWidth={3} />
                     </div>
                     <h4 className="text-2xl font-black text-slate-800 tracking-tight">¡Pago Verificado!</h4>
                 </div>
             ) : (
                <div className="space-y-6 relative z-10">
                    <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-amber-300 text-center shadow-inner">
                        <p className="text-slate-600 text-xs mb-2 font-bold uppercase tracking-wider">Envía exactamente:</p>
                        <p className="text-5xl font-mono font-black text-amber-500 mb-4 drop-shadow-sm">${finalTotal.toFixed(2)}</p>
                        <div className="flex justify-center flex-wrap gap-2">
                            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                                <Mail size={14} className="text-amber-500"/> {contactInfo.binance_email}
                            </div>
                            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                                <QrCode size={14} className="text-amber-500"/> Pay ID: {contactInfo.binance_pay_id}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">Order ID / ID de Transacción</label>
                        <input 
                            type="text" 
                            value={transactionId} 
                            onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ''))} 
                            placeholder="Pega aquí el ID (Ej: 423516...)" 
                            className="w-full bg-white border border-slate-300 rounded-xl py-3.5 px-4 text-slate-800 font-mono focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none shadow-sm transition-all"
                        />
                        <p className="text-[10px] text-slate-500 font-medium ml-1">El ID que te da Binance tras el pago (18+ dígitos)</p>
                    </div>
                    
                    <div className="flex gap-3 pt-3">
                        <button onClick={onCancel} className="px-5 py-3.5 rounded-xl text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-100 transition-colors">Cancelar</button>
                        <button onClick={handleVerify} disabled={status === 'verifying' || !transactionId} className="flex-1 bg-[#FCD535] hover:bg-[#E5C02C] text-slate-900 font-black py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none">
                            {status === 'verifying' ? <><Loader className="animate-spin" size={20} /> Verificando...</> : "Ya pagué, Verificar"}
                        </button>
                    </div>
                </div>
             )}
        </div>
    );
};

export default BinanceAutomatedCheckout;
