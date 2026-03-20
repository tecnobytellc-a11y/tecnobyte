import React, { useState, useRef } from 'react';
import { ShieldCheck, FileCheck, ImageIcon, Bot, Link as LinkIcon, AlertTriangle, ArrowRight } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES } from '../../config/constants';

const PayPalDetailsForm = ({ paypalData, setPaypalData, setCheckoutStep, paymentMethod, openTerms, openPrivacy, cart }) => {
  const idDocRef = useRef(null); 
  const isBinance = (paymentMethod === 'binance'); 
  const isTarjeta = (paymentMethod === 'tarjeta');
  
  // AQUÍ ESTÁ LA MAGIA: Exigimos foto siempre, EXCEPTO si es Binance o Tarjeta
  const requiresIdImage = !isBinance && !isTarjeta; 
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // VALIDACIÓN ARCHIVO 1MB
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
      // AHORA EXIGIMOS QUE EL CAMPO DE CÉDULA (idNumber) ESTÉ LLENO
      if(!paypalData.email || !paypalData.firstName || !paypalData.lastName || !paypalData.phone || !paypalData.idNumber) { 
          alert("Por favor completa todos los campos de texto."); 
          return; 
      } 
      // VERIFICAMOS LA FOTO SOLO SI EL MÉTODO LO REQUIERE (Ej: PayPal)
      if (requiresIdImage && !paypalData.idDoc) { 
          alert("Debes cargar la foto de tu documento de identidad para continuar."); 
          return; 
      } 

      // --- 🛡️ VALIDACIÓN ADMIN BOT (NUEVO) ---
      const hasBot = cart.some(item => item.id === 20 || item.title === 'Admin. Bot');
      if (hasBot) {
          const link = paypalData.groupLink;
          if (!link || !link.includes('chat.whatsapp.com')) {
              alert("⚠️ ALERTA:\n\nPara comprar el 'Admin. Bot' es OBLIGATORIO ingresar un enlace de grupo de WhatsApp válido.\n\nPor favor, pégalo en el recuadro azul que apareció en el formulario.");
              return; 
          }
      }
      // ----------------------------------------------

      setCheckoutStep(2); 
  };
  
  // EL BOTÓN SOLO SE ACTIVA SI LA CÉDULA ESTÁ PUESTA Y LA FOTO (SI APLICA) TAMBIÉN
  const isFormValid = paypalData.email && paypalData.firstName && paypalData.lastName && paypalData.phone && paypalData.idNumber && (!requiresIdImage || paypalData.idDoc) && acceptedTerms;

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl border border-indigo-500/30 animate-fade-in-up">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span className={`${isBinance ? 'bg-yellow-500 text-black' : (isTarjeta ? 'bg-cyan-500 text-black' : 'bg-indigo-600 text-white')} text-xs py-1 px-2 rounded`}>API</span> 
        Configuración de {isBinance ? 'Binance Pay' : (isTarjeta ? 'Tarjeta' : 'Facturación')}
      </h2>
      <p className="text-gray-400 text-sm mb-6">Ingresa tus datos para generar la orden de pago.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
                {/* --- NUEVO CAMPO DE CÉDULA --- */}
                <label className="block text-gray-300 text-sm mb-1">Cédula / Documento</label>
                <input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="V-12345678" value={paypalData.idNumber || ''} onChange={e => setPaypalData({...paypalData, idNumber: e.target.value})} />
            </div>
            <div>
                <label className="block text-gray-300 text-sm mb-1">WhatsApp (Notificaciones)</label>
                <input type="tel" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="+584120000000" value={paypalData.phone || ''} onChange={e => setPaypalData({...paypalData, phone: e.target.value})} />
            </div>
        </div>
        
        {/* LA FOTO DEL DOCUMENTO AHORA SOLO APARECE SI requiresIdImage ES TRUE */}
        {requiresIdImage && ( 
            <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-xl p-4 mt-4">
                <label className="block text-indigo-300 text-sm font-bold mb-2 flex items-center gap-2"><ShieldCheck size={16}/> Verificación de Identidad (Obligatorio)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${paypalData.idDoc ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 hover:border-indigo-500 bg-gray-800/50'}`} onClick={() => idDocRef.current && idDocRef.current.click()}>
                    <input type="file" ref={idDocRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    {paypalData.idDoc ? ( 
                        <div className="flex flex-col items-center text-green-400">
                            <FileCheck size={32} className="mb-2" />
                            <p className="font-bold text-sm">Documento Cargado</p>
                            <p className="text-xs opacity-70 mb-2">{paypalData.idDoc.name}</p>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setPaypalData({...paypalData, idDoc: null}); if(idDocRef.current) idDocRef.current.value = ""; }} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">Cambiar archivo</button>
                        </div> 
                    ) : ( 
                        <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon size={32} className="mb-2 opacity-50" />
                            <p className="font-bold text-sm text-white">Subir Foto Documento ID</p>
                            <p className="text-xs mt-1 opacity-70">Haz clic para cargar (Máx 1MB)</p>
                        </div> 
                    )}
                </div>
            </div> 
        )}

        {/* 🤖 MÓDULO INTELIGENTE: ADMIN BOT (INYECCIÓN DE CÓDIGO) */}
        {cart.some(item => item.id === 20 || item.title === 'Admin. Bot') && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl animate-fadeIn">
                <div className="flex items-center gap-2 mb-2">
                    <Bot className="text-blue-400" size={20} />
                    <h3 className="text-sm font-bold text-blue-100">Configuración del Bot</h3>
                </div>
                
                <p className="text-[11px] text-gray-300 mb-3 leading-relaxed">
                    Para activar el <strong>Admin Bot</strong>, necesitamos el enlace de invitación de tu grupo.
                    <span className="block text-blue-300 mt-1">🚀 El bot se unirá automáticamente al confirmar el pago.</span>
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
                    {/* Mensaje de error condicional */}
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
        <button type="submit" disabled={!isFormValid} className={`w-full font-bold py-4 rounded-lg shadow-lg mt-4 flex justify-center gap-2 transition-all ${isFormValid ? (isBinance ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : (isTarjeta ? 'bg-cyan-500 hover:bg-cyan-400 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white')) : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-70'}`}>
            Continuar al Pago <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

export default PayPalDetailsForm;
