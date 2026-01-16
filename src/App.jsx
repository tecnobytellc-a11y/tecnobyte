import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, Gamepad2, CreditCard, MessageSquare, 
  Smartphone, User, Check, Upload, X, Lock, 
  Globe, Zap, Trash2, Eye, RefreshCw,
  Facebook, Instagram, Mail, Phone, ShieldCheck, LogIn, ChevronDown, Landmark, Building2, Send, FileText, Tv, Music,
  Sparkles, Bot, MessageCircle, Loader, ArrowRight, Wallet, QrCode, AlertTriangle
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc } from "firebase/firestore";

// --- FIREBASE INIT CORREGIDO ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try { return JSON.parse(__firebase_config); } catch (e) { console.error(e); }
  }
  return {
    apiKey: "AIzaSyDYYKRuG39vi35a5CTxwoCQ7iPvvppakjU",
    authDomain: "tecnobyte-59f74.firebaseapp.com",
    projectId: "tecnobyte-59f74",
    storageBucket: "tecnobyte-59f74.firebasestorage.app",
    messagingSenderId: "312636053858",
    appId: "1:312636053858:web:03eff6f29188d8b6348175"
  };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Esta variable debe ser global para evitar el error de "appId is not defined"
const globalAppId = typeof __app_id !== 'undefined' ? __app_id : 'tecnobyte-59f74';

// --- VERCEL API CONFIG ---
const VERCEL_API_URL = "https://mech-api-secure.vercel.app"; 

// --- DATA & CONFIGURATION ---

const API_CONFIG = {
    paypal: {
        clientId: "ARTKETeYRDsymqCukcIve_aTTzyFKrDgKeG7exZF gGK0qJwdTxyWcoViI-mdQbfiYG2xQA6TDL-YNkju", 
        mode: "sandbox" 
    },
    binance: {
        apiKey: "CpoLTBClPNJTW9vTIbfZlarGyzD6emsboQkbZ28iLZEVaWjgiQeJhGRuAJWVCLwy", 
    }
};

const RATE_API_CONFIG = {
    url: "https://api-secure-server.vercel.app/api/get-tasa", 
    key: "TU_API_KEY_AQUI", 
    intervalMinutes: 1 
};

const INITIAL_RATE_BS = 570.00;
// Use empty string for apiKey as per instructions to use runtime key
const apiKey = ""; 

const SERVICES = [
  { id: 1, category: 'Virtual Numbers', title: 'WhatsApp Number', price: 2.05, icon: <MessageSquare />, description: 'Número virtual privado para verificación de WhatsApp.' },
  { id: 2, category: 'Virtual Numbers', title: 'Telegram Number', price: 1.85, icon: <MessageSquare />, description: 'Verificación segura para Telegram.' },
  { id: 3, category: 'Virtual Numbers', title: 'PayPal/Banks Number', price: 1.30, icon: <CreditCard />, description: 'Para recibir SMS de bancos y PayPal.' },
  
  // Servicios de Exchange Mejorados
  { id: 4, category: 'Exchange', title: 'Cambio PayPal a USDT', price: 0, icon: <RefreshCw />, description: 'Recibe USDT netos (Binance Pay/BEP20).', type: 'usdt' },
  { id: 5, category: 'Exchange', title: 'Cambio PayPal a Bs', price: 0, icon: <RefreshCw />, description: 'Recibe Bolívares en tu banco nacional.', type: 'bs' },
  
  { id: 6, category: 'Gaming', title: 'Recarga Free Fire (100 Diamantes)', price: 1.25, icon: <Gamepad2 />, description: 'Recarga directa vía ID.' },
  { id: 7, category: 'Gaming', title: 'Recarga Roblox (400 Robux)', price: 5.50, icon: <Gamepad2 />, description: 'Tarjeta de regalo o recarga directa.' },
  { id: 8, category: 'Gaming', title: 'COD Mobile Points (880 CP)', price: 10.90, icon: <Gamepad2 />, description: 'Call of Duty Mobile CP.' },
  { id: 9, category: 'Membership', title: 'PS Plus Deluxe (1 Mes)', price: 15.45, icon: <Gamepad2 />, description: 'Acceso total a clásicos y catálogo de juegos.' },
  { id: 10, category: 'Membership', title: 'PS Plus Extra (1 Mes)', price: 14.10, icon: <Gamepad2 />, description: 'Catálogo de juegos de PS4 y PS5.' },
  { id: 11, category: 'Gift Cards', title: 'Amazon Gift Card $10', price: 11.00, icon: <CreditCard />, description: 'Código canjeable Región USA.' },
  { id: 12, category: 'Services', title: 'ChatBot PyME', price: 5.00, icon: <Zap />, description: 'Automatización básica para WhatsApp Business.' },

  { id: 13, category: 'Streaming', title: 'Netflix (1 Mes)', price: 4.00, icon: <Tv />, description: 'Cuenta renovable 1 Pantalla Ultra HD.' },
  { id: 14, category: 'Streaming', title: 'Amazon Prime Video', price: 3.00, icon: <Tv />, description: 'Membresía mensual con acceso completo.' },
  { id: 15, category: 'Streaming', title: 'HBO Max (Max)', price: 2.55, icon: <Tv />, description: 'Disfruta de todas las series y películas de Max.' },
  { id: 16, category: 'Streaming', title: 'Disney+ Premium', price: 3.00, icon: <Tv />, description: 'Acceso total al contenido de Disney.' },
  { id: 17, category: 'Streaming', title: 'Crunchyroll Mega Fan', price: 1.50, icon: <Tv />, description: 'Anime sin anuncios y modo offline.' },
  { id: 18, category: 'Streaming', title: 'YouTube Premium', price: 3.50, icon: <Tv />, description: 'Videos sin publicidad, segundo plano y Music.' },
  { id: 19, category: 'Streaming', title: 'Spotify Premium (3 Meses)', price: 7.00, icon: <Music />, description: 'Música sin interrupciones, cuenta individual.' },
];

