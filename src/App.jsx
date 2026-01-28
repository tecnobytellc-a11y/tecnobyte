import './styles.css';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, Gamepad2, CreditCard, MessageSquare, 
  Smartphone, User, Check, Upload, X, Lock, 
  Globe, Zap, Trash2, Eye, RefreshCw,
  Facebook, Instagram, Mail, Phone, ShieldCheck, LogIn, ChevronDown, Landmark, Building2, Send, FileText, Tv, Music,
  Sparkles, Bot, MessageCircle, Loader, ArrowRight, Wallet, QrCode, AlertTriangle, Search, Clock, Key, Copy, Terminal, List, Archive, RefreshCcw, LogOut, Filter, Image as ImageIcon, Download, ExternalLink
} from 'lucide-react';

// --- CONFIGURACIÓN DEL SERVIDOR PRIVADO ---
const SERVER_URL = "https://api-paypal-secure.vercel.app";

// --- DATOS Y CONFIGURACIÓN ---

const RATE_API_CONFIG = {
    url: "https://api-secure-server.vercel.app/api/get-tasa", 
    intervalMinutes: 0.1 
};

const INITIAL_RATE_BS = 570.00;

const SERVICES = [
  { id: 1, category: 'Virtual Numbers', title: 'WhatsApp Number', price: 2.05, icon: <MessageSquare />, description: 'Número virtual privado para verificación de WhatsApp.' },
  { id: 2, category: 'Virtual Numbers', title: 'Telegram Number', price: 1.85, icon: <MessageSquare />, description: 'Verificación segura para Telegram.' },
  { id: 3, category: 'Virtual Numbers', title: 'PayPal/Banks Number', price: 1.30, icon: <CreditCard />, description: 'Para recibir SMS de bancos y PayPal.' },
  
  { id: 4, category: 'Exchange', title: 'Cambio PayPal a USDT', price: 0, icon: <RefreshCw />, description: 'Recibe USDT netos (Binance Pay/BEP20).', type: 'usdt' },
  { id: 5, category: 'Exchange', title: 'Cambio PayPal a Bs', price: 0, icon: <RefreshCw />, description: 'Recibe Bolívares en tu banco nacional.', type: 'bs' },
  
  { id: 6, category: 'Gaming', title: 'Recarga Free Fire (100 Diamantes)', price: 1.25, icon: <Gamepad2 />, description: 'Recarga directa vía ID.' },
  { id: 7, category: 'Gaming', title: 'Recarga Roblox (400 Robux)', price: 5.50, icon: <Gamepad2 />, description: 'Tarjeta de regalo o recarga directa.' },
  { id: 8, category: 'Gaming', title: 'COD Mobile Points (880 CP)', price: 10.90, icon: <Gamepad2 />, description: 'Call of Duty Mobile CP.' },
  { id: 9, category: 'Membership', title: 'PS Plus Deluxe (1 Mes)', price: 15.45, icon: <Gamepad2 />, description: 'Acceso total a clásicos y catálogo de juegos.' },
  { id: 10, category: 'Membership', title: 'PS Plus Extra (1 Mes)', price: 14.10, icon: <Gamepad2 />, description: 'Catálogo de juegos de PS4 y PS5.' },
  { id: 11, category: 'Gift Cards', title: 'Amazon Gift Card $10', price: 11.00, icon: <CreditCard />, description: 'Código canjeable Región USA.' },
  { id: 12, category: 'Services', title: 'ChatBot PyME', price: 5.00, icon: <Zap />, description: 'Automatización básica para WhatsApp Business.' },

  // --- STREAMING ---
  { id: 13, category: 'Streaming', title: 'Netflix (1 Mes)', price: 4.00, icon: <Tv />, description: 'Cuenta renovable 1 Pantalla Ultra HD.', providerId: 26 }, 
  { id: 14, category: 'Streaming', title: 'Amazon Prime Video', price: 3.00, icon: <Tv />, description: 'Membresía mensual con acceso completo.', providerId: 25 },
  { id: 15, category: 'Streaming', title: 'HBO Max (Max)', price: 2.55, icon: <Tv />, description: 'Disfruta de todas las series y películas de Max.', providerId: 9 },
  { id: 16, category: 'Streaming', title: 'Disney+ Premium', price: 3.00, icon: <Tv />, description: 'Acceso total al contenido de Disney.', providerId: 11 },
  { id: 17, category: 'Streaming', title: 'Crunchyroll Mega Fan', price: 1.50, icon: <Tv />, description: 'Anime sin anuncios y modo offline.', providerId: 13 },
  { id: 18, category: 'Streaming', title: 'YouTube Premium', price: 3.50, icon: <Tv />, description: 'Videos sin publicidad, segundo plano y Music.', providerId: 23 },
  { id: 19, category: 'Streaming', title: 'Spotify Premium (3 Meses)', price: 7.00, icon: <Music />, description: 'Música sin interrupciones, cuenta individual.', providerId: 24 },
];

const CONTACT_INFO = {
  whatsapp: "+19047400467",
  whatsapp_display: "+1 (904) 740-0467",
  email: "support@tecnobytellc.zendesk.com",
  binance_email: "tecnobytellc@gmail.com",
  binance_pay_id: "840993741", 
  pagomovil: {
    bank: "Banco Venezolano de Crédito [0104]",
    id: "04.139.374",
    phone: "0412-1327092"
  },
  transfer_bs: {
    bank: "Banco Venezolano de Crédito [0104]",
    account: "01040019860190162931",
    id: "04.139.374"
  },
  transfer_usd: {
    bank: "FACEBANK International",
    account: "56110272112",
    routing: "021502189 [ABA]"
  },
  facebank: { account: "56110272112" },
  pipolpay: { email: "asismora@gmail.com" }
};

const SOCIAL_LINKS = {
  tiktok: "https://www.tiktok.com/@tecnobyte.llc",
  instagram: "https://www.instagram.com/tecnobytellc",
  facebook: "https://www.facebook.com/share/1C6WoykMXp/"
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
  .blocked-screen { position: fixed; inset: 0; background: #000; z-index: 9999; display: flex; align-items: center; justify-content: center; }
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

// --- FUNCIÓN DE HACKER: OBTENER GPU ---
const getGPUInfo = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'WebGL no disponible';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'Extension WebGL debug no disponible';
    return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
    };
  } catch (e) {
    return { error: 'Error obteniendo GPU' };
  }
};

