import React, { useState } from 'react';
import { Ticket, Loader, AlertTriangle, Check } from 'lucide-react';
import { SERVER_URL } from '../../config/constants';

const PaymentMethodSelection = ({ setPaymentMethod, setCheckoutStep, setView, applyCoupon, coupon, removeCoupon }) => {
    const [couponInput, setCouponInput] = useState(''); 
    const [couponError, setCouponError] = useState(''); 
    const [isValidating, setIsValidating] = useState(false);
    
    const handleApplyCoupon = async () => { 
        if(!couponInput.trim()) return; 
        setIsValidating(true); 
        setCouponError(''); 
        setTimeout(async () => { 
            try { 
                const deviceId = localStorage.getItem('tecnobyte_device_id') || (()=>{let id='DEV-'+Math.random().toString(36).substr(2,9)+Date.now().toString(36);localStorage.setItem('tecnobyte_device_id',id);return id;})();
                const res = await fetch(`${SERVER_URL}/api/validate-coupon`, { 
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({ code: couponInput.toUpperCase(), deviceId }) 
                }); 
                const data = await res.json(); 
                if(data.success) { 
                    applyCoupon(data.coupon); 
                    setCouponInput(''); 
                } else { 
                    setCouponError(data.message || "Cupón inválido o límite alcanzado"); 
                } 
            } catch(e) { 
                setCouponError("Error de red validando cupón"); 
            } 
            setIsValidating(false); 
        }, 800); 
    };
  
    return (
      <div className="max-w-4xl mx-auto bg-gray-900/80 p-8 rounded-2xl border border-indigo-500/20 backdrop-blur-sm animate-fade-in-up">
        {/* SECCIÓN DE CUPÓN (Intacta) */}
        <div className="mb-8 p-4 bg-indigo-900/10 rounded-xl border border-indigo-500/30">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Ticket size={16} className="text-yellow-400"/> ¿Tienes un cupón?
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={couponInput} 
                    onChange={e => { setCouponInput(e.target.value); if (couponError) setCouponError(''); }} 
                    placeholder="Ingresa tu código aquí" 
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white uppercase text-sm focus:border-indigo-500 outline-none" 
                    disabled={!!coupon}
                />
                <button 
                    onClick={handleApplyCoupon} 
                    disabled={isValidating || !couponInput || !!coupon} 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                    {isValidating ? <Loader className="animate-spin" size={14}/> : 'APLICAR'}
                </button>
            </div>
            {couponError && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertTriangle size={12}/> {couponError}</p>}
            {coupon && (
                <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex justify-between items-center animate-scale-in">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-500 text-black p-1 rounded-full"><Check size={12} strokeWidth={4}/></div>
                        <div>
                            <p className="text-green-400 text-sm font-bold">¡Cupón Aplicado!</p>
                            <p className="text-gray-400 text-xs">{coupon.code} - {(coupon.discountType || coupon.type) === 'fixed' ? '$' : ''}{coupon.discountValue || coupon.amount || coupon.percent || coupon.value}{(coupon.discountType || coupon.type) !== 'fixed' ? '%' : ''} de Descuento</p>
                        </div>
                    </div>
                    <button onClick={removeCoupon} className="text-red-400 hover:text-white text-xs underline">Quitar</button>
                </div>
            )}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Selecciona Método de Pago</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* TARJETAS - Agrandado un pelito (62px) */}
          <button onClick={() => { setPaymentMethod('tarjeta'); setCheckoutStep(1); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-cyan-400 flex flex-col items-center gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-cyan-400 text-black text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">AUTO</div>
            <img src="/icons/tarjetas.png" alt="Tarjetas" className="w-[62px] h-[62px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-white text-center">Tarjetas de Crédito / Débito</span>
          </button>
          
          {/* BINANCE PAY - Medida estándar de referencia (w-14 / 56px) */}
          <button onClick={() => { setPaymentMethod('binance'); setCheckoutStep(1); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-yellow-400 flex flex-col items-center gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">AUTO</div>
            <img src="/icons/binance.png" alt="Binance Pay" className="w-14 h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-white">Binance Pay</span>
          </button>
          
          {/* PAYPAL API - Medida estándar de referencia (w-14 / 56px) */}
          <button onClick={() => { setPaymentMethod('paypal'); setCheckoutStep(1); }} className="p-6 bg-gradient-to-br from-[#003087] to-[#009cde] rounded-xl border border-indigo-400 shadow-[0_0_15px_rgba(0,156,222,0.3)] hover:scale-105 transition-transform flex flex-col items-center gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-[#003087] text-[10px] font-bold px-2 py-0.5">AUTO</div>
            <img src="/icons/paypal.png" alt="PayPal" className="w-14 h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
            <span className="font-bold text-white">PayPal API</span>
          </button>
          
          {/* PAGO MÓVIL - Agrandado bastante (w-20 / 80px) para compensar padding */}
          <button onClick={() => { setPaymentMethod('pagomovil'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-400 flex flex-col items-center gap-3 group">
            <img src="/icons/pagomovil.png" alt="Pago Móvil" className="w-20 h-20 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-white">Pago Móvil</span>
          </button>
          
          {/* TRANSF. BS - Agrandado (w-20) Y VOLVIDO BLANCO (brightness-0 invert) */}
          <button onClick={() => { setPaymentMethod('transfer_bs'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-400 flex flex-col items-center gap-3 group">
            <img src="/icons/transf.png" alt="Transf. Bs" className="w-20 h-20 object-contain brightness-0 invert drop-shadow-[0_4px_10px_rgba(255,255,255,0.1)] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-white">Transf. Bs</span>
          </button>
          
          {/* TRANSF. USD - Agrandado (w-20) Y VOLVIDO BLANCO (brightness-0 invert) */}
          <button onClick={() => { setPaymentMethod('transfer_usd'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-600 flex flex-col items-center gap-3 group">
            <img src="/icons/transf.png" alt="Transf. USD" className="w-20 h-20 object-contain brightness-0 invert drop-shadow-[0_4px_10px_rgba(255,255,255,0.1)] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-white">Transf. USD</span>
          </button>
          
          {/* FACEBANK - Agrandado bastante (w-20 / 80px) para compensar padding */}
          <button onClick={() => { setPaymentMethod('facebank'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-600 flex flex-col items-center gap-3 group">
            <img src="/icons/facebank.png" alt="FACEBANK" className="w-20 h-20 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-white">FACEBANK</span>
          </button>
          
          {/* PIPOLPAY - Agrandado bastante (w-20 / 80px) para compensar padding */}
          <button onClick={() => { setPaymentMethod('pipolpay'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-400 flex flex-col items-center gap-3 group">
            <img src="/icons/pipolpay.png" alt="PipolPay" className="w-20 h-20 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-white">PipolPay</span>
          </button>
          
        </div>
        <div className="mt-4 flex justify-center"><button onClick={() => setView('home')} className="text-gray-500 hover:text-white">Cancelar</button></div>
      </div>
    );
};

export default PaymentMethodSelection;