const CONTACT_INFO = {
  whatsapp: "+19047400467",
  whatsapp_display: "+1 (904) 740-0467",
  email: "support@tecnobytellc.zendesk.com",
  instagram: "@tecnobytellc",
  tiktok: "@tecnobyte.llc",
  facebook: "TecnoByte",
  binance_email: "tecnobytellc@gmail.com",
  pagomovil: {
    bank: "Banco Venezolano de Crédito [0104]",
    id: "04.139.374",
    phone: "0412-1327092"
  },
  transfer_bs: {
    bank: "Venezolano de Crédito",
    account: "01040019860190162931",
    id: "V-04139374"
  },
  transfer_usd: {
    bank: "FACEBANK International",
    account: "56110272112",
    routing: "021502189 (ABA)"
  },
  facebank: {
    account: "56110272112"
  },
  pipolpay: {
    email: "asismora@gmail.com"
  }
};

const SOCIAL_LINKS = {
  tiktok: "https://www.tiktok.com/@tecnobyte.llc?_r=1&_t=ZM-92yHI3mqLG4",
  instagram: "https://www.instagram.com/tecnobytellc?igsh=MXA2bGFzbzdqbHNiNQ==",
  facebook: "https://www.facebook.com/share/1C6WoykMXp/"
};

const ORDER_STATUSES = [
  "PENDIENTE POR ENTREGAR",
  "CANCELADO",
  "ENTREGADO",
  "COMPLETADO",
  "FACTURADO",
  "EN DISPUTA",
  "REEMBOLSADO",
  "PROCESANDO AUTOMÁTICAMENTE"
];

// --- STYLES (From styles.css) ---
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

// --- ICONS EXTRA ---
const TikTokIcon = () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg> );

