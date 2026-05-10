import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, UserCheck, Bot, Link as LinkIcon, AlertTriangle, ArrowRight } from 'lucide-react';
import { auth, db } from '../../pages/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

const PayPalDetailsForm = ({ paypalData, setPaypalData, setCheckoutStep, paymentMethod, openTerms, openPrivacy, cart }) => {
  const isBinance = (paymentMethod === 'binance'); 
  const isTarjeta = (paymentMethod === 'tarjeta');
  const isSaldoTnb = (paymentMethod === 'saldo_tnb'); // Detectar Saldo TNB
  
  // AQUÍ ESTÁ LA LÓGICA DE SEGURIDAD: Exigimos KYC (Didit) siempre, EXCEPTO si es Binance, Tarjeta o SALDO TNB
  const requiresKycValidation = !isBinance && !isTarjeta && !isSaldoTnb; 
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [hasKyc, setHasKyc] = useState(false);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);
  const [userUid, setUserUid] = useState(null);

  // --- 🛡️ INYECCIÓN: Estado para saber si es invitado o usuario registrado ---
  const [isGuest, setIsGuest] = useState(true);
  // --------------------------------------------------------------------------

  useEffect(() => {
      const checkUserKyc = async () => {
          const user = auth.currentUser;
          if (user) {
              // --- 🛡️ INYECCIÓN: Modo usuario registrado activo ---
              setIsGuest(false);
              setUserUid(user.uid);
              const userDoc = await getDoc(doc(db, "usuarios", user.uid));
              if (userDoc.exists()) {
                  const data = userDoc.data();
                  const isKycVerified = data.kyc_verificado === true;
                  if (isKycVerified) {
                      setHasKyc(true);
                  }
                  
                  // Autocompletamos los datos en la sombra para que pase las validaciones sin pedirle nada
                  setPaypalData(prev => ({
                      ...prev,
                      email: user.email || data.email || '',
                      firstName: data.nombre_real || data.gamertag || 'Usuario',
                      lastName: data.apellido_real || 'Registrado',
                      idNumber: data.cedula_identidad || data.cedula || 'N/A',
                      phone: data.telefono || 'N/A'
                  }));
              }
              // -----------------------------------------------------------------
          } else {
              setIsGuest(true);
          }
      };
      checkUserKyc();
  }, []);

  const handleStartKYC = async () => {
      setIsLoadingKyc(true);
      try {
          const response = await axios.post('https://api-paypal-secure.vercel.app/api/kyc/generate-session', {
              vendorData: userUid || "Invitado_Checkout"
          });
          if (response.data.success) {
              window.location.href = response.data.url;
          } else {
              alert("No se pudo iniciar Didit.");
              setIsLoadingKyc(false);
          }
      } catch (error) {
          alert("Error de conexión con el servidor de seguridad.");
          setIsLoadingKyc(false);
      }
  };
  
  const handleSubmit = (e) => { 
      e.preventDefault(); 
      if (requiresKycValidation && !hasKyc) {
          return alert("⚠️ Por regulaciones de seguridad, debes Verificar tu Identidad con Didit antes de continuar con este método de pago.");
      }
      if(!paypalData.email || !paypalData.firstName || !paypalData.lastName || !paypalData.idNumber) {
          return alert("Completa todos los campos obligatorios.");
      }

      const hasBot = cart.some(item => item.id === 20 || item.title === 'Admin. Bot');
      if (hasBot) {
          const link = paypalData.groupLink;
          if (!link || !link.includes('chat.whatsapp.com')) {
              alert("⚠️ ALERTA:\n\nPara comprar el 'Admin. Bot' es OBLIGATORIO ingresar un enlace de grupo de WhatsApp válido.\n\nPor favor, pégalo en el recuadro azul que apareció en el formulario.");
              return; 
          }
      }

      setCheckoutStep(2); 
  };
  
  const isFormValid = paypalData.email && paypalData.firstName && paypalData.lastName && paypalData.phone && paypalData.idNumber && acceptedTerms;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl animate-fade-in-up">
      <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3 tracking-tight">
        <span className={`${isBinance ? 'bg-amber-400 text-amber-900 border-amber-500' : (isTarjeta ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : isSaldoTnb ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200')} text-[10px] font-bold py-1 px-2 rounded-md uppercase tracking-wider border shadow-sm`}>API</span> 
        Configuración de {isBinance ? 'Binance Pay' : (isTarjeta ? 'Tarjeta' : isSaldoTnb ? 'Pago con Saldo TNB' : 'Facturación')}
      </h2>
      <p className="text-slate-500 text-sm mb-8 font-medium">
          {isGuest ? 'Ingresa tus datos para generar la orden de pago.' : 'Confirma los términos para generar la orden segura.'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* --- 🛡️ INYECCIÓN: Ocultamos el formulario de texto si ya es usuario registrado --- */}
        {isGuest && (
            <>
                <div>
                    <label className="block text-slate-700 text-sm font-bold mb-1.5">Correo Electrónico</label>
                    <input type="email" required className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-800 shadow-inner outline-none transition-colors placeholder:text-slate-300 font-medium" placeholder="tu@email.com" value={paypalData.email || ''} onChange={e => setPaypalData({...paypalData, email: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-slate-700 text-sm font-bold mb-1.5">Nombre</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-800 shadow-inner outline-none transition-colors font-medium" value={paypalData.firstName || ''} onChange={e => setPaypalData({...paypalData, firstName: e.target.value})} /></div>
                    <div><label className="block text-slate-700 text-sm font-bold mb-1.5">Apellido</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-800 shadow-inner outline-none transition-colors font-medium" value={paypalData.lastName || ''} onChange={e => setPaypalData({...paypalData, lastName: e.target.value})} /></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">Cédula / Documento</label>
                        <input type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-800 shadow-inner outline-none transition-colors placeholder:text-slate-300 font-medium font-mono" placeholder="V-12345678" value={paypalData.idNumber || ''} onChange={e => setPaypalData({...paypalData, idNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">WhatsApp (Notificaciones)</label>
                        <input type="tel" required className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-800 shadow-inner outline-none transition-colors placeholder:text-slate-300 font-medium font-mono" placeholder="+584120000000" value={paypalData.phone || ''} onChange={e => setPaypalData({...paypalData, phone: e.target.value})} />
                    </div>
                </div>
            </>
        )}
        {/* ---------------------------------------------------------------------------------- */}
      
        {requiresKycValidation && (
            <div className="mt-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Verificación de Identidad (Requerido)
                </label>
                
                {hasKyc ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="bg-emerald-100 border border-emerald-200 p-2.5 rounded-full shadow-sm">
                            <UserCheck size={28} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-emerald-800 text-sm font-black uppercase tracking-wider">Identidad Verificada</p>
                            <p className="text-emerald-600 text-xs font-medium mt-0.5">KYC Nivel 1 Aprobado por Didit. Puedes proceder al pago.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center shadow-sm">
                        <ShieldCheck size={40} className="text-indigo-500 mx-auto mb-3" />
                        <p className="text-slate-600 text-sm font-medium mb-4">
                            Para usar {paymentMethod === 'paypal' ? 'PayPal' : 'este método'}, requerimos validar tu identidad por normas anti-fraude con el escáner Didit.
                        </p>
                        <button 
                            type="button"
                            onClick={handleStartKYC}
                            disabled={isLoadingKyc}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 text-sm"
                        >
                            {isLoadingKyc ? "Conectando al Escáner..." : "Verificar Identidad con Didit"}
                        </button>
                    </div>
                )}
            </div>
        )}

        {cart.some(item => item.id === 20 || item.title === 'Admin. Bot') && (
            <div className="mt-5 p-5 bg-sky-50 border border-sky-200 rounded-2xl animate-fadeIn shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Bot className="text-sky-600" size={24} />
                    <h3 className="text-base font-black text-sky-900 tracking-tight">Configuración del Bot</h3>
                </div>
                
                <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">
                    Para activar el <strong>Admin Bot</strong>, necesitamos el enlace de invitación de tu grupo.
                </p>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Enlace del Grupo (WhatsApp)</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="https://chat.whatsapp.com/..."
                            className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-inner"
                            value={paypalData.groupLink || ''}
                            onChange={(e) => setPaypalData({ ...paypalData, groupLink: e.target.value })}
                        />
                    </div>
                    {paypalData.groupLink && !paypalData.groupLink.includes('chat.whatsapp.com') && (
                        <p className="text-xs font-bold text-red-600 mt-2 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-100">
                            <AlertTriangle size={14} /> Enlace no válido. Debe contener "chat.whatsapp.com"
                        </p>
                    )}
                </div>
            </div>
        )}

        <div className="flex items-start sm:items-center gap-3 mt-6 pt-2">
            <input type="checkbox" id="terms-checkbox-paypal" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 sm:mt-0 w-4 h-4 text-indigo-600 rounded bg-white border border-slate-300 focus:ring-indigo-500 cursor-pointer" />
            <label htmlFor="terms-checkbox-paypal" className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">He leído y acepto los <span onClick={openTerms} className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer">Términos y Condiciones</span> y la <span onClick={openPrivacy} className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer">Política de Privacidad</span>.</label>
        </div>
        
        <button type="submit" disabled={!isFormValid} className={`w-full font-black py-4.5 rounded-xl mt-6 flex justify-center items-center gap-2 transition-all transform tracking-wide text-lg ${isFormValid ? (isBinance ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md hover:scale-[1.02]' : (isTarjeta ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:scale-[1.02]' : isSaldoTnb ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-[1.02]' : 'bg-slate-800 hover:bg-slate-900 text-white shadow-md hover:scale-[1.02]')) : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'}`}>
            Continuar al Pago <ArrowRight size={20} className={!isFormValid ? "opacity-50" : ""} />
        </button>
      </form>
    </div>
  );
};

export default PayPalDetailsForm;
