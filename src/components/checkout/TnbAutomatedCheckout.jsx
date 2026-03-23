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
        <div className="bg-gray-900 border border-green-500/30 rounded-xl p-6 max-w-lg mx-auto animate-fade-in-up text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <Wallet size={32} />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Pago con Saldo TNB</h3>
            <p className="text-gray-400 text-sm mb-6">
                Total a debitar de tu billetera digital: <br/>
                <span className="text-green-400 font-bold font-mono text-xl">${finalTotal.toFixed(2)} USD</span>
            </p>

            {status === 'idle' && (
                <button onClick={handlePay} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all">
                    Confirmar y Pagar
                </button>
            )}
            
            {status === 'processing' && (
                <div className="py-4">
                    <Loader className="animate-spin text-green-400 mx-auto mb-2" size={32} />
                    <p className="text-green-400 font-bold animate-pulse">Debitando fondos...</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="py-4">
                    <Check className="text-green-500 mx-auto mb-2" size={48} strokeWidth={4} />
                    <p className="text-green-400 font-bold text-lg">¡Pago Exitoso!</p>
                </div>
            )}
            
            {status === 'idle' && (
                <div className="mt-4">
                    <button onClick={() => setCheckoutStep(1)} className="text-gray-500 hover:text-white text-sm transition-colors font-bold tracking-wide">← Volver</button>
                </div>
            )}
        </div>
    );
};

export default TnbAutomatedCheckout;
