import React from 'react';
import PayPalAutomatedCheckout from './PayPalAutomatedCheckout';
import { submitOrderToPrivateServer } from '../../utils/security';

const AutomatedFlowWrapper = ({ cartTotal, setCheckoutStep, paypalData, setLastOrder, setCart, cart, coupon, contactInfo, paymentMethod }) => {
    return (
        <PayPalAutomatedCheckout 
            finalTotal={cartTotal} 
            paypalData={paypalData} 
            isExchange={cart.some(i => i.category === 'Exchange')}
            exchangeData={cart.find(i => i.category === 'Exchange')?.exchangeData}
            cart={cart} 
            coupon={coupon}
            onPaymentComplete={async (orderId, binanceTxId) => { 
                // 🛡️ GENERADOR DE ID PERFECTO (Anti-Colisiones)
                const uniqueId = 'ORD-' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 100); 
                
                const orderData = { 
                    orderId: uniqueId, 
                    visualId: uniqueId, 
                    user: `${paypalData.firstName} ${paypalData.lastName}`, 
                    items: cart.map(i => i.title).join(', '), 
                    total: cartTotal.toFixed(2), 
                    status: cart.some(i => i.category === 'Exchange') ? 'COMPLETADO (Exchange)' : 'VERIFICADO (Pagado)', 
                    date: new Date().toISOString(), 
                    rawItems: cart.map(({ icon, ...rest }) => rest), 
                    paymentMethod: 'paypal_api', 
                    couponData: coupon, 
                    fullData: { ...paypalData, refNumber: orderId, binanceTxId } 
                };
                
                // 🛡️ GUARDAMOS LA ORDEN DE PAYPAL EN LA BASE DE DATOS
                await submitOrderToPrivateServer(orderData); 
                
                setLastOrder(orderData); 
                setCart([]); 
                setCheckoutStep(3); 
            }} 
        />
    );
};

export default AutomatedFlowWrapper;
