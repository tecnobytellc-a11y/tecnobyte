import './styles.css';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, Gamepad2, CreditCard, MessageSquare, 
  Smartphone, User, Check, Upload, X, Lock, 
  Globe, Zap, Trash2, Eye, RefreshCw,
  Facebook, Instagram, Mail, Phone, ShieldCheck, LogIn, ChevronDown, Landmark, Building2, Send, FileText, Tv, Music,
  Sparkles, Bot, MessageCircle, Loader, ArrowRight, Wallet, QrCode, AlertTriangle, Search, Clock, Key, Copy, Terminal, List, Archive, RefreshCcw, LogOut, Filter
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, collection, addDoc, serverTimestamp, 
  onSnapshot, doc, updateDoc, query, orderBy 
} from "firebase/firestore";
import { 
  getAuth, signInWithEmailAndPassword, signOut, 
  onAuthStateChanged, signInAnonymously 
} from "firebase/auth";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBgqPltYbC8ZSzLszFA1y6FegfHJn91Ozg",
  authDomain: "tecnobyte-52ae0.firebaseapp.com",
  databaseURL: "https://tecnobyte-52ae0-default-rtdb.firebaseio.com",
  projectId: "tecnobyte-52ae0",
  storageBucket: "tecnobyte-52ae0.firebasestorage.app",
  messagingSenderId: "727089895868",
  appId: "1:727089895868:web:0412acf7c812a1f07b73b9",
  measurementId: "G-XC1PJ1PB6W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Usamos el projectId como ID único para la ruta de la colección pública
const DB_ROOT_PATH = `artifacts/${firebaseConfig.projectId}/public/data`;

// --- CONFIGURACIÓN GLOBAL ---
const VERCEL_API_URL = "https://api-paypal-secure.vercel.app"; 

// --- DATA & CONFIGURATION ---

