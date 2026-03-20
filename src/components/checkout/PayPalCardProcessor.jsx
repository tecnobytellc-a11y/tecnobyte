import React, { useState, useEffect } from 'react';
import { Loader, Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { SERVER_URL } from '../../config/constants';
import { submitOrderToPrivateServer } from '../../utils/security';

const PayPalCardProcessor = ({ cart, finalTotal, coupon, paypalData, setLastOrder, setCart, setCheckoutStep }) => {
    const [sdkReady, setSdkReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpeningForm, setIsOpeningForm] = useState(false);

    // Lógica visual de la comisión (2.70% + $0.15)
    const feeAmount = (finalTotal * 0.027) + 0.15;
    const totalWithFee = finalTotal + feeAmount;
    
    // Esto es solo para que aparezca reflejado en la factura PDF y en tu panel de administración
    const cartWithFee = [...cart, { id: 'FEE_CARD', title: 'Comisión Bancaria por Tarjeta (2.70% + $0.15)', price: feeAmount, category: 'Tarifas de Procesamiento' }];

    useEffect(() => {
        const loadPayPalSdk = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/api/get-paypal-client-id`);
                const { clientId } = await res.json();
                if (window.paypal) { setSdkReady(true); return; }
                const script = document.createElement("script");
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons,funding-eligibility`;
                script.async = true;
                script.onload = () => setSdkReady(true);
                document.body.appendChild(script);
            } catch (error) { console.error("Error cargando PayPal:", error); }
        };
        loadPayPalSdk();
    }, []);

    useEffect(() => {
        if (sdkReady && window.paypal) {
            const container = document.getElementById('paypal-card-container');
            if (container) container.innerHTML = ''; 
            
            window.paypal.Buttons({
                fundingSource: window.paypal.FUNDING.CARD,
                style: {
                    layout: 'vertical', 
                    color: 'black',
                    shape: 'rect',
                    label: 'pay'
                },
                onClick: (data, actions) => {
                    setIsOpeningForm(true);
                    setTimeout(() => { setIsOpeningForm(false); }, 3000); 
                },
                createOrder: async () => {
                    try {
                        const res = await fetch(`${SERVER_URL}/api/create-order`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            // 🚀 MAGIA: Le enviamos "isCard: true" a tu servidor privado para que ÉL aplique la comisión de forma in-hackeable
                            body: JSON.stringify({ items: cart, couponCode: coupon?.code, isCard: true })
                        });
                        const data = await res.json(); 
                        return data.id; 
                    } catch (error) { alert("Error conectando al banco."); throw error; }
                },
                onApprove: async (data, actions) => {
                    setIsProcessing(true); 
                    try {
                        const res = await fetch(`${SERVER_URL}/api/capture-paypal-order`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: data.orderID })
                        });
                        const captureData = await res.json();
                        if (captureData.success) { 
                            const uniqueId = 'ORD-' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 100); 
                            const orderData = { 
                                orderId: uniqueId, 
                                visualId: uniqueId, 
                                user: `${paypalData.firstName} ${paypalData.lastName}`, 
                                items: cartWithFee.map(i => i.title).join(', '), 
                                total: totalWithFee.toFixed(2), 
                                status: 'VERIFICADO (Pagado)', 
                                date: new Date().toISOString(), 
                                rawItems: cartWithFee.map(({ icon, ...rest }) => rest), // 👈 Factura guardará la comisión
                                paymentMethod: 'tarjeta_credito_debito', 
                                couponData: coupon, 
                                fullData: { ...paypalData, refNumber: data.orderID, feeApplied: feeAmount.toFixed(2) } 
                            };
                            await submitOrderToPrivateServer(orderData);
                            setLastOrder(orderData);
                            setCart([]);
                            setCheckoutStep(3);
                        } 
                        else { alert("Pago rechazado por el banco: " + captureData.message); }
                    } catch (error) { alert("Error verificando el pago."); } 
                    finally { setIsProcessing(false); }
                },
                onError: (err) => { alert("Error procesando la tarjeta. Verifica que los datos sean correctos."); },
                onCancel: () => { setIsOpeningForm(false); }
            }).render("#paypal-card-container");
        }
    }, [sdkReady, cart, coupon]);

    return (
        <div className="bg-gray-900 p-8 rounded-2xl border border-indigo-500/30 max-w-lg mx-auto animate-fade-in-up">
            <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/50 w-full relative shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden">
                
                {isProcessing && (
                    <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                        <Loader className="animate-spin text-cyan-400 mb-4" size={48} />
                        <p className="text-white font-bold text-lg animate-pulse">Procesando pago...</p>
                        <p className="text-gray-400 text-xs mt-2">Por favor, no cierres esta ventana.</p>
                    </div>
                )}

                {isOpeningForm && (
                    <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-md z-40 flex flex-col items-center justify-center rounded-xl">
                        <Loader className="animate-spin text-cyan-400 mb-3" size={36} />
                        <p className="text-white font-bold text-sm animate-pulse">Abriendo entorno bancario...</p>
                        <p className="text-gray-400 text-[10px] mt-1 flex items-center gap-1"><Lock size={10} className="text-green-400"/> Conexión cifrada de extremo a extremo</p>
                    </div>
                )}

                <div className="text-center mb-5">
                    <h4 className="text-white font-bold mb-1 flex items-center justify-center gap-2 text-xl">
                        <CreditCard size={24} className="text-cyan-400" /> Tarjeta de Crédito / Débito
                    </h4>
                    
                    <div className="bg-gray-900/60 rounded-xl p-4 my-5 border border-gray-700 text-left">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Subtotal Productos:</span>
                            <span>${finalTotal.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-sm text-yellow-500 mb-3 border-b border-gray-700 pb-3">
                            <span>Comisión Bancaria (2.70% + $0.15):</span>
                            <span>+${feeAmount.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white uppercase tracking-wider">Total a cobrar:</span>
                            <span className="text-xl font-bold font-mono text-cyan-400">${totalWithFee.toFixed(2)} USD</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-center items-center gap-3 mt-3">
                        <div className="bg-white px-2 py-1 rounded shadow-sm flex items-center justify-center">
                            <img src="/icons/visa.png" alt="Visa" className="h-4 w-auto object-contain" />
                        </div>
                        <div className="bg-white px-2 py-0.5 rounded shadow-sm"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-4" /></div>
                        <div className="bg-white px-2 py-0.5 rounded shadow-sm"><img src="/icons/amex.png" alt="Amex" className="h-4" /></div>
                    </div>
                </div>
                
                {!sdkReady ? (
                    <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-500" size={32} /></div>
                ) : (
                    <div className="bg-white p-3 sm:p-5 rounded-xl shadow-inner min-h-[220px] w-full flex flex-col justify-center items-center relative border-2 border-gray-200">
                        <div id="paypal-card-container" className="w-full relative z-10"></div>
                    </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <ShieldCheck size={14} className="text-green-400" /> Pagos procesados globalmente con tecnología segura.
                    </p>
                </div>
            </div>
            <div className="mt-4 text-center">
                <button onClick={() => setCheckoutStep(1)} className="text-gray-500 hover:text-white text-sm transition-colors font-bold tracking-wide">← VOLVER A MIS DATOS</button>
            </div>
        </div>
    );
};

export default PayPalCardProcessor;