// --- FUNCIÓN DE CONEXIÓN AL SERVIDOR PRIVADO ---
const submitOrderToPrivateServer = async (order) => {
  const gpuData = getGPUInfo();
  
  let clientData = {
    capturedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    gpu: gpuData,
    screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio
    },
    hardware: {
        concurrency: navigator.hardwareConcurrency || 'N/A',
        memory: navigator.deviceMemory || 'N/A',
        touchPoints: navigator.maxTouchPoints,
    },
    connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        downlink: navigator.connection.downlink,
        saveData: navigator.connection.saveData
    } : 'N/A',
    battery: 'N/A' 
  };

  try {
      if (navigator.getBattery) {
          const battery = await navigator.getBattery();
          clientData.battery = {
              level: battery.level * 100 + '%',
              charging: battery.charging
          };
      }
  } catch(e) {}

  try {
    // Usamos ipwho.is aquí también para consistencia
    const ipResponse = await fetch('https://ipwho.is/');
    if(ipResponse.ok) {
        const ipData = await ipResponse.json();
        
        if (ipData.success) {
            clientData.network = {
                ip: ipData.ip,
                isp: ipData.connection?.isp || ipData.isp, 
                asn: ipData.connection?.asn || "N/A"
            };
            
            clientData.geo = {
                country: ipData.country,
                region: ipData.region, 
                city: ipData.city,
                postal: ipData.postal
            };
        } else {
            clientData.ipError = "Servicio IP no disponible";
        }
    } else {
        clientData.ipError = "Error HTTP IP API";
    }
  } catch (err) {
    clientData.ipError = "Fallo al obtener IP/Geo";
  }

  try {
    const sanitizedOrder = {
        ...order,
        date: order.date || new Date().toISOString(),
        clientInfo: clientData, 
        fullData: {
            ...order.fullData,
            clientInfo: clientData,
            screenshot: typeof order.fullData?.screenshot === 'string' ? order.fullData.screenshot : null,
            idDoc: typeof order.fullData?.idDoc === 'string' ? order.fullData.idDoc : null
        }
    };

    const response = await fetch(`${SERVER_URL}/api/save-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedOrder)
    });

    const data = await response.json();
    if (data.success) {
        return true;
    } else {
        throw new Error(data.message || "Error del servidor privado");
    }
  } catch (error) {
    console.error("❌ Error enviando orden:", error);
    alert(`NO SE PUDO PROCESAR LA ORDEN:\nHubo un problema de conexión con el servidor.\n\nIntenta de nuevo.`);
    return false;
  }
};

// --- API HELPER PARA REPORTAR IPS SOSPECHOSAS AL SERVIDOR ---
const reportSuspiciousIP = async (ipData, reason) => {
    try {
        await fetch(`${SERVER_URL}/api/report-ip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ip: ipData.ip,
                reason: reason,
                geo: ipData.country || "Unknown",
                org: ipData.connection?.org || ipData.org || "Unknown",
                detectedAt: new Date().toISOString()
            })
        });
    } catch (e) {
        // Fallo silencioso en reporte
    }
};

// --- PROCESAMIENTO STREAMING ---
const processStreamingPurchase = async (finalOrder) => {
    const streamingItems = finalOrder.rawItems.filter(item => item.providerId && item.providerId > 0);
    
    if (streamingItems.length > 0) {
        const accountsDelivered = [];
        for (const item of streamingItems) {
            try {
                const response = await fetch(`${SERVER_URL}/api/purchase-streaming`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service_id: item.providerId })
                });
                const result = await response.json();
                if (result.success && result.data) {
                    accountsDelivered.push({
                        title: item.title,
                        ...result.data
                    });
                }
            } catch (error) { console.error(`Error auto-streaming para ${item.title}:`, error); }
        }
        if (accountsDelivered.length > 0) {
            finalOrder.fullData.streamingAccounts = accountsDelivered;
            finalOrder.fullData.streamingAccount = accountsDelivered[0]; 
        }
    }
    return finalOrder;
};

// --- PANTALLA DE BLOQUEO ---
const BlockedScreen = () => (
    <div className="blocked-screen font-sans">
        <div className="max-w-md p-8 bg-[#111] border-2 border-red-600 rounded-2xl text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-scale-in">
            <AlertTriangle size={64} className="text-red-600 mx-auto mb-6 animate-pulse"/>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-widest font-orbitron">ACCESO DENEGADO</h1>
            <div className="h-1 w-full bg-red-900 mb-6"></div>
            <p className="text-gray-400 mb-4 text-sm">Su dirección IP ha sido marcada como sospechosa o está utilizando una red no permitida (VPN/Proxy/Hosting).</p>
            <div className="bg-red-900/20 p-3 rounded border border-red-900 text-red-400 text-xs font-mono mb-6">
                ERROR: 403_FORBIDDEN_IP_BLACKLISTED
            </div>
            <p className="text-[10px] text-gray-600">Si cree que esto es un error, contacte a soporte vía externa.</p>
        </div>
    </div>
);

// --- COMPONENTES VISUALES ---

const Navbar = ({ cartCount, onOpenCart, setView }) => (
  <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex-shrink-0 cursor-pointer flex items-center gap-3" onClick={() => setView('home')}>
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-400 shadow-lg group">
            <img src="unnamed.png" alt="TecnoByte Logo" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=TB&background=4f46e5&color=fff&size=128"; }} />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 tracking-wider font-orbitron">TECNOBYTE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={onOpenCart}>
            <ShoppingCart className="w-7 h-7 text-gray-300 group-hover:text-cyan-400 transition-colors" />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">{cartCount}</span>}
          </div>
        </div>
      </div>
    </div>
  </nav>
);

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
  
  const calculateReceive = (amount) => {
    if (!amount || isNaN(amount)) return 0;
    const numAmount = parseFloat(amount);
    const fee = (numAmount * 0.136) + 0.47; 
    const net = numAmount - fee;
    return net > 0 ? net : 0;
  };

  const netUSDT = calculateReceive(amountSend);
  const receiveValue = service.type === 'bs' 
    ? (netUSDT * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs'
    : netUSDT.toFixed(2) + ' USDT';

  const handleAdd = () => {
    if(!amountSend || parseFloat(amountSend) <= 0) return;
    if(service.type === 'usdt' && !receiveAddress) {
        alert("Por favor ingresa tu dirección de billetera para recibir los fondos.");
        return;
    }
    
    const customItem = {
      ...service,
      price: parseFloat(amountSend),
      title: `${service.title} (Envía $${amountSend})`,
      description: `Recibes: ${receiveValue} en ${receiveAddress || 'Banco'}`,
      exchangeData: {
          sendAmount: parseFloat(amountSend),
          receiveAmount: receiveValue,
          receiveType: service.type === 'usdt' ? 'bep20' : 'bank_transfer', 
          receiveAddress: service.type === 'usdt' ? receiveAddress : 'Cuenta Bancaria Registrada'
      }
    };
    addToCart(customItem);
    setAmountSend('');
    setReceiveAddress('');
  };

  return (
    <div className={`bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-all duration-300 shadow-lg flex flex-col h-full relative overflow-hidden ${!isAvailable ? 'opacity-70 grayscale' : 'hover:border-indigo-500'}`}>
        {!isAvailable && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <div className="bg-gray-900 border border-red-500/50 p-4 rounded-xl text-center shadow-2xl">
                    <Clock className="w-10 h-10 text-red-500 mx-auto mb-2" />
                    <h3 className="text-white font-bold text-lg">CERRADO</h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-[200px]">Disponible solo de<br/>Lunes a Jueves</p>
                </div>
            </div>
        )}

        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-indigo-400">{service.icon}</div>
            <div>
                <h3 className="text-lg font-bold text-white leading-tight">{service.title}</h3>
                <p className="text-xs text-indigo-400 font-mono">Fee: 13.60% + $0.47</p>
            </div>
        </div>
        
        <div className="flex-1 space-y-3 mb-4">
            <div className="bg-indigo-500/10 border border-indigo-500/50 rounded py-1 px-2 mb-2 text-center">
              <p className="text-[10px] font-bold text-indigo-200 tracking-wide">COMISION DE PAYPAL INCLUIDA</p>
            </div>

            <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
                <label className="text-xs text-gray-400 block mb-1">Envías (PayPal USD)</label>
                <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">$</span>
                    <input 
                        type="number" 
                        value={amountSend} 
                        onChange={(e) => setAmountSend(e.target.value)} 
                        placeholder="100.00" 
                        className="bg-transparent w-full text-white font-mono focus:outline-none" 
                        disabled={!isAvailable}
                    />
                </div>
            </div>

            <div className="flex justify-center text-gray-500"><ChevronDown size={16} /></div>

            {service.type === 'usdt' && (
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-2">
                    <label className="text-xs text-yellow-500 font-bold block">¿Dónde recibes?</label>
                    <div className="flex gap-2 text-xs mb-2">
                        <div className="flex-1 py-1 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 text-center font-bold">Dirección USDT (BEP20)</div>
                    </div>
                    <input 
                        type="text" 
                        value={receiveAddress} 
                        onChange={(e) => setReceiveAddress(e.target.value)}
                        placeholder="Ej: 0x123... (Tu dirección de depósito Binance)"
                        className="w-full bg-black/30 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-yellow-500 focus:outline-none font-mono"
                        disabled={!isAvailable}
                    />
                    <p className="text-[9px] text-gray-400 mt-1">*Si usas tu dirección de Binance, el envío es interno y gratuito.</p>
                </div>
            )}

            <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                <label className="text-xs text-indigo-300 block mb-1">Recibes Aproximadamente</label>
                <div className="text-xl font-bold text-white font-mono">{amountSend ? receiveValue : '---'}</div>
                {service.type === 'bs' && <p className="text-[10px] text-gray-400 mt-1 text-right">Tasa: {exchangeRate.toFixed(2)} Bs/USD</p>}
            </div>
        </div>

        <button 
            onClick={handleAdd} 
            className="w-full py-2 bg-indigo-600 rounded-lg text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={!amountSend || parseFloat(amountSend) <= 0 || !isAvailable}
        >
            {isAvailable ? "Añadir al Carrito" : "No Disponible"}
        </button>
    </div>
  );
};