const API_CONFIG = {
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
const apiKey = ""; 

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

  // --- STREAMING (Con providerId para la API) ---
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
  instagram: "@tecnobytellc",
  tiktok: "@tecnobyte.llc",
  facebook: "TecnoByte",
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

const TikTokIcon = () => ( <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg> );

// --- HELPER FUNCTION: SAVE ORDER TO FIREBASE ---
const saveOrderToFirestore = async (order) => {
  try {
    // Si no hay usuario logueado, iniciamos sesión anónima primero para tener permisos
    if (!auth.currentUser) {
       await signInAnonymously(auth);
    }
    
    // Guardamos en la colección 'orders' dentro de la ruta pública
    const ordersRef = collection(db, 'artifacts', firebaseConfig.projectId, 'public', 'data', 'orders');
    
    // Serializar objetos complejos (como FileList o archivos) si los hay, o subir URLs
    // Aquí simplificamos guardando metadatos básicos de archivos, no el binario
    const sanitizedOrder = {
        ...order,
        date: order.date || new Date().toISOString(),
        createdAt: serverTimestamp(),
        // Limpiamos fullData de objetos File para evitar errores de Firestore
        fullData: {
            ...order.fullData,
            idDoc: order.fullData?.idDoc ? { name: order.fullData.idDoc.name } : null,
            screenshot: order.fullData?.screenshot ? { name: order.fullData.screenshot.name } : null
        }
    };

    await addDoc(ordersRef, sanitizedOrder);
    console.log("Orden guardada en Firestore:", order.id);
    return true;
  } catch (error) {
    console.error("Error guardando orden en Firestore:", error);
    return false;
  }
};

// --- ADMIN PANEL COMPONENT (INTEGRATED) ---
const AdminPanel = ({ setView }) => {
  // Estado de Autenticación del Admin
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Estado de Datos (Órdenes)
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const ORDER_STATUSES = ["PENDIENTE POR ENTREGAR", "CANCELADO", "ENTREGADO", "COMPLETADO", "FACTURADO", "EN DISPUTA", "REEMBOLSADO"];

  // --- 1. VERIFICAR SESIÓN ACTUAL ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) { // Asumimos que si no es anónimo, es el admin (o login real)
        setAdminUser(user.email);
        setIsAuthenticated(true);
        // Mantenemos loading en true para que al entrar al dashboard cargue los datos
      } else {
        setIsAuthenticated(false);
        setLoading(false); // <--- SOLUCIÓN: Desactiva el spinner si no estás logueado
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. ESCUCHAR CAMBIOS EN LA COLECCIÓN DE ÓRDENES ---
  useEffect(() => {
    if (!isAuthenticated) return;

    // Ruta de la colección: artifacts/{projectId}/public/data/orders
    const ordersCollectionRef = collection(db, 'artifacts', firebaseConfig.projectId, 'public', 'data', 'orders');
    
    // Query ordenado por fecha de creación (si existe) o fecha
    const q = query(ordersCollectionRef); // Podríamos añadir orderBy('createdAt', 'desc') pero requiere índice compuesto a veces
    
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
            ...doc.data(),
            firestoreId: doc.id
        }));
        
        // Ordenamiento manual para evitar errores de índices faltantes al inicio
        ordersData.sort((a, b) => {
            const dateA = new Date(a.createdAt ? a.createdAt.toDate() : (a.date || 0));
            const dateB = new Date(b.createdAt ? b.createdAt.toDate() : (b.date || 0));
            return dateB - dateA;
        });
        
        setOrders(ordersData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [isAuthenticated]);

  // --- 3. LÓGICA DE LOGIN CON FIREBASE AUTH ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      // El onAuthStateChanged se encargará de setear isAuthenticated
    } catch (error) {
      console.error("Login error:", error);
      let msg = "Error de autenticación.";
      if (error.code === 'auth/invalid-email') msg = "Email inválido.";
      if (error.code === 'auth/user-not-found') msg = "Usuario no encontrado.";
      if (error.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
      if (error.code === 'auth/invalid-credential') msg = "Credenciales inválidas.";
      setLoginError(msg);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setLoginForm({ email: '', password: '' });
    // Volver a anónimo para que la tienda siga funcionando si es necesario
    await signInAnonymously(auth);
  };

  // --- 4. ACTUALIZAR ESTADO ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (orderToUpdate && orderToUpdate.firestoreId) {
            const docRef = doc(db, 'artifacts', firebaseConfig.projectId, 'public', 'data', 'orders', orderToUpdate.firestoreId);
            await updateDoc(docRef, { status: newStatus });
        }
    } catch (err) {
        console.error("Error updating status:", err);
        alert("Error al actualizar la base de datos.");
    }
  };

  // Cálculos
  const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total || 0), 0).toFixed(2);
  const pendingOrdersCount = orders.filter(o => o.status && (o.status.includes('PENDIENTE') || o.status === 'Pendiente')).length;
  const uniqueCustomers = new Set(orders.map(o => o.user)).size;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 p-8 rounded-2xl border border-indigo-500/30 backdrop-blur shadow-2xl animate-scale-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">Panel Administrativo</h2>
          <p className="text-center text-gray-400 text-sm mb-6">Acceso seguro Firebase Auth</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider ml-1">Email Admin</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                  type="email" 
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="admin@tecnobyte.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-400 text-xs text-center bg-red-900/20 p-3 rounded border border-red-900/50 flex items-center justify-center gap-2">
                <X size={14} /> {loginError}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-600/20 flex justify-center gap-2 mt-4 disabled:opacity-50">
              {loading ? <Loader className="animate-spin" size={20}/> : <><LogIn size={20} /> Entrar</>}
            </button>
            <button type="button" onClick={() => setView('home')} className="w-full text-gray-500 text-xs hover:text-white mt-2">Volver a la Tienda</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 p-4 md:p-8 font-sans">
      {/* Header Dashboard */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
        <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
                Dashboard Ventas
            </h2>
            <p className="text-gray-400 text-sm mt-1">Gestión en tiempo real de Firestore: {firebaseConfig.projectId}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-800/60 p-2 rounded-xl border border-gray-700">
            <div className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-xs text-gray-300 flex items-center gap-2">
                <User size={14} className="text-indigo-400"/>
                {adminUser}
            </div>
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors" title="Cerrar Sesión"><LogOut size={18} /></button>
            <button onClick={() => setView('home')} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors ml-2" title="Ir a Tienda"><ShoppingCart size={18} /></button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
        <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur hover:border-indigo-500/30 transition-colors">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><ShoppingCart size={14} /> Ventas Totales</h3>
          <p className="text-4xl font-bold mt-2 text-white">${totalSales}</p>
        </div>
        <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur hover:border-yellow-500/30 transition-colors">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><RefreshCw size={14} /> Pendientes</h3>
          <p className="text-4xl font-bold mt-2 text-yellow-400">{pendingOrdersCount}</p>
        </div>
        <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur hover:border-green-500/30 transition-colors">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><User size={14} /> Clientes</h3>
          <p className="text-4xl font-bold mt-2 text-green-400">{uniqueCustomers}</p>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="max-w-7xl mx-auto bg-gray-800/40 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl animate-fade-in-up">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
            <h3 className="font-bold text-white flex items-center gap-2"><Filter size={18}/> Registro de Órdenes</h3>
            {loading && <span className="text-indigo-400 text-xs animate-pulse flex items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Cargando...</span>}
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
            {orders.length === 0 && !loading ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Search size={48} className="mb-4 opacity-20"/>
                    <p>No se encontraron registros en la base de datos.</p>
                </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="p-4 border-b border-gray-700">ID</th>
                    <th className="p-4 border-b border-gray-700">Cliente</th>
                    <th className="p-4 border-b border-gray-700">Items</th>
                    <th className="p-4 border-b border-gray-700">Monto</th>
                    <th className="p-4 border-b border-gray-700">Estado</th>
                    <th className="p-4 border-b border-gray-700 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 text-sm">
                  {orders.map(order => (
                    <tr key={order.firestoreId || order.id} className="hover:bg-gray-700/20 transition-colors group">
                      <td className="p-4 font-mono text-gray-400 group-hover:text-white transition-colors">{order.id}</td>
                      <td className="p-4 font-medium text-gray-200">
                          <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold">{(order.user || 'A').charAt(0).toUpperCase()}</div>
                              {order.user}
                          </div>
                      </td>
                      <td className="p-4 text-gray-400 max-w-xs truncate" title={order.items}>{order.items}</td>
                      <td className="p-4 font-bold text-emerald-400 font-mono">${order.total}</td>
                      <td className="p-4">
                        <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`w-full appearance-none bg-gray-900 border border-gray-600 hover:border-indigo-500 text-xs font-bold py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none cursor-pointer
                              ${order.status === 'COMPLETADO' || order.status === 'ENTREGADO' ? 'text-green-400 border-green-900 bg-green-900/10' : ''}
                              ${order.status === 'CANCELADO' || order.status === 'REEMBOLSADO' ? 'text-red-400 border-red-900 bg-red-900/10' : ''}
                              ${(order.status || '').includes('PENDIENTE') ? 'text-yellow-400 border-yellow-900 bg-yellow-900/10' : ''}
                            `}
                        >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => setSelectedOrder(order)} className="text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 p-2 rounded-lg transition-all"><Eye size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {/* MODAL DETALLES */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl custom-scrollbar animate-scale-in">
            <div className="sticky top-0 bg-gray-900/95 border-b border-gray-800 p-5 flex justify-between items-center backdrop-blur z-20">
              <h3 className="text-xl font-bold text-white">Orden {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)}><X className="text-gray-400 hover:text-white" size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Cliente</p><p className="text-white font-bold">{selectedOrder.user}</p></div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Total</p><p className="text-emerald-400 font-bold text-xl">${selectedOrder.total}</p></div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Método</p><p className="text-gray-200 font-medium uppercase">{selectedOrder.paymentMethod || 'N/A'}</p></div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50"><p className="text-gray-500 text-xs uppercase font-bold mb-1">Fecha</p><p className="text-white font-mono text-sm">{selectedOrder.date}</p></div>
              </div>
              
              {selectedOrder.fullData && (
                <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50">
                   <h4 className="text-indigo-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><User size={16}/> Datos Personales</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500 text-xs block">Teléfono</span><span className="text-white font-mono">{selectedOrder.fullData.contactPhone || selectedOrder.fullData.phone || 'N/A'}</span></div>
                      <div><span className="text-gray-500 text-xs block">ID / Cédula</span><span className="text-white font-mono">{selectedOrder.fullData.idNumber || selectedOrder.fullData.nationalId || 'N/A'}</span></div>
                      <div className="col-span-2"><span className="text-gray-500 text-xs block">Referencia Pago</span><span className="text-yellow-400 font-mono font-bold">{selectedOrder.fullData.refNumber || 'N/A'}</span></div>
                      {selectedOrder.paymentMethod === 'paypal' && <div className="col-span-2"><span className="text-gray-500 text-xs block">Email PayPal</span><span className="text-white">{selectedOrder.fullData.paypalEmail}</span></div>}
                   </div>
                </div>
              )}

              <div>
                 <h4 className="text-indigo-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><ShoppingCart size={16}/> Items</h4>
                 <ul className="space-y-2">
                   {selectedOrder.rawItems && selectedOrder.rawItems.map((item, idx) => (
                     <li key={idx} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center text-sm">
                       <span className="text-gray-200">{item.title}</span><span className="text-gray-400 font-mono">${item.price.toFixed(2)}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

// --- CALCULADORA & EXCHANGE AVANZADO ---

const ExchangeCard = ({ service, addToCart, exchangeRate, isAvailable }) => {
  const [amountSend, setAmountSend] = useState('');
  const [receiveAddress, setReceiveAddress] = useState('');
  
  const calculateReceive = (amount) => {
    if (!amount || isNaN(amount)) return 0;
    const numAmount = parseFloat(amount);
    // Updated commission: 13.60% + $0.47
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
        {/* BLOQUEO DE FIN DE SEMANA */}
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
            {/* Aviso de comisión */}
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

            {/* INPUT DE DESTINO PARA USDT */}
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

// --- NUEVA HERRAMIENTA SECRETA: GENERADOR MANUAL DE CUENTAS ---
const ManualServiceGenerator = ({ onClose }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [password, setPassword] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [providerServices, setProviderServices] = useState(null);
    const [subscriptions, setSubscriptions] = useState(null);
    const [viewMode, setViewMode] = useState('generate'); // 'generate', 'list', 'history'

    // Solo los servicios que tienen providerId
    const apiServices = SERVICES.filter(s => s.providerId && s.providerId > 0);

    const handleLogin = () => {
        if(password === "admin123") setIsAuth(true);
        else alert("Clave incorrecta");
    };

    const handleFetchProviderServices = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${VERCEL_API_URL}/api/list-provider-services`);
            const data = await response.json();
            if (data.success) {
                setProviderServices(data.services); // Asume que devuelve un array de servicios
            } else {
                alert("Error consultando catálogo: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchSubscriptions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${VERCEL_API_URL}/api/list-subscriptions`);
            const data = await response.json();
            if (data.success) {
                setSubscriptions(data.subscriptions);
            } else {
                alert("Error consultando historial: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedService) return;
        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${VERCEL_API_URL}/api/purchase-streaming`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id: selectedService.providerId })
            });
            const data = await response.json();
            
            if(data.success) {
                setResult(data.data); // data.data tiene la cuenta devuelta por la API
            } else {
                alert("Error API: " + (data.message || "Desconocido"));
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuth) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
                <div className="bg-gray-900 p-6 rounded-xl border border-red-500/50 text-center max-w-sm w-full">
                    <Terminal className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-4">Acceso Restringido</h3>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Clave de Admin"
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white mb-4 text-center"
                    />
                    <div className="flex gap-2">
                        <button onClick={onClose} className="flex-1 bg-gray-800 text-gray-400 py-2 rounded hover:text-white">Salir</button>
                        <button onClick={handleLogin} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-500">Entrar</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-gray-900 p-6 rounded-xl border border-indigo-500/50 max-w-3xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                
                <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-400" /> Admin Tools
                    </h3>
                    <div className="flex gap-2 bg-gray-800 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                        <button 
                            onClick={() => setViewMode('generate')}
                            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${viewMode === 'generate' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                        >
                            Generador
                        </button>
                        <button 
                            onClick={() => { setViewMode('list'); handleFetchProviderServices(); }}
                            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                        >
                            Ver IDs Catálogo
                        </button>
                        <button 
                            onClick={() => { setViewMode('history'); handleFetchSubscriptions(); }}
                            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${viewMode === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                        >
                            📜 Historial Ventas
                        </button>
                    </div>
                </div>

                {viewMode === 'list' && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400">Lista de servicios disponibles en el proveedor. Usa estos IDs en tu código.</p>
                        {isLoading ? (
                            <div className="text-center py-8"><Loader className="animate-spin mx-auto text-indigo-500"/></div>
                        ) : providerServices ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                                {(Array.isArray(providerServices) ? providerServices : []).map((s, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-black/40 p-2 rounded border border-gray-700 text-xs">
                                        <span className="text-white font-bold">{s.name || s.service_name || "Servicio"}</span>
                                        <span className="text-yellow-400 font-mono bg-yellow-900/20 px-2 py-1 rounded">ID: {s.id || s.service_id}</span>
                                    </div>
                                ))}
                                {(!Array.isArray(providerServices) || providerServices.length === 0) && (
                                    <p className="text-center text-gray-500 text-xs">No se encontraron servicios o formato desconocido.</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-red-400 text-xs">Error cargando lista.</p>
                        )}
                    </div>
                )}

                {viewMode === 'history' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-400">Cuentas vendidas y su estado.</p>
                            {subscriptions && <span className="text-xs bg-indigo-900 px-2 py-1 rounded text-indigo-200">Total: {subscriptions.length}</span>}
                        </div>
                        
                        {isLoading ? (
                            <div className="text-center py-8"><Loader className="animate-spin mx-auto text-indigo-500"/></div>
                        ) : subscriptions ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                                {subscriptions.map((sub, idx) => (
                                    <div key={idx} className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-xs flex flex-col gap-2">
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="text-white font-bold">{sub.service_name || "Servicio Desconocido"}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${!sub.reported ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                {!sub.reported ? 'ACTIVA' : 'REPORTADA'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-gray-400">
                                            <div>
                                                <span className="block text-[10px] uppercase">Email</span>
                                                <span className="text-white select-all">{sub.email}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase">Password</span>
                                                <span className="text-white select-all">{sub.password}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase">Vencimiento</span>
                                                <span className="text-white">{sub.expiration_date || "N/A"}</span>
                                            </div>
                                            {sub.pin && (
                                                <div>
                                                    <span className="block text-[10px] uppercase">PIN/Perfil</span>
                                                    <span className="text-yellow-400">{sub.pin}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {subscriptions.length === 0 && <p className="text-center text-gray-500">No hay ventas registradas.</p>}
                            </div>
                        ) : (
                            <p className="text-center text-red-400 text-xs">Error o sin datos.</p>
                        )}
                    </div>
                )}

                {viewMode === 'generate' && !result && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400 mb-2">Selecciona un servicio para comprar una cuenta ahora mismo.</p>
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {apiServices.map(service => (
                                <button 
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-3 rounded-lg border text-left transition-all ${selectedService?.id === service.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    <div className="font-bold text-sm">{service.title}</div>
                                    <div className="text-xs opacity-70">ID API: {service.providerId}</div>
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={handleGenerate}
                            disabled={!selectedService || isLoading}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg mt-4 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin" /> : "GENERAR CUENTA AHORA"}
                        </button>
                    </div>
                )}

                {viewMode === 'generate' && result && (
                    <div className="bg-black/50 p-4 rounded-lg border border-green-500/50 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-green-400 font-bold">¡Cuenta Generada!</h4>
                            <button onClick={() => setResult(null)} className="text-xs text-gray-400 underline">Generar otra</button>
                        </div>
                        
                        <div className="space-y-3 font-mono text-sm bg-gray-800 p-3 rounded">
                            <div>
                                <span className="text-gray-500 block text-xs">Email / Usuario</span>
                                <div className="flex justify-between text-white">
                                    <span>{result.email || result.user || "N/A"}</span>
                                    <Copy size={14} className="cursor-pointer hover:text-indigo-400" onClick={() => navigator.clipboard.writeText(result.email || result.user)} />
                                </div>
                            </div>
                            <div className="border-t border-gray-700 pt-2">
                                <span className="text-gray-500 block text-xs">Contraseña</span>
                                <div className="flex justify-between text-white">
                                    <span>{result.password || result.pass || "****"}</span>
                                    <Copy size={14} className="cursor-pointer hover:text-indigo-400" onClick={() => navigator.clipboard.writeText(result.password || result.pass)} />
                                </div>
                            </div>
                            {result.message && <p className="text-xs text-yellow-500 pt-2">{result.message}</p>}
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">Copia y pega estos datos al cliente en WhatsApp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- PAYMENT & API LOGIC ---

// --- COMPONENTE BINANCE CORREGIDO: SOLO MANUAL ---
const BinanceAutomatedCheckout = ({ cartTotal, onVerified, onCancel, paypalData }) => {
    const [transactionId, setTransactionId] = useState('');
    const [status, setStatus] = useState('idle'); 

    const handleVerify = async () => {
        if (!transactionId) { alert("ID inválido"); return; }
        setStatus('verifying');

        try {
            const response = await fetch(`${VERCEL_API_URL}/api/verify-binance-pay`, {
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
             
             {/* Header */}
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
            if (VERCEL_API_URL.includes("PON_AQUI")) {
                 alert("⚠️ FALTANTE: No has puesto la URL de tu servidor en el archivo App.jsx. Edita el archivo y pega la URL.");
                 setStatus('idle');
                 return;
            }

            const response = await fetch(`${VERCEL_API_URL}/api/create-order`, {
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

            const response = await fetch(`${VERCEL_API_URL}/api/capture-and-exchange`, {
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
                    alert("Pago PayPal recibido, pero hubo un error enviando USDT (Posiblemente IP Proxy). Revisa el panel Admin.");
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

const PaymentProofStep = ({ proofData, setProofData, cart, cartTotal, setLastOrder, setCart, setCheckoutStep, paymentMethod, paypalData, exchangeRate }) => {
  const fileInputRef = useRef(null);
  const idDocRef = useRef(null); 

  const executeOrderCreation = async (manualProofData) => {
      const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
      const randomId = Math.floor(100 + Math.random() * 900);
      
      const newOrder = {
          id: `ORD-${randomId}`,
          user: `${manualProofData.name} ${manualProofData.lastName}`,
          items: cart.map(i => i.title).join(', '),
          total: cartTotal.toFixed(2),
          status: 'PENDIENTE POR ENTREGAR', 
          date: new Date().toISOString().split('T')[0],
          rawItems: sanitizedItems, 
          paymentMethod: paymentMethod,
          exchangeRateUsed: exchangeRate,
          fullData: {
            ...manualProofData,
            contactPhone: manualProofData.phone
          }
      };

      // GUARDAR EN FIRESTORE
      await saveOrderToFirestore(newOrder);

      setLastOrder(newOrder);
      setCart([]); 
      setCheckoutStep(3); 
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if(!proofData.name || !proofData.refNumber) { 
        alert("Por favor completa los datos obligatorios."); 
        return; 
    }
    await executeOrderCreation(proofData);
  };

  const hasStreaming = cart.some(i => i.providerId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-4">Datos para Transferir</h3>
        {/* ... (Datos Bancarios sin cambios) ... */}
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
            {(paymentMethod === 'facebank' || paymentMethod === 'pipolpay') && (
               <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 space-y-4">
                  <input type="text" placeholder="Cuenta Emisora" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.issuerAccount || ''} onChange={e => setProofData({...proofData, issuerAccount: e.target.value})} />
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer" onClick={() => idDocRef.current.click()}>
                    <input type="file" ref={idDocRef} className="hidden" accept="image/*" onChange={(e) => setProofData({...proofData, idDoc: e.target.files[0]})} />
                    <p className="text-gray-300 text-xs">Foto Documento Identidad</p>
                    {proofData.idDoc && <p className="text-green-400 text-xs mt-1">Adjunto: {proofData.idDoc.name}</p>}
                  </div>
               </div>
            )}
            <input type="text" placeholder="Referencia / Comprobante" required className="bg-gray-800 border border-gray-700 rounded p-3 text-white w-full font-mono" value={proofData.refNumber} onChange={e => setProofData({...proofData, refNumber: e.target.value})} />
            
            {/* ALERTAS DE ENTREGA */}
            <div className="space-y-2">
                {/* Nota para todos */}
                <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
                    <p className="text-indigo-300 text-xs text-center flex items-center justify-center gap-1">
                    <Upload className="inline w-4 h-4"/>
                    <b>Nota:</b> Al finalizar, deberás enviar la captura por WhatsApp.
                    </p>
                </div>
                {/* ADVERTENCIA ESPECÍFICA DE STREAMING */}
                {hasStreaming && (
                    <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/20">
                        <p className="text-yellow-300 text-xs text-center flex items-center justify-center gap-1">
                        <Clock className="inline w-4 h-4"/>
                        <b>Streaming:</b> La cuenta se entregará por WhatsApp una vez verificado el pago manualmente.
                        </p>
                    </div>
                )}
            </div>
            
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg mt-6">REGISTRAR PAGO</button>
         </form>
      </div>
    </div>
  );
};

const AutomatedFlowWrapper = ({ cart, cartTotal, setLastOrder, setCart, setCheckoutStep, paypalData }) => {
    const exchangeItem = cart.find(item => item.type === 'usdt');
    const isExchange = !!exchangeItem;
    const [binanceTxId, setBinanceTxId] = useState('');

    const processStreamingPurchase = async (finalOrder) => {
        const streamingItem = finalOrder.rawItems.find(item => item.providerId && item.providerId > 0);
        if (streamingItem) {
            try {
                const response = await fetch(`${VERCEL_API_URL}/api/purchase-streaming`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service_id: streamingItem.providerId })
                });
                const result = await response.json();
                if (result.success && result.data) {
                    finalOrder.fullData.streamingAccount = result.data; 
                }
            } catch (error) { console.error("Error auto-streaming:", error); }
        }
        return finalOrder;
    };

    const handleBinanceVerifiedSuccess = async (txId) => {
         const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
         const randomId = Math.floor(100 + Math.random() * 900);
         
         let automatedOrder = {
             id: `ORD-${randomId}`,
             user: `${paypalData.firstName} ${paypalData.lastName}`, 
             items: cart.map(i => i.title).join(', '),
             total: cartTotal.toFixed(2),
             status: 'FACTURADO (Binance Verified)',
             date: new Date().toISOString().split('T')[0],
             rawItems: sanitizedItems,
             paymentMethod: 'binance_api',
             fullData: {
                 email: paypalData.email,
                 phone: paypalData.phone,
                 refNumber: txId,
                 contactPhone: paypalData.phone
             }
         };
         automatedOrder = await processStreamingPurchase(automatedOrder);

         // GUARDAR EN FIRESTORE
         await saveOrderToFirestore(automatedOrder);

         setLastOrder(automatedOrder);
         setCart([]);
         setCheckoutStep(3);
    };

    const handlePayPalComplete = async (invoiceId, bTxId) => {
        const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
        const randomId = Math.floor(100 + Math.random() * 900);

        let automatedOrder = {
            id: `ORD-${randomId}`,
            user: `${paypalData.firstName} ${paypalData.lastName}`, 
            items: cart.map(i => i.title).join(', '),
            total: cartTotal.toFixed(2),
            status: isExchange ? 'COMPLETADO' : 'FACTURADO', 
            date: new Date().toISOString().split('T')[0],
            rawItems: sanitizedItems,
            paymentMethod: 'paypal_api',
            fullData: {
                email: paypalData.email,
                phone: paypalData.phone,
                refNumber: invoiceId, 
                binanceTxId: bTxId, 
                exchangeData: exchangeItem ? exchangeItem.exchangeData : null,
                contactPhone: paypalData.phone
            }
        };
        automatedOrder = await processStreamingPurchase(automatedOrder);

        // GUARDAR EN FIRESTORE
        await saveOrderToFirestore(automatedOrder);

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
            {/* Nota: Para Binance Manual/Auto, se usa el componente separado si se selecciona en el paso anterior */}
            <div className="hidden">
                 <BinanceAutomatedCheckout 
                    cartTotal={cartTotal}
                    paypalData={paypalData}
                    onVerified={handleBinanceVerifiedSuccess}
                    onCancel={() => setCheckoutStep(0)}
                />
            </div>
        </div>
    );
};

const PayPalDetailsForm = ({ paypalData, setPaypalData, setCheckoutStep, paymentMethod }) => {
  const idDocRef = useRef(null);
  const handleSubmit = (e) => { e.preventDefault(); if(!paypalData.email || !paypalData.firstName) { alert("Completa los campos básicos."); return; } setCheckoutStep(2); };
  const isBinance = paymentMethod === 'binance';

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
        <button type="submit" className={`w-full ${isBinance ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} font-bold py-4 rounded-lg shadow-lg mt-4 flex justify-center gap-2`}>Continuar al Pago <ArrowRight size={20} /></button>
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

const SuccessScreen = ({ lastOrder, setView }) => {
  const generateWhatsAppLink = () => {
    if (!lastOrder) return "";
    const isBsPayment = lastOrder.paymentMethod === 'pagomovil' || lastOrder.paymentMethod === 'transfer_bs';
    const amountBs = isBsPayment ? (parseFloat(lastOrder.total) * (lastOrder.exchangeRateUsed || 0)).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : 0;
    const isApiVerified = lastOrder.paymentMethod === 'paypal_api' || lastOrder.paymentMethod === 'binance_api';

    let text = `👋 *Hola equipo TecnoByte, he realizado una nueva compra.*\nAquí están los detalles de mi pedido para su validación:\n\n`;
    text += `📋 *RESUMEN DEL PEDIDO*\n🆔 *ID:* ${lastOrder.id}\n👤 *Cliente:* ${lastOrder.user}\n📞 *Teléfono:* ${lastOrder.fullData.contactPhone}\n💳 *Método:* ${lastOrder.paymentMethod.toUpperCase().replace('_', ' ')}\n🧾 *Ref:* ${lastOrder.fullData.refNumber || 'N/A'}\n`;
    if (isApiVerified) text += `✅ *ESTADO:* VERIFICADO AUTOMÁTICAMENTE\n\n`; else text += `\n`;
    text += `🛒 *CARRITO*\n`;
    lastOrder.rawItems.forEach(item => { text += `• ${item.title} - $${item.price.toFixed(2)}\n`; });
    text += `\n💰 *TOTAL USD: $${lastOrder.total}*\n`;
    if (isBsPayment) { text += `🇻🇪 *TOTAL BS: ${amountBs}* (Tasa: ${lastOrder.exchangeRateUsed})\n`; }
    text += `\n📝 *NOTA ADJUNTA:*\n`;
    if (isApiVerified) {
        text += `✅ El pago ya fue verificado exitosamente por el sistema API.`;
        if (lastOrder.fullData.streamingAccount) { text += `\n🔑 *CUENTA ENTREGADA:* Ya recibí mis credenciales de acceso.`; }
    } else if (lastOrder.paymentMethod === 'facebank' || lastOrder.paymentMethod === 'transfer_usd') {
         text += `✅ Adjunto foto del comprobante de pago.\n❗ *OBLIGATORIO:* Adjunto también foto del documento de identidad.`;
    } else {
         text += `✅ Adjunto foto del comprobante de pago para su verificación.`;
    }
    text += `\n\nQuedo atento a la entrega. Gracias.`;
    return `https://wa.me/19047400467?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-scale-in">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]"><Check className="w-12 h-12 text-white" strokeWidth={3} /></div>
        <h2 className="text-4xl font-bold text-white mb-4">¡Pedido Registrado!</h2>
        <p className="text-gray-300 max-w-lg mb-8 text-lg">Tu pedido ha sido procesado localmente y guardado en la nube. Para finalizar, repórtalo en WhatsApp.</p>
        {lastOrder && (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 max-w-md w-full mb-8 shadow-2xl">
            <h3 className="text-indigo-400 font-bold mb-4 border-b border-gray-700 pb-2 flex justify-between">Resumen de Compra<span className="text-gray-500 text-xs font-normal">{lastOrder.id}</span></h3>
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
            <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse-green flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"><Send size={22} /> REPORTAR COMPRA (Enviar Datos)</a>
            <p className="text-xs text-gray-500 mt-2">*Al hacer clic, se abrirá WhatsApp con los datos de tu compra precargados.</p>
        </div>
        <button onClick={() => setView('home')} className="mt-8 text-gray-500 hover:text-white underline">Volver al inicio</button>
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
  const [paypalData, setPaypalData] = useState({ email: '', firstName: '', lastName: '', phone: '', nationalId: '', idDoc: null });
  const [proofData, setProofData] = useState({ screenshot: null, refNumber: '', name: '', lastName: '', idNumber: '', phone: '', issuerAccount: '', idDoc: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdminTool, setShowAdminTool] = useState(false);

  // --- LÓGICA DE HORARIO ---
  const getIsExchangeOpen = () => {
    const now = new Date();
    const venString = now.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const venDate = new Date(venString);
    const day = venDate.getDay(); 
    return day >= 1 && day <= 4;
  };
  const isExchangeAvailable = getIsExchangeOpen();

  // --- CONFIGURACIÓN DE ICONO ---
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
    setIsProcessing(true); 
    setTimeout(() => {
        setCheckoutStep(0);
        setView('checkout'); 
        setIsCartOpen(false); 
        setIsProcessing(false);
    }, 500);
  };

  const handleBinanceVerifiedSuccess = async (txId) => {
    const sanitizedItems = cart.map(({ icon, ...rest }) => rest);
    const randomId = Math.floor(100 + Math.random() * 900);
    let automatedOrder = {
        id: `ORD-${randomId}`,
        user: `${paypalData.firstName} ${paypalData.lastName}`, 
        items: cart.map(i => i.title).join(', '),
        total: cartTotal.toFixed(2),
        status: 'FACTURADO (Binance Verified)',
        date: new Date().toISOString().split('T')[0],
        rawItems: sanitizedItems,
        paymentMethod: 'binance_api',
        fullData: { email: paypalData.email, phone: paypalData.phone, refNumber: txId, contactPhone: paypalData.phone }
    };
    
    // Auto streaming logic...
    const streamingItem = sanitizedItems.find(item => item.providerId && item.providerId > 0);
    if (streamingItem) {
        try {
            const response = await fetch(`${VERCEL_API_URL}/api/purchase-streaming`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id: streamingItem.providerId })
            });
            const result = await response.json();
            if (result.success && result.data) {
                automatedOrder.fullData.streamingAccount = result.data; 
            }
        } catch (e) { console.error("Error auto-streaming:", e); }
    }

    // GUARDAR EN FIRESTORE
    await saveOrderToFirestore(automatedOrder);

    setLastOrder(automatedOrder);
    setCart([]);
    setCheckoutStep(3);
  };

  return (
    <div className="bg-[#0a0a12] text-gray-100 min-h-screen font-sans">
      <style>{globalStyles}</style>
      
      {/* VISTA DEL PANEL ADMINISTRATIVO */}
      {view === 'admin' && <AdminPanel setView={setView} />}

      {/* VISTA NORMAL DE LA TIENDA */}
      {view !== 'admin' && (
      <>
        <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} setView={setView} />
        
        <main className="pt-6 pb-20">
            {view === 'checkout' ? (
            <div className="pt-24 px-4 sm:px-6 lg:px-8">
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
                {checkoutStep === 1 && (paymentMethod === 'paypal' || paymentMethod === 'binance') && ( <PayPalDetailsForm paypalData={paypalData} setPaypalData={setPaypalData} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} /> )}
                {checkoutStep === 2 && (
                    paymentMethod === 'paypal' ? (
                        <AutomatedFlowWrapper cart={cart} cartTotal={cartTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paypalData={paypalData} />
                    ) : paymentMethod === 'binance' ? (
                        <BinanceAutomatedCheckout cartTotal={cartTotal} paypalData={paypalData} onVerified={handleBinanceVerifiedSuccess} onCancel={() => setCheckoutStep(0)} />
                    ) : (
                        <PaymentProofStep proofData={proofData} setProofData={setProofData} cart={cart} cartTotal={cartTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} paypalData={paypalData} exchangeRate={exchangeRateBs} />
                    )
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
        
        {/* FOOTER CON ACCESO SECRETO */}
        <footer className="bg-black/90 border-t border-gray-800 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div><h4 className="text-white font-orbitron font-bold text-xl mb-4">TECNOBYTE</h4><p className="text-sm">Innovación y seguridad en cada transacción. Tu aliado digital de confianza.</p></div>
            <div><h4 className="text-white font-bold mb-4">Contacto</h4><ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><Mail size={16}/> {CONTACT_INFO.email}</li><li className="flex items-center gap-2"><Phone size={16}/> {CONTACT_INFO.whatsapp_display}</li></ul></div>
            <div><h4 className="text-white font-bold mb-4">Síguenos</h4><div className="flex gap-4"><a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Facebook /></a><a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors"><Instagram /></a><a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors"><TikTokIcon /></a></div></div>
            <div><h4 className="text-white font-bold mb-4">Legal</h4><ul className="space-y-2 text-sm"><li>Términos y Condiciones</li><li>Política de Privacidad</li></ul></div>
            </div>
            <div className="text-center mt-12 text-xs text-gray-600">
                © 2024 TecnoByte LLC. Todos los derechos reservados.
                <button onClick={() => setView('admin')} className="ml-2 text-gray-800 hover:text-gray-700">Acceso Admin</button>
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
        <GeminiChat exchangeRate={exchangeRateBs} />
        {showAdminTool && <ManualServiceGenerator onClose={() => setShowAdminTool(false)} />}
      </>
      )}
    </div>
  );
}
