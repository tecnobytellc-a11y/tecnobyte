import './styles.css';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, Gamepad2, CreditCard, MessageSquare, 
  Smartphone, Check, Upload, X, Lock, 
  Zap, Trash2, RefreshCw,
  Facebook, Instagram, Mail, Phone, ShieldCheck, ChevronDown, Landmark, Building2, Send, Tv, Music,
  Loader, ArrowRight, AlertTriangle, Clock, Key, Image as ImageIcon, FileCheck, QrCode
} from 'lucide-react';

// --- CONFIGURACIÓN DEL SERVIDOR ---
// ✅ CONECTADO A TU SERVIDOR VERCEL
const SERVER_URL = "https://api-paypal-secure.vercel.app"; 

// --- DATA & CONFIGURATION ---

const RATE_API_CONFIG = {
    // API CriptoYa
    url: "https://api-secure-server.vercel.app/api/get-tasa", 
    intervalMinutes: 0.1 
};

const INITIAL_RATE_BS = 570.00;

const SERVICES = [
  { id: 1, category: 'Virtual Numbers', title: 'WhatsApp Number', price: 2.05, icon: <MessageSquare />, description: 'Número virtual privado para verificación de WhatsApp.' },
  { id: 2, category: 'Virtual Numbers', title: 'Telegram Number', price: 1.85, icon: <MessageSquare />, description: 'Verificación segura para Telegram.' },
  { id: 3, category: 'Virtual Numbers', title: 'PayPal/Banks Number', price: 1.30, icon: <CreditCard />, description: 'Para recibir SMS de bancos y PayPal.' },
  
  // Exchange Items
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
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
`;

// --- HELPER FUNCTIONS ---
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// --- FUNCIÓN DE CONEXIÓN CON TU SERVIDOR ---
const submitOrderToPrivateServer = async (order) => {
  try {
    // Usamos el endpoint '/api/save-order' que configuramos en tu server.js
    const response = await fetch(`${SERVER_URL}/api/save-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });

    const data = await response.json();
    if (data.success) {
        console.log("✅ Orden guardada en el servidor exitosamente:", data.id);
        return true;
    } else {
        throw new Error(data.message || "Error del servidor privado");
    }
  } catch (error) {
    console.error("❌ Error enviando orden:", error);
    alert(`NO SE PUDO PROCESAR LA ORDEN:\nHubo un problema de conexión con el servidor.\n\nIntenta de nuevo o contacta a soporte.`);
    return false;
  }
};

// --- COMPONENTS UI ---

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

// --- CALCULADORA & EXCHANGE ---

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