// --- GEMINI CHAT COMPONENT ---
const GeminiChat = ({ exchangeRate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: '¡Hola! Soy TecnoBot ✨, tu asistente virtual. ¿En qué puedo ayudarte hoy? Pregúntame sobre precios, cambios o métodos de pago.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const systemContext = `
        Eres TecnoBot, un asistente de ventas amable y futurista para la tienda digital "TecnoByte".
        DATOS CLAVE:
        - Tasa de Cambio actual: ${exchangeRate.toFixed(2)} Bs/USD.
        - Catálogo de Servicios: ${JSON.stringify(SERVICES.map(s => ({ title: s.title, price: s.price, category: s.category })))}
        - Métodos de Pago Disponibles: Binance, Pago Móvil, PayPal, Facebank, PipolPay, Transferencia Bs/USD.
        INSTRUCCIONES: Responde brevemente.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: systemContext + "\n\nUsuario: " + inputText }] }] })
      });

      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, tuve un error de conexión neuronal. Intenta de nuevo.";
      setMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ Error de conexión con TecnoBot." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-110 transition-transform animate-float group">
          <Sparkles className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></span>
        </button>
      )}
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-gray-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col animate-scale-in overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 flex justify-between items-center border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <Bot className="text-cyan-400 w-6 h-6" />
              <h3 className="text-white font-bold font-orbitron text-sm">TecnoBot AI ✨</h3>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} className="text-white" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <Loader className="w-4 h-4 text-indigo-400 animate-spin ml-4" />}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Escribe aquí..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none" />
            <button onClick={handleSend} disabled={isLoading || !inputText.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl"><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTS ---

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
          <button onClick={() => setView('admin')} className="text-gray-400 hover:text-white text-xs transition-colors hidden md:block">Admin</button>
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
            <span className="text-sm font-mono text-green-400 font-bold">Tasa Actual: {exchangeRate.toFixed(2)} Bs | {venTime} (VET)</span>
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

const AdminPanel = ({ setView, orders, setAllOrders }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password !== "TnE@3109") { setError("Credenciales incorrectas"); return; }
    if (!username.startsWith("@") || !username.endsWith("-3J7")) { setError("Formato inválido"); return; }
    setIsAuthenticated(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (orderToUpdate && orderToUpdate.firestoreId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderToUpdate.firestoreId), { status: newStatus });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-900/80 p-8 rounded-2xl border border-indigo-500/30 backdrop-blur shadow-2xl animate-fade-in-up">
          <h2 className="text-2xl font-bold text-center text-white mb-6">Acceso Administrativo</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white" placeholder="@admin-3J7" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white" placeholder="••••••••" />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg">Entrar</button>
            <button type="button" onClick={() => setView('home')} className="w-full text-gray-500 text-sm hover:text-white">Volver</button>
          </form>
        </div>
      </div>
    );
  }

  const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total), 0).toFixed(2);

  return (
    <div className="min-h-screen pt-24 px-4 max-w-[95%] mx-auto text-gray-100 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400">Panel de Administración</h2>
        <button onClick={() => setView('home')} className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 text-sm">Salir</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800"><h3 className="text-gray-400 text-sm">Ventas Totales</h3><p className="text-3xl font-bold mt-2">${totalSales}</p></div>
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800"><h3 className="text-gray-400 text-sm">Órdenes</h3><p className="text-3xl font-bold mt-2 text-yellow-500">{orders.length}</p></div>
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800"><h3 className="text-gray-400 text-sm">Usuarios</h3><p className="text-3xl font-bold mt-2 text-green-500">{new Set(orders.map(o => o.user)).size}</p></div>
      </div>

      <div className="bg-gray-900/80 rounded-xl overflow-hidden border border-gray-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-4 border-b border-gray-700">ID</th>
                <th className="p-4 border-b border-gray-700">Cliente</th>
                <th className="p-4 border-b border-gray-700">Items</th>
                <th className="p-4 border-b border-gray-700">Total</th>
                <th className="p-4 border-b border-gray-700">Estatus</th>
                <th className="p-4 border-b border-gray-700">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-800/50">
                  <td className="p-4 font-mono text-sm text-gray-400">{order.id}</td>
                  <td className="p-4 font-medium text-white">{order.user}</td>
                  <td className="p-4 text-sm text-gray-300 max-w-xs truncate">{order.items}</td>
                  <td className="p-4 text-green-400 font-bold">${order.total}</td>
                  <td className="p-4">
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="bg-gray-800 border border-gray-700 text-xs rounded p-1">
                      {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="p-4"><button onClick={() => setSelectedOrder(order)}><Eye size={18} className="text-indigo-400" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
      
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 relative z-10 shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Detalles {selectedOrder.id}</h3>
                <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Cliente:</strong> {selectedOrder.user}</p>
                    <p><strong>Pago:</strong> {selectedOrder.paymentMethod}</p>
                    {/* Mostrar datos de exchange si existen */}
                    {selectedOrder.fullData?.exchangeData && (
                         <div className="bg-indigo-900/30 p-3 rounded border border-indigo-500/30 my-2">
                             <p className="text-indigo-400 font-bold mb-1">Datos de Dispersión (Binance API):</p>
                             <p><strong>Tipo:</strong> {selectedOrder.fullData.exchangeData.receiveType}</p>
                             <p><strong>Destino:</strong> {selectedOrder.fullData.exchangeData.receiveAddress}</p>
                             <p><strong>Monto a Enviar:</strong> {selectedOrder.fullData.exchangeData.receiveAmount}</p>
                         </div>
                    )}
                    <p><strong>Ref:</strong> {selectedOrder.fullData?.refNumber || 'Automático'}</p>
                    {selectedOrder.fullData?.screenshot && (
                        <p className="text-green-400">Comprobante Adjunto (Ver en BD)</p>
                    )}
                </div>
                <button onClick={() => setSelectedOrder(null)} className="mt-6 w-full bg-gray-700 py-2 rounded">Cerrar</button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- CALCULADORA & EXCHANGE AVANZADO ---

const ExchangeCard = ({ service, addToCart, exchangeRate }) => {
  const [amountSend, setAmountSend] = useState('');
  const [receiveType, setReceiveType] = useState('binance_id'); // binance_id, bep20
  const [receiveAddress, setReceiveAddress] = useState('');
  
  const calculateReceive = (amount) => {
    if (!amount || isNaN(amount)) return 0;
    const numAmount = parseFloat(amount);
    const fee = (numAmount * 0.083) + 0.15; // Comisión ejemplo
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
        alert("Por favor ingresa tu Binance ID o Wallet para recibir los fondos.");
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
          receiveType: service.type === 'usdt' ? receiveType : 'bank_transfer',
          receiveAddress: service.type === 'usdt' ? receiveAddress : 'Cuenta Bancaria Registrada'
      }
    };
    addToCart(customItem);
    setAmountSend('');
    setReceiveAddress('');
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500 transition-all duration-300 shadow-lg flex flex-col h-full">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-indigo-400">{service.icon}</div>
            <div>
                <h3 className="text-lg font-bold text-white leading-tight">{service.title}</h3>
                <p className="text-xs text-indigo-400 font-mono">Fee: 8.30% + $0.15</p>
            </div>
        </div>
        
        <div className="flex-1 space-y-3 mb-4">
            <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
                <label className="text-xs text-gray-400 block mb-1">Envías (PayPal USD)</label>
                <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">$</span>
                    <input type="number" value={amountSend} onChange={(e) => setAmountSend(e.target.value)} placeholder="100.00" className="bg-transparent w-full text-white font-mono focus:outline-none" />
                </div>
            </div>

            <div className="flex justify-center text-gray-500"><ChevronDown size={16} /></div>

            {/* INPUT DE DESTINO PARA USDT */}
            {service.type === 'usdt' && (
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-2">
                    <label className="text-xs text-yellow-500 font-bold block">¿Dónde recibes?</label>
                    <div className="flex gap-2 text-xs mb-2">
                        <button onClick={() => setReceiveType('binance_id')} className={`flex-1 py-1 rounded ${receiveType === 'binance_id' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-gray-700 text-gray-400'}`}>Binance ID</button>
                        <button onClick={() => setReceiveType('bep20')} className={`flex-1 py-1 rounded ${receiveType === 'bep20' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-gray-700 text-gray-400'}`}>BEP20</button>
                    </div>
                    <input 
                        type="text" 
                        value={receiveAddress} 
                        onChange={(e) => setReceiveAddress(e.target.value)}
                        placeholder={receiveType === 'binance_id' ? "Ej: 123456789" : "Ej: 0x123..."}
                        className="w-full bg-black/30 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-yellow-500 focus:outline-none font-mono"
                    />
                </div>
            )}

            <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                <label className="text-xs text-indigo-300 block mb-1">Recibes Aproximadamente</label>
                <div className="text-xl font-bold text-white font-mono">{amountSend ? receiveValue : '---'}</div>
                {service.type === 'bs' && <p className="text-[10px] text-gray-400 mt-1 text-right">Tasa: {exchangeRate.toFixed(2)} Bs/USD</p>}
            </div>
        </div>

        <button onClick={handleAdd} className="w-full py-2 bg-indigo-600 rounded-lg text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={!amountSend || parseFloat(amountSend) <= 0}>
            Añadir al Carrito
        </button>
    </div>
  );
};

