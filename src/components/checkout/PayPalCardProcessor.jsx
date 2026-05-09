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
                const isEuros = cart.some(item => item.id == 22 || item.isEuros);
                const currency = isEuros ? "EUR" : "USD";
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&components=buttons,funding-eligibility`;
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
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-lg mx-auto animate-fade-in-up shadow-xl">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full relative shadow-inner overflow-hidden">
                
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                        <Loader className="animate-spin text-indigo-600 mb-4" size={56} />
                        <p className="text-slate-800 font-black text-xl animate-pulse tracking-tight">Procesando pago...</p>
                        <p className="text-slate-500 font-medium text-sm mt-2">Por favor, no cierres esta ventana.</p>
                    </div>
                )}

                {isOpeningForm && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center rounded-2xl">
                        <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
                        <p className="text-slate-800 font-black text-lg animate-pulse tracking-tight">Abriendo entorno bancario...</p>
                        <p className="text-emerald-700 font-bold text-xs mt-2 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"><Lock size={12} className="text-emerald-500"/> Conexión cifrada de extremo a extremo</p>
                    </div>
                )}

                <div className="text-center mb-6">
                    <h4 className="text-slate-800 font-black mb-1 flex items-center justify-center gap-2 text-2xl tracking-tight">
                        <CreditCard size={28} className="text-indigo-600" /> Tarjeta de Crédito / Débito
                    </h4>
                    
                    <div className="bg-white rounded-xl p-5 my-6 border border-slate-200 text-left shadow-sm">
                        <div className="flex justify-between text-sm text-slate-500 font-medium mb-3">
                            <span>Subtotal Productos:</span>
                            <span className="text-slate-800 font-bold">{cart.some(item => item.id == 22 || item.isEuros) ? '€' : '$'}{finalTotal.toFixed(2)} {cart.some(item => item.id == 22 || item.isEuros) ? 'EUR' : 'USD'}</span>
                        </div>
                        <div className="flex justify-between text-sm text-amber-600 font-bold mb-4 border-b border-slate-100 pb-4">
                            <span>Comisión Bancaria (2.70% + $0.15):</span>
                            <span>+{cart.some(item => item.id == 22 || item.isEuros) ? '€' : '$'}{feeAmount.toFixed(2)} {cart.some(item => item.id == 22 || item.isEuros) ? 'EUR' : 'USD'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total a cobrar:</span>
                            <span className="text-2xl font-black font-mono text-indigo-600 drop-shadow-sm">{cart.some(item => item.id == 22 || item.isEuros) ? '€' : '$'}{totalWithFee.toFixed(2)} {cart.some(item => item.id == 22 || item.isEuros) ? 'EUR' : 'USD'}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-center items-center gap-3 mt-4">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                            <img src="/icons/visa.png" alt="Visa" className="h-5 w-auto object-contain" />
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-5 object-contain" />
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                            <img src="/icons/amex.png" alt="Amex" className="h-5 object-contain" />
                        </div>
                    </div>
                </div>
                
                {!sdkReady ? (
                    <div className="flex justify-center py-10"><Loader className="animate-spin text-indigo-600" size={40} /></div>
                ) : (
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm min-h-[220px] w-full flex flex-col justify-center items-center relative border border-slate-200 mt-2">
                        <div id="paypal-card-container" className="w-full relative z-10"></div>
                    </div>
                )}
                
                <div className="mt-8 pt-5 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-500" /> Pagos procesados globalmente con tecnología segura.
                    </p>
                </div>
            </div>
            <div className="mt-6 text-center">
                <button onClick={() => setCheckoutStep(1)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-6 py-2 rounded-xl text-sm transition-colors font-bold tracking-wide uppercase">← VOLVER A MIS DATOS</button>
            </div>
        </div>
    );
};

export default PayPalCardProcessor;
