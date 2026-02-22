import './styles.css';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, Gamepad2, CreditCard, MessageSquare, 
  Smartphone, User, Check, Upload, X, Lock, 
  Globe, Zap, Trash2, Eye, RefreshCw,
  Facebook, Instagram, Mail, Phone, ShieldCheck, LogIn, ChevronDown, Landmark, Building2, Send, FileText, Tv, Music,
  Sparkles, Bot, MessageCircle, Loader, ArrowRight, Wallet, QrCode, AlertTriangle, Search, Clock, Key, Copy, Terminal, List, Archive, RefreshCcw, LogOut, Filter, Image as ImageIcon, Download, ExternalLink, FileText as FileTextIcon, Shield, Ticket, Percent, FileCheck, HelpCircle, Link as LinkIcon
} from 'lucide-react';

const SERVER_URL = "https://api-paypal-secure.vercel.app"; 
const RATE_API_URL = "https://api-secure-server.vercel.app/api/get-tasa"; 

// --- CONTENIDO DEL MANUAL (EMBEBIDO PARA DESCARGA) ---
const BOT_MANUAL_TEXT = `MANUAL DE COMANDOS MAESTRO - TECNO-BOT IA 3.0

🖼️ 1. MULTIMEDIA Y EDICIÓN
Herramientas para crear stickers, descargar contenido y editar archivos.
!sticker (o !s): Responde a una imagen o video para convertirlo en un Sticker de WhatsApp.
!sfull: Crea un sticker sin recortar (pantalla completa/formato original).
!scircle: Crea un sticker con forma circular.
!emojimix: Mezcla dos emojis para crear un sticker único.
!toimg: Responde a un sticker para convertirlo de nuevo en una imagen (JPG).
!tovideo: Responde a un sticker animado para convertirlo en video (MP4).
!tomp3: Responde a un video para extraer solo el audio.
!play [canción]: Busca una canción en YouTube y muestra su ficha técnica con enlace.
!video [nombre]: Busca un video en YouTube para descargar.
!spotify: Descarga música directamente desde enlaces de Spotify.
!tiktok: Descarga videos de TikTok sin marca de agua.
!ig: Descarga imágenes o Reels de Instagram.
!fb: Descarga videos de Facebook.
!slow: Aplica efecto de cámara lenta a un audio.
!fast: Acelera un audio (efecto ardilla rápido).
!reverse: Invierte un audio (se escucha al revés).
!bass: Aumenta los bajos de un audio (Bass Boost).
!robot: Aplica efecto robótico a un audio.

🧠 2. INTELIGENCIA ARTIFICIAL (IA)
Comandos potenciados por redes neuronales y GPT.
!ia (o !gpt) [pregunta]: Charla con la IA, haz preguntas, pide consejos o resuelve dudas matemáticas.
!img [descripción]: Genera una imagen desde cero usando Inteligencia Artificial (DALL-E/Pollinations) basada en tu texto.
!traducir: Traduce textos a otros idiomas automáticamente.
!tts [texto]: (Text-to-Speech) Convierte tu texto escrito en una nota de voz con voz de Google.
!ocr: Responde a una imagen que tenga texto para que el Bot lo extraiga y te lo envíe escrito.
!reconocer: Responde a un audio o video corto para que el Bot identifique qué canción es (tipo Shazam).
!resumen: Pide a la IA que resuma un texto largo.
!código: Pide a la IA que genere código de programación (JS, Python, etc.).
!receta: Pide a la IA una receta de cocina basada en ingredientes.

👮 3. MODERACIÓN Y GRUPOS
Comandos exclusivos para Administradores del Grupo. (Nota: El Bot debe ser admin para que funcionen la mayoría)
!kick @usuario: Elimina a un usuario del grupo.
!ban @usuario: (Igual que kick) Banea a un usuario.
!promover @usuario: Da permisos de administrador a un miembro.
!degradar @usuario: Quita permisos de administrador a un miembro.
!grupo cerrar: Cierra el grupo para que solo los admins puedan escribir.
!grupo abrir: Abre el grupo para que todos puedan escribir.
!hidetag [texto]: Menciona a todos los miembros de forma "invisible" (les llega notificación pero no se ve la etiqueta).
!tagall: Menciona a todos los miembros del grupo en una lista visible.
!link: Obtiene y envía el enlace de invitación del grupo actual.
!revoke: Restablece el enlace del grupo (el anterior dejará de funcionar).
!bienvenida on/off: Activa o desactiva el mensaje de bienvenida automático.
!antilink on/off: Activa la protección que elimina a quienes envían enlaces de otros grupos.
!antifake on: Expulsa automáticamente números con prefijos raros (+212, +265, etc.).
!setname [texto]: Cambia el nombre (asunto) del grupo.
!setdesc [texto]: Cambia la descripción del grupo.
!setpp: Responde a una imagen para ponerla como foto del grupo.
!info: Muestra información detallada del estado del grupo.
!admins: Muestra la lista de administradores del grupo.
!warn @usuario: Da una advertencia a un usuario.
!unwarn @usuario: Quita una advertencia.
!listwarn: Muestra la lista de usuarios advertidos.
!mute: Silencia al bot en el chat actual.
!delete: Responde a un mensaje del bot para eliminarlo.
!fantasmas: Detecta usuarios que nunca escriben (inactivos).
!kickfantasmas: Elimina a todos los usuarios inactivos detectados.

🛠️ 4. HERRAMIENTAS ÚTILES
Utilidades generales para el día a día.
!qr [texto]: Genera una imagen de Código QR con el texto o enlace que pongas.
!calc [operación]: Calculadora rápida (Ej: !calc 2*5+10).
!wiki [busqueda]: Busca definiciones o información en Wikipedia.
!google: Realiza una búsqueda rápida en Google.
!clima [ciudad]: Muestra el reporte del clima actual.
!short: Acorta un enlace largo.
!lid: Obtiene el ID (identificador numérico) de un usuario o grupo.
!style: Cambia la fuente/estilo de tu texto.
!ip: Muestra información sobre una dirección IP.
!dolar: Muestra el precio del dólar (tasa del día).
!crypto: Muestra el precio de criptomonedas (Bitcoin, etc.).

🎉 5. DIVERSIÓN Y SOCIAL
Comandos de entretenimiento y juegos.
!ppt [piedra/papel/tijera]: Juega Piedra, Papel o Tijera contra el Bot.
!dado: Lanza un dado de 6 caras al azar.
!gay @usuario: Calcula el porcentaje "gay" de un usuario (broma).
!pareja: El Bot elige a dos personas del grupo para formar una pareja ideal.
!amor @usuario: Calculadora de compatibilidad amorosa.
!fuego: Medidor de qué tan "sexy" es alguien.
!bofetada @usuario: Envía una bofetada virtual.
!besar @usuario: Envía un beso virtual.
!chiste: Cuenta un chiste al azar.
!piropo: Envía un piropo para ligar.
!8ball [pregunta]: La bola mágica 8 responde "Sí", "No" o "Tal vez" a tu pregunta.
!casino: Juego de apuestas simple.
!tictactoe: Juego de "La Vieja" o "Tres en raya".

💰 6. ECONOMÍA (RPG)
Sistema de economía virtual dentro del Bot.
!balance (o !bal): Revisa cuánto dinero virtual tienes.
!daily: Reclama tu recompensa diaria de dinero.
!work: Trabaja para ganar dinero virtual.
!transfer @usuario [cantidad]: Transfiere dinero a otro usuario.
!rob @usuario: Intenta robar dinero a otro usuario (puedes fallar).
!mine: Mina recursos para ganar dinero.
!shop: Muestra la tienda de ítems virtuales.
!buy: Compra ítems de la tienda.
!rank: Muestra el ranking de los usuarios más ricos.
!perfil: Muestra tu perfil de jugador.

© 2026 TecnoByte LLC. Todos los derechos reservados.`;

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ICON_MAP = {
    'MessageSquare': MessageSquare, 'CreditCard': CreditCard, 'RefreshCw': RefreshCw,
    'Gamepad2': Gamepad2, 'Zap': Zap, 'Tv': Tv, 'Music': Music, 'Smartphone': Smartphone,
    'Globe': Globe, 'Lock': Lock, 'Bot': Bot
};

