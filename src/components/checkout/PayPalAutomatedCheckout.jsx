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
             newWindow.document.write(`<div style="background:#000;color:#fff;height:100vh;display:flex;justify-content:center;align-items:center;font-family:sans-serif;"><h1>Conectando con PayPal...</h1></div>`);
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
        <div className="bg-gray-900 border border-indigo-500/30 rounded-xl p-6 max-w-md mx-auto animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8" />
                <span className="text-white font-bold text-lg">Checkout Seguro</span>
            </div>
            
            {status === 'idle' && (
                <div className="space-y-4">
                    <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
                        <p className="text-gray-300 text-sm mb-2">Resumen de Pago:</p>
                        <p className="text-3xl font-bold text-white">${finalTotal.toFixed(2)}</p>
                        {isExchange && (
                            <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
                                <RefreshCw size={10} /> Incluye dispersión automática a Binance
                            </div>
                        )}
                    </div>
                    <button onClick={handlePayPalPayment} className={`w-full font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] bg-[#FFC439] hover:bg-[#F4BB35] text-blue-900`}>
                        Pagar con PayPal
                    </button>
                    <p className="text-[10px] text-gray-500 text-center">Serás redirigido al portal seguro de PayPal.</p>
                </div>
            )}
            
            {status === 'processing' && (
                <div className="text-center py-8">
                    <Loader className="w-12 h-12 text-[#003087] animate-spin mx-auto mb-4" />
                    <p className="text-white font-bold">Iniciando Transacción...</p>
                    <p className="text-xs text-gray-400">Creando factura en PayPal...</p>
                </div>
            )}
            
            {status === 'verifying' && (
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto border border-blue-500/50 flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-xl">Confirmar Pago</h4>
                        <p className="text-indigo-400 font-mono text-sm mt-1">Orden: {invoiceId}</p>
                        <p className="text-gray-400 text-xs mt-2 px-4">Hemos abierto una pestaña segura. Completa el pago y luego haz clic abajo.</p>
                        {approveLink && <a href={approveLink} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-500 underline block mt-1">¿No se abrió? Clic aquí</a>}
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-left">
                        <button onClick={handleVerification} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded text-sm animate-pulse-green shadow-lg">Ya realicé el pago</button>
                    </div>
                </div>
            )}
            
            {status === 'dispersing' && (
                <div className="text-center py-8 space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-spin border-t-transparent"></div>
                        <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" className="absolute inset-0 w-8 h-8 m-auto animate-pulse" alt="Binance" />
                    </div>
                    <div>
                        <p className="text-white font-bold">Verificando y Enviando...</p>
                        <p className="text-xs text-yellow-500">Conectando con Binance API...</p>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4">
                        <div className="bg-yellow-500 h-1.5 rounded-full animate-[width_3s_ease-out_forwards]" style={{width: '90%'}}></div>
                    </div>
                </div>
            )}
            
            {status === 'completed' && (
                <div className="text-center py-6">
                    <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold text-white">¡Operación Exitosa!</h4>
                    <p className="text-gray-400 text-sm mt-2">El pago ha sido verificado.</p>
                    {isExchange && <p className="text-green-400 text-xs mt-2 font-bold bg-green-900/20 p-2 rounded border border-green-900">Fondos enviados via Binance.</p>}
                </div>
            )}
        </div>
    );
};

export default PayPalAutomatedCheckout;
