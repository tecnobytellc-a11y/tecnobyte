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
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-lg mx-auto animate-fade-in-up relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex justify-between items-start mb-6 relative z-10 border-b border-gray-800 pb-4">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#FCD535] rounded-full flex items-center justify-center text-black font-bold text-xl">
                         <Zap size={24} fill="currentColor" />
                     </div>
                     <div>
                         <h3 className="text-white font-bold text-lg">Binance Pay</h3>
                         <p className="text-xs text-gray-400">Verificación Automática</p>
                     </div>
                 </div>
             </div>
             
             {status === 'success' ? (
                 <div className="text-center py-10 animate-scale-in">
                     <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                         <Check className="w-10 h-10 text-white" strokeWidth={4} />
                     </div>
                     <h4 className="text-2xl font-bold text-white">¡Pago Verificado!</h4>
                 </div>
             ) : (
                <div className="space-y-6 relative z-10">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-dashed border-gray-700 text-center">
                        <p className="text-gray-400 text-xs mb-2">Envía exactamente:</p>
                        <p className="text-4xl font-mono font-bold text-[#FCD535] mb-2">${finalTotal.toFixed(2)}</p>
                        <div className="flex justify-center gap-2 mb-2">
                            <div className="bg-black/40 px-3 py-1.5 rounded border border-gray-600 text-xs font-mono text-white flex items-center gap-2">
                                <Mail size={12} className="text-yellow-500"/> {contactInfo.binance_email}
                            </div>
                        </div>
                        <div className="flex justify-center gap-2">
                            <div className="bg-black/40 px-3 py-1.5 rounded border border-gray-600 text-xs font-mono text-white flex items-center gap-2">
                                <QrCode size={12} className="text-yellow-500"/> Pay ID: {contactInfo.binance_pay_id}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white">Order ID / ID de Transacción</label>
                        <input 
                            type="text" 
                            value={transactionId} 
                            onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ''))} 
                            placeholder="Pega aquí el ID (Ej: 423516...)" 
                            className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 px-4 text-white font-mono focus:border-[#FCD535] outline-none"
                        />
                        <p className="text-[10px] text-gray-500">El ID que te da Binance tras el pago (18+ dígitos)</p>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <button onClick={onCancel} className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">Cancelar</button>
                        <button onClick={handleVerify} disabled={status === 'verifying' || !transactionId} className="flex-1 bg-[#FCD535] hover:bg-[#E5C02C] text-black font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2">
                            {status === 'verifying' ? <><Loader className="animate-spin" size={20} /> Verificando...</> : "Ya pagué, Verificar"}
                        </button>
                    </div>
                </div>
             )}
        </div>
    );
};

export default BinanceAutomatedCheckout;