const DynamicIcon = ({ name, className }) => {
    const IconComponent = typeof name === 'string' ? (ICON_MAP[name] || HelpCircle) : HelpCircle;
    if (React.isValidElement(name)) return name;
    return <IconComponent className={className} />;
};

const RATE_API_CONFIG = { url: RATE_API_URL, intervalMinutes: 0.1 };
const INITIAL_RATE_BS = 570.00;

const DEFAULT_CONTACT_INFO = {
  whatsapp: "+19047400467", whatsapp_display: "Cargando...", email: "...", binance_email: "...", binance_pay_id: "...", deposit_address: "Cargando...",
  pagomovil: { bank: "", id: "", phone: "" }, transfer_bs: { bank: "", account: "", id: "" },
  transfer_usd: { bank: "", account: "", routing: "" }, facebank: { account: "" }, pipolpay: { email: "" }
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600&display=swap');
  .font-orbitron { font-family: 'Orbitron', sans-serif; }
  .font-sans { font-family: 'Inter', sans-serif; }
  ::selection { background-color: #6366f1; color: white; }
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  .animate-float { animation: float 4s ease-in-out infinite; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  .animate-scale-in { animation: scaleIn 0.4s ease-out forwards; }
  @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); } 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); } }
  .animate-pulse-green { animation: pulse-green 2s infinite; }
  .custom-scrollbar::-webkit-scrollbar { width: 8px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
  .blocked-screen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #000000; z-index: 99999999; display: flex; align-items: center; justify-content: center; overflow: hidden; }
`;

const TikTokIcon = () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg> );

const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

const getGPUInfo = () => { try { const canvas = document.createElement('canvas'); const gl = canvas.getContext('webgl'); if (!gl) return 'WebGL no disponible'; const debugInfo = gl.getExtension('WEBGL_debug_renderer_info'); return { vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL), renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) }; } catch (e) { return { error: 'Error obteniendo GPU' }; } };

const submitOrderToPrivateServer = async (order) => {
  const gpuData = getGPUInfo();
  let clientData = { capturedAt: new Date().toISOString(), userAgent: navigator.userAgent, language: navigator.language, platform: navigator.platform, gpu: gpuData, screen: { width: window.screen.width, height: window.screen.height }, connection: navigator.connection ? { effectiveType: navigator.connection.effectiveType } : 'N/A' };
  try { const ipResponse = await fetch('https://ipwho.is/'); if(ipResponse.ok) { const ipData = await ipResponse.json(); if (ipData.success) { clientData.network = { ip: ipData.ip, isp: ipData.connection?.isp }; clientData.geo = { country: ipData.country, city: ipData.city }; } } } catch (err) { clientData.ipError = "Fallo IP"; }
  try {
    const sanitizedOrder = { ...order, date: order.date || new Date().toISOString(), clientInfo: clientData, fullData: { ...order.fullData, clientInfo: clientData, screenshot: typeof order.fullData?.screenshot === 'string' ? order.fullData.screenshot : null, idDoc: typeof order.fullData?.idDoc === 'string' ? order.fullData.idDoc : null } };
    const response = await fetch(`${SERVER_URL}/api/save-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sanitizedOrder) });
    const data = await response.json();
    return data.success;
  } catch (error) { console.error("❌ Error enviando orden:", error); alert(`NO SE PUDO PROCESAR LA ORDEN:\nHubo un problema de conexión con el servidor.\n\nIntenta de nuevo.`); return false; }
};

const reportSuspiciousIP = async (ipData, reason) => { try { await fetch(`${SERVER_URL}/api/report-ip`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: ipData.ip, reason, geo: ipData.country, detectedAt: new Date().toISOString() }) }); } catch (e) {} };

const processStreamingPurchase = async (finalOrder) => {
    const streamingItems = finalOrder.rawItems.filter(item => item.providerId && item.providerId > 0);
    if (streamingItems.length > 0) {
        const accountsDelivered = [];
        let deliverySuccess = false;
        for (const item of streamingItems) {
            try {
                const response = await fetch(`${SERVER_URL}/api/purchase-streaming`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service_id: item.providerId }) });
                const result = await response.json();
                if (result.success && result.data) {
                    accountsDelivered.push({ title: item.title, ...result.data });
                    deliverySuccess = true;
                }
            } catch (error) { console.error(`Error auto-streaming:`, error); }
        }
        if (deliverySuccess) {
             finalOrder.fullData.streamingAccounts = accountsDelivered;
             finalOrder.fullData.streamingAccount = accountsDelivered[0];
             finalOrder.status = "ENTREGADO AUTOMÁTICAMENTE";
             finalOrder.deliveryStatus = "SUCCESS";
        } else {
             finalOrder.status = "PAGADO (Pendiente Entrega Manual)"; 
             finalOrder.deliveryStatus = "FAILED_PROVIDER";
             finalOrder.fullData.deliveryNote = "El pago fue verificado correctamente, pero hubo un error conectando con el proveedor de cuentas. Contacte soporte para entrega manual.";
        }
    } else {
        finalOrder.status = "VERIFICADO (Procesando)";
    }
    return finalOrder;
};

const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const BlockedScreen = () => ( <div className="blocked-screen font-sans"><div className="max-w-md p-8 bg-[#111] border-2 border-red-600 rounded-2xl text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-scale-in"><AlertTriangle size={64} className="text-red-600 mx-auto mb-6 animate-pulse"/><h1 className="text-3xl font-bold text-white mb-2 tracking-widest font-orbitron">ACCESO DENEGADO</h1><p className="text-gray-400 mb-4 text-sm">Su dirección IP ha sido marcada como sospechosa.</p></div></div> );

const LegalModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10 flex justify-between items-center">
          <div><h2 className="text-2xl font-bold text-white font-orbitron flex items-center gap-2">{title.includes("Privacidad") ? <Shield size={24} className="text-indigo-500"/> : <FileTextIcon size={24} className="text-indigo-500"/>}{title}</h2></div>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{content || "Cargando..."}</div>
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end"><button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">Entendido</button></div>
      </div>
    </div>
  );
};

const Navbar = ({ cartCount, onOpenCart, setView }) => ( <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]"><div className="max-w-7xl mx-auto px-4"><div className="flex items-center justify-between h-20"><div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}><div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-400 shadow-lg group"><img src="unnamed.png" alt="TB" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=TB&background=4f46e5&color=fff"; }} /></div><span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 font-orbitron">TECNOBYTE</span></div><div className="relative group cursor-pointer" onClick={onOpenCart}><ShoppingCart className="w-7 h-7 text-gray-300 group-hover:text-cyan-400 transition-colors" />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}</div></div></div></nav> );

