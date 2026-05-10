import React, { useState, useEffect } from 'react';
import { Loader, Lock, CreditCard, ShieldCheck, Euro } from 'lucide-react';
import { SERVER_URL } from '../../config/constants';
import { submitOrderToPrivateServer } from '../../utils/security';

const PayPalCardProcessorEUR = ({ cart, finalTotal, coupon, paypalData, setLastOrder, setCart, setCheckoutStep }) => {
    const [sdkReady, setSdkReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpeningForm, setIsOpeningForm] = useState(false);

    // Sin comisión bancaria para Card Test EUR
    const totalToCharge = finalTotal;

    useEffect(() => {
        const loadPayPalSdk = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/api/get-paypal-client-id`);
                const { clientId } = await res.json();

                // Eliminar cualquier script previo del SDK de PayPal para evitar conflicto de monedas
                const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
                if (existingScript) {
                    existingScript.remove();
                    delete window.paypal;
                }

                const script = document.createElement("script");
                // 🔑 CLAVE: currency=EUR para que PayPal procese en Euros
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&components=buttons,funding-eligibility`;
                script.async = true;
                script.onload = () => setSdkReady(true);
                document.body.appendChild(script);
            } catch (error) { console.error("Error cargando PayPal EUR:", error); }
        };
        loadPayPalSdk();
    }, []);

    useEffect(() => {
        if (sdkReady && window.paypal) {
            const container = document.getElementById('paypal-eur-container');
            if (container) container.innerHTML = '';

            // Botón de Tarjeta de Débito/Crédito
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
                        // 🔑 Llama al endpoint EUR dedicado
                        const res = await fetch(`${SERVER_URL}/api/create-order-eur`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ items: cart, couponCode: coupon?.code })
                        });
                        const data = await res.json();
                        return data.id;
                    } catch (error) { alert("Error conectando al banco."); throw error; }
                },
                onApprove: async (data, actions) => {
                    setIsProcessing(true);
                    try {
                        // 🔑 Captura con el endpoint EUR dedicado
                        const res = await fetch(`${SERVER_URL}/api/capture-paypal-order-eur`, {
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
                                items: cart.map(i => i.title).join(', '),
                                total: totalToCharge.toFixed(2),
                                currency: 'EUR',
                                status: 'VERIFICADO (Pagado EUR)',
                                date: new Date().toISOString(),
                                rawItems: cart.map(({ icon, ...rest }) => rest),
                                paymentMethod: 'tarjeta_credito_debito_eur',
                                couponData: coupon,
                                fullData: { ...paypalData, refNumber: data.orderID }
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
            }).render("#paypal-eur-container");

            // Botón de PayPal (balance/cuenta PayPal)
            const paypalBtnContainer = document.getElementById('paypal-eur-paypal-btn');
            if (paypalBtnContainer) paypalBtnContainer.innerHTML = '';

            window.paypal.Buttons({
                fundingSource: window.paypal.FUNDING.PAYPAL,
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal'
                },
                createOrder: async () => {
                    try {
                        const res = await fetch(`${SERVER_URL}/api/create-order-eur`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ items: cart, couponCode: coupon?.code })
                        });
                        const data = await res.json();
                        return data.id;
                    } catch (error) { alert("Error conectando con PayPal."); throw error; }
                },
                onApprove: async (data, actions) => {
                    setIsProcessing(true);
                    try {
                        const res = await fetch(`${SERVER_URL}/api/capture-paypal-order-eur`, {
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
                                items: cart.map(i => i.title).join(', '),
                                total: totalToCharge.toFixed(2),
                                currency: 'EUR',
                                status: 'VERIFICADO (PayPal EUR)',
                                date: new Date().toISOString(),
                                rawItems: cart.map(({ icon, ...rest }) => rest),
                                paymentMethod: 'paypal_eur',
                                couponData: coupon,
                                fullData: { ...paypalData, refNumber: data.orderID }
                            };
                            await submitOrderToPrivateServer(orderData);
                            setLastOrder(orderData);
                            setCart([]);
                            setCheckoutStep(3);
                        }
                        else { alert("Pago rechazado: " + captureData.message); }
                    } catch (error) { alert("Error verificando el pago."); }
                    finally { setIsProcessing(false); }
                },
                onError: (err) => { alert("Error procesando PayPal."); },
                onCancel: () => {}
            }).render("#paypal-eur-paypal-btn");
        }
    }, [sdkReady, cart, coupon]);

    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-lg mx-auto animate-fade-in-up shadow-xl">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full relative shadow-inner overflow-hidden">

                {isProcessing && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                        <Loader className="animate-spin text-indigo-600 mb-4" size={56} />
                        <p className="text-slate-800 font-black text-xl animate-pulse tracking-tight">Procesando pago en EUR...</p>
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
                        <Euro size={28} className="text-blue-600" /> Pago en Euros (EUR)
                    </h4>
                    <p className="text-slate-500 text-sm mt-1">PayPal y Tarjeta de Débito o Crédito</p>

                    <div className="bg-white rounded-xl p-5 my-6 border border-slate-200 text-left shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total a cobrar:</span>
                            <span className="text-2xl font-black font-mono text-blue-600 drop-shadow-sm">€{totalToCharge.toFixed(2)} EUR</span>
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
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                            <img src="/icons/paypal.png" alt="PayPal" className="h-5 object-contain" />
                        </div>
                    </div>
                </div>

                {!sdkReady ? (
                    <div className="flex justify-center py-10"><Loader className="animate-spin text-indigo-600" size={40} /></div>
                ) : (
                    <div className="space-y-3">
                        {/* Botón PayPal */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm min-h-[60px] w-full flex flex-col justify-center items-center relative border border-slate-200">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">PayPal</p>
                            <div id="paypal-eur-paypal-btn" className="w-full relative z-10"></div>
                        </div>
                        {/* Botón Tarjeta */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm min-h-[60px] w-full flex flex-col justify-center items-center relative border border-slate-200">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Tarjeta de Débito o Crédito</p>
                            <div id="paypal-eur-container" className="w-full relative z-10"></div>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-5 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-500" /> Pago procesado en Euros. Fondos recibidos en balance EUR.
                    </p>
                </div>
            </div>
            <div className="mt-6 text-center">
                <button onClick={() => setCheckoutStep(1)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-6 py-2 rounded-xl text-sm transition-colors font-bold tracking-wide uppercase">← VOLVER A MIS DATOS</button>
            </div>
        </div>
    );
};

export default PayPalCardProcessorEUR;