const PaymentProofStep = ({ proofData, setProofData, cart, cartTotal, setLastOrder, setCart, setCheckoutStep, paymentMethod, paypalData, exchangeRate }) => {
  const fileInputRef = useRef(null);
  const idDocRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeOrderCreation = async (manualProofData) => {
      const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
      const randomId = Math.floor(100 + Math.random() * 900);
      
      const newOrder = {
          id: `ORD-${randomId}`,
          user: `${manualProofData.name} ${manualProofData.lastName}`,
          items: cart.map(i => i.title).join(', '),
          total: cartTotal.toFixed(2),
          status: 'PENDIENTE POR ENTREGAR', 
          date: new Date().toISOString(),
          rawItems: sanitizedItems, 
          paymentMethod: paymentMethod,
          exchangeRateUsed: exchangeRate,
          fullData: {
            ...manualProofData,
            contactPhone: manualProofData.phone
          }
      };

      // ENVIAR AL SERVIDOR PRIVADO
      const savedSuccess = await submitOrderToPrivateServer(newOrder);

      if (savedSuccess) {
        setLastOrder(newOrder);
        setCart([]); 
        setCheckoutStep(3); 
      }
  };

  const isFormValid = 
      proofData.name && 
      proofData.lastName && 
      proofData.refNumber && 
      proofData.screenshot;

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if(!isFormValid) { alert("Completa todos los campos obligatorios."); return; }
    
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
        alert("Error procesando imagen.");
        setIsSubmitting(false);
        return;
    }

    const finalData = {
        ...proofData,
        screenshot: screenshotBase64,
        idDoc: idDocBase64
    };

    await executeOrderCreation(finalData);
    setIsSubmitting(false);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) setProofData({ ...proofData, screenshot: file });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-4">Datos para Transferir</h3>
        {paymentMethod === 'binance' && (
            <div className="space-y-4">
                <p className="text-yellow-500 font-bold">Binance Pay</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Email:</span> {CONTACT_INFO.binance_email}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">ID:</span> {CONTACT_INFO.binance_pay_id}</p>
                </div>
            </div>
        )}
        {paymentMethod === 'pagomovil' && (
            <div className="space-y-4">
                <p className="text-blue-400 font-bold">Pago Móvil</p>
                <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400 font-bold">Banco:</span> {CONTACT_INFO.pagomovil.bank}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">Tel:</span> {CONTACT_INFO.pagomovil.phone}</p>
                    <p className="text-white"><span className="text-gray-400 font-bold">CI:</span> {CONTACT_INFO.pagomovil.id}</p>
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
            
            <input type="text" placeholder="Referencia / Comprobante" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.refNumber} onChange={e => setProofData({...proofData, refNumber: e.target.value})} />
            
            <div className="space-y-2">
                <div 
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${proofData.screenshot ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 hover:border-indigo-500 bg-gray-800/50'}`} 
                    onClick={() => screenshotInputRef.current.click()}
                >
                    <input 
                        type="file" 
                        ref={screenshotInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleScreenshotChange} 
                    />
                    {proofData.screenshot ? (
                        <div className="flex flex-col items-center text-green-400">
                            <Check size={32} className="mb-2" />
                            <p className="font-bold text-sm">Comprobante Cargado</p>
                            <p className="text-xs opacity-70 mb-2">{proofData.screenshot.name}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon size={32} className="mb-2 opacity-50" />
                            <p className="font-bold text-sm text-white">Subir Comprobante de Pago</p>
                        </div>
                    )}
                </div>
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

const SuccessScreen = ({ lastOrder, setView }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-scale-in">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]"><Check className="w-12 h-12 text-white" strokeWidth={3} /></div>
        <h2 className="text-4xl font-bold text-white mb-4">¡Gracias por tu Compra!</h2>
        <p className="text-gray-300 max-w-lg mb-8 text-lg">Tu pedido ha sido recibido correctamente.</p>
        {lastOrder && (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 max-w-md w-full mb-8 shadow-2xl">
            <h3 className="text-indigo-400 font-bold mb-4 border-b border-gray-700 pb-2 flex justify-between">Resumen de Compra<span className="text-gray-500 text-xs font-normal">{lastOrder.id}</span></h3>
            <div className="space-y-3 text-left">
            {lastOrder.rawItems.map((item, i) => (<div key={i} className="flex justify-between text-sm text-gray-300"><span>{item.title}</span><span className="text-gray-400">${item.price.toFixed(2)}</span></div>))}
            <div className="flex justify-between text-white font-bold pt-3 border-t border-gray-700 mt-2 text-lg"><span>Total:</span><span className="text-green-400">${lastOrder.total}</span></div>
            </div>
        </div>
        )}
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
      <button onClick={() => { setPaymentMethod('paypal'); setCheckoutStep(1); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-600 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500"><CreditCard /></div><span className="font-bold text-white">PayPal</span>
      </button>
      <button onClick={() => { setPaymentMethod('transfer_bs'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-400 flex flex-col items-center gap-3">
         <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500"><Landmark /></div><span className="font-bold text-white">Transf. Bs</span>
      </button>
    </div>
    <div className="mt-4 flex justify-center"><button onClick={() => setView('home')} className="text-gray-500 hover:text-white">Cancelar</button></div>
  </div>
);

const AutomatedFlowWrapper = ({ cart, cartTotal, setLastOrder, setCart, setCheckoutStep, paypalData }) => {
    // Wrapper para manejar pagos automáticos (Binance/PayPal)
    const exchangeItem = cart.find(item => item.type === 'usdt');
    const isExchange = !!exchangeItem;

    const handleVerifiedSuccess = async (txId) => {
         const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
         const randomId = Math.floor(100 + Math.random() * 900);
         
         let automatedOrder = {
             id: `ORD-${randomId}`,
             user: `Cliente Auto`, 
             items: cart.map(i => i.title).join(', '),
             total: cartTotal.toFixed(2),
             status: 'FACTURADO (Binance Verified)',
             date: new Date().toISOString(),
             rawItems: sanitizedItems,
             paymentMethod: 'binance_api',
             fullData: { refNumber: txId }
         };
         
         const saved = await submitOrderToPrivateServer(automatedOrder);
         if (saved) {
            setLastOrder(automatedOrder);
            setCart([]);
            setCheckoutStep(3);
         }
    };

    return (
        <div className="max-w-4xl mx-auto">
             {isExchange && (
                 <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg mb-6 flex items-start gap-3">
                     <AlertTriangle className="text-yellow-500 flex-shrink-0" />
                     <div className="text-sm text-yellow-200">
                         <strong>Modo Exchange:</strong> Se verificará el pago y se enviará USDT a: 
                         <span className="font-mono bg-black/30 px-2 rounded ml-1 text-white">{exchangeItem.exchangeData.receiveAddress}</span>
                     </div>
                 </div>
             )}
            
            <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-lg mx-auto animate-fade-in-up relative overflow-hidden">
                {/* Contenido Simulado de Binance para Demo */}
                <div className="text-center">
                    <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4"/>
                    <h3 className="text-white font-bold mb-2">Pago con Binance Pay</h3>
                    <p className="text-gray-400 text-sm mb-4">Envía ${cartTotal.toFixed(2)} al ID: {CONTACT_INFO.binance_pay_id}</p>
                    <button onClick={() => handleVerifiedSuccess("TX-DEMO-123")} className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg">Simular Pago Exitoso</button>
                </div>
            </div>
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
  const [paypalData, setPaypalData] = useState({});
  const [proofData, setProofData] = useState({ screenshot: null, refNumber: '', name: '', lastName: '', idNumber: '', phone: '', idDoc: null });

  // Horario del Exchange
  const getIsExchangeOpen = () => {
    const now = new Date();
    // Simulación: Abierto Lun-Jue
    const day = now.getDay(); 
    return day >= 1 && day <= 4;
  };
  const isExchangeAvailable = getIsExchangeOpen();

  useEffect(() => {
    // Tasa dinámica
    const fetchRate = async () => {
        try {
            const response = await fetch(RATE_API_CONFIG.url);
            const data = await response.json();
            // Lógica simple para extraer tasa (depende de la API)
            if(data.rates && data.rates.VES) setExchangeRateBs(data.rates.VES);
        } catch (error) {}
    };
    fetchRate();
  }, []);

  const categories = ['All', ...new Set(SERVICES.map(s => s.category))];
  const addToCart = (service) => { setCart([...cart, service]); setIsCartOpen(true); };
  const removeFromCart = (index) => { const newCart = [...cart]; newCart.splice(index, 1); setCart(newCart); };
  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);
  const filteredServices = activeCategory === 'All' ? SERVICES : SERVICES.filter(s => s.category === activeCategory);

  const handleCheckoutStart = async () => {
    setCheckoutStep(0);
    setView('checkout'); 
    setIsCartOpen(false); 
  };

  return (
    <div className="bg-[#0a0a12] text-gray-100 min-h-screen font-sans">
      <style>{globalStyles}</style>

      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} setView={setView} />
        
        <main className="pt-6 pb-20">
            {view === 'checkout' ? (
            <div className="pt-24 px-4 sm:px-6 lg:px-8">
                {checkoutStep === 0 && <PaymentMethodSelection setPaymentMethod={setPaymentMethod} setCheckoutStep={setCheckoutStep} setView={setView} />}
                
                {/* Paso 1: Depende del método */}
                {checkoutStep === 1 && (paymentMethod === 'binance') && ( 
                    <AutomatedFlowWrapper cart={cart} cartTotal={cartTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paypalData={paypalData} /> 
                )}
                
                {checkoutStep === 1 && (paymentMethod === 'paypal') && ( 
                     <div className="bg-gray-900 border border-blue-500/30 p-6 rounded-lg text-center max-w-md mx-auto">
                        <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4"/>
                        <h3 className="text-white font-bold mb-2">Pago con PayPal</h3>
                        <p className="text-gray-400 text-sm mb-4">Monto: ${cartTotal.toFixed(2)}</p>
                        <button onClick={() => {alert("Pago PayPal simulado"); setCheckoutStep(3);}} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg w-full">Pagar con PayPal</button>
                     </div>
                )}

                {/* Paso 2: Manual (Pago Móvil, Transferencias) */}
                {checkoutStep === 2 && (
                    <PaymentProofStep proofData={proofData} setProofData={setProofData} cart={cart} cartTotal={cartTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} paypalData={paypalData} exchangeRate={exchangeRateBs} />
                )}
                
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
        
        {/* Carrito Flotante */}
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