const Hero = ({ exchangeRate }) => {
  const [date, setDate] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setDate(new Date()), 1000); return () => clearInterval(timer); }, []);
  const venTime = date.toLocaleString('es-VE', { timeZone: 'America/Caracas', dateStyle: 'short', timeStyle: 'medium' });

  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900/30 border border-indigo-500/30 backdrop-blur-md animate-fade-in-up">
            <RefreshCw size={14} className="text-green-400 animate-spin" />
            <span className="text-sm font-mono text-green-400 font-bold">Tasa Actual: {exchangeRate.toFixed(2)} Bs/USD | {venTime} (VET)</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 font-orbitron drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">EL FUTURO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">DIGITAL</span></h1>
        <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">Soluciones digitales inmediatas. Números virtuales, recargas de juegos y exchange automatizado al alcance de un clic.</p>
        <div className="mt-10 flex justify-center gap-4">
          <a href="#services" className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] transform hover:scale-105">Ver Servicios</a>
        </div>
      </div>
    </div>
  );
};

const ExchangeCard = ({ service, addToCart, exchangeRate, isAvailable }) => {
  const [amountSend, setAmountSend] = useState('');
  const [receiveAddress, setReceiveAddress] = useState('');
  const calculateReceive = (amount) => { if (!amount || isNaN(amount)) return 0; const numAmount = parseFloat(amount); const fee = (numAmount * 0.136) + 0.47; const net = numAmount - fee; return net > 0 ? net : 0; };
  const netUSDT = calculateReceive(amountSend);
  const receiveValue = service.type === 'bs' ? (netUSDT * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs' : netUSDT.toFixed(2) + ' USDT';
  const handleAdd = () => { if(!amountSend || parseFloat(amountSend) <= 0) return; if(service.type === 'usdt' && !receiveAddress) { alert("Por favor ingresa tu dirección de billetera para recibir los fondos."); return; } addToCart({ ...service, price: parseFloat(amountSend), title: `${service.title} (Envía $${amountSend})`, description: `Recibes: ${receiveValue} en ${receiveAddress || 'Banco'}`, exchangeData: { sendAmount: parseFloat(amountSend), receiveAmount: receiveValue, receiveType: service.type === 'usdt' ? 'bep20' : 'bank_transfer', receiveAddress: service.type === 'usdt' ? receiveAddress : 'Cuenta Bancaria Registrada' } }); setAmountSend(''); setReceiveAddress(''); };

  return (
    <div className={`bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all duration-300 shadow-lg flex flex-col h-full relative overflow-hidden ${!isAvailable ? 'opacity-70 grayscale' : 'hover:border-indigo-500'}`}>
        {!isAvailable && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]"><div className="bg-gray-900 border border-red-500/50 p-4 rounded-xl text-center shadow-2xl"><Clock className="w-10 h-10 text-red-500 mx-auto mb-2" /><h3 className="text-white font-bold text-lg">CERRADO</h3><p className="text-gray-400 text-xs mt-1 max-w-[200px]">Disponible solo de<br/>Lunes a Jueves</p></div></div>}
        <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-indigo-400"><DynamicIcon name={service.icon} /></div><div><h3 className="text-lg font-bold text-white leading-tight">{service.title}</h3><p className="text-xs text-indigo-400 font-mono">Fee: 13.60% + $0.47</p></div></div>
        <div className="flex-1 space-y-3 mb-4"><div className="bg-indigo-500/10 border border-indigo-500/50 rounded py-1 px-2 mb-2 text-center"><p className="text-[10px] font-bold text-indigo-200 tracking-wide">COMISION DE PAYPAL INCLUIDA</p></div><div className="bg-black/40 p-3 rounded-lg border border-gray-700"><label className="text-xs text-gray-400 block mb-1">Envías (PayPal USD)</label><div className="flex items-center gap-2"><span className="text-green-500 font-bold">$</span><input type="number" value={amountSend} onChange={(e) => setAmountSend(e.target.value)} placeholder="100.00" className="bg-transparent w-full text-white font-mono focus:outline-none" disabled={!isAvailable}/></div></div><div className="flex justify-center text-gray-500"><ChevronDown size={16} /></div>{service.type === 'usdt' && <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-2"><label className="text-xs text-yellow-500 font-bold block">¿Dónde recibes?</label><div className="flex gap-2 text-xs mb-2"><div className="flex-1 py-1 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 text-center font-bold">Dirección USDT (BEP20)</div></div><input type="text" value={receiveAddress} onChange={(e) => setReceiveAddress(e.target.value)} placeholder="Ej: 0x123... (Tu dirección de depósito Binance)" className="w-full bg-black/30 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-yellow-500 focus:outline-none font-mono" disabled={!isAvailable}/><p className="text-[9px] text-gray-400 mt-1">*Si usas tu dirección de Binance, el envío es interno y gratuito.</p></div>}<div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30"><label className="text-xs text-indigo-300 block mb-1">Recibes Aproximadamente</label><div className="text-xl font-bold text-white font-mono">{amountSend ? receiveValue : '---'}</div>{service.type === 'bs' && <p className="text-[10px] text-gray-400 mt-1 text-right">Tasa: {exchangeRate.toFixed(2)} Bs/USD</p>}</div></div>
        <button onClick={handleAdd} className="w-full py-2 bg-indigo-600 rounded-lg text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={!amountSend || parseFloat(amountSend) <= 0 || !isAvailable}>{isAvailable ? "Añadir al Carrito" : "No Disponible"}</button>
    </div>
  );
};

const BinanceAutomatedCheckout = ({ finalTotal, onVerified, onCancel, contactInfo }) => {
    const [transactionId, setTransactionId] = useState('');
    const [status, setStatus] = useState('idle'); 
    const handleVerify = async () => { if (!transactionId) { alert("ID inválido"); return; } setStatus('verifying'); try { const response = await fetch(`${SERVER_URL}/api/verify-binance-pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: transactionId, amount: finalTotal.toFixed(2) }) }); const result = await response.json(); if (result.success) { setStatus('success'); setTimeout(() => onVerified(transactionId), 2000); } else { alert(result.message); setStatus('idle'); } } catch (error) { alert("Error de conexión"); setStatus('idle'); } };

    return (
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-lg mx-auto animate-fade-in-up relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex justify-between items-start mb-6 relative z-10 border-b border-gray-800 pb-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#FCD535] rounded-full flex items-center justify-center text-black font-bold text-xl"><Zap size={24} fill="currentColor" /></div><div><h3 className="text-white font-bold text-lg">Binance Pay</h3><p className="text-xs text-gray-400">Verificación Automática</p></div></div></div>
             {status === 'success' ? <div className="text-center py-10 animate-scale-in"><div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.6)]"><Check className="w-10 h-10 text-white" strokeWidth={4} /></div><h4 className="text-2xl font-bold text-white">¡Pago Verificado!</h4></div> : (
                <div className="space-y-6 relative z-10"><div className="bg-gray-800/50 p-4 rounded-lg border border-dashed border-gray-700 text-center"><p className="text-gray-400 text-xs mb-2">Envía exactamente:</p><p className="text-4xl font-mono font-bold text-[#FCD535] mb-2">${finalTotal.toFixed(2)}</p><div className="flex justify-center gap-2 mb-2"><div className="bg-black/40 px-3 py-1.5 rounded border border-gray-600 text-xs font-mono text-white flex items-center gap-2"><Mail size={12} className="text-yellow-500"/> {contactInfo.binance_email}</div></div><div className="flex justify-center gap-2"><div className="bg-black/40 px-3 py-1.5 rounded border border-gray-600 text-xs font-mono text-white flex items-center gap-2"><QrCode size={12} className="text-yellow-500"/> Pay ID: {contactInfo.binance_pay_id}</div></div></div><div className="space-y-2"><label className="text-sm font-bold text-white">Order ID / ID de Transacción</label><input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Pega aquí el ID (Ej: 423516...)" className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 px-4 text-white font-mono focus:border-[#FCD535] outline-none"/><p className="text-[10px] text-gray-500">El ID que te da Binance tras el pago (18+ dígitos)</p></div><div className="flex gap-3 pt-2"><button onClick={onCancel} className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">Cancelar</button><button onClick={handleVerify} disabled={status === 'verifying' || !transactionId} className="flex-1 bg-[#FCD535] hover:bg-[#E5C02C] text-black font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2">{status === 'verifying' ? <><Loader className="animate-spin" size={20} /> Verificando...</> : "Ya pagué, Verificar"}</button></div></div>
             )}
        </div>
    );
};

const PayPalAutomatedCheckout = ({ finalTotal, onPaymentComplete, isExchange, exchangeData, cart, coupon }) => {
    const [status, setStatus] = useState('idle'); const [invoiceId, setInvoiceId] = useState(''); const [approveLink, setApproveLink] = useState('');
    
    // MANEJO SEGURO DE POPUP (Evita bloqueo de navegadores)
    const handlePayPalPayment = async () => { 
        setStatus('processing');
        // Abrir ventana inmediatamente para evitar bloqueos del navegador
        const newWindow = window.open('', '_blank');
        if (newWindow) {
             newWindow.document.write(`<div style="background:#000;color:#fff;height:100vh;display:flex;justify-content:center;align-items:center;font-family:sans-serif;"><h1>Conectando con PayPal...</h1></div>`);
        }

        try { 
            const payload = { items: cart.map(item => ({ id: parseInt(item.id, 10), price: item.price })), couponCode: coupon ? coupon.code : null }; 
            const response = await fetch(`${SERVER_URL}/api/create-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); 
            const data = await response.json(); 
            
            if (data.id) { 
                setInvoiceId(data.id); 
                const link = data.links.find(l => l.rel === "approve").href;
                setApproveLink(link); 
                if (newWindow) {
                    newWindow.location.href = link;
                } else {
                    window.location.href = link; 
                }
                setStatus('verifying'); 
            } else throw new Error("Error PayPal"); 
        } catch (error) { 
            if(newWindow) newWindow.close();
            alert("Error PayPal: " + error.message); 
            setStatus('idle'); 
        } 
    };

    const handleVerification = async () => { if (!invoiceId) return; if (isExchange) setStatus('dispersing'); try { const response = await fetch(`${SERVER_URL}/api/capture-and-exchange`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: invoiceId, receiveAddress: exchangeData?.receiveAddress }) }); const result = await response.json(); if (result.success) { setStatus('completed'); onPaymentComplete(invoiceId, result.binanceTxId); } else { alert("Pago fallido: " + result.message); setStatus('verifying'); } } catch (error) { alert("Error conexión"); setStatus('verifying'); } };

    return (
        <div className="bg-gray-900 border border-indigo-500/30 rounded-xl p-6 max-w-md mx-auto animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8" /><span className="text-white font-bold text-lg">Checkout Seguro</span></div>
            {status === 'idle' && <div className="space-y-4"><div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20"><p className="text-gray-300 text-sm mb-2">Resumen de Pago:</p><p className="text-3xl font-bold text-white">${finalTotal.toFixed(2)}</p>{isExchange && <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1"><RefreshCw size={10} /> Incluye dispersión automática a Binance</div>}</div><button onClick={handlePayPalPayment} className={`w-full font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] bg-[#FFC439] hover:bg-[#F4BB35] text-blue-900`}>Pagar con PayPal</button><p className="text-[10px] text-gray-500 text-center">Serás redirigido al portal seguro de PayPal.</p></div>}
            {status === 'processing' && <div className="text-center py-8"><Loader className="w-12 h-12 text-[#003087] animate-spin mx-auto mb-4" /><p className="text-white font-bold">Iniciando Transacción...</p><p className="text-xs text-gray-400">Creando factura en PayPal...</p></div>}
            {status === 'verifying' && <div className="space-y-6 text-center"><div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto border border-blue-500/50 flex items-center justify-center"><CreditCard className="w-8 h-8 text-blue-500" /></div><div><h4 className="text-white font-bold text-xl">Confirmar Pago</h4><p className="text-indigo-400 font-mono text-sm mt-1">Orden: {invoiceId}</p><p className="text-gray-400 text-xs mt-2 px-4">Hemos abierto una pestaña segura. Completa el pago y luego haz clic abajo.</p>{approveLink && <a href={approveLink} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-500 underline block mt-1">¿No se abrió? Clic aquí</a>}</div><div className="bg-gray-800 p-4 rounded-lg text-left"><button onClick={handleVerification} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded text-sm animate-pulse-green shadow-lg">Ya realicé el pago</button></div></div>}
            {status === 'dispersing' && <div className="text-center py-8 space-y-4"><div className="relative w-16 h-16 mx-auto"><div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-spin border-t-transparent"></div><img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" className="absolute inset-0 w-8 h-8 m-auto animate-pulse" alt="Binance" /></div><div><p className="text-white font-bold">Verificando y Enviando...</p><p className="text-xs text-yellow-500">Conectando con Binance API...</p></div><div className="w-full bg-gray-800 rounded-full h-1.5 mt-4"><div className="bg-yellow-500 h-1.5 rounded-full animate-[width_3s_ease-out_forwards]" style={{width: '90%'}}></div></div></div>}
            {status === 'completed' && <div className="text-center py-6"><Check className="w-16 h-16 text-green-500 mx-auto mb-4" /><h4 className="text-2xl font-bold text-white">¡Operación Exitosa!</h4><p className="text-gray-400 text-sm mt-2">El pago ha sido verificado.</p>{isExchange && <p className="text-green-400 text-xs mt-2 font-bold bg-green-900/20 p-2 rounded border border-green-900">Fondos enviados via Binance.</p>}</div>}
        </div>
    );
};