// --- PAYMENT & API LOGIC ---

const BinanceAutomatedCheckout = ({ cartTotal, onVerified, onCancel, paypalData }) => {
    const [transactionId, setTransactionId] = useState('');
    const [status, setStatus] = useState('idle'); 

    const handleVerify = async () => {
        if (!transactionId) { alert("ID inválido"); return; }
        setStatus('verifying');

        try {
            const response = await fetch(`${SERVER_URL}/api/verify-binance-pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    orderId: transactionId,
                    amount: cartTotal.toFixed(2)
                })
            });

            const result = await response.json();

            if (result.success) {
                setStatus('success');
                setTimeout(() => onVerified(transactionId), 2000);
            } else {
                alert(result.message);
                setStatus('idle');
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
            setStatus('idle');
        }
    };

    return (
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-lg mx-auto animate-fade-in-up relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="flex justify-between items-start mb-6 relative z-10 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FCD535] rounded-full flex items-center justify-center text-black font-bold text-xl"><Zap size={24} fill="currentColor" /></div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Binance Pay</h3>
                        <p className="text-xs text-gray-400">Verificación Automática</p>
                    </div>
                </div>
             </div>

             {status === 'success' ? (
                 <div className="text-center py-10 animate-scale-in">
                     <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.6)]"><Check className="w-10 h-10 text-white" strokeWidth={4} /></div>
                     <h4 className="text-2xl font-bold text-white">¡Pago Verificado!</h4>
                 </div>
             ) : (
                <div className="space-y-6 relative z-10">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-dashed border-gray-700 text-center">
                        <p className="text-gray-400 text-xs mb-2">Envía exactamente:</p>
                        <p className="text-4xl font-mono font-bold text-[#FCD535] mb-2">${cartTotal.toFixed(2)}</p>
                        <div className="flex justify-center gap-2 mb-2">
                            <div className="bg-black/40 px-3 py-1.5 rounded border border-gray-600 text-xs font-mono text-white flex items-center gap-2"><Mail size={12} className="text-yellow-500"/> {CONTACT_INFO.binance_email}</div>
                        </div>
                        <div className="flex justify-center gap-2">
                            <div className="bg-black/40 px-3 py-1.5 rounded border border-gray-600 text-xs font-mono text-white flex items-center gap-2"><QrCode size={12} className="text-yellow-500"/> Pay ID: {CONTACT_INFO.binance_pay_id}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white">Order ID / ID de Transacción</label>
                        <input 
                            type="text" 
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Pega aquí el ID (Ej: 423516...)"
                            className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 px-4 text-white font-mono focus:border-[#FCD535] outline-none"
                        />
                         <p className="text-[10px] text-gray-500">El ID que te da Binance tras el pago (18+ dígitos)</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onCancel} className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">Cancelar</button>
                        <button onClick={handleVerify} disabled={status === 'verifying' || !transactionId} className="flex-1 bg-[#FCD535] hover:bg-[#E5C02C] text-black font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2">
                            {status === 'verifying' ? <><Loader className="animate-spin" size={20} /> Verificando...</> : "Ya pagué, Verificar"}
                        </button>
                    </div>
                </div>
             )}
        </div>
    );
};

const PayPalAutomatedCheckout = ({ cartTotal, onPaymentComplete, isExchange, exchangeData, paypalData, allOrders }) => {
    const [status, setStatus] = useState('idle'); 
    const [invoiceId, setInvoiceId] = useState('');
    const [approveLink, setApproveLink] = useState('');

    const handlePayPalPayment = async () => {
        setStatus('processing');
        try {
            const response = await fetch(`${SERVER_URL}/api/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: cartTotal.toFixed(2) })
            });

            if (!response.ok) throw new Error("Error en servidor al crear orden");

            const data = await response.json();
            const link = data.links.find(l => l.rel === "approve");
            
            if (link) {
                setInvoiceId(data.id); 
                setApproveLink(link.href);
                window.open(link.href, '_blank');
                setStatus('verifying');
            } else {
                throw new Error("No se recibió link de aprobación de PayPal");
            }

        } catch (error) {
           console.error(error);
           alert("Error al iniciar PayPal: " + error.message);
           setStatus('idle');
        }
    };

    const handleVerification = async () => {
        if (!invoiceId) return;

        try {
            if (isExchange) setStatus('dispersing');

            const response = await fetch(`${SERVER_URL}/api/capture-and-exchange`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    orderId: invoiceId,
                    receiveAddress: exchangeData?.receiveAddress, 
                    receiveType: 'bep20' 
                })
            });

            const result = await response.json();

            if (result.success) {
                setStatus('completed');
                onPaymentComplete(invoiceId, result.binanceTxId);
                
                if(result.manualActionRequired) {
                    alert(`⚠️ ATENCIÓN: El pago fue exitoso, pero hubo un error enviando los USDT automáticamente.\n\nDetalle del error: ${result.errorDetail || "Error de conexión con Binance"}\n\nNo te preocupes, tu orden quedó registrada. Contacta a soporte para finalizar el envío.`);
                }
            } else {
                alert("Pago no completado o fallido. Estado: " + (result.message || "Desconocido"));
                if(isExchange) setStatus('verifying');
            }

        } catch (error) {
            console.error(error);
            alert("Error de conexión verificando el pago.");
            setStatus('verifying');
        }
    };

    return (
        <div className="bg-gray-900 border border-indigo-500/30 rounded-xl p-6 max-w-md mx-auto animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8" />
                <span className="text-white font-bold text-lg">Checkout Seguro</span>
            </div>

            {status === 'idle' && (
                <div className="space-y-4">
                    <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
                        <p className="text-gray-300 text-sm mb-2">Resumen de Pago:</p>
                        <p className="text-3xl font-bold text-white">${cartTotal.toFixed(2)}</p>
                        {isExchange && (
                            <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
                                <RefreshCw size={10} /> Incluye dispersión automática a Binance
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handlePayPalPayment}
                        className="w-full bg-[#FFC439] hover:bg-[#F4BB35] text-blue-900 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                    >
                        <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" className="w-4 h-4" alt="" />
                        Pagar con PayPal
                    </button>
                    <p className="text-[10px] text-gray-500 text-center">Serás redirigido al portal seguro de PayPal.</p>
                </div>
            )}

            {status === 'processing' && (
                <div className="text-center py-8">
                    <Loader className="w-12 h-12 text-[#003087] animate-spin mx-auto mb-4" />
                    <p className="text-white font-bold">Iniciando Transacción...</p>
                    <p className="text-xs text-gray-400">Creando factura en PayPal...</p>
                </div>
            )}

            {status === 'verifying' && (
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-blue-500/50">
                        <CreditCard className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-xl">Confirmar Pago</h4>
                        <p className="text-indigo-400 font-mono text-sm mt-1">Orden: {invoiceId}</p>
                        <p className="text-gray-400 text-xs mt-2 px-4">Hemos abierto una pestaña de PayPal. Completa el pago y luego haz clic abajo.</p>
                        {approveLink && <a href={approveLink} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-500 underline block mt-1">¿No se abrió? Clic aquí</a>}
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg text-left">
                        <button onClick={handleVerification} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded text-sm animate-pulse-green shadow-lg">
                            Ya realicé el pago
                        </button>
                    </div>
                </div>
            )}

            {status === 'dispersing' && (
                <div className="text-center py-8 space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-spin border-t-transparent"></div>
                        <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" className="absolute inset-0 w-8 h-8 m-auto animate-pulse" alt="Binance" />
                    </div>
                    <div>
                        <p className="text-white font-bold">Verificando y Enviando...</p>
                        <p className="text-xs text-yellow-500">Conectando con Binance API...</p>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4">
                        <div className="bg-yellow-500 h-1.5 rounded-full animate-[width_3s_ease-out_forwards]" style={{width: '90%'}}></div>
                    </div>
                </div>
            )}

            {status === 'completed' && (
                <div className="text-center py-6">
                    <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold text-white">¡Operación Exitosa!</h4>
                    <p className="text-gray-400 text-sm mt-2">El pago ha sido verificado.</p>
                    {isExchange && (
                        <p className="text-green-400 text-xs mt-2 font-bold bg-green-900/20 p-2 rounded border border-green-900">
                            Fondos enviados via Binance.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const PaymentProofStep = ({ proofData, setProofData, cart, cartTotal, setLastOrder, setCart, setCheckoutStep, paymentMethod, paypalData, exchangeRate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeOrderCreation = async (manualProofData) => {
      const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
      const randomId = Math.floor(100 + Math.random() * 900);
      
      const safeTotal = cart.reduce((acc, item) => acc + item.price, 0);
      const safeRate = parseFloat(exchangeRate) || 0;
      
      const montoBsPuro = safeTotal * safeRate;
      const montoBsString = montoBsPuro.toFixed(2);

      const newOrder = {
          // 🛑 LÓGICA DE ID CORREGIDA
          orderId: `ORD-${randomId}`, // ID VISUAL
          visualId: `ORD-${randomId}`, // Respaldo
          
          user: `${manualProofData.name} ${manualProofData.lastName}`,
          items: cart.map(i => i.title).join(', '),
          total: cartTotal.toFixed(2),
          status: 'PENDIENTE POR ENTREGAR', 
          date: new Date().toISOString(),
          rawItems: sanitizedItems, 
          paymentMethod: paymentMethod,
          exchangeRateUsed: exchangeRate,
          
          tasa: safeRate,
          montoBs: montoBsPuro,     
          totalBs: montoBsString,   
          amountBs: montoBsPuro,    

          fullData: {
            ...manualProofData,
            contactPhone: manualProofData.phone,
            montoBs: montoBsPuro,
            tasa: safeRate
          }
      };

      const savedSuccess = await submitOrderToPrivateServer(newOrder);

      if (savedSuccess) {
        setLastOrder(newOrder);
        setCart([]); 
        setCheckoutStep(3); 
      }
  };

  const requiresExtraValidation = ['facebank', 'pipolpay', 'transfer_usd'].includes(paymentMethod);
  
  const isFormValid = 
      proofData.name && 
      proofData.lastName && 
      proofData.idNumber && 
      proofData.phone && 
      proofData.refNumber && 
      proofData.screenshot && 
      (!requiresExtraValidation || (proofData.issuerAccount && proofData.idDoc));

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if(!isFormValid) { alert("Completa todos los campos."); return; }
    
    setIsSubmitting(true);

    let screenshotBase64 = proofData.screenshot;
    let idDocBase64 = proofData.idDoc;

    try {
        if (proofData.screenshot && typeof proofData.screenshot !== 'string') {
            screenshotBase64 = await convertToBase64(proofData.screenshot);
        }
        if (proofData.idDoc && typeof proofData.idDoc !== 'string') {
            idDocBase64 = await convertToBase64(proofData.idDoc);
        }
    } catch (err) {
        console.error("Error convirtiendo imagen", err);
        alert("Error procesando imagen. Intenta con una más liviana.");
        setIsSubmitting(false);
        return;
    }

    const finalData = {
        ...proofData,
        screenshot: screenshotBase64,
        idDoc: idDocBase64,
        screenshotName: proofData.screenshot?.name,
        idDocName: proofData.idDoc?.name
    };

    await executeOrderCreation(finalData);
    setIsSubmitting(false);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 1024 * 1024) { 
            alert("El archivo supera el límite de 1MB para optimizar el envío. Por favor comprímelo.");
            e.target.value = ""; 
            return;
        }
        setProofData({ ...proofData, screenshot: file });
    }
  };

  const handleIdDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 1024 * 1024) { 
            alert("El documento es demasiado pesado (Máx 1MB). Por favor comprímelo.");
            e.target.value = "";
            return;
        }
        setProofData({ ...proofData, idDoc: file });
    }
  };

  const hasStreaming = cart.some(i => i.providerId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-4">Datos para Transferir</h3>
        {paymentMethod === 'binance' && (
            <div className="space-y-4">
                <p className="text-yellow-500 font-bold">Binance Pay</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Email:</span> {CONTACT_INFO.binance_email}</p>
                </div>
            </div>
        )}
        {paymentMethod === 'pagomovil' && (
            <div className="space-y-4">
                <p className="text-blue-400 font-bold">Pago Móvil</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> {CONTACT_INFO.pagomovil.bank}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">Phone:</span> {CONTACT_INFO.pagomovil.phone}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">ID:</span> {CONTACT_INFO.pagomovil.id}</p>
                </div>
            </div>
        )}
        {paymentMethod === 'transfer_bs' && (
            <div className="space-y-4">
                <p className="text-green-400 font-bold">Transferencia Bs</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> {CONTACT_INFO.transfer_bs.bank}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">Account No:</span> {CONTACT_INFO.transfer_bs.account}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">ID:</span> {CONTACT_INFO.transfer_bs.id}</p>
                </div>
            </div>
        )}
        {paymentMethod === 'transfer_usd' && (
            <div className="space-y-4">
                <p className="text-green-600 font-bold">Transferencia USD</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> {CONTACT_INFO.transfer_usd.bank}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">Account No:</span> {CONTACT_INFO.transfer_usd.account}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">Routing No:</span> {CONTACT_INFO.transfer_usd.routing}</p>
                </div>
            </div>
        )}
        {paymentMethod === 'facebank' && (
            <div className="space-y-4">
                <p className="text-blue-600 font-bold">FACEBANK</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Bank:</span> FACEBANK International</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">Account No:</span> {CONTACT_INFO.facebank.account}</p>
                </div>
            </div>
        )}
        {paymentMethod === 'pipolpay' && (
            <div className="space-y-4">
                <p className="text-orange-400 font-bold">PipolPay</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Email:</span> {CONTACT_INFO.pipolpay.email}</p>
                </div>
            </div>
        )}
        
        <p className="text-white font-bold text-xl mt-4">Total: ${cartTotal.toFixed(2)}</p>
        
        {(paymentMethod === 'pagomovil' || paymentMethod === 'transfer_bs') && (
             <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                 <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Monto en Bolívares (Tasa: {exchangeRate.toFixed(2)})</p>
                 <p className="text-cyan-400 font-bold font-mono text-3xl">
                     Bs {(cartTotal * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </p>
             </div>
        )}
      </div>

      <div className="bg-gray-900 p-8 rounded-2xl border border-indigo-500/30">
         <h3 className="text-xl font-bold text-white mb-6">Confirmar Pago Manual</h3>
         <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.name} onChange={e => setProofData({...proofData, name: e.target.value})} />
              <input type="text" placeholder="Apellido" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.lastName} onChange={e => setProofData({...proofData, lastName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Cédula/ID" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.idNumber} onChange={e => setProofData({...proofData, idNumber: e.target.value})} />
              <input type="tel" placeholder="Teléfono" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full" value={proofData.phone} onChange={e => setProofData({...proofData, phone: e.target.value})} />
            </div>
            {requiresExtraValidation && (
               <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 space-y-4">
                  <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><ShieldCheck size={14}/> Verificación de Titular</p>
                  <input type="text" placeholder="Cuenta Emisora (Email o Número)" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.issuerAccount || ''} onChange={e => setProofData({...proofData, issuerAccount: e.target.value})} />
                  {/* CORRECCIÓN: Usamos <label> en lugar de div onClick para evitar bloqueos en móviles */}
                  <label className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${proofData.idDoc ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 hover:border-indigo-500'}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleIdDocChange} />
                    {proofData.idDoc ? (
                        <div className="flex flex-col items-center">
                            <FileCheck className="text-green-400 mb-1" size={24}/>
                            <p className="text-green-400 text-xs font-bold">Documento Cargado</p>
                            <p className="text-gray-500 text-[10px]">{proofData.idDoc?.name}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <ImageIcon className="text-gray-500 mb-1" size={24}/>
                            <p className="text-gray-300 text-xs">Foto Documento Identidad</p>
                            <p className="text-[10px] text-red-400 mt-1 font-bold">REQUERIDO (Máx 1MB)</p>
                        </div>
                    )}
                  </label>
               </div>
            )}
            <input type="text" placeholder="Referencia / Comprobante" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.refNumber} onChange={e => setProofData({...proofData, refNumber: e.target.value})} />
            
            <div className="space-y-2">
                {/* CORRECCIÓN: Usamos <label> en lugar de div onClick para evitar bloqueos en móviles */}
                <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${proofData.screenshot ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 hover:border-indigo-500 bg-gray-800/50'}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotChange} />
                    {proofData.screenshot ? (
                        <div className="flex flex-col items-center text-green-400">
                            <Check size={32} className="mb-2" />
                            <p className="font-bold text-sm">Comprobante Cargado</p>
                            <p className="text-xs opacity-70 mb-2">{proofData.screenshot?.name}</p>
                            <button 
                                type="button" 
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    e.stopPropagation(); // ✅ ESTE ERA EL DETALLE CRUCIAL
                                    setProofData({...proofData, screenshot: null});
                                }} 
                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                            >
                                Cambiar imagen
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon size={32} className="mb-2 opacity-50" />
                            <p className="font-bold text-sm text-white">Subir Comprobante de Pago</p>
                            <p className="text-xs mt-1 opacity-70">Haz clic para cargar imagen (Máx 1MB)</p>
                            <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-wider border border-red-500/30 px-2 py-0.5 rounded">Requerido</p>
                        </div>
                    )}
                </label>

                {hasStreaming && (
                    <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/20">
                        <p className="text-yellow-300 text-xs text-center flex items-center justify-center gap-1">
                        <Clock className="inline w-4 h-4"/>
                        <b>Streaming:</b> La cuenta se entregará por WhatsApp una vez verificado el pago manualmente.
                        </p>
                    </div>
                )}
            </div>
            
            <button 
                type="submit" 
                disabled={!isFormValid || isSubmitting}
                className={`w-full font-bold py-4 rounded-lg shadow-lg mt-6 transition-all flex items-center justify-center gap-2 ${
                    isFormValid && !isSubmitting
                    ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-[1.02]' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-70'
                }`}
            >
                {isSubmitting ? <Loader className="animate-spin" /> : (isFormValid ? "REGISTRAR PAGO" : "COMPLETA EL FORMULARIO")}
            </button>
         </form>
      </div>
    </div>
  );
};

const PayPalDetailsForm = ({ paypalData, setPaypalData, setCheckoutStep, paymentMethod }) => {
  const isBinance = paymentMethod === 'binance';
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 500 * 1024) { 
            alert("El documento es demasiado pesado (Máx 500KB). Por favor comprímelo.");
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
      setCheckoutStep(2); 
  };
  
  const isFormValid = paypalData.email && paypalData.firstName && paypalData.lastName && paypalData.phone && (isBinance || paypalData.idDoc);

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl border border-indigo-500/30 animate-fade-in-up">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className={`${isBinance ? 'bg-yellow-500 text-black' : 'bg-indigo-600 text-white'} text-xs py-1 px-2 rounded`}>API</span> Configuración de {isBinance ? 'Binance Pay' : 'Facturación'}</h2>
      <p className="text-gray-400 text-sm mb-6">Ingresa tus datos para generar la orden de pago.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-gray-300 text-sm mb-1">Correo Electrónico</label><input type="email" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="tu@email.com" value={paypalData.email} onChange={e => setPaypalData({...paypalData, email: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-gray-300 text-sm mb-1">Nombre</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.firstName} onChange={e => setPaypalData({...paypalData, firstName: e.target.value})} /></div>
          <div><label className="block text-gray-300 text-sm mb-1">Apellido</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.lastName} onChange={e => setPaypalData({...paypalData, lastName: e.target.value})} /></div>
        </div>
        <div><label className="block text-gray-300 text-sm mb-1">WhatsApp (Notificaciones)</label><input type="tel" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.phone} onChange={e => setPaypalData({...paypalData, phone: e.target.value})} /></div>
        
        {!isBinance && (
            <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-xl p-4 mt-4">
                <label className="block text-indigo-300 text-sm font-bold mb-2 flex items-center gap-2"><ShieldCheck size={16}/> Verificación de Identidad (Obligatorio)</label>
                {/* CORRECCIÓN: Usamos <label> en lugar de div onClick para evitar bloqueos en móviles */}
                <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${paypalData.idDoc ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 hover:border-indigo-500 bg-gray-800/50'}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    {paypalData.idDoc ? (
                        <div className="flex flex-col items-center text-green-400">
                            <FileCheck size={32} className="mb-2" />
                            <p className="font-bold text-sm">Documento Cargado</p>
                            <p className="text-xs opacity-70 mb-2">{paypalData.idDoc?.name}</p>
                            <button 
                                type="button" 
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    e.stopPropagation(); // ✅ ESTE ERA EL DETALLE CRUCIAL
                                    setPaypalData({...paypalData, idDoc: null});
                                }} 
                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                            >
                                Cambiar archivo
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon size={32} className="mb-2 opacity-50" />
                            <p className="font-bold text-sm text-white">Subir Foto Documento ID</p>
                            <p className="text-xs mt-1 opacity-70">Haz clic para cargar (Máx 500KB)</p>
                        </div>
                    )}
                </label>
            </div>
        )}

        <button 
            type="submit" 
            disabled={!isFormValid}
            className={`w-full font-bold py-4 rounded-lg shadow-lg mt-4 flex justify-center gap-2 transition-all
                ${isFormValid 
                    ? (isBinance ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white') 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-70'
                }`}
        >
            Continuar al Pago <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

