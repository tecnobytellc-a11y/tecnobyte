import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, FileCheck, ImageIcon, Bot, Link as LinkIcon, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES } from '../../config/constants';
import { auth, db } from '../../pages/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

const PayPalDetailsForm = ({ paypalData, setPaypalData, setCheckoutStep, paymentMethod, openTerms, openPrivacy, cart }) => {
  const idDocRef = useRef(null); 
  const isBinance = (paymentMethod === 'binance'); 
  const isTarjeta = (paymentMethod === 'tarjeta');
  const isSaldoTnb = (paymentMethod === 'saldo_tnb'); // INYECCIÓN: Detectar Saldo TNB
  
  // AQUÍ ESTÁ LA MAGIA: Exigimos foto siempre, EXCEPTO si es Binance, Tarjeta o SALDO TNB
  const requiresIdImage = !isBinance && !isTarjeta && !isSaldoTnb; 
  
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
                      phone: data.telefono || 'N/A',
                      idDoc: isKycVerified ? 'KYC_APROBADO' : prev.idDoc 
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
  
  const handleFileChange = (e) => { 
      const file = e.target.files[0]; 
      if (file) { 
          if (file.size > MAX_FILE_SIZE_BYTES) { 
              alert("El archivo supera el límite de 1MB."); 
              e.target.value = "";
              return; 
          } 
          setPaypalData({ ...paypalData, idDoc: file }); 
      } 
  };

  const handleSubmit = (e) => { 
      e.preventDefault(); 
      if (requiresIdImage && !hasKyc) {
          return alert("⚠️ Por regulaciones de seguridad, debes Verificar tu Identidad con Didit antes de continuar con este método de pago.");
      }
      if(!paypalData.email || !paypalData.firstName || !paypalData.lastName || !paypalData.idNumber) {
          return alert("Completa todos los campos obligatorios.");
      }
      if (requiresIdImage && !paypalData.idDoc) { 
          alert("Debes cargar la foto de tu documento de identidad para continuar."); 
          return; 
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
  
  const isFormValid = paypalData.email && paypalData.firstName && paypalData.lastName && paypalData.phone && paypalData.idNumber && (!requiresIdImage || paypalData.idDoc) && acceptedTerms;

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl border border-indigo-500/30 animate-fade-in-up">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span className={`${isBinance ? 'bg-yellow-500 text-black' : (isTarjeta ? 'bg-cyan-500 text-black' : isSaldoTnb ? 'bg-green-500 text-black' : 'bg-indigo-600 text-white')} text-xs py-1 px-2 rounded`}>API</span> 
        Configuración de {isBinance ? 'Binance Pay' : (isTarjeta ? 'Tarjeta' : isSaldoTnb ? 'Pago con Saldo TNB' : 'Facturación')}
      </h2>
      <p className="text-gray-400 text-sm mb-6">
          {isGuest ? 'Ingresa tus datos para generar la orden de pago.' : 'Confirma los términos para generar la orden segura.'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* --- 🛡️ INYECCIÓN: Ocultamos el formulario de texto si ya es usuario registrado --- */}
        {isGuest && (
            <>
                <div>
                    <label className="block text-gray-300 text-sm mb-1">Correo Electrónico</label>
                    <input type="email" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="tu@email.com" value={paypalData.email || ''} onChange={e => setPaypalData({...paypalData, email: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-gray-300 text-sm mb-1">Nombre</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.firstName || ''} onChange={e => setPaypalData({...paypalData, firstName: e.target.value})} /></div>
                    <div><label className="block text-gray-300 text-sm mb-1">Apellido</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.lastName || ''} onChange={e => setPaypalData({...paypalData, lastName: e.target.value})} /></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Cédula / Documento</label>
                        <input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="V-12345678" value={paypalData.idNumber || ''} onChange={e => setPaypalData({...paypalData, idNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm mb-1">WhatsApp (Notificaciones)</label>
                        <input type="tel" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="+584120000000" value={paypalData.phone || ''} onChange={e => setPaypalData({...paypalData, phone: e.target.value})} />
                    </div>
                </div>

                {/* INYECCIÓN: Restauramos el input para subir la foto de los invitados */}
                {requiresIdImage && (
                    <div className="mt-4">
                        <label className="block text-gray-300 text-sm mb-1">Foto del Documento de Identidad</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm" />
                    </div>
                )}
            </>
        )}
        {/* ---------------------------------------------------------------------------------- */}
      
        {requiresIdImage && (
            <div className="mt-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Verificación de Identidad (Requerido)
                </label>
                
                {hasKyc ? (
                    <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-full">
                            <UserCheck size={24} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-green-400 text-sm font-bold uppercase tracking-wider">Identidad Verificada</p>
                            <p className="text-green-500/70 text-xs">KYC Nivel 1 Aprobado por Didit. Puedes proceder al pago.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 text-center">
                        <ShieldCheck size={32} className="text-indigo-400 mx-auto mb-2" />
                        <p className="text-gray-300 text-xs mb-3">
                            Para usar {paymentMethod === 'paypal' ? 'PayPal' : 'este método'}, requerimos validar tu identidad por normas anti-fraude.
                        </p>
                        <button 
                            type="button"
                            onClick={handleStartKYC}
                            disabled={isLoadingKyc}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 text-sm"
                        >
                            {isLoadingKyc ? "Conectando al Escáner..." : "Verificar Identidad con Didit"}
                        </button>
                    </div>
                )}
            </div>
        )}

        {cart.some(item => item.id === 20 || item.title === 'Admin. Bot') && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl animate-fadeIn">
                <div className="flex items-center gap-2 mb-2">
                    <Bot className="text-blue-400" size={20} />
                    <h3 className="text-sm font-bold text-blue-100">Configuración del Bot</h3>
                </div>
                
                <p className="text-[11px] text-gray-300 mb-3 leading-relaxed">
                    Para activar el <strong>Admin Bot</strong>, necesitamos el enlace de invitación de tu grupo.
                </p>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Enlace del Grupo (WhatsApp)</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="https://chat.whatsapp.com/..."
                            className="w-full bg-black/40 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-3 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                            value={paypalData.groupLink || ''}
                            onChange={(e) => setPaypalData({ ...paypalData, groupLink: e.target.value })}
                        />
                    </div>
                    {paypalData.groupLink && !paypalData.groupLink.includes('chat.whatsapp.com') && (
                        <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertTriangle size={10} /> Enlace no válido. Debe contener "chat.whatsapp.com"
                        </p>
                    )}
                </div>
            </div>
        )}

        <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="terms-checkbox-paypal" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded bg-gray-800 border-gray-600 focus:ring-indigo-500" />
            <label htmlFor="terms-checkbox-paypal" className="text-sm text-gray-400">He leído y acepto los <span onClick={openTerms} className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer">Términos y Condiciones</span> y la <span onClick={openPrivacy} className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer">Política de Privacidad</span>.</label>
        </div>
        <button type="submit" disabled={!isFormValid} className={`w-full font-bold py-4 rounded-lg shadow-lg mt-4 flex justify-center gap-2 transition-all ${isFormValid ? (isBinance ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : (isTarjeta ? 'bg-cyan-500 hover:bg-cyan-400 text-black' : isSaldoTnb ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white')) : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-70'}`}>
            Continuar al Pago <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

export default PayPalDetailsForm;
