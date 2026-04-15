import React, { useState, useEffect } from 'react';
import { Ticket, ShieldCheck, FileCheck, ImageIcon, Check, Loader, UserCheck, Copy, AlertTriangle } from 'lucide-react';
import { convertToBase64 } from '../../utils/helpers';
import { MAX_FILE_SIZE_BYTES } from '../../config/constants';
import { submitOrderToPrivateServer } from '../../utils/security';
import { auth, db } from '../../pages/firebase'; // Tu ruta ajustada
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

const PaymentProofStep = ({ proofData, setProofData, cart, finalTotal, setLastOrder, setCart, setCheckoutStep, paymentMethod, exchangeRate, coupon, contactInfo, openTerms, openPrivacy }) => {
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isFormValid = proofData.name && proofData.lastName && proofData.idNumber && proofData.phone && proofData.email && proofData.refNumber && proofData.screenshot && acceptedTerms;

  // --- INYECCIÓN: LÓGICA DE FRICCIÓN CERO Y DIDIT ---
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [hasKyc, setHasKyc] = useState(false);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);
  const [userUid, setUserUid] = useState(null);

  useEffect(() => {
      const fetchUserProfile = async () => {
          const user = auth.currentUser;
          if (user) {
              setUserUid(user.uid);
              try {
                  const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                  if (userDoc.exists()) {
                      const data = userDoc.data();
                      setIsVerifiedUser(true);
                      setHasKyc(data.kyc_verificado === true);
                      
                      setProofData(prev => ({
                          ...prev,
                          name: data.nombre_real || data.gamertag || 'Usuario',
                          lastName: data.apellido_real || 'Registrado',
                          idNumber: data.cedula_identidad || 'Verificado',
                          phone: data.telefono || 'Verificado',
                          email: data.email || user.email
                      }));
                  }
              } catch (error) {
                  console.error("Error leyendo perfil KYC:", error);
              }
          }
      };
      fetchUserProfile();
  }, []);

  const handleStartKYC = async () => {
      setIsLoadingKyc(true);
      try {
          const response = await axios.post('https://api-paypal-secure.vercel.app/api/kyc/generate-session', {
              vendorData: userUid || "Invitado_Bancario"
          });
          if (response.data.success) {
              window.location.href = response.data.url;
          } else {
              alert("No se pudo iniciar el escáner de seguridad.");
              setIsLoadingKyc(false);
          }
      } catch (error) {
          alert("Error de conexión con Didit. Intenta de nuevo.");
          setIsLoadingKyc(false);
      }
  };
  // ------------------------------------------------

  const handleFinalSubmit = async (e) => { 
      e.preventDefault(); 
      if(!acceptedTerms) return alert("Acepta términos"); 

      // Bloqueo estricto para Facebank y Pipol Pay
      if (['facebank', 'pipolpay'].includes(paymentMethod) && !hasKyc) {
          return alert("⚠️ Por regulaciones bancarias, debes verificar tu identidad con Didit antes de reportar este pago.");
      }

      setIsSubmitting(true); 
      let screenshotBase64 = null, idDocBase64 = null; 
      try { 
          if (proofData.screenshot) screenshotBase64 = await convertToBase64(proofData.screenshot); 
          if (proofData.idDoc) idDocBase64 = await convertToBase64(proofData.idDoc); 
      } catch(e) { 
          return setIsSubmitting(false); 
      } 
      const orderData = { 
          orderId: 'ORD-' + Date.now().toString().slice(-4) + Math.floor(Math.random()*100), 
          visualId: `ORD-NEW`, 
          user: `${proofData.name} ${proofData.lastName}`, 
          items: cart.map(i => i.title).join(', '), 
          total: finalTotal.toFixed(2), 
          status: 'PENDIENTE POR ENTREGAR', 
          amountBs: (finalTotal * exchangeRate).toFixed(2), 
          date: new Date().toISOString(), 
          rawItems: cart.map(({icon,...r})=>r), 
          paymentMethod, 
          exchangeRateUsed: exchangeRate, 
          couponData: coupon, 
          fullData: { 
              ...proofData, 
              screenshot: screenshotBase64, 
              idDoc: idDocBase64, 
              contactPhone: proofData.phone, 
              email: proofData.email 
          } 
      }; 
      if(await submitOrderToPrivateServer(orderData)) { 
          setLastOrder(orderData); 
          setCart([]); 
          setCheckoutStep(3); 
      } 
      setIsSubmitting(false); 
  };
  
  const handleFileChange = (e, field) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
              alert("El archivo supera el límite de 1MB. Por favor, comprímelo o sube uno más ligero.");
              e.target.value = ""; 
              return;
          }
          setProofData({...proofData, [field]: file});
      }
  };

  // --- 📋 FUNCIÓN PARA COPIAR DATOS DE PAGO Y MONTO ---
    const handleCopyPaymentData = () => {
        if (!contactInfo || !contactInfo[paymentMethod]) {
            alert("No hay datos de pago disponibles para copiar.");
            return;
        }

        const info = contactInfo[paymentMethod];
        let textToCopy = "";

        // Verificamos si es un método en Bolívares
        const isBs = paymentMethod === 'pagomovil' || paymentMethod === 'transfer_bs';

        if (isBs) {
            // 🇻🇪 FORMATO ESTRICTO SIN PLANTILLAS PARA BOLÍVARES (Solo datos y monto)
            Object.entries(info).forEach(([key, value]) => {
                const nombreCampo = key.charAt(0).toUpperCase() + key.slice(1);
                textToCopy += `${nombreCampo}: ${value}\n`;
            });
            const montoBs = (finalTotal * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            textToCopy += `Monto: ${montoBs}`;
        } else {
            // 💵 FORMATO CON PLANTILLA PARA USD (El que ya habías aprobado)
            textToCopy = "🏦 DATOS DE PAGO:\n\n";
            Object.entries(info).forEach(([key, value]) => {
                const nombreCampo = key.charAt(0).toUpperCase() + key.slice(1);
                textToCopy += `• ${nombreCampo}: ${value}\n`;
            });
            textToCopy += "\n💰 MONTO EXACTO A PAGAR:\n";
            textToCopy += `=> $${finalTotal.toFixed(2)} USD`;
        }

        // Ejecutamos la copia al portapapeles
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("✅ ¡Datos copiados al portapapeles!");
        }).catch(err => {
            console.error("Error al copiar: ", err);
            alert("❌ No se pudo copiar automáticamente. Por favor, hazlo de forma manual.");
        });
    };
    // ----------------------------------------------------

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm h-fit">
        <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Datos para Transferir</h3>
        {paymentMethod === 'binance' && <div className="space-y-4"><p className="text-amber-600 font-bold">Binance Pay</p><div className="space-y-2"><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Email:</span> {contactInfo.binance_email}</p></div></div>}
        {paymentMethod === 'pagomovil' && <div className="space-y-4"><p className="text-indigo-600 font-bold">Pago Móvil</p><div className="space-y-2"><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Banco:</span> {contactInfo.pagomovil.bank}</p><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Teléfono:</span> {contactInfo.pagomovil.phone}</p><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Rif/Cédula:</span> {contactInfo.pagomovil.id}</p></div></div>}
        {paymentMethod === 'transfer_bs' && <div className="space-y-4"><p className="text-emerald-600 font-bold">Transferencia Bs</p><div className="space-y-2"><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Banco:</span> {contactInfo.transfer_bs.bank}</p><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">N° Cuenta:</span> {contactInfo.transfer_bs.account}</p><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Rif/Cédula:</span> {contactInfo.transfer_bs.id}</p></div></div>}
        {paymentMethod === 'transfer_usd' && <div className="space-y-4"><p className="text-emerald-700 font-bold">Transferencia USD</p><div className="space-y-2"><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Banco:</span> {contactInfo.transfer_usd.bank}</p><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">N° Cuenta:</span> {contactInfo.transfer_usd.account}</p><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Routing No:</span> {contactInfo.transfer_usd.routing}</p></div></div>}
        {paymentMethod === 'facebank' && <div className="space-y-4"><p className="text-blue-600 font-bold">FACEBANK</p><div className="space-y-2"><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Banco:</span> FACEBANK International</p><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">N° Cuenta:</span> {contactInfo.facebank.account}</p></div></div>}
        {paymentMethod === 'pipolpay' && <div className="space-y-4"><p className="text-orange-600 font-bold">PipolPay</p><div className="space-y-2"><p className="text-slate-800 font-medium"><span className="text-slate-500 font-bold">Email:</span> {contactInfo.pipolpay.email}</p></div></div>}
        
        <div className="mt-4 pt-4 border-t border-slate-200">
            {coupon && <div className="flex justify-between items-center mb-2"><span className="text-slate-500 font-bold">Subtotal:</span><span className="text-slate-400 line-through">${cart.reduce((acc, i) => acc + i.price, 0).toFixed(2)}</span></div>}
            <div className="flex justify-between items-center text-xl font-black"><span className="text-slate-800">Total a Pagar:</span><span className="text-indigo-600">${finalTotal.toFixed(2)}</span></div>
            {coupon && <div className="text-xs text-emerald-600 mt-1 flex flex-col gap-1"><div className="flex items-center gap-1 font-bold"><Ticket size={12}/> Cupón aplicado: {coupon.code} (-{(coupon.discountType || coupon.type) === 'fixed' ? '$' : ''}{coupon.discountValue || coupon.amount || coupon.percent || coupon.value}{(coupon.discountType || coupon.type) !== 'fixed' ? '%' : ''})</div>{coupon.excludedIds?.length > 0 && <span className="text-amber-500 text-[10px]">*Algunos productos no aplican para descuento</span>}</div>}
        </div>
        
        {(paymentMethod === 'pagomovil' || paymentMethod === 'transfer_bs') && <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm"><p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">Monto en Bolívares (Tasa: {exchangeRate.toFixed(2)})</p><p className="text-indigo-700 font-black font-mono text-3xl">Bs {(finalTotal * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>}
        
        {/* --- 📋 BOTÓN DE COPIAR DATOS --- */}
        <button
            type="button"
            onClick={handleCopyPaymentData}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 font-bold py-3 px-4 rounded-xl transition-all shadow-sm group"
        >
            <Copy size={18} className="group-hover:scale-110 transition-transform" />
            Copiar Datos y Monto
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
         <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Confirmar Pago Manual</h3>
         <form onSubmit={handleFinalSubmit} className="space-y-4">
            
            {/* INTERRUPTOR DE FRICCIÓN CERO: Oculta los datos si ya está registrado */}
            {isVerifiedUser ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 shadow-inner mb-4">
                    <UserCheck size={24} className="text-emerald-500" />
                    <div>
                        <p className="font-bold text-sm uppercase tracking-wider">Identidad Verificada</p>
                        <p className="text-xs text-emerald-600 font-medium">Tus datos personales se adjuntarán automáticamente a este pago.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Nombre" required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 w-full focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={proofData.name || ''} onChange={e => setProofData({...proofData, name: e.target.value})} /><input type="text" placeholder="Apellido" required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 w-full focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={proofData.lastName || ''} onChange={e => setProofData({...proofData, lastName: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Cédula/ID" required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 w-full focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={proofData.idNumber || ''} onChange={e => setProofData({...proofData, idNumber: e.target.value})} /><input type="tel" placeholder="Teléfono" required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 w-full focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={proofData.phone || ''} onChange={e => setProofData({...proofData, phone: e.target.value})} /></div>
                    <input type="email" placeholder="Correo Electrónico (Requerido)" required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 w-full focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={proofData.email || ''} onChange={e => setProofData({...proofData, email: e.target.value})} />
                </>
            )}

            {['facebank', 'pipolpay', 'transfer_usd'].includes(paymentMethod) && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-4 shadow-sm">
                    <p className="text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><ShieldCheck size={14}/> Verificación de Titular</p>
                    <input type="text" placeholder="Cuenta Emisora (Email o Número)" required className="bg-white border border-slate-200 rounded-xl p-3 text-slate-800 w-full font-mono focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={proofData.issuerAccount || ''} onChange={e => setProofData({...proofData, issuerAccount: e.target.value})} />
                    
                    {hasKyc ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center shadow-sm">
                            <p className="text-emerald-700 text-xs font-bold flex items-center justify-center gap-1"><ShieldCheck size={14} className="text-emerald-500"/> KYC Completado</p>
                            <p className="text-emerald-600 text-[10px] font-medium">Identidad validada por Didit. No requieres subir documento manual.</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center mt-2 shadow-sm">
                            <ShieldCheck size={32} className="text-indigo-400 mx-auto mb-2" />
                            <p className="text-slate-600 text-xs font-medium mb-3">
                                Por normativas internacionales AML, requerimos validar tu identidad para recibir dólares.
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
            
            <input type="text" placeholder="Referencia / Comprobante" required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 w-full font-mono focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={proofData.refNumber || ''} onChange={e => setProofData({...proofData, refNumber: e.target.value})} />
            
            <div className="space-y-2">
                <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all shadow-inner ${proofData.screenshot ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100'}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'screenshot')} />
                    {proofData.screenshot ? (
                        <div className="flex flex-col items-center text-emerald-700">
                            <Check size={32} className="mb-2 text-emerald-500" />
                            <p className="font-bold text-sm">Comprobante Cargado</p>
                            <p className="text-xs mb-2 font-medium">{proofData.screenshot?.name}</p>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProofData({...proofData, screenshot: null}); }} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-red-500 rounded-lg text-xs font-bold shadow-sm transition-colors mt-1">Cambiar imagen</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-slate-500">
                            <ImageIcon size={32} className="mb-2 opacity-50" />
                            <p className="font-bold text-sm text-slate-700">Subir Comprobante de Pago</p>
                            <p className="text-xs mt-1 font-medium">Haz clic para cargar imagen (Máx 1MB)</p>
                            <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-wider border border-red-200 bg-red-50 px-2 py-0.5 rounded shadow-sm">Requerido</p>
                        </div>
                    )}
                </label>
            </div>
            
            <div className="flex items-start gap-2 mt-4 pt-2">
                <input type="checkbox" id="terms-checkbox-manual" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-4 h-4 text-indigo-600 rounded bg-white border-slate-300 focus:ring-indigo-500" />
                <label htmlFor="terms-checkbox-manual" className="text-xs font-medium text-slate-500 leading-tight">He leído y acepto los <span onClick={openTerms} className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer font-bold">Términos y Condiciones</span> y la <span onClick={openPrivacy} className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer font-bold">Política de Privacidad</span>.</label>
            </div>
            
            <button type="submit" disabled={!isFormValid || isSubmitting} className={`w-full font-black uppercase tracking-widest py-4 rounded-xl shadow-md mt-6 transition-all flex items-center justify-center gap-2 ${isFormValid && !isSubmitting ? 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                {isSubmitting ? <Loader className="animate-spin" /> : (isFormValid ? "Registrar Pago" : "Completa el Formulario")}
            </button>
         </form>
      </div>
    </div>
  );
};

export default PaymentProofStep;