const PaymentProofStep = ({ proofData, setProofData, cart, finalTotal, setLastOrder, setCart, setCheckoutStep, paymentMethod, exchangeRate, coupon, contactInfo, openTerms, openPrivacy }) => {
  const [isSubmitting, setIsSubmitting] = useState(false); const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isFormValid = proofData.name && proofData.lastName && proofData.idNumber && proofData.phone && proofData.refNumber && proofData.screenshot && acceptedTerms;
  const handleFinalSubmit = async (e) => { e.preventDefault(); if(!acceptedTerms) return alert("Acepta términos"); setIsSubmitting(true); let screenshotBase64 = null, idDocBase64 = null; try { if (proofData.screenshot) screenshotBase64 = await convertToBase64(proofData.screenshot); if (proofData.idDoc) idDocBase64 = await convertToBase64(proofData.idDoc); } catch(e) { return setIsSubmitting(false); } const orderData = { orderId: `ORD-${Math.floor(100+Math.random()*900)}`, visualId: `ORD-NEW`, user: `${proofData.name} ${proofData.lastName}`, items: cart.map(i => i.title).join(', '), total: finalTotal.toFixed(2), status: 'PENDIENTE POR ENTREGAR', date: new Date().toISOString(), rawItems: cart.map(({icon,...r})=>r), paymentMethod, exchangeRateUsed: exchangeRate, couponData: coupon, fullData: { ...proofData, screenshot: screenshotBase64, idDoc: idDocBase64, contactPhone: proofData.phone } }; if(await submitOrderToPrivateServer(orderData)) { setLastOrder(orderData); setCart([]); setCheckoutStep(3); } setIsSubmitting(false); };
  
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

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-4">Datos para Transferir</h3>
        {paymentMethod === 'binance' && <div className="space-y-4"><p className="text-yellow-500 font-bold">Binance Pay</p><div className="space-y-2"><p className="text-white"><span className="text-gray-400 font-bold">Email:</span> {contactInfo.binance_email}</p></div></div>}
        {paymentMethod === 'pagomovil' && <div className="space-y-4"><p className="text-blue-400 font-bold">Pago Móvil</p><div className="space-y-2"><p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> {contactInfo.pagomovil.bank}</p><p className="text-white"><span className="text-gray-400 font-bold">Phone:</span> {contactInfo.pagomovil.phone}</p><p className="text-white"><span className="text-gray-400 font-bold">ID:</span> {contactInfo.pagomovil.id}</p></div></div>}
        {paymentMethod === 'transfer_bs' && <div className="space-y-4"><p className="text-green-400 font-bold">Transferencia Bs</p><div className="space-y-2"><p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> {contactInfo.transfer_bs.bank}</p><p className="text-white"><span className="text-gray-400 font-bold">Account No:</span> {contactInfo.transfer_bs.account}</p><p className="text-white"><span className="text-gray-400 font-bold">ID:</span> {contactInfo.transfer_bs.id}</p></div></div>}
        {paymentMethod === 'transfer_usd' && <div className="space-y-4"><p className="text-green-600 font-bold">Transferencia USD</p><div className="space-y-2"><p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> {contactInfo.transfer_usd.bank}</p><p className="text-white"><span className="text-gray-400 font-bold">Account No:</span> {contactInfo.transfer_usd.account}</p><p className="text-white"><span className="text-gray-400 font-bold">Routing No:</span> {contactInfo.transfer_usd.routing}</p></div></div>}
        {paymentMethod === 'facebank' && <div className="space-y-4"><p className="text-blue-600 font-bold">FACEBANK</p><div className="space-y-2"><p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> FACEBANK International</p><p className="text-white"><span className="text-gray-400 font-bold">Account No:</span> {contactInfo.facebank.account}</p></div></div>}
        {paymentMethod === 'pipolpay' && <div className="space-y-4"><p className="text-orange-400 font-bold">PipolPay</p><div className="space-y-2"><p className="text-white"><span className="text-gray-400 font-bold">Email:</span> {contactInfo.pipolpay.email}</p></div></div>}
        <div className="mt-4 pt-4 border-t border-gray-600">
            {coupon && <div className="flex justify-between items-center mb-2"><span className="text-gray-300">Subtotal:</span><span className="text-gray-400 line-through">${cart.reduce((acc, i) => acc + i.price, 0).toFixed(2)}</span></div>}
            <div className="flex justify-between items-center text-xl font-bold"><span className="text-white">Total a Pagar:</span><span className="text-green-400">${finalTotal.toFixed(2)}</span></div>
            {coupon && <div className="text-xs text-green-300 mt-1 flex flex-col gap-1"><div className="flex items-center gap-1"><Ticket size={12}/> Cupón aplicado: {coupon.code} (-{coupon.percent}%)</div>{coupon.excludedIds?.length > 0 && <span className="text-yellow-400 text-[10px]">*Algunos productos no aplican para descuento</span>}</div>}
        </div>
        {(paymentMethod === 'pagomovil' || paymentMethod === 'transfer_bs') && <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600"><p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Monto en Bolívares (Tasa: {exchangeRate.toFixed(2)})</p><p className="text-cyan-400 font-bold font-mono text-3xl">Bs {(finalTotal * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>}
      </div>
      <div className="bg-gray-900 p-8 rounded-2xl border border-indigo-500/30">
         <h3 className="text-xl font-bold text-white mb-6">Confirmar Pago Manual</h3>
         <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Nombre" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.name} onChange={e => setProofData({...proofData, name: e.target.value})} /><input type="text" placeholder="Apellido" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.lastName} onChange={e => setProofData({...proofData, lastName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Cédula/ID" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.idNumber} onChange={e => setProofData({...proofData, idNumber: e.target.value})} /><input type="tel" placeholder="Teléfono" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.phone} onChange={e => setProofData({...proofData, phone: e.target.value})} /></div>
            {['facebank', 'pipolpay', 'transfer_usd'].includes(paymentMethod) && <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 space-y-4"><p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><ShieldCheck size={14}/> Verificación de Titular</p><input type="text" placeholder="Cuenta Emisora (Email o Número)" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.issuerAccount || ''} onChange={e => setProofData({...proofData, issuerAccount: e.target.value})} /><label className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${proofData.idDoc ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 hover:border-indigo-500'}`}><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'idDoc')} />{proofData.idDoc ? <div className="flex flex-col items-center"><FileCheck className="text-green-400 mb-1" size={24}/><p className="text-green-400 text-xs font-bold">Documento Cargado</p><p className="text-gray-500 text-[10px]">{proofData.idDoc?.name}</p></div> : <div className="flex flex-col items-center"><ImageIcon className="text-gray-500 mb-1" size={24}/><p className="text-gray-300 text-xs">Foto Documento Identidad</p><p className="text-[10px] text-red-400 mt-1 font-bold">REQUERIDO (Máx 1MB)</p></div>}</label></div>}
            <input type="text" placeholder="Referencia / Comprobante" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.refNumber} onChange={e => setProofData({...proofData, refNumber: e.target.value})} />
            <div className="space-y-2"><label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${proofData.screenshot ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 hover:border-indigo-500 bg-gray-800/50'}`}><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'screenshot')} />{proofData.screenshot ? <div className="flex flex-col items-center text-green-400"><Check size={32} className="mb-2" /><p className="font-bold text-sm">Comprobante Cargado</p><p className="text-xs opacity-70 mb-2">{proofData.screenshot?.name}</p><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProofData({...proofData, screenshot: null}); }} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">Cambiar imagen</button></div> : <div className="flex flex-col items-center text-gray-400"><ImageIcon size={32} className="mb-2 opacity-50" /><p className="font-bold text-sm text-white">Subir Comprobante de Pago</p><p className="text-xs mt-1 opacity-70">Haz clic para cargar imagen (Máx 1MB)</p><p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-wider border border-red-500/30 px-2 py-0.5 rounded">Requerido</p></div>}</label></div>
            <div className="flex items-center gap-2 mt-4"><input type="checkbox" id="terms-checkbox-manual" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded bg-gray-800 border-gray-600 focus:ring-indigo-500" /><label htmlFor="terms-checkbox-manual" className="text-sm text-gray-400">He leído y acepto los <span onClick={openTerms} className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer">Términos y Condiciones</span> y la <span onClick={openPrivacy} className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer">Política de Privacidad</span>.</label></div>
            <button type="submit" disabled={!isFormValid || isSubmitting} className={`w-full font-bold py-4 rounded-lg shadow-lg mt-6 transition-all flex items-center justify-center gap-2 ${isFormValid && !isSubmitting ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-[1.02]' : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-70'}`}>{isSubmitting ? <Loader className="animate-spin" /> : (isFormValid ? "REGISTRAR PAGO" : "COMPLETA EL FORMULARIO")}</button>
         </form>
      </div>
    </div>
  );
};

