import React, { useState } from 'react';
import { Wallet, Loader, Check } from 'lucide-react';
import { submitOrderToPrivateServer } from '../../utils/security';
import { auth } from '../../pages/firebase'; 

const TnbAutomatedCheckout = ({ finalTotal, cart, paypalData, coupon, setLastOrder, setCart, setCheckoutStep }) => {
    const [status, setStatus] = useState('idle');

    const handlePay = async () => {
        if (!auth.currentUser) {
            alert("Error: No has iniciado sesión.");
            return;
        }

        setStatus('processing');
        try {
            const uniqueId = 'ORD-' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 100);

            const orderData = {
                orderId: uniqueId,
                visualId: uniqueId,
                userId: auth.currentUser.uid, 
                user: `${paypalData.firstName} ${paypalData.lastName}`,
                items: cart.map(i => i.title).join(', '),
                total: finalTotal.toFixed(2),
                status: 'COMPLETADO', 
                date: new Date().toISOString(),
                rawItems: cart.map(({ icon, ...rest }) => rest),
                paymentMethod: 'saldo_tnb',
                couponData: coupon,
                fullData: { ...paypalData, refNumber: 'TNB-AUTO-' + uniqueId }
            };

            // Enviamos la orden al servidor (Si hay error de saldo, Vercel lanzará un error y caerá en el catch)
            await submitOrderToPrivateServer(orderData);

            // Si llegamos a esta línea, es porque Vercel restó el saldo con éxito
            setStatus('success');
            setTimeout(() => {
                setLastOrder(orderData);
                setCart([]);
                setCheckoutStep(3); // Lanzamos la pantalla de éxito
            }, 2000);

        } catch (error) {
            console.error(error);
            alert("Fondos insuficientes o error procesando el pago con Saldo TNB.");
            setStatus('idle');
        }
    };

    return (
        <div className="bg-white border border-emerald-200 rounded-xl p-8 max-w-lg mx-auto animate-fade-in-up text-center shadow-xl">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 shadow-sm rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Wallet size={36} />
            </div>
            <h3 className="text-slate-800 font-black text-2xl mb-2 tracking-tight">Pago con Saldo TNB</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">
                Total a debitar de tu billetera digital: <br/>
                <span className="text-emerald-600 font-black font-mono text-2xl drop-shadow-sm">${finalTotal.toFixed(2)} USD</span>
            </p>

            {status === 'idle' && (
                <button onClick={handlePay} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]">
                    Confirmar y Pagar
                </button>
            )}
            
            {status === 'processing' && (
                <div className="py-6">
                    <Loader className="animate-spin text-emerald-600 mx-auto mb-3" size={36} />
                    <p className="text-emerald-700 font-bold animate-pulse uppercase tracking-wider text-sm">Debitando fondos...</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="py-6">
                    <Check className="text-emerald-500 mx-auto mb-3 drop-shadow-sm" size={56} strokeWidth={3} />
                    <p className="text-emerald-700 font-black text-xl tracking-tight">¡Pago Exitoso!</p>
                </div>
            )}
            
            {status === 'idle' && (
                <div className="mt-6">
                    <button onClick={() => setCheckoutStep(1)} className="text-slate-400 hover:text-slate-600 text-sm transition-colors font-bold tracking-wide uppercase px-4 py-2 hover:bg-slate-50 rounded-lg">← Volver</button>
                </div>
            )}
        </div>
    );
};

export default TnbAutomatedCheckout;