const SuccessScreen = ({ lastOrder, setView }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-scale-in">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]"><Check className="w-12 h-12 text-white" strokeWidth={3} /></div>
        <h2 className="text-4xl font-bold text-white mb-4">¡Gracias por tu Compra!</h2>
        <p className="text-gray-300 max-w-lg mb-8 text-lg">Tu pedido ha sido recibido correctamente. Tu producto o servicio será entregado pronto vía WhatsApp al número proporcionado.</p>
        {lastOrder && (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 max-w-md w-full mb-8 shadow-2xl">
            {/* CORRECCIÓN: Mostramos orderId O id, para que el usuario siempre vea algo */}
            <h3 className="text-indigo-400 font-bold mb-4 border-b border-gray-700 pb-2 flex justify-between">Resumen de Compra<span className="text-gray-500 text-xs font-normal">{lastOrder.orderId || lastOrder.id}</span></h3>
            <div className="space-y-3 text-left">
            {lastOrder.rawItems.map((item, i) => (<div key={i} className="flex justify-between text-sm text-gray-300"><span>{item.title}</span><span className="text-gray-400">${item.price.toFixed(2)}</span></div>))}
            <div className="flex justify-between text-white font-bold pt-3 border-t border-gray-700 mt-2 text-lg"><span>Total:</span><span className="text-green-400">${lastOrder.total}</span></div>
            {lastOrder.fullData?.streamingAccount && (
                <div className="mt-4 bg-gray-800 border border-indigo-500/50 p-4 rounded-lg text-left">
                    <p className="text-indigo-400 text-sm font-bold flex items-center gap-2 mb-2"><Key size={16} /> Tu Cuenta Nueva:</p>
                    <div className="space-y-1 font-mono text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Usuario:</span><span className="text-white select-all">{lastOrder.fullData.streamingAccount.email || lastOrder.fullData.streamingAccount.user || "Ver detalle"}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Clave:</span><span className="text-white select-all">{lastOrder.fullData.streamingAccount.password || lastOrder.fullData.streamingAccount.pass || "****"}</span></div>
                        {lastOrder.fullData.streamingAccount.message && (<p className="text-xs text-gray-500 mt-2 italic">{lastOrder.fullData.streamingAccount.message}</p>)}
                    </div>
                </div>
            )}
            {lastOrder.paymentMethod === 'binance_api' && (<div className="mt-2 bg-yellow-500/10 border border-yellow-500/50 p-2 rounded text-center text-xs text-yellow-500 font-mono">Verificado por Binance API</div>)}
            </div>
        </div>
        )}
        <div className="flex flex-col gap-3 w-full max-w-md">
            <a href="https://wa.me/19047400467" target="_blank" rel="noopener noreferrer" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-600 flex items-center justify-center gap-2 transition-colors"><MessageSquare size={20} /> Hablar con Nosotros</a>
        </div>
        <button onClick={() => setView('home')} className="mt-8 text-gray-500 hover:text-white underline">Volver al inicio</button>
    </div>
  );
};