const PayPalDetailsForm = ({ paypalData, setPaypalData, setCheckoutStep, paymentMethod, openTerms, openPrivacy, cart }) => {
  const idDocRef = useRef(null); 
  const isBinance = (paymentMethod === 'binance'); 
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
      if(!paypalData.email || !paypalData.firstName || !paypalData.lastName || !paypalData.phone) { 
          alert("Por favor completa todos los campos de texto."); 
          return; 
      } 
      if (!isBinance && !paypalData.idDoc) { 
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
  
  const isFormValid = paypalData.email && paypalData.firstName && paypalData.lastName && paypalData.phone && (isBinance || paypalData.idDoc) && acceptedTerms;

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl border border-indigo-500/30 animate-fade-in-up">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className={`${isBinance ? 'bg-yellow-500 text-black' : 'bg-indigo-600 text-white'} text-xs py-1 px-2 rounded`}>API</span> Configuración de {isBinance ? 'Binance Pay' : 'Facturación'}</h2>
      <p className="text-gray-400 text-sm mb-6">Ingresa tus datos para generar la orden de pago.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-gray-300 text-sm mb-1">Correo Electrónico</label><input type="email" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="tu@email.com" value={paypalData.email} onChange={e => setPaypalData({...paypalData, email: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="block text-gray-300 text-sm mb-1">Nombre</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.firstName} onChange={e => setPaypalData({...paypalData, firstName: e.target.value})} /></div><div><label className="block text-gray-300 text-sm mb-1">Apellido</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.lastName} onChange={e => setPaypalData({...paypalData, lastName: e.target.value})} /></div></div>
        <div><label className="block text-gray-300 text-sm mb-1">WhatsApp (Notificaciones)</label><input type="tel" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.phone} onChange={e => setPaypalData({...paypalData, phone: e.target.value})} /></div>
        
        {!isBinance && ( 
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

        <div className="flex items-center gap-2 mt-4"><input type="checkbox" id="terms-checkbox-paypal" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded bg-gray-800 border-gray-600 focus:ring-indigo-500" /><label htmlFor="terms-checkbox-paypal" className="text-sm text-gray-400">He leído y acepto los <span onClick={openTerms} className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer">Términos y Condiciones</span> y la <span onClick={openPrivacy} className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer">Política de Privacidad</span>.</label></div>
        <button type="submit" disabled={!isFormValid} className={`w-full font-bold py-4 rounded-lg shadow-lg mt-4 flex justify-center gap-2 transition-all ${isFormValid ? (isBinance ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-70'}`}>Continuar al Pago <ArrowRight size={20} /></button>
      </form>
    </div>
  );
};

const PaymentMethodSelection = ({ setPaymentMethod, setCheckoutStep, setView, applyCoupon, coupon, removeCoupon }) => {
    const [couponInput, setCouponInput] = useState(''); const [couponError, setCouponError] = useState(''); const [isValidating, setIsValidating] = useState(false);
    const handleApplyCoupon = async () => { if(!couponInput.trim()) return; setIsValidating(true); setCouponError(''); setTimeout(async () => { try { const res = await fetch(`${SERVER_URL}/api/validate-coupon`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ code: couponInput.toUpperCase() }) }); if (res.ok) { const data = await res.json(); if(data.success) { applyCoupon(data.coupon); setCouponInput(''); } else { setCouponError(data.message || "Cupón inválido"); } } else { setCouponError("Error de conexión"); } } catch(e) { setCouponError("Error validando cupón"); } setIsValidating(false); }, 800); };

    return (
      <div className="max-w-4xl mx-auto bg-gray-900/80 p-8 rounded-2xl border border-indigo-500/20 backdrop-blur-sm animate-fade-in-up">
        <div className="mb-8 p-4 bg-indigo-900/10 rounded-xl border border-indigo-500/30"><h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Ticket size={16} className="text-yellow-400"/> ¿Tienes un cupón?</h3><div className="flex gap-2"><input type="text" value={couponInput} onChange={e => { setCouponInput(e.target.value); if (couponError) setCouponError(''); }} placeholder="Ingresa tu código aquí" className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white uppercase text-sm focus:border-indigo-500 outline-none" disabled={!!coupon}/><button onClick={handleApplyCoupon} disabled={isValidating || !couponInput || !!coupon} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">{isValidating ? <Loader className="animate-spin" size={14}/> : 'APLICAR'}</button></div>{couponError && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertTriangle size={12}/> {couponError}</p>}{coupon && <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex justify-between items-center animate-scale-in"><div className="flex items-center gap-2"><div className="bg-green-500 text-black p-1 rounded-full"><Check size={12} strokeWidth={4}/></div><div><p className="text-green-400 text-sm font-bold">¡Cupón Aplicado!</p><p className="text-gray-400 text-xs">{coupon.code} - {coupon.percent}% de Descuento</p></div></div><button onClick={removeCoupon} className="text-red-400 hover:text-white text-xs underline">Quitar</button></div>}</div>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Selecciona Método de Pago</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => { setPaymentMethod('binance'); setCheckoutStep(1); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-yellow-400 flex flex-col items-center gap-3 relative overflow-hidden group"><div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">AUTO</div><div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500"><Zap /></div><span className="font-bold text-white">Binance Pay</span></button>
          <button onClick={() => { setPaymentMethod('paypal'); setCheckoutStep(1); }} className="p-6 bg-gradient-to-br from-[#003087] to-[#009cde] rounded-xl border border-indigo-400 shadow-[0_0_15px_rgba(0,156,222,0.3)] hover:scale-105 transition-transform flex flex-col items-center gap-3 relative overflow-hidden"><div className="absolute top-0 right-0 bg-yellow-400 text-[#003087] text-[10px] font-bold px-2 py-0.5">AUTO</div><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#003087]"><CreditCard /></div><span className="font-bold text-white">PayPal API</span></button>
          
          <button onClick={() => { setPaymentMethod('pagomovil'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-400 flex flex-col items-center gap-3"><div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500"><Smartphone /></div><span className="font-bold text-white">Pago Móvil</span></button>
          <button onClick={() => { setPaymentMethod('transfer_bs'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-400 flex flex-col items-center gap-3"><div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500"><Landmark /></div><span className="font-bold text-white">Transf. Bs</span></button>
          <button onClick={() => { setPaymentMethod('transfer_usd'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-600 flex flex-col items-center gap-3"><div className="w-12 h-12 bg-green-700/20 rounded-full flex items-center justify-center text-green-600"><Landmark /></div><span className="font-bold text-white">Transf. USD</span></button>
          <button onClick={() => { setPaymentMethod('facebank'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-600 flex flex-col items-center gap-3"><div className="w-12 h-12 bg-blue-700/20 rounded-full flex items-center justify-center text-blue-600"><Building2 /></div><span className="font-bold text-white">FACEBANK</span></button>
          <button onClick={() => { setPaymentMethod('pipolpay'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-400 flex flex-col items-center gap-3"><div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500"><Send /></div><span className="font-bold text-white">PipolPay</span></button>
        </div>
        <div className="mt-4 flex justify-center"><button onClick={() => setView('home')} className="text-gray-500 hover:text-white">Cancelar</button></div>
      </div>
    );
};

const AutomatedFlowWrapper = ({ cartTotal, setCheckoutStep, paypalData, setLastOrder, setCart, cart, coupon, contactInfo, paymentMethod }) => {
    return (
        <PayPalAutomatedCheckout finalTotal={cartTotal} paypalData={paypalData} onPaymentComplete={(orderId) => { setLastOrder({ orderId: orderId, total: cartTotal.toFixed(2), items: "PayPal Order", paymentMethod: 'paypal_api', fullData: paypalData, rawItems: [] }); setCart([]); setCheckoutStep(3); }} isExchange={false} cart={cart} coupon={coupon} />
    );
};

export default function App() {
  const [view, setView] = useState('home'); const [cart, setCart] = useState([]); const [isCartOpen, setIsCartOpen] = useState(false); const [activeCategory, setActiveCategory] = useState('All'); const [lastOrder, setLastOrder] = useState(null); const [exchangeRateBs, setExchangeRateBs] = useState(INITIAL_RATE_BS); const [checkoutStep, setCheckoutStep] = useState(0); const [paymentMethod, setPaymentMethod] = useState(null); const [paypalData, setPaypalData] = useState({ email: '', firstName: '', lastName: '', phone: '', idDoc: null, groupLink: '' }); const [proofData, setProofData] = useState({ screenshot: null, refNumber: '', name: '', lastName: '', idNumber: '', phone: '', issuerAccount: '', idDoc: null }); const [isProcessing, setIsProcessing] = useState(false); const [isBlocked, setIsBlocked] = useState(false); const [showTerms, setShowTerms] = useState(false); const [showPrivacy, setShowPrivacy] = useState(false); const [coupon, setCoupon] = useState(null); const [isLoadingSecurity, setIsLoadingSecurity] = useState(true); const [services, setServices] = useState([]); const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_INFO); const [legalInfo, setLegalInfo] = useState({ terms: "Cargando...", privacy: "Cargando..." }); const [socialLinks, setSocialLinks] = useState({ tiktok: "#", instagram: "#", facebook: "#" });

  // Detectar si hay servicios que requieren link en el carrito
  const requiresGroupLink = cart.some(item => item.requiresLink);

  const isExchangeAvailable = (() => { const now = new Date(); const venDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Caracas"})); const day = venDate.getDay(); return day >= 1 && day <= 4; })();

  useEffect(() => {
    const init = async () => {
        try {
            const ipRes = await fetch('https://ipwho.is/');
            if(ipRes.ok) {
                const ipData = await ipRes.json();
                if (ipData.success) {
                    const org = (ipData.connection?.org || ipData.connection?.isp || "").toLowerCase();
                    const asn = (ipData.connection?.asn || "").toString().toLowerCase(); 
                    if (["vpn", "proxy", "hosting", "cloud", "datacenter"].some(k => org.includes(k) || asn.includes(k))) { setIsBlocked(true); reportSuspiciousIP(ipData, `Auto-Detect VPN: ${ipData.org}`); setIsLoadingSecurity(false); return; }
                    try { const checkRes = await fetch(`${SERVER_URL}/api/check-ip?ip=${ipData.ip}`); if (checkRes.ok && (await checkRes.json()).blocked) { setIsBlocked(true); setIsLoadingSecurity(false); return; } } catch(e){}
                }
            }
            const configRes = await fetch(`${SERVER_URL}/api/get-config`);
            if (configRes.ok) {
                const config = await configRes.json();
                if (config.success) { setServices(config.catalog); setContactInfo(config.contact); setLegalInfo(config.legal); setSocialLinks(config.social); }
            }
        } catch (error) {} finally { setIsLoadingSecurity(false); setIsLoadingCatalog(false); }
    }; init();
  }, []);

  useEffect(() => { document.title = "TecnoByte | Soluciones Digitales"; let link = document.querySelector("link[rel~='icon']"); if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.getElementsByTagName('head')[0].appendChild(link); } const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; const ctx = canvas.getContext('2d'); const img = new Image(); img.src = 'unnamed.png'; img.crossOrigin = 'Anonymous'; img.onload = () => { try { ctx.beginPath(); ctx.arc(32, 32, 32, 0, 2 * Math.PI); ctx.clip(); ctx.drawImage(img, 0, 0, 64, 64); link.href = canvas.toDataURL(); } catch (e) {} }; }, []);
  useEffect(() => { const fetchRate = async () => { try { const response = await fetch(RATE_API_CONFIG.url); if (!response.ok) throw new Error('Error tasa'); const data = await response.json(); const newRate = parseFloat(data.rate || data.price || data.tasa || data.value); if (!isNaN(newRate) && newRate > 0) setExchangeRateBs(newRate); } catch (error) {} }; fetchRate(); const intervalId = setInterval(fetchRate, RATE_API_CONFIG.intervalMinutes * 60 * 1000); return () => clearInterval(intervalId); }, []);

  if (isLoadingSecurity || isLoadingCatalog) return <div className="fixed inset-0 bg-[#0a0a12] flex flex-col items-center justify-center z-[100]"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div><h2 className="text-white font-orbitron text-xl tracking-widest animate-pulse">CARGANDO TIENDA</h2><p className="text-gray-500 text-xs mt-2 font-mono">Conectando con el servidor...</p></div>;
  if (isBlocked) return <BlockedScreen />;

  const categories = ['All', ...new Set(services.map(s => s.category))];
  const addToCart = (service) => { setCart([...cart, service]); setIsCartOpen(true); };
  const removeFromCart = (index) => { const newCart = [...cart]; newCart.splice(index, 1); setCart(newCart); };
  const filteredServices = activeCategory === 'All' ? services : services.filter(s => s.category === activeCategory);
  const calculateTotal = (cartItems, appliedCoupon) => cartItems.reduce((acc, item) => { if (appliedCoupon && appliedCoupon.excludedIds && appliedCoupon.excludedIds.includes(item.id)) return acc + item.price; if (appliedCoupon) return acc + (item.price * (1 - appliedCoupon.percent / 100)); return acc + item.price; }, 0);
  const rawTotal = cart.reduce((acc, item) => acc + item.price, 0);
  const finalTotal = calculateTotal(cart, coupon);

  const handleCheckoutStart = async () => { 
      setIsProcessing(true); 
      // Verificar si hay link si el producto lo requiere
      if (requiresGroupLink && (!paypalData.groupLink || !paypalData.groupLink.includes('chat.whatsapp.com'))) {
          setIsProcessing(false);
          alert("Por favor ingresa un enlace válido de Grupo de WhatsApp antes de continuar.");
          setIsCartOpen(true);
          return;
      }

      const hasExchangeItem = cart.some(i => i.category === 'Exchange');
      setTimeout(() => { 
          if (hasExchangeItem) {
              setPaymentMethod('paypal'); 
              setCheckoutStep(1); 
          } else {
              setPaymentMethod(null);
              setCheckoutStep(0); 
          }
          setView('checkout'); 
          setIsCartOpen(false); 
          setIsProcessing(false); 
      }, 500); 
  };
  
  const handleBinanceSuccess = async (transactionId) => { 
      const randomId = Math.floor(100 + Math.random() * 900); 
      let automatedOrder = { 
          orderId: `ORD-${randomId}`, 
          visualId: `ORD-${randomId}`, 
          user: `${paypalData.firstName} ${paypalData.lastName}`, 
          items: cart.map(i => i.title).join(', '), 
          total: finalTotal.toFixed(2), 
          status: 'VERIFICADO (Procesando...)', 
          date: new Date().toISOString(), 
          rawItems: cart.map(({ icon, ...rest }) => rest), 
          paymentMethod: 'binance_api', 
          tasa: 0, montoBs: 0, totalBs: "0.00", amountBs: 0, 
          couponData: coupon ? { code: coupon.code, percent: coupon.percent, excludedIds: coupon.excludedIds } : null, 
          fullData: { email: paypalData.email, phone: paypalData.phone, refNumber: transactionId, contactPhone: paypalData.phone, groupLink: paypalData.groupLink } 
      }; 
      try {
          try { automatedOrder = await processStreamingPurchase(automatedOrder); } 
          catch (streamingError) {
              console.error("Error en entrega automática:", streamingError);
              automatedOrder.status = "PAGADO (Fallo Entrega Auto)";
              automatedOrder.deliveryStatus = "FAILED_SYSTEM";
              automatedOrder.fullData.deliveryNote = "Error de sistema al conectar con proveedor. Entregar manualmente.";
          }
          const saveSuccess = await submitOrderToPrivateServer(automatedOrder); 
          if (saveSuccess) { setLastOrder(automatedOrder); setCart([]); setCheckoutStep(3); } 
          else { alert(`PAGO RECIBIDO PERO ERROR AL GUARDAR.\n\nTu ID de pago es: ${transactionId}\nPor favor toma una captura de pantalla.`); }
      } catch (e) { console.error("Error fatal checkout:", e); alert("Error inesperado. Contáctanos."); }
  };

  return (
    <div className="bg-[#0a0a12] text-gray-100 min-h-screen font-sans flex flex-col">
      <style>{globalStyles}</style>
      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} setView={setView} />
      <main className="flex-grow pt-6 pb-20">
          {view === 'checkout' ? (
          <div className="pt-24 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center mb-8"><div className="flex items-center gap-4"><div onClick={() => { if (checkoutStep > 0 && checkoutStep < 3) { setCheckoutStep(0); setPaymentMethod(null); }}} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${checkoutStep >= 0 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'} ${checkoutStep > 0 && checkoutStep < 3 ? 'cursor-pointer hover:bg-indigo-500 hover:scale-110 shadow-lg shadow-indigo-500/50' : ''}`}>1</div><div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 0 ? 'w-full' : 'w-0'}`}></div></div><div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>2</div><div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 2 ? 'w-full' : 'w-0'}`}></div></div><div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 3 ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}>3</div></div></div>
              {checkoutStep === 0 && <PaymentMethodSelection setPaymentMethod={setPaymentMethod} setCheckoutStep={setCheckoutStep} setView={setView} applyCoupon={setCoupon} coupon={coupon} removeCoupon={() => setCoupon(null)} />}
              {checkoutStep === 1 && (paymentMethod === 'paypal' || paymentMethod === 'binance') && <PayPalDetailsForm paypalData={paypalData} setPaypalData={setPaypalData} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} openTerms={() => setShowTerms(true)} openPrivacy={() => setShowPrivacy(true)} cart={cart} />}
              {checkoutStep === 2 && ( (paymentMethod === 'paypal') ? <AutomatedFlowWrapper cart={cart} cartTotal={finalTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paypalData={paypalData} coupon={coupon} contactInfo={contactInfo} paymentMethod={paymentMethod} /> : (paymentMethod === 'binance' ? <BinanceAutomatedCheckout finalTotal={finalTotal} cartTotal={finalTotal} paypalData={paypalData} onVerified={handleBinanceSuccess} onCancel={() => setCheckoutStep(0)} contactInfo={contactInfo} /> : <PaymentProofStep proofData={proofData} setProofData={setProofData} cart={cart} cartTotal={rawTotal} finalTotal={finalTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} paypalData={paypalData} exchangeRate={exchangeRateBs} coupon={coupon} contactInfo={contactInfo} openTerms={() => setShowTerms(true)} openPrivacy={() => setShowPrivacy(true)} />) )}
              {checkoutStep === 3 && <SuccessScreen lastOrder={lastOrder} setView={setView} />}
          </div>
          ) : (
          <>
              <Hero exchangeRate={exchangeRateBs} />
              <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4 mb-12">{categories.map(cat => ( <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full border transition-all ${activeCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}>{cat}</button> ))}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredServices.map((service, idx) => ( service.category === 'Exchange' ? <ExchangeCard key={service.id} service={service} addToCart={addToCart} exchangeRate={exchangeRateBs} isAvailable={isExchangeAvailable} /> : <div key={service.id} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500 hover:-translate-y-2 transition-all duration-300 group shadow-lg flex flex-col justify-between" style={{ animationDelay: `${idx * 0.05}s` }}><div><div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-indigo-400 group-hover:text-cyan-400 group-hover:scale-110 transition-transform"><DynamicIcon name={service.icon} /></div><h3 className="text-xl font-bold text-white mb-2">{service.title}</h3><p className="text-gray-400 text-sm mb-4">{service.description}</p></div><div className="flex items-center justify-between mt-auto"><div className="flex flex-col"><span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">${service.price.toFixed(2)}</span><span className="text-xs text-gray-400 font-mono">≈ {(service.price * exchangeRateBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</span></div><button onClick={() => addToCart(service)} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white shadow-lg transition-colors"><ShoppingCart size={20} /></button></div></div> ))}
              </div>
              </div>
          </>
          )}
      </main>
      <footer className="bg-black/90 border-t border-gray-800 text-gray-400 py-12"><div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8"><div><h4 className="text-white font-orbitron font-bold text-xl mb-4">TECNOBYTE</h4><p className="text-sm">Innovación y seguridad en cada transacción. Tu aliado digital de confianza.</p></div><div><h4 className="text-white font-bold mb-4">Contacto</h4><ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><Mail size={16}/> {contactInfo.email}</li><li className="flex items-center gap-2"><Phone size={16}/> {contactInfo.whatsapp_display}</li></ul></div><div><h4 className="text-white font-bold mb-4">Síguenos</h4><div className="flex gap-4"><a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Facebook /></a><a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors"><Instagram /></a><a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors"><TikTokIcon /></a></div></div><div><h4 className="text-white font-bold mb-4">Legal</h4><ul className="space-y-2 text-sm"><li className="cursor-pointer hover:text-white transition-colors" onClick={() => setShowTerms(true)}>Términos y Condiciones</li><li className="cursor-pointer hover:text-white transition-colors" onClick={() => setShowPrivacy(true)}>Política de Privacidad</li></ul></div></div><div className="text-center mt-12 text-xs text-gray-600">© 2024 TecnoByte LLC. Todos los derechos reservados.</div></footer>
      {isCartOpen && ( <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div><div className="relative w-full max-w-md bg-gray-900 h-full shadow-2xl border-l border-gray-800 p-6 flex flex-col animate-scale-in"><div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4"><h2 className="text-2xl font-bold text-white">Tu Carrito</h2><button onClick={() => setIsCartOpen(false)}><X className="text-gray-400 hover:text-white" /></button></div><div className="flex-1 overflow-y-auto space-y-4">
        {cart.length === 0 ? <div className="text-center text-gray-500 mt-10">Tu carrito está vacío</div> : cart.map((item, idx) => ( 
            <div key={idx} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex justify-between items-center"><div><h4 className="text-white font-medium">{item.title}</h4><p className="text-sm text-cyan-400">${item.price.toFixed(2)}</p></div><button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button></div>
                {item.exchangeData && item.type === 'usdt' && <p className="text-[10px] text-yellow-500 mt-2 bg-yellow-900/10 p-1 rounded">Destino: {item.exchangeData.receiveAddress} ({item.exchangeData.receiveType})</p>}
            </div> 
        ))}
        {requiresGroupLink && (
            <div className="mt-4 p-4 bg-indigo-900/10 border border-indigo-500/30 rounded-lg animate-fade-in-up">
                <label className="text-xs text-indigo-300 font-bold mb-2 flex items-center gap-2"><LinkIcon size={14} /> Enlace de Grupo (Requerido para el Bot)</label>
                <input 
                    type="text" 
                    placeholder="https://chat.whatsapp.com/..." 
                    className="w-full bg-black/40 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                    value={paypalData.groupLink || ''}
                    onChange={(e) => setPaypalData({...paypalData, groupLink: e.target.value})}
                />
                <p className="text-[10px] text-gray-400 mt-1">El bot se unirá a este grupo automáticamente tras el pago.</p>
            </div>
        )}
      </div><div className="mt-6 border-t border-gray-800 pt-4">{coupon ? ( <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Descuento ({coupon.code}):</span><span className="text-green-400 font-bold">-{coupon.percent}%</span></div> ) : null}<div className="flex justify-between text-xl font-bold text-white mb-4"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div><button disabled={cart.length === 0} onClick={handleCheckoutStart} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2">Proceder al Pago <Lock size={18} /></button></div></div></div> )}
      <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Términos y Condiciones" content={legalInfo.terms} />
      <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Política de Privacidad y Aviso Legal" content={legalInfo.privacy} />
    </div>
  );
}
