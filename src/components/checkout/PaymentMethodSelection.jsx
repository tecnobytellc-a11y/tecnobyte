import React, { useState, useEffect } from 'react';
import { Ticket, Loader, AlertTriangle, Check, Wallet } from 'lucide-react';
import { SERVER_URL } from '../../config/constants';
import { auth, db } from '../../pages/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const PaymentMethodSelection = ({ setPaymentMethod, setCheckoutStep, setView, applyCoupon, coupon, removeCoupon, userData, cartTotal }) => {
    const [couponInput, setCouponInput] = useState(''); 
    const [couponError, setCouponError] = useState(''); 
    const [isValidating, setIsValidating] = useState(false);
    
    // Extracción de saldo TNB en tiempo real
    const [localUserData, setLocalUserData] = useState(userData);
    const [isCheckingBalance, setIsCheckingBalance] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (userData && userData.saldo_tnb !== undefined) {
                    setLocalUserData(userData);
                    setIsCheckingBalance(false);
                } else {
                    try {
                        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                        if (userDoc.exists()) setLocalUserData(userDoc.data());
                    } catch(e) { console.error("Error obteniendo saldo", e); }
                    setIsCheckingBalance(false);
                }
            } else {
                setLocalUserData(null);
                setIsCheckingBalance(false);
            }
        });
        return () => unsubscribe();
    }, [userData]);

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
                if(data.success) { applyCoupon(data.coupon); setCouponInput(''); } 
                else { setCouponError(data.message || "Cupón inválido o límite alcanzado"); } 
            } catch(e) { setCouponError("Error de red validando cupón"); } 
            setIsValidating(false); 
        }, 800); 
    };

    // LÓGICA DE BLOQUEO ESTricta
    const saldoUsuario = localUserData?.saldo_tnb || 0;
    const totalPagar = cartTotal || 0;
    const noAlcanza = saldoUsuario < totalPagar;
    const sinSesion = !localUserData;
  
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xl animate-fade-in-up">
        {/* SECCIÓN DE CUPÓN */}
        <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Ticket size={16} className="text-indigo-600"/> ¿Tienes un cupón?
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" value={couponInput} disabled={!!coupon}
                    onChange={e => { setCouponInput(e.target.value); if (couponError) setCouponError(''); }} 
                    placeholder="Ingresa tu código aquí" 
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 uppercase text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner outline-none transition-all" 
                />
                <button 
                    onClick={handleApplyCoupon} disabled={isValidating || !couponInput || !!coupon} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50 shadow-md"
                >
                    {isValidating ? <Loader className="animate-spin" size={14}/> : 'APLICAR'}
                </button>
            </div>
            {couponError && <p className="text-red-500 font-medium text-xs mt-2 flex items-center gap-1"><AlertTriangle size={12}/> {couponError}</p>}
            {coupon && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center animate-scale-in shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-500 text-white p-1 rounded-full"><Check size={12} strokeWidth={4}/></div>
                        <div>
                            <p className="text-emerald-700 text-sm font-bold">¡Cupón Aplicado!</p>
                            <p className="text-slate-600 text-xs font-medium">{coupon.code} - {(coupon.discountType || coupon.type) === 'fixed' ? '$' : ''}{coupon.discountValue || coupon.amount || coupon.percent || coupon.value}{(coupon.discountType || coupon.type) !== 'fixed' ? '%' : ''} de Descuento</p>
                        </div>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-xs font-bold underline">Quitar</button>
                </div>
            )}
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mb-6 text-center tracking-tight">Selecciona Método de Pago</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* BOTÓN SALDO TNB (CON LÓGICA DE BLOQUEO) */}
          <button 
            onClick={() => { setPaymentMethod('saldo_tnb'); setCheckoutStep(1); }} 
            disabled={isCheckingBalance || sinSesion || noAlcanza}
            className={`p-6 rounded-xl border flex flex-col items-center gap-3 relative overflow-hidden transition-all duration-300 ${
                (isCheckingBalance || sinSesion || noAlcanza) 
                ? 'bg-slate-50 border-slate-200 opacity-60 grayscale cursor-not-allowed' 
                : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 shadow-sm group'
            }`}
          >
            {!(isCheckingBalance || sinSesion || noAlcanza) && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm">RÁPIDO</div>
            )}
            
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform ${
                (isCheckingBalance || sinSesion || noAlcanza) ? 'bg-slate-300' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md group-hover:scale-110'
            }`}>
              <Wallet size={28} />
            </div>
            
            <div className="flex flex-col items-center">
                <span className={`font-bold text-center ${isCheckingBalance || sinSesion || noAlcanza ? 'text-slate-500' : 'text-slate-800'}`}>Saldo TNB</span>
                {isCheckingBalance ? (
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-1 rounded-full mt-1 border border-slate-200 flex items-center gap-1 shadow-sm">
                        <Loader size={10} className="animate-spin"/> Cargando...
                    </span>
                ) : sinSesion ? (
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full mt-1 border border-red-200 shadow-sm">
                        Inicia sesión para usar
                    </span>
                ) : noAlcanza ? (
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full mt-1 border border-red-200 shadow-sm">
                        Faltan ${(totalPagar - saldoUsuario).toFixed(2)} USD
                    </span>
                ) : (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded-full mt-1 border border-emerald-200 shadow-sm">
                        Disponible: ${saldoUsuario.toFixed(2)}
                    </span>
                )}
            </div>
          </button>

          {/* TARJETAS */}
          <button onClick={() => { setPaymentMethod('tarjeta'); setCheckoutStep(1); }} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md flex flex-col items-center gap-3 relative overflow-hidden group transition-all shadow-sm">
            <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">AUTO</div>
            <img src="/icons/tarjetas.png" alt="Tarjetas" className="w-[62px] h-[62px] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 filter" />
            <span className="font-bold text-slate-800 text-center">Tarjetas de Crédito / Débito</span>
          </button>
          
          {/* BINANCE PAY */}
          <button onClick={() => { setPaymentMethod('binance'); setCheckoutStep(1); }} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md flex flex-col items-center gap-3 relative overflow-hidden group transition-all shadow-sm">
            <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">AUTO</div>
            <img src="/icons/binance.png" alt="Binance Pay" className="w-14 h-14 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-slate-800">Binance Pay</span>
          </button>
          
          {/* PAYPAL API */}
          <button onClick={() => { setPaymentMethod('paypal'); setCheckoutStep(1); }} className="p-6 bg-gradient-to-br from-[#003087] to-[#009cde] rounded-xl border border-indigo-200 shadow-md hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-[#003087] text-[10px] font-bold px-2 py-0.5 shadow-sm">AUTO</div>
            <img src="/icons/paypal.png" alt="PayPal" className="w-14 h-14 object-contain drop-shadow-md" />
            <span className="font-bold text-white tracking-wide">PayPal API</span>
          </button>
          
          {/* PAGO MÓVIL */}
          <button onClick={() => { setPaymentMethod('pagomovil'); setCheckoutStep(2); }} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md flex flex-col items-center gap-3 group transition-all shadow-sm">
            <img src="/icons/pagomovil.png" alt="Pago Móvil" className="w-20 h-20 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 filter" />
            <span className="font-bold text-slate-800">Pago Móvil</span>
          </button>
          
          {/* TRANSF. BS */}
          <button onClick={() => { setPaymentMethod('transfer_bs'); setCheckoutStep(2); }} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md flex flex-col items-center gap-3 group transition-all shadow-sm">
            <img src="/icons/transf.png" alt="Transf. Bs" className="w-20 h-20 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 filter opacity-80" />
            <span className="font-bold text-slate-800">Transf. Bs</span>
          </button>
          
          {/* TRANSF. USD */}
          <button onClick={() => { setPaymentMethod('transfer_usd'); setCheckoutStep(2); }} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-md flex flex-col items-center gap-3 group transition-all shadow-sm">
            <img src="/icons/transf.png" alt="Transf. USD" className="w-20 h-20 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 filter opacity-80" />
            <span className="font-bold text-slate-800">Transf. USD</span>
          </button>
          
          {/* FACEBANK */}
          <button onClick={() => { setPaymentMethod('facebank'); setCheckoutStep(2); }} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md flex flex-col items-center gap-3 group transition-all shadow-sm">
            <img src="/icons/facebank.png" alt="FACEBANK" className="w-20 h-20 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 filter" />
            <span className="font-bold text-slate-800">FACEBANK</span>
          </button>
          
          {/* PIPOLPAY */}
          <button onClick={() => { setPaymentMethod('pipolpay'); setCheckoutStep(2); }} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-md flex flex-col items-center gap-3 group transition-all shadow-sm">
            <img src="/icons/pipolpay.png" alt="PipolPay" className="w-20 h-20 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 filter" />
            <span className="font-bold text-slate-800">PipolPay</span>
          </button>
          
        </div>
        <div className="mt-6 flex justify-center"><button onClick={() => setView('home')} className="text-slate-500 hover:text-slate-800 font-bold underline transition-colors">Cancelar</button></div>
      </div>
    );
};

export default PaymentMethodSelection;