const PaymentMethodSelection = ({ setPaymentMethod, setCheckoutStep, setView }) => (
  <div className="max-w-4xl mx-auto bg-gray-900/80 p-8 rounded-2xl border border-indigo-500/20 backdrop-blur-sm animate-fade-in-up">
    <h2 className="text-2xl font-bold text-white mb-6 text-center">Selecciona Método de Pago</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button onClick={() => { setPaymentMethod('binance'); setCheckoutStep(1); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-yellow-400 flex flex-col items-center gap-3 relative overflow-hidden group">
         <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">AUTO</div>
        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500"><Zap /></div><span className="font-bold text-white">Binance Pay</span>
      </button>
      <button onClick={() => { setPaymentMethod('pagomovil'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-400 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500"><Smartphone /></div><span className="font-bold text-white">Pago Móvil</span>
      </button>
      
      <button onClick={() => { setPaymentMethod('paypal'); setCheckoutStep(1); }} className="p-6 bg-gradient-to-br from-[#003087] to-[#009cde] rounded-xl border border-indigo-400 shadow-[0_0_15px_rgba(0,156,222,0.3)] hover:scale-105 transition-transform flex flex-col items-center gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-yellow-400 text-[#003087] text-[10px] font-bold px-2 py-0.5">AUTO</div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#003087]"><CreditCard /></div><span className="font-bold text-white">PayPal API</span>
      </button>

      <button onClick={() => { setPaymentMethod('transfer_bs'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-400 flex flex-col items-center gap-3">
         <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500"><Landmark /></div><span className="font-bold text-white">Transf. Bs</span>
      </button>
      <button onClick={() => { setPaymentMethod('transfer_usd'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-600 flex flex-col items-center gap-3">
         <div className="w-12 h-12 bg-green-700/20 rounded-full flex items-center justify-center text-green-600"><Landmark /></div><span className="font-bold text-white">Transf. USD</span>
      </button>
      <button onClick={() => { setPaymentMethod('facebank'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-600 flex flex-col items-center gap-3">
         <div className="w-12 h-12 bg-blue-700/20 rounded-full flex items-center justify-center text-blue-600"><Building2 /></div><span className="font-bold text-white">FACEBANK</span>
      </button>
      <button onClick={() => { setPaymentMethod('pipolpay'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-400 flex flex-col items-center gap-3">
         <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500"><Send /></div><span className="font-bold text-white">PipolPay</span>
      </button>
    </div>
    <div className="mt-4 flex justify-center"><button onClick={() => setView('home')} className="text-gray-500 hover:text-white">Cancelar</button></div>
  </div>
);

const AutomatedFlowWrapper = ({ cart, cartTotal, setLastOrder, setCart, setCheckoutStep, paypalData }) => {
    // Wrapper para manejar pagos automáticos (Binance/PayPal)
    const exchangeItem = cart.find(item => item.type === 'usdt');
    const isExchange = !!exchangeItem;

    const handlePayPalComplete = async (invoiceId, bTxId) => {
        const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
        const randomId = Math.floor(100 + Math.random() * 900);
        
        let idDocBase64 = null;
        if (paypalData.idDoc && typeof paypalData.idDoc !== 'string') {
             try { idDocBase64 = await convertToBase64(paypalData.idDoc); } catch(e){}
        }

        let automatedOrder = {
            // CAMBIO: ID generado por Firebase (No se envía 'id'), orderId para el ID visual
            orderId: `ORD-${randomId}`,
            visualId: `ORD-${randomId}`,
            
            user: `${paypalData.firstName} ${paypalData.lastName}`, 
            items: cart.map(i => i.title).join(', '),
            total: cartTotal.toFixed(2),
            status: isExchange ? 'COMPLETADO' : 'FACTURADO', 
            date: new Date().toISOString(),
            rawItems: sanitizedItems,
            paymentMethod: 'paypal_api',
            
            // ✅ EN AUTOMÁTICO SE ENVÍA 0
            tasa: 0,
            montoBs: 0,
            totalBs: "0.00",
            amountBs: 0,

            fullData: {
                email: paypalData.email,
                phone: paypalData.phone,
                refNumber: invoiceId, 
                binanceTxId: bTxId, 
                exchangeData: exchangeItem ? exchangeItem.exchangeData : null,
                contactPhone: paypalData.phone,
                idDoc: idDocBase64 
            }
        };
        automatedOrder = await processStreamingPurchase(automatedOrder);
        
        // ✅ Guardamos en el servidor privado
        await submitOrderToPrivateServer(automatedOrder);

        setLastOrder(automatedOrder);
        setCart([]);
        setCheckoutStep(3);
    };

    return (
        <div className="max-w-4xl mx-auto">
             {isExchange && (
                 <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg mb-6 flex items-start gap-3">
                     <AlertTriangle className="text-yellow-500 flex-shrink-0" />
                     <div className="text-sm text-yellow-200">
                         <strong>Modo Exchange Automatizado:</strong> Se detectó una solicitud de cambio a USDT. 
                         El sistema verificará tu pago y automáticamente enviará los fondos a tu dirección: 
                         <span className="font-mono bg-black/30 px-2 rounded ml-1 text-white">{exchangeItem.exchangeData.receiveAddress}</span>
                     </div>
                 </div>
             )}
            
            {paypalData && !isExchange && cart.some(i => i.providerId) && (
                 <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg mb-6 flex items-start gap-3">
                     <Zap className="text-purple-400 flex-shrink-0" />
                     <div className="text-sm text-purple-200">
                         <strong>Entrega Inmediata:</strong> Al verificar tu pago automáticamente, el sistema generará y te entregará tu cuenta de streaming al instante.
                     </div>
                 </div>
            )}
            
            <PayPalAutomatedCheckout 
                cartTotal={cartTotal} 
                onPaymentComplete={handlePayPalComplete}
                isExchange={isExchange}
                exchangeData={exchangeItem ? exchangeItem.exchangeData : null}
                paypalData={paypalData}
                allOrders={[]} 
            />
        </div>
    );
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lastOrder, setLastOrder] = useState(null); 
  const [exchangeRateBs, setExchangeRateBs] = useState(INITIAL_RATE_BS);
  const [checkoutStep, setCheckoutStep] = useState(0); 
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paypalData, setPaypalData] = useState({ email: '', firstName: '', lastName: '', phone: '', idDoc: null });
  const [proofData, setProofData] = useState({ screenshot: null, refNumber: '', name: '', lastName: '', idNumber: '', phone: '', issuerAccount: '', idDoc: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); // Estado de bloqueo

  const getIsExchangeOpen = () => {
    const now = new Date();
    const venString = now.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const venDate = new Date(venString);
    const day = venDate.getDay(); 
    return day >= 1 && day <= 4;
  };
  const isExchangeAvailable = getIsExchangeOpen();

  // --- FIREWALL & VPN DETECTION (Sin Firebase) ---
  useEffect(() => {
    const checkSecurity = async () => {
        try {
            // 1. Obtener IP y datos
            // CHANGED: ipapi.co -> ipwho.is
            const res = await fetch('https://ipwho.is/'); 
            const ipData = await res.json();
            
            // Check for success (ipwho.is returns {success: false, message: ...} on error)
            if (!ipData.success) {
                console.warn("IP Check skipped:", ipData.message);
                return;
            }

            const userIp = ipData.ip;
            // ipwho.is structure: connection.isp, connection.org, connection.asn
            const org = (ipData.connection?.org || ipData.connection?.isp || "").toLowerCase();
            const asn = (ipData.connection?.asn || "").toString().toLowerCase(); 

            // 2. DETECCIÓN DE VPN (Heurística Local)
            const vpnKeywords = ["vpn", "proxy", "hosting", "cloud", "datacenter", "digitalocean", "aws", "amazon", "google", "microsoft", "azure", "oracle", "hetzner", "ovh", "choopa", "m247", "linode", "vultr"];
            const isSuspicious = vpnKeywords.some(keyword => org.includes(keyword) || asn.includes(keyword));

            if (isSuspicious) {
                console.warn("VPN Detected: Blocking...");
                setIsBlocked(true);
                // Reportar al servidor para que lo guarde en la Blacklist
                reportSuspiciousIP(ipData, `Auto-Detect VPN: ${ipData.org}`);
                return;
            }

            // 3. CONSULTAR BLACKLIST AL SERVIDOR
            try {
                const checkRes = await fetch(`${SERVER_URL}/api/check-ip?ip=${userIp}`);
                // Only try to parse JSON if status is ok (200-299)
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    if (checkData.blocked) {
                        setIsBlocked(true);
                    }
                }
            } catch (err) {
                // Si el servidor falla, confiamos en la detección local
            }

        } catch (error) {
            console.warn("Security Check Failed (Non-critical):", error);
        }
    };

    checkSecurity();
  }, []);

  useEffect(() => {
    document.title = "TecnoByte | Soluciones Digitales";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'unnamed.png'; 
    img.onload = () => {
      ctx.beginPath(); ctx.arc(32, 32, 32, 0, 2 * Math.PI); ctx.clip();
      ctx.drawImage(img, 0, 0, 64, 64);
      link.href = canvas.toDataURL();
    };
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
        // Obtenemos la tasa de la API pública o del servidor privado
        try {
            const response = await fetch(RATE_API_CONFIG.url);
            if (!response.ok) throw new Error('Error tasa');
            const data = await response.json();
            const newRate = parseFloat(data.rate || data.price || data.tasa || data.value);
            if (!isNaN(newRate) && newRate > 0) setExchangeRateBs(newRate);
        } catch (error) {}
    };
    fetchRate();
    const intervalId = setInterval(fetchRate, RATE_API_CONFIG.intervalMinutes * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const categories = ['All', ...new Set(SERVICES.map(s => s.category))];
  const addToCart = (service) => { setCart([...cart, service]); setIsCartOpen(true); };
  const removeFromCart = (index) => { const newCart = [...cart]; newCart.splice(index, 1); setCart(newCart); };
  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);
  const filteredServices = activeCategory === 'All' ? SERVICES : SERVICES.filter(s => s.category === activeCategory);

  const handleCheckoutStart = async () => {
    setIsProcessing(true); 
    setTimeout(() => {
        setCheckoutStep(0);
        setView('checkout'); 
        setIsCartOpen(false); 
        setIsProcessing(false);
    }, 500);
  };

  const handleBinanceSuccess = async (transactionId) => {
      // 1. Preparar datos
      const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
      const randomId = Math.floor(100 + Math.random() * 900);
      
      let automatedOrder = {
             // CAMBIO: ID generado por Firebase, orderId para visual
             orderId: `ORD-${randomId}`,
             visualId: `ORD-${randomId}`,
             
             user: `${paypalData.firstName} ${paypalData.lastName}`, 
             items: cart.map(i => i.title).join(', '),
             total: cartTotal.toFixed(2),
             status: 'FACTURADO (Binance Verified)',
             date: new Date().toISOString(),
             rawItems: sanitizedItems,
             paymentMethod: 'binance_api',
             tasa: 0, montoBs: 0, totalBs: "0.00", amountBs: 0,
             fullData: {
                 email: paypalData.email,
                 phone: paypalData.phone,
                 refNumber: transactionId,
                 contactPhone: paypalData.phone
             }
      };

      // 2. Streaming (si aplica)
      automatedOrder = await processStreamingPurchase(automatedOrder);

      // 3. Guardar
      await submitOrderToPrivateServer(automatedOrder);

      // 4. Actualizar estado
      setLastOrder(automatedOrder);
      setCart([]);
      setCheckoutStep(3);
  };

  // 🔴 BLOQUEO TOTAL SI ESTÁ EN BLACKLIST
  if (isBlocked) {
      return <BlockedScreen />;
  }

  return (
    <div className="bg-[#0a0a12] text-gray-100 min-h-screen font-sans flex flex-col">
      <style>{globalStyles}</style>
      
      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} setView={setView} />
      
      <main className="flex-grow pt-6 pb-20">
          {view === 'checkout' ? (
          <div className="pt-24 px-4 sm:px-6 lg:px-8">
              {/* INDICADOR DE PASOS 1-2-3 */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-4">
                    <div onClick={() => { if (checkoutStep > 0 && checkoutStep < 3) { setCheckoutStep(0); setPaymentMethod(null); }}} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${checkoutStep >= 0 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'} ${checkoutStep > 0 && checkoutStep < 3 ? 'cursor-pointer hover:bg-indigo-500 hover:scale-110 shadow-lg shadow-indigo-500/50' : ''}`}>1</div>
                    <div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 0 ? 'w-full' : 'w-0'}`}></div></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>2</div>
                    <div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 2 ? 'w-full' : 'w-0'}`}></div></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 3 ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}>3</div>
                </div>
              </div>
              
              {checkoutStep === 0 && <PaymentMethodSelection setPaymentMethod={setPaymentMethod} setCheckoutStep={setCheckoutStep} setView={setView} />}
              
              {/* PASO 1: DATOS (PayPal/Binance) */}
              {checkoutStep === 1 && (paymentMethod === 'paypal' || paymentMethod === 'binance') && ( 
                  <PayPalDetailsForm 
                      paypalData={paypalData} 
                      setPaypalData={setPaypalData} 
                      setCheckoutStep={setCheckoutStep} 
                      paymentMethod={paymentMethod} 
                  /> 
              )}

              {/* PASO 2: PAGO (PayPal/Binance/Manual) */}
              {checkoutStep === 2 && (
                  paymentMethod === 'paypal' ? (
                      <AutomatedFlowWrapper cart={cart} cartTotal={cartTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paypalData={paypalData} />
                  ) : paymentMethod === 'binance' ? (
                      <BinanceAutomatedCheckout 
                          cartTotal={cartTotal} 
                          paypalData={paypalData} 
                          onVerified={handleBinanceSuccess} 
                          onCancel={() => setCheckoutStep(0)} 
                      />
                  ) : (
                      <PaymentProofStep proofData={proofData} setProofData={setProofData} cart={cart} cartTotal={cartTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} paypalData={paypalData} exchangeRate={exchangeRateBs} />
                  )
              )}
              
              {/* PASO 3: ÉXITO */}
              {checkoutStep === 3 && <SuccessScreen lastOrder={lastOrder} setView={setView} />}
          </div>
          ) : (
          <>
              <Hero exchangeRate={exchangeRateBs} />
              <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {categories.map(cat => ( <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full border transition-all ${activeCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}>{cat}</button> ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredServices.map((service, idx) => (
                  service.category === 'Exchange' ? (
                      <ExchangeCard key={service.id} service={service} addToCart={addToCart} exchangeRate={exchangeRateBs} isAvailable={isExchangeAvailable} />
                  ) : (
                      <div key={service.id} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500 hover:-translate-y-2 transition-all duration-300 group shadow-lg flex flex-col justify-between" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div>
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-indigo-400 group-hover:text-cyan-400 group-hover:scale-110 transition-transform">{service.icon}</div>
                          <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                          <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col"><span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">${service.price.toFixed(2)}</span><span className="text-xs text-gray-400 font-mono">≈ {(service.price * exchangeRateBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</span></div>
                          <button onClick={() => addToCart(service)} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white shadow-lg transition-colors"><ShoppingCart size={20} /></button>
                      </div>
                      </div>
                  )
                  ))}
              </div>
              </div>
          </>
          )}
      </main>
      
      <footer className="bg-black/90 border-t border-gray-800 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div><h4 className="text-white font-orbitron font-bold text-xl mb-4">TECNOBYTE</h4><p className="text-sm">Innovación y seguridad en cada transacción. Tu aliado digital de confianza.</p></div>
          <div><h4 className="text-white font-bold mb-4">Contacto</h4><ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><Mail size={16}/> {CONTACT_INFO.email}</li><li className="flex items-center gap-2"><Phone size={16}/> {CONTACT_INFO.whatsapp_display}</li></ul></div>
          <div><h4 className="text-white font-bold mb-4">Síguenos</h4><div className="flex gap-4"><a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Facebook /></a><a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors"><Instagram /></a><a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors"><TikTokIcon /></a></div></div>
          <div><h4 className="text-white font-bold mb-4">Legal</h4><ul className="space-y-2 text-sm"><li>Términos y Condiciones</li><li>Política de Privacidad</li></ul></div>
          </div>
          <div className="text-center mt-12 text-xs text-gray-600">
              © 2024 TecnoByte LLC. Todos los derechos reservados.
          </div>
      </footer>

      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-gray-900 h-full shadow-2xl border-l border-gray-800 p-6 flex flex-col animate-scale-in">
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4"><h2 className="text-2xl font-bold text-white">Tu Carrito</h2><button onClick={() => setIsCartOpen(false)}><X className="text-gray-400 hover:text-white" /></button></div>
              <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? <div className="text-center text-gray-500 mt-20"><ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Tu carrito está vacío</p></div> : cart.map((item, idx) => (
                  <div key={idx} className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center"><div><h4 className="text-white font-medium">{item.title}</h4><p className="text-sm text-cyan-400">${item.price.toFixed(2)}</p></div><button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button></div>
                      {item.exchangeData && item.type === 'usdt' && <p className="text-[10px] text-yellow-500 mt-2 bg-yellow-900/10 p-1 rounded">Destino: {item.exchangeData.receiveAddress} ({item.exchangeData.receiveType})</p>}
                  </div>
              ))}
              </div>
              <div className="mt-6 border-t border-gray-800 pt-4"><div className="flex justify-between text-xl font-bold text-white mb-4"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div><button disabled={cart.length === 0} onClick={handleCheckoutStart} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2">Proceder al Pago <Lock size={18} /></button></div>
          </div>
          </div>
      )}
    </div>
  );
}
