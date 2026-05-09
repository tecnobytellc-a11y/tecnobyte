import React, { useState } from 'react';
import { RefreshCw, Loader, CreditCard, Check } from 'lucide-react';
import { SERVER_URL } from '../../config/constants';

const PayPalAutomatedCheckout = ({ finalTotal, onPaymentComplete, isExchange, exchangeData, cart, coupon }) => {
    const [status, setStatus] = useState('idle'); 
    const [invoiceId, setInvoiceId] = useState(''); 
    const [approveLink, setApproveLink] = useState('');
    
    // MANEJO SEGURO DE POPUP (Evita bloqueo de navegadores)
    const handlePayPalPayment = async () => { 
        setStatus('processing');
        // Abrir ventana inmediatamente para evitar bloqueos del navegador
        const newWindow = window.open('', '_blank');
        if (newWindow) {
             newWindow.document.write(`<div style="background:#f8fafc;color:#1e293b;height:100vh;display:flex;justify-content:center;align-items:center;font-family:sans-serif;"><h1>Conectando con PayPal...</h1></div>`);
        }

        try { 
            const payload = { items: cart.map(item => ({ id: parseInt(item.id, 10), price: item.price })), couponCode: coupon ? coupon.code : null }; 
            const response = await fetch(`${SERVER_URL}/api/create-order`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            }); 
            const data = await response.json(); 
            
            if (data.id) { 
                setInvoiceId(data.id); 
                const link = data.links.find(l => l.rel === "approve").href;
                setApproveLink(link); 
                if (newWindow) {
                    newWindow.location.href = link;
                } else {
                    window.location.href = link; 
                }
                setStatus('verifying'); 
            } else throw new Error("Error PayPal"); 
        } catch (error) { 
            if(newWindow) newWindow.close();
            alert("Error PayPal: " + error.message); 
            setStatus('idle'); 
        } 
    };

    const handleVerification = async () => { 
        if (!invoiceId) return; 
        if (isExchange) setStatus('dispersing'); 
        try { 
            const response = await fetch(`${SERVER_URL}/api/capture-and-exchange`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ orderId: invoiceId, receiveAddress: exchangeData?.receiveAddress }) 
            }); 
            const result = await response.json(); 
            if (result.success) { 
                setStatus('completed'); 
                onPaymentComplete(invoiceId, result.binanceTxId); 
            } else { 
                alert("Pago fallido: " + result.message); 
                setStatus('verifying'); 
            } 
        } catch (error) { 
            alert("Error conexión"); 
            setStatus('verifying'); 
        } 
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md mx-auto animate-fade-in-up shadow-xl">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8" />
                <span className="text-slate-800 font-black text-xl tracking-tight">Checkout Seguro</span>
            </div>
            
            {status === 'idle' && (
                <div className="space-y-5">
                    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm text-center">
                        <p className="text-indigo-600 font-bold uppercase tracking-wider text-xs mb-2">Resumen de Pago:</p>
                        <p className="text-4xl font-black text-slate-800">{cart.some(item => item.id == 22 || item.isEuros) ? '€' : '$'}{finalTotal.toFixed(2)}</p>
                        {isExchange && (
                            <div className="mt-3 text-xs text-amber-600 font-bold flex items-center justify-center gap-1.5 bg-amber-50 rounded-lg p-2 border border-amber-200 inline-flex">
                                <RefreshCw size={12} /> Incluye dispersión a Binance
                            </div>
                        )}
                    </div>
                    <button onClick={handlePayPalPayment} className={`w-full font-black py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform transform hover:scale-[1.02] bg-[#FFC439] hover:bg-[#F4BB35] text-slate-900 tracking-wide text-lg`}>
                        Pagar con PayPal
                    </button>
                    <p className="text-xs text-slate-500 font-medium text-center px-4">Serás redirigido al portal seguro de PayPal.</p>
                </div>
            )}
            
            {status === 'processing' && (
                <div className="text-center py-10">
                    <Loader className="w-14 h-14 text-[#003087] animate-spin mx-auto mb-5" />
                    <p className="text-slate-800 font-black text-lg tracking-tight">Iniciando Transacción...</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Creando factura en PayPal...</p>
                </div>
            )}
            
            {status === 'verifying' && (
                <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto border border-blue-200 flex items-center justify-center shadow-sm">
                        <CreditCard className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-black text-2xl tracking-tight">Confirmar Pago</h4>
                        <p className="text-indigo-600 font-mono font-bold text-sm mt-1 bg-indigo-50 py-1 px-3 rounded-lg inline-block border border-indigo-100">Orden: {invoiceId}</p>
                        <p className="text-slate-600 font-medium text-sm mt-4 px-4 leading-relaxed">Hemos abierto una pestaña segura. Completa el pago y luego haz clic abajo.</p>
                        {approveLink && <a href={approveLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-600 hover:text-amber-700 underline block mt-2">¿No se abrió? Clic aquí</a>}
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-2 shadow-inner">
                        <button onClick={handleVerification} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl animate-pulse text-sm shadow-md transition-colors uppercase tracking-wider">Ya realicé el pago</button>
                    </div>
                </div>
            )}
            
            {status === 'dispersing' && (
                <div className="text-center py-10 space-y-5">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-amber-400 rounded-full animate-spin border-t-transparent"></div>
                        <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" className="absolute inset-0 w-10 h-10 m-auto animate-pulse drop-shadow-sm" alt="Binance" />
                    </div>
                    <div>
                        <p className="text-slate-800 font-black text-xl tracking-tight">Verificando y Enviando...</p>
                        <p className="text-sm font-bold text-amber-600 mt-1">Conectando con Binance API...</p>
                    </div>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2 mt-6 overflow-hidden">
                        <div className="bg-amber-400 h-2 rounded-full animate-[width_3s_ease-out_forwards] shadow-sm" style={{width: '90%'}}></div>
                    </div>
                </div>
            )}
            
            {status === 'completed' && (
                <div className="text-center py-8">
                    <Check className="w-20 h-20 text-emerald-500 mx-auto mb-5 drop-shadow-sm" strokeWidth={3} />
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight">¡Operación Exitosa!</h4>
                    <p className="text-slate-500 font-medium text-lg mt-2">El pago ha sido verificado.</p>
                    {isExchange && <p className="text-emerald-700 text-sm mt-3 font-bold bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-200 shadow-sm inline-block">Fondos enviados via Binance.</p>}
                </div>
            )}
        </div>
    );
};

export default PayPalAutomatedCheckout;