// --- PAYMENT & API LOGIC ---

const PayPalAutomatedCheckout = ({ cartTotal, onPaymentComplete, isExchange, exchangeData, paypalData, allOrders }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, verifying, completed, failed
    const [invoiceId, setInvoiceId] = useState('');
    const [approveLink, setApproveLink] = useState('');

    // MODIFICADO: Ahora conecta con tu Vercel API
    const handlePayPalPayment = async () => {
        setStatus('processing');
        try {
          // 1. Pedir a Vercel que cree la orden en PayPal
          const response = await fetch(`${VERCEL_API_URL}/api/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: cartTotal.toFixed(2) })
          });
          
          if (!response.ok) throw new Error('Error al crear orden en PayPal');
          
          const data = await response.json();
          // El ID real de la orden de PayPal
          const realOrderId = data.id; 
          setInvoiceId(realOrderId);

          // Buscar el link para aprobar
          const link = data.links.find(l => l.rel === 'approve');
          if (link) {
              setApproveLink(link.href);
              // Abrir PayPal en nueva pestaña
              window.open(link.href, '_blank');
              setStatus('verifying');
          } else {
              throw new Error('No se encontró link de aprobación');
          }

        } catch (error) {
           console.error(error);
           alert("Error conectando con PayPal: " + error.message);
           setStatus('idle');
        }
    };

    // MODIFICADO: Ahora verifica el pago REAL en Vercel
    const handleVerification = async () => {
        if (!invoiceId) return;

        try {
            if (isExchange) {
                setStatus('dispersing'); // Conectando a Binance via Vercel
                
                const response = await fetch(`${VERCEL_API_URL}/api/capture-and-exchange`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: invoiceId,
                        receiveAddress: exchangeData.receiveAddress,
                        receiveType: exchangeData.receiveType,
                        userData: paypalData // Enviamos datos del usuario para el registro
                    })
                });

                const result = await response.json();

                if (result.success) {
                    setStatus('completed');
                    // Pasamos el ID de la transacción de Binance
                    onPaymentComplete(invoiceId, result.binanceTxId);
                } else {
                   alert("Error en el intercambio: " + result.message);
                   setStatus('verifying'); // Volver a permitir intentar
                }

            } else {
                // Lógica normal si no es exchange (solo captura) - Opcional, por ahora asumimos el mismo flujo
                setStatus('completed');
                onPaymentComplete(invoiceId, null);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor de pagos.");
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
                    <p className="text-xs text-gray-400">Conectando con PayPal...</p>
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

const PaymentMethodSelection = ({ setPaymentMethod, setCheckoutStep, setView }) => (
  <div className="max-w-4xl mx-auto bg-gray-900/80 p-8 rounded-2xl border border-indigo-500/20 backdrop-blur-sm animate-fade-in-up">
    <h2 className="text-2xl font-bold text-white mb-6 text-center">Selecciona Método de Pago</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Botones de métodos existentes */}
      <button onClick={() => { setPaymentMethod('binance'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-yellow-400 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500"><Zap /></div><span className="font-bold text-white">Binance Pay</span>
      </button>
      <button onClick={() => { setPaymentMethod('pagomovil'); setCheckoutStep(2); }} className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-400 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500"><Smartphone /></div><span className="font-bold text-white">Pago Móvil</span>
      </button>
      
      {/* PAYPAL AUTOMATIZADO */}
      <button onClick={() => { setPaymentMethod('paypal'); setCheckoutStep(1); }} className="p-6 bg-gradient-to-br from-[#003087] to-[#009cde] rounded-xl border border-indigo-400 shadow-[0_0_15px_rgba(0,156,222,0.3)] hover:scale-105 transition-transform flex flex-col items-center gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-yellow-400 text-[#003087] text-[10px] font-bold px-2 py-0.5">AUTO</div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#003087]"><CreditCard /></div><span className="font-bold text-white">PayPal API</span>
      </button>

      {/* Resto de métodos */}
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

// --- PASO DE PAGO MANUAL (COMPROBANTE) ---
const PaymentProofStep = ({ proofData, setProofData, cart, cartTotal, allOrders, setAllOrders, setLastOrder, setCart, setCheckoutStep, paymentMethod, paypalData, exchangeRate }) => {
  const fileInputRef = useRef(null);
  const idDocRef = useRef(null); 

  // Función interna para manejar el éxito del pago manual
  const executeOrderCreation = async (manualProofData) => {
      // (Lógica existente de creación de orden en Firestore...)
      const sanitizedFullData = {
          ...manualProofData,
          screenshot: manualProofData.screenshot ? { name: manualProofData.screenshot.name, data: await convertToBase64(manualProofData.screenshot) } : null,
          idDoc: manualProofData.idDoc ? { name: manualProofData.idDoc.name, data: await convertToBase64(manualProofData.idDoc) } : null,
          contactPhone: manualProofData.phone
      };

      const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
      const newOrder = {
          id: `ORD-${String(allOrders.length + 1).padStart(3, '0')}`,
          user: `${manualProofData.name} ${manualProofData.lastName}`,
          items: cart.map(i => i.title).join(', '),
          total: cartTotal.toFixed(2),
          status: 'PENDIENTE POR ENTREGAR', 
          date: new Date().toISOString().split('T')[0],
          rawItems: sanitizedItems, 
          paymentMethod: paymentMethod,
          fullData: sanitizedFullData
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), newOrder);
      setLastOrder(newOrder);
      setCart([]); 
      setCheckoutStep(3); 
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if(!proofData.screenshot || !proofData.refNumber) { alert("Comprobante obligatorio."); return; }
    try { await executeOrderCreation(proofData); } catch (error) { console.error(error); alert("Error guardando pedido."); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-4">Datos para Transferir</h3>
        {/* Lógica de visualización de datos de pago existente... */}
        {paymentMethod === 'binance' && <div className="space-y-4"><p className="text-yellow-500 font-bold">Binance Pay ID</p><p className="text-white font-mono">{CONTACT_INFO.binance_email}</p></div>}
        {paymentMethod === 'pagomovil' && <div className="space-y-4"><p className="text-blue-400 font-bold">Pago Móvil</p><p className="text-white">{CONTACT_INFO.pagomovil.phone} - {CONTACT_INFO.pagomovil.id}</p></div>}
        {paymentMethod === 'transfer_bs' && <div className="space-y-4"><p className="text-green-400 font-bold">Transferencia Bs</p><p className="text-white">{CONTACT_INFO.transfer_bs.account}</p></div>}
        {paymentMethod === 'transfer_usd' && <div className="space-y-4"><p className="text-green-600 font-bold">Transferencia USD</p><p className="text-white">{CONTACT_INFO.transfer_usd.account}</p></div>}
        {paymentMethod === 'facebank' && <div className="space-y-4"><p className="text-blue-600 font-bold">FACEBANK</p><p className="text-white">{CONTACT_INFO.facebank.account}</p></div>}
        {paymentMethod === 'pipolpay' && <div className="space-y-4"><p className="text-orange-400 font-bold">PipolPay</p><p className="text-white">{CONTACT_INFO.pipolpay.email}</p></div>}
        <p className="text-white font-bold text-xl mt-4">Total: ${cartTotal.toFixed(2)}</p>
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
            {(paymentMethod === 'facebank' || paymentMethod === 'pipolpay') && (
               <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 space-y-4">
                  <input type="text" placeholder="Cuenta Emisora" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.issuerAccount || ''} onChange={e => setProofData({...proofData, issuerAccount: e.target.value})} />
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer" onClick={() => idDocRef.current.click()}>
                    <input type="file" ref={idDocRef} className="hidden" required accept="image/*" onChange={(e) => setProofData({...proofData, idDoc: e.target.files[0]})} />
                    <p className="text-gray-300 text-xs">Foto Documento Identidad</p>
                    {proofData.idDoc && <p className="text-green-400 text-xs mt-1">Adjunto: {proofData.idDoc.name}</p>}
                  </div>
               </div>
            )}
            <input type="text" placeholder="Referencia / Comprobante" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.refNumber} onChange={e => setProofData({...proofData, refNumber: e.target.value})} />
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <input type="file" ref={fileInputRef} className="hidden" required accept="image/*" onChange={(e) => setProofData({...proofData, screenshot: e.target.files[0]})} />
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">Subir Captura</p>
              {proofData.screenshot && <p className="text-green-400 text-xs mt-2">Listo: {proofData.screenshot.name}</p>}
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg mt-6">FINALIZAR COMPRA</button>
         </form>
      </div>
    </div>
  );
};

// --- AUTOMATED FLOW WRAPPER ---
const AutomatedFlowWrapper = ({ cart, cartTotal, allOrders, setLastOrder, setCart, setCheckoutStep, paypalData }) => {
    // Detectar si hay un item de exchange en el carrito
    const exchangeItem = cart.find(item => item.type === 'usdt');
    const isExchange = !!exchangeItem;

    // Cuando el pago se completa (llamado desde PayPalAutomatedCheckout)
    const handleAutomatedComplete = async (invoiceId, binanceTxId) => {
        // Construir la orden automáticamente
        const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
        const automatedOrder = {
            id: `ORD-${String(allOrders.length + 1).padStart(3, '0')}`,
            user: `${paypalData.firstName} ${paypalData.lastName}`, // Usamos datos del form previo de paypal
            items: cart.map(i => i.title).join(', '),
            total: cartTotal.toFixed(2),
            status: isExchange ? 'COMPLETADO' : 'FACTURADO', // Si es exchange y Binance pagó, está completado. Si no, facturado.
            date: new Date().toISOString().split('T')[0],
            rawItems: sanitizedItems,
            paymentMethod: 'paypal_api',
            fullData: {
                email: paypalData.email,
                phone: paypalData.phone,
                refNumber: invoiceId, // ID DE LA FACTURA PAYPAL
                binanceTxId: binanceTxId, // SI HUBIERA DISPERSIÓN
                exchangeData: exchangeItem ? exchangeItem.exchangeData : null
            }
        };

        // Nota: El servidor de Vercel ya guardó la orden en Firestore en el endpoint capture-and-exchange.
        // Aquí solo actualizamos el estado local para mostrar la pantalla de éxito.
        // Si queremos duplicar o asegurar, podemos guardarlo, pero lo ideal es confiar en el backend.
        // Para mantener la lógica visual de "SuccessScreen" con "lastOrder", lo seteamos aquí:
        
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
                         El sistema verificará tu pago en PayPal y automáticamente enviará los fondos a tu dirección: 
                         <span className="font-mono bg-black/30 px-2 rounded ml-1 text-white">{exchangeItem.exchangeData.receiveAddress}</span>
                     </div>
                 </div>
             )}
            <PayPalAutomatedCheckout 
                cartTotal={cartTotal} 
                onPaymentComplete={handleAutomatedComplete}
                isExchange={isExchange}
                exchangeData={exchangeItem ? exchangeItem.exchangeData : null}
                paypalData={paypalData}
                allOrders={allOrders}
            />
        </div>
    );
};

const PayPalDetailsForm = ({ paypalData, setPaypalData, setCheckoutStep }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if(!paypalData.email || !paypalData.firstName) { alert("Completa los campos básicos."); return; }
    setCheckoutStep(2); // Avanzar a la pantalla de pago automatizada
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl border border-indigo-500/30 animate-fade-in-up">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="bg-indigo-600 text-xs py-1 px-2 rounded">API</span> Configuración de Facturación</h2>
      <p className="text-gray-400 text-sm mb-6">Ingresa tus datos para generar la factura electrónica vía PayPal API.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-gray-300 text-sm mb-1">Correo Electrónico (PayPal)</label><input type="email" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" placeholder="tu@email.com" value={paypalData.email} onChange={e => setPaypalData({...paypalData, email: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-gray-300 text-sm mb-1">Nombre</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.firstName} onChange={e => setPaypalData({...paypalData, firstName: e.target.value})} /></div>
          <div><label className="block text-gray-300 text-sm mb-1">Apellido</label><input type="text" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.lastName} onChange={e => setPaypalData({...paypalData, lastName: e.target.value})} /></div>
        </div>
        <div><label className="block text-gray-300 text-sm mb-1">WhatsApp (Notificaciones)</label><input type="tel" required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white" value={paypalData.phone} onChange={e => setPaypalData({...paypalData, phone: e.target.value})} /></div>
        
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg mt-4 flex justify-center gap-2">
            Continuar a Pasarela Segura <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

const SuccessScreen = ({ lastOrder, setView }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-scale-in">
    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]"><Check className="w-12 h-12 text-white" strokeWidth={3} /></div>
    <h2 className="text-4xl font-bold text-white mb-4">¡Operación Exitosa!</h2>
    <p className="text-gray-300 max-w-lg mb-8 text-lg">Tu pedido ha sido procesado correctamente.</p>

    {lastOrder && (
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 max-w-md w-full mb-8 shadow-2xl">
          <h3 className="text-indigo-400 font-bold mb-4 border-b border-gray-700 pb-2 flex justify-between">Resumen de Compra<span className="text-gray-500 text-xs font-normal">{lastOrder.id}</span></h3>
          <div className="space-y-3 text-left">
          {lastOrder.rawItems.map((item, i) => <div key={i} className="flex justify-between text-sm text-gray-300"><span>{item.title}</span><span className="text-gray-400">${item.price.toFixed(2)}</span></div>)}
          <div className="flex justify-between text-white font-bold pt-3 border-t border-gray-700 mt-2 text-lg"><span>Total:</span><span className="text-green-400">${lastOrder.total}</span></div>
          {lastOrder.fullData?.binanceTxId && (
              <div className="mt-4 bg-green-900/20 border border-green-500/30 p-3 rounded text-center">
                  <p className="text-green-400 text-xs font-bold mb-1">Dispersión Binance Completada</p>
                  <p className="text-white font-mono text-xs break-all">{lastOrder.fullData.binanceTxId}</p>
              </div>
          )}
          </div>
      </div>
    )}
    <button onClick={() => setView('home')} className="mt-6 text-gray-500 hover:text-white underline">Volver al inicio</button>
  </div>
);

// --- APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [allOrders, setAllOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null); 
  const [user, setUser] = useState(null);
  const [exchangeRateBs, setExchangeRateBs] = useState(INITIAL_RATE_BS);
  const [checkoutStep, setCheckoutStep] = useState(0); 
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paypalData, setPaypalData] = useState({ email: '', firstName: '', lastName: '', phone: '', nationalId: '', idDoc: null });
  const [proofData, setProofData] = useState({ screenshot: null, refNumber: '', name: '', lastName: '', idNumber: '', phone: '', issuerAccount: '', idDoc: null });

  // Missing state variables added
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Authentication Logic Fixed
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Error Auth:", err);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Use dynamic appId for Firestore path
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
        ordersData.sort((a, b) => { if (a.date > b.date) return -1; if (a.date < b.date) return 1; return 0; });
        setAllOrders(ordersData);
    }, (error) => console.error("Error fetching orders:", error));
    return () => unsubscribeSnapshot();
  }, [user]);

  useEffect(() => {
    const fetchRate = async () => {
        if (!RATE_API_CONFIG.url || RATE_API_CONFIG.url.includes("tu-servidor-privado")) return;
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
    if (!user) return;
    setIsProcessing(true); 
    
    try {
      // Sanitize cart items to remove React components (icons) before saving to Firestore
      const sanitizedCart = cart.map(({ icon, ...item }) => item);

      // Use dynamic appId for Firestore path
      const orderRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
        userId: user.uid,
        items: sanitizedCart, // Use sanitized cart
        total: cartTotal,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setOrderId(orderRef.id);
      setCheckoutStep(0);
      setView('checkout'); // Added this to change the view
      setIsCartOpen(false); // Added this to close the cart
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#0a0a12] text-gray-100 min-h-screen font-sans">
      <style>{globalStyles}</style>
      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} setView={setView} />
      
      <main className="pt-6 pb-20">
        {view === 'admin' ? (
          <AdminPanel setView={setView} orders={allOrders} setAllOrders={setAllOrders} />
        ) : view === 'checkout' ? (
          <div className="pt-24 px-4 sm:px-6 lg:px-8">
             <div className="flex justify-center mb-8">
               <div className="flex items-center gap-4">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 0 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>1</div>
                 <div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 0 ? 'w-full' : 'w-0'}`}></div></div>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>2</div>
                 <div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 2 ? 'w-full' : 'w-0'}`}></div></div>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 3 ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}>3</div>
               </div>
             </div>
             
             {checkoutStep === 0 && <PaymentMethodSelection setPaymentMethod={setPaymentMethod} setCheckoutStep={setCheckoutStep} setView={setView} />}
             
             {/* PASO 1: DETALLES FACTURACIÓN (Si es PayPal API) */}
             {checkoutStep === 1 && paymentMethod === 'paypal' && (
                <PayPalDetailsForm paypalData={paypalData} setPaypalData={setPaypalData} setCheckoutStep={setCheckoutStep} />
             )}
             
             {/* PASO 2: PAGO (Dos variantes: Automatizada o Manual) */}
             {checkoutStep === 2 && (
                 paymentMethod === 'paypal' ? (
                     <AutomatedFlowWrapper 
                        cart={cart}
                        cartTotal={cartTotal}
                        allOrders={allOrders}
                        setLastOrder={setLastOrder}
                        setCart={setCart}
                        setCheckoutStep={setCheckoutStep}
                        paypalData={paypalData}
                     />
                 ) : (
                    <PaymentProofStep 
                        proofData={proofData} setProofData={setProofData}
                        cart={cart} cartTotal={cartTotal}
                        allOrders={allOrders} setAllOrders={setAllOrders} setLastOrder={setLastOrder}
                        setCart={setCart} setCheckoutStep={setCheckoutStep}
                        paymentMethod={paymentMethod} paypalData={paypalData} exchangeRate={exchangeRateBs} 
                    />
                 )
             )}
             
             {checkoutStep === 3 && <SuccessScreen lastOrder={lastOrder} setView={setView} />}
          </div>
        ) : (
          <>
            <Hero exchangeRate={exchangeRateBs} />
            <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full border transition-all ${activeCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map((service, idx) => (
                  service.category === 'Exchange' ? (
                     <ExchangeCard key={service.id} service={service} addToCart={addToCart} exchangeRate={exchangeRateBs} />
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
        <div className="text-center mt-12 text-xs text-gray-600">© 2024 TecnoByte LLC. Todos los derechos reservados.</div>
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
      <GeminiChat exchangeRate={exchangeRateBs} />
    </div>
  );
}
