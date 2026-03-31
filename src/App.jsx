import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Instagram, ShoppingCart, Search, Filter } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './pages/firebase';
import CinematicLanding from './components/ui/CinematicLanding';

// === CONFIGURATION & STORES ===
import { SERVER_URL, RATE_API_CONFIG, INITIAL_RATE_BS, DEFAULT_CONTACT_INFO, GLOBAL_STYLES } from './config/constants';
import { reportSuspiciousIP } from './utils/security';

// === UI COMPONENTS ===
import Navbar from './components/ui/Navbar';
import Hero from './components/ui/Hero';
import BlockedScreen from './components/ui/BlockedScreen';
import LegalModal from './components/ui/LegalModal';
import CartDrawer from './components/layout/CartDrawer';
import Sidebar from './components/layout/Sidebar';

// === PRODUCT COMPONENTS ===
import ProductCard from './components/products/ProductCard';
import ExchangeCard from './components/products/ExchangeCard';

// === CHECKOUT COMPONENTS ===
import PaymentMethodSelection from './components/checkout/PaymentMethodSelection';
import PayPalDetailsForm from './components/checkout/PayPalDetailsForm';
import PayPalCardProcessor from './components/checkout/PayPalCardProcessor';
import AutomatedFlowWrapper from './components/checkout/AutomatedFlowWrapper';
import BinanceAutomatedCheckout from './components/checkout/BinanceAutomatedCheckout';
import TnbAutomatedCheckout from './components/checkout/TnbAutomatedCheckout';
import PaymentProofStep from './components/checkout/PaymentProofStep';
import VortexPayDashboard from './components/checkout/VortexPayDashboard';

import SuccessScreen from './components/verification/SuccessScreen';
import OrderVerification from './components/verification/OrderVerification';
import BovedaSecreta from './components/verification/BovedaSecreta';
import SupportCenter from './pages/SupportCenter';

// === GAMIFICATION ===
import GamificationDashboard from './pages/GamificationDashboard';

// === AUTHENTICATION ===
import Login from './pages/Login';
import Register from './pages/Register';

// === AI & MARKETING ===
import TecnoBot from './components/ui/TecnoBot';
import SocialProofPopup from './components/ui/SocialProofPopup';

// --- Custom Icons ---
const TikTokIcon = () => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);

const AppContent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [view, setView] = useState('home'); 
    const [cart, setCart] = useState([]); 
    const [isCartOpen, setIsCartOpen] = useState(false); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Gift Cards'); 

    // --- 🔍 ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [reloadlyCatalog, setReloadlyCatalog] = useState({});
    const [availableCountries, setAvailableCountries] = useState(['All']);
    const [rangoInputs, setRangoInputs] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 24;

    // --- 💎 ESTADOS VIP Y CASHBACK ---
    const [activeUser, setActiveUser] = useState(null);
    const [cashbackPct, setCashbackPct] = useState(0);
    // ---------------------------------------------

    const [lastOrder, setLastOrder] = useState(null); 
    const [exchangeRateBs, setExchangeRateBs] = useState(INITIAL_RATE_BS); 
    const [checkoutStep, setCheckoutStep] = useState(0); 
    const [paymentMethod, setPaymentMethod] = useState(null); 
    const [paypalData, setPaypalData] = useState({ email: '', firstName: '', lastName: '', phone: '', idDoc: null, idNumber: '', groupLink: '' }); 
    const [proofData, setProofData] = useState({ screenshot: null, refNumber: '', name: '', lastName: '', idNumber: '', phone: '', issuerAccount: '', idDoc: null }); 
    const [isProcessing, setIsProcessing] = useState(false); 
    const [isBlocked, setIsBlocked] = useState(false); 
    const [showTerms, setShowTerms] = useState(false); 
    const [showPrivacy, setShowPrivacy] = useState(false); 
    const [coupon, setCoupon] = useState(null); 
    const [isLoadingSecurity, setIsLoadingSecurity] = useState(true); 
    const [services, setServices] = useState([]); 
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
    const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_INFO); 
    const [legalInfo, setLegalInfo] = useState({ terms: "Cargando...", privacy: "Cargando..." }); 
    const [socialLinks, setSocialLinks] = useState({ tiktok: "#", instagram: "#", facebook: "#" });
    const [multipackages, setMultipackages] = useState({});

    const requiresGroupLink = cart.some(item => item.requiresLink || item.title === 'Admin. Bot' || item.id === 20);
    const isExchangeAvailable = (() => { const now = new Date(); const venDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Caracas"})); const day = venDate.getDay(); return day >= 1 && day <= 4; })();

    useEffect(() => {
        if (view === 'checkout' && location.pathname !== '/checkout') {
            navigate('/checkout');
        } else if (view === 'home' && location.pathname === '/checkout') {
            navigate('/');
        }
    }, [view, navigate, location.pathname]);

    useEffect(() => {
        if (location.pathname === '/') setView('home');
        else if (location.pathname === '/checkout') setView('checkout');
    }, [location.pathname]);

    // --- 💎 LECTURA DE RANGO VIP EN TIEMPO REAL ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setActiveUser(user);
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        const pts = data.tecnoPoints_acumulados || 0;
                        const rangoActual = data.rango || '';
                        if (pts >= 15000 || rangoActual.toLowerCase() === 'diamante') {
                            setCashbackPct(5);
                        } else if (pts >= 5000 || rangoActual.toLowerCase() === 'oro') {
                            setCashbackPct(2);
                        } else {
                            setCashbackPct(0);
                        }
                    }
                } catch (error) {
                    console.error("Error leyendo rango VIP:", error);
                }
            } else {
                setCashbackPct(0);
            }
        });
        return () => unsubscribe();
    }, []);

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
                    if (config.success) { setServices(config.catalog); setMultipackages(config.multipackages || {}); setContactInfo(config.contact); setLegalInfo(config.legal); setSocialLinks(config.social); }
                }

                // Cargar Catálogo de Reloadly
                const reloadlySnapshot = await getDocs(collection(db, "catalogo_reloadly"));
                const catalog = {};
                const paises = new Set(['All']);

                reloadlySnapshot.forEach(doc => {
                    const paquetes = doc.data().paquetes;
                    catalog[doc.id] = paquetes;
                    if(paquetes && paquetes.length > 0 && paquetes[0].pais) paises.add(paquetes[0].pais);
                });
                
                setReloadlyCatalog(catalog);
                setAvailableCountries(Array.from(paises).sort());

            } catch (error) {} finally { setIsLoadingSecurity(false); setIsLoadingCatalog(false); }
        }; init();
    }, []);

    useEffect(() => { document.title = "TecnoByte | Soluciones Digitales"; let link = document.querySelector("link[rel~='icon']"); if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.getElementsByTagName('head')[0].appendChild(link); } const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; const ctx = canvas.getContext('2d'); const img = new Image(); img.src = '/unnamed.png'; img.crossOrigin = 'Anonymous'; img.onload = () => { try { ctx.beginPath(); ctx.arc(32, 32, 32, 0, 2 * Math.PI); ctx.clip(); ctx.drawImage(img, 0, 0, 64, 64); link.href = canvas.toDataURL(); } catch (e) {} }; }, []);
    useEffect(() => { const fetchRate = async () => { try { const response = await fetch(RATE_API_CONFIG.url); if (!response.ok) throw new Error('Error tasa'); const data = await response.json(); const newRate = parseFloat(data.rate || data.price || data.tasa || data.value); if (!isNaN(newRate) && newRate > 0) setExchangeRateBs(newRate); } catch (error) {} }; fetchRate(); const intervalId = setInterval(fetchRate, RATE_API_CONFIG.intervalMinutes * 60 * 1000); return () => clearInterval(intervalId); }, []);

    // 🚀 GATILLO AUTOMÁTICO PARA RELOADLY
    useEffect(() => {
        if (checkoutStep === 3 && lastOrder && (lastOrder.paymentMethod === 'binance_api' || lastOrder.paymentMethod === 'paypal_api' || lastOrder.paymentMethod === 'tarjeta_credito_debito')) {
            const pinProduct = lastOrder.rawItems.find(item => item.title.toLowerCase().includes('robux') || item.title.toLowerCase().includes('amazon') || item.title.toLowerCase().includes('playstation') || item.title.toLowerCase().includes('netflix') || item.category === 'Gift Cards' );
            if (pinProduct && pinProduct.reloadlyId) {
                const valorTarjeta = pinProduct.faceValue || pinProduct.price; 
                const precioPagado = pinProduct.price; 
                solicitarPinAutomatico(pinProduct.reloadlyId, valorTarjeta, precioPagado, lastOrder.fullData.email);
            }
        }
    }, [checkoutStep, lastOrder]);

    const addToCart = (service) => { setCart([...cart, service]); };
    const removeFromCart = (index) => { const newCart = [...cart]; newCart.splice(index, 1); setCart(newCart); };
    
    // Total calculation
    const calculateTotal = (cartItems, appliedCoupon) => Math.max(0, cartItems.reduce((acc, item) => { if (appliedCoupon && appliedCoupon.excludedIds && appliedCoupon.excludedIds.includes(item.id)) return acc + item.price; if (appliedCoupon && (appliedCoupon.discountType || appliedCoupon.type) !== 'fixed') return acc + (item.price * (1 - (Number(appliedCoupon.percent || appliedCoupon.discountValue || appliedCoupon.value) || 0) / 100)); return acc + item.price; }, 0) - (appliedCoupon && (appliedCoupon.discountType || appliedCoupon.type) === 'fixed' ? (Number(appliedCoupon.discountValue || appliedCoupon.amount || appliedCoupon.value) || 0) : 0));
    const rawTotal = cart.reduce((acc, item) => acc + item.price, 0);
    const finalTotal = calculateTotal(cart, coupon);

    const solicitarPinAutomatico = async (idProducto, valorTarjeta, precioPagado, correoCliente) => {
        try {
            const respuesta = await fetch(`${SERVER_URL}/api/comprar-pin`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: idProducto, amount: valorTarjeta, precioPagado: precioPagado, identifier: correoCliente })
            });
            const datos = await respuesta.json();
            if (datos.success) console.log("Orden procesada Reloadly."); else console.error("Error Reloadly:", datos.mensaje);
        } catch (error) { console.error("Error Reloadly servidor:", error); }
    };

    const handleCheckoutStart = () => { 
        setIsProcessing(true); 
        if (requiresGroupLink && (!paypalData.groupLink || !paypalData.groupLink.includes('chat.whatsapp.com'))) {
            setIsProcessing(false);
            alert("Por favor ingresa un enlace válido de Grupo de WhatsApp antes de continuar.");
            setIsCartOpen(true);
            return;
        }
        const hasExchangeItem = cart.some(i => i.category === 'Exchange');
        setTimeout(() => { 
            if (hasExchangeItem) { setPaymentMethod('paypal'); setCheckoutStep(1); } 
            else { setPaymentMethod(null); setCheckoutStep(0); }
            setView('checkout'); 
            setIsCartOpen(false); 
            setIsProcessing(false); 
        }, 300); 
    };

    // --- 🛠️ SISTEMA DE FILTRADO UNIFICADO Y PAGINACIÓN 🛠️ ---
    const filteredServices = services.filter(service => {
        const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const filteredReloadly = Object.entries(reloadlyCatalog).filter(([nombreMarcaPais, paquetes]) => {
        const marcaStr = nombreMarcaPais.toLowerCase();
        const searchStr = searchTerm.toLowerCase();
        const matchesSearch = marcaStr.includes(searchStr);
        const matchesCountry = selectedCountry === 'All' || (paquetes.length > 0 && paquetes[0].pais === selectedCountry);
        const matchesCategory = activeCategory === 'All' || activeCategory === 'Gift Cards';
        return matchesSearch && matchesCountry && matchesCategory;
    });

    // Unimos todos los productos en una sola lista para paginarlos sin congelar la pantalla
    const unifiedList = [
        ...filteredServices.map(s => ({ type: 'original', data: s })),
        ...filteredReloadly.map(r => ({ type: 'reloadly', data: r }))
    ];

    const totalPages = Math.ceil(unifiedList.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = unifiedList.slice(indexOfFirstItem, indexOfLastItem);

    if (isLoadingSecurity || isLoadingCatalog) return <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[100]"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div><h2 className="text-slate-800 font-bold text-xl tracking-widest animate-pulse">CARGANDO TIENDA</h2><p className="text-slate-500 text-xs mt-2 font-mono">Conectando con el servidor...</p></div>;
    if (isBlocked) return <BlockedScreen />;

    const urlParams = new URLSearchParams(window.location.search);
    const cofreId = urlParams.get('cofre');
    if (cofreId) return <BovedaSecreta cofreId={cofreId} />;

    return (
        <div className="bg-slate-50 text-slate-800 min-h-screen font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
            <style>{GLOBAL_STYLES}</style>
            <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} onOpenSidebar={() => setIsSidebarOpen(true)} setView={setView} />
            
            <main className="flex-grow pt-6 pb-20">
                <Routes>
                    <Route path="/" element={
                        <>
                            <CinematicLanding />
                            <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                                
                                {/* 🌟 MÓDULO DE BÚSQUEDA CENTRADO Y PREMIUM 🌟 */}
                                <div className="max-w-3xl mx-auto mb-12 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
                                    <h2 className="text-center text-slate-800 font-bold text-xl mb-4 tracking-wider">
                                        BUSCADOR GLOBAL
                                    </h2>
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center z-10 relative">
                                        <div className="relative w-full md:w-2/3">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500" size={20} />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar juegos, gift cards, apps..." 
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                                value={searchTerm}
                                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                            />
                                        </div>
                                        
                                        {(activeCategory === 'Gift Cards' || searchTerm.length > 0) && (
                                            <div className="relative w-full md:w-1/3 flex items-center">
                                                <Filter className="absolute left-4 text-indigo-500" size={18} />
                                                <select 
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner cursor-pointer"
                                                    value={selectedCountry}
                                                    onChange={(e) => { setSelectedCountry(e.target.value); setCurrentPage(1); }}
                                                >
                                                    {availableCountries.map(country => (
                                                        <option key={country} value={country}>{country === 'All' ? '🌐 Todos los Países' : `📍 ${country}`}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CATEGORÍAS - AHORA MANEJADAS POR EL SIDEBAR. ELIMINADA DE LA VISTA DIRECTA. */}

                                {/* GRILLA PAGINADA */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {currentItems.map((item, idx) => {
                                        if (item.type === 'original') {
                                            const service = item.data;
                                            return service.category === 'Exchange' 
                                                ? <ExchangeCard key={`exc-${service.id || idx}`} service={service} addToCart={addToCart} exchangeRate={exchangeRateBs} isAvailable={isExchangeAvailable} /> 
                                                : <ProductCard key={`prod-${service.id || idx}`} service={service} addToCart={addToCart} exchangeRateBs={exchangeRateBs} idx={idx} multipackages={multipackages} />;
                                        } else {
                                            const [nombreMarcaPais, paquetes] = item.data;
                                            if (!paquetes || paquetes.length === 0) return null;

                                            return (
                                                <div key={nombreMarcaPais} className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col group">
                                                    
                                                    {/* 💎 INSIGNIA CASHBACK LÓGICA 💎 */}
                                                    {cashbackPct > 0 && (
                                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                                                            <span>💎</span> +{cashbackPct}% Cashback VIP
                                                        </div>
                                                    )}
                                                    
                                                   {/* PORTADA DE LA TARJETA (FULL COVER) */}
                                                    <div className="h-32 relative overflow-hidden bg-slate-50 flex flex-col items-center justify-center">
                                                        
                                                        {paquetes[0].logo ? (
                                                            /* La imagen ahora cubre el 100% del espacio sin deformarse */
                                                            <img 
                                                                src={paquetes[0].logo} 
                                                                alt={nombreMarcaPais} 
                                                                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-500" 
                                                            />
                                                        ) : (
                                                            <h3 className="text-3xl font-black text-slate-400 tracking-widest uppercase z-10 drop-shadow-sm">{paquetes[0].pais}</h3>
                                                        )}
                                                        
                                                        {/* Degradado claro superpuesto */}
                                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-0"></div>
                                                        
                                                        <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white z-10 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                                                            {paquetes[0].pais}
                                                        </span>
                                                    </div>

                                                    <div className="p-5 flex flex-col flex-grow bg-white">
                                                        <div className="mb-4">
                                                            <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{nombreMarcaPais.split(' - ')[0]}</h3>
                                                            <span className="text-xs text-slate-500 font-mono mt-1 block">Gift Card • {paquetes[0].moneda}</span>
                                                        </div>

                                                        {paquetes[0].isFixed === false ? (
                                                            /* RANGO LIBRE CON DISEÑO ADAPTADO */
                                                            <div className="mt-auto pt-4 border-t border-slate-100">
                                                                <p className="text-[11px] text-slate-500 mb-2 font-mono flex justify-between">
                                                                    <span>Mín: {paquetes[0].minAmount}</span>
                                                                    <span>Máx: {paquetes[0].maxAmount}</span>
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <div className="relative w-full">
                                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                                        <input 
                                                                            type="number" 
                                                                            placeholder="0.00"
                                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-slate-800 text-sm focus:border-indigo-500 outline-none transition-colors"
                                                                            value={(typeof rangoInputs[nombreMarcaPais] === 'string' ? rangoInputs[nombreMarcaPais] : '') || ''}
                                                                            onChange={(e) => setRangoInputs({...rangoInputs, [nombreMarcaPais]: e.target.value})}
                                                                        />
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const val = parseFloat(rangoInputs[nombreMarcaPais]);
                                                                            if(val >= paquetes[0].minAmount && val <= paquetes[0].maxAmount) {
                                                                                addToCart({
                                                                                    id: `${paquetes[0].id}_${val}`,
                                                                                    title: `${nombreMarcaPais} (${val} ${paquetes[0].moneda})`,
                                                                                    price: val,
                                                                                    category: 'Gift Cards',
                                                                                    reloadlyId: paquetes[0].reloadlyId,
                                                                                    isFixed: false,
                                                                                    cashback: cashbackPct
                                                                                });
                                                                                setRangoInputs({...rangoInputs, [nombreMarcaPais]: ''});
                                                                            } else { alert(`El monto debe estar entre ${paquetes[0].minAmount} y ${paquetes[0].maxAmount}`); }
                                                                        }}
                                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                                    >
                                                                        <ShoppingCart size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* MENÚ DESPLEGABLE PARA PRECIOS FIJOS */
                                                            <div className="mt-auto pt-4 border-t border-slate-100">
                                                                <select 
                                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 mb-3 focus:border-indigo-500 outline-none transition-colors"
                                                                    onChange={(e) => {
                                                                        const p = paquetes.find(x => x.id === e.target.value);
                                                                        if(p) setRangoInputs({...rangoInputs, [nombreMarcaPais]: p});
                                                                    }}
                                                                    defaultValue=""
                                                                >
                                                                    <option value="" disabled>Selecciona un paquete...</option>
                                                                    {paquetes.sort((a,b)=> a.price - b.price).map(p => (
                                                                        <option key={p.id} value={p.id}>{p.title || p.price} {p.moneda} - ${p.price}</option>
                                                                    ))}
                                                                </select>
                                                                
                                                                <button 
                                                                    onClick={() => {
                                                                        const selected = rangoInputs[nombreMarcaPais];
                                                                        if(selected && typeof selected === 'object') {
                                                                            addToCart({
                                                                                id: selected.id,
                                                                                title: `${nombreMarcaPais} - ${selected.title || selected.price}`,
                                                                                price: selected.price,
                                                                                category: 'Gift Cards',
                                                                                reloadlyId: selected.reloadlyId,
                                                                                isFixed: true,
                                                                                cashback: cashbackPct
                                                                            });
                                                                        } else {
                                                                            alert("Por favor selecciona un paquete primero.");
                                                                        }
                                                                    }}
                                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                                >
                                                                    <ShoppingCart size={18} /> Agregar al Carrito
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>

                                {/* ESTADO VACÍO */}
                                {unifiedList.length === 0 && (
                                    <div className="text-center py-20 text-gray-500 col-span-full">
                                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-xl">No encontramos productos para "{searchTerm}"</p>
                                    </div>
                                )}

                                {/* 🌟 CONTROLES DE PAGINACIÓN 🌟 */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-16">
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 hover:bg-indigo-600 transition-colors font-bold text-sm"
                                        >
                                            Anterior
                                        </button>
                                        
                                        <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none custom-scrollbar pb-1">
                                            {[...Array(totalPages)].map((_, i) => {
                                                const page = i + 1;
                                                if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                                                    return (
                                                        <button 
                                                            key={page} 
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`w-10 h-10 rounded-lg font-bold transition-all flex-shrink-0 ${currentPage === page ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                } else if (page === currentPage - 3 || page === currentPage + 3) {
                                                    return <span key={page} className="text-gray-600 px-1 flex items-end pb-2">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 hover:bg-indigo-600 transition-colors font-bold text-sm"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    } />
                    
                    <Route path="/checkout" element={
                        <div className="pt-24 px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div onClick={() => { if (checkoutStep > 0 && checkoutStep < 3) { setCheckoutStep(0); setPaymentMethod(null); }}} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${checkoutStep >= 0 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-gray-800 text-gray-500'} ${checkoutStep > 0 && checkoutStep < 3 ? 'cursor-pointer hover:bg-indigo-500 hover:scale-110' : ''}`}>1</div>
                                    <div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 0 ? 'w-full' : 'w-0'}`}></div></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${checkoutStep >= 2 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-gray-800 text-gray-500'}`}>2</div>
                                    <div className="w-16 h-1 bg-gray-800"><div className={`h-full bg-indigo-600 transition-all ${checkoutStep > 2 ? 'w-full' : 'w-0'}`}></div></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${checkoutStep === 3 ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-800 text-gray-500'}`}>3</div>
                                </div>
                            </div>
                            
                            {checkoutStep === 0 && <PaymentMethodSelection setPaymentMethod={setPaymentMethod} setCheckoutStep={setCheckoutStep} setView={setView} coupon={coupon} applyCoupon={setCoupon} removeCoupon={() => setCoupon(null)} cartTotal={finalTotal} />}
                            {checkoutStep === 1 && (paymentMethod === 'paypal' || paymentMethod === 'binance' || paymentMethod === 'tarjeta' || paymentMethod === 'saldo_tnb') && <PayPalDetailsForm paypalData={paypalData} setPaypalData={setPaypalData} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} openTerms={() => setShowTerms(true)} openPrivacy={() => setShowPrivacy(true)} cart={cart} />}
                            {checkoutStep === 2 && ( 
                                (paymentMethod === 'tarjeta') ? <PayPalCardProcessor cart={cart} finalTotal={finalTotal} coupon={coupon} paypalData={paypalData} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} /> :
                                (paymentMethod === 'paypal') ? <AutomatedFlowWrapper cart={cart} cartTotal={finalTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paypalData={paypalData} coupon={coupon} contactInfo={contactInfo} paymentMethod={paymentMethod} /> : 
                                (paymentMethod === 'binance') ? <BinanceAutomatedCheckout finalTotal={finalTotal} cartTotal={finalTotal} paypalData={paypalData} onVerified={(tid) => { /* Handled originally in function, let's keep it clean we need handleBinanceSuccess equivalent */ }} onCancel={() => setCheckoutStep(0)} contactInfo={contactInfo} /> :
                                (paymentMethod === 'saldo_tnb') ? <TnbAutomatedCheckout finalTotal={finalTotal} cart={cart} paypalData={paypalData} coupon={coupon} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} /> :
                                <PaymentProofStep proofData={proofData} setProofData={setProofData} cart={cart} cartTotal={rawTotal} finalTotal={finalTotal} setLastOrder={setLastOrder} setCart={setCart} setCheckoutStep={setCheckoutStep} paymentMethod={paymentMethod} paypalData={paypalData} exchangeRate={exchangeRateBs} coupon={coupon} contactInfo={contactInfo} openTerms={() => setShowTerms(true)} openPrivacy={() => setShowPrivacy(true)} />
                            )}
                            {checkoutStep === 3 && (
                                <div className="max-w-3xl mx-auto w-full mb-8">
                                    <SuccessScreen lastOrder={lastOrder} setView={setView} />
                                </div>
                            )}
                        </div>
                    } />

                    <Route path="/verificar-orden/:orderId" element={<OrderVerificationWrapper />} />
                    <Route path="/resoluciones" element={<SupportCenter />} />
                    <Route path="/perfil" element={<GamificationDashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Register />} />

                    <Route path="/vortex-pay" element={
                        <div className="pt-24">
                            <VortexPayDashboard saldoTnb={755.50} />
                        </div>
                    } />

                </Routes>
            </main>

            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                categories={['All', ...new Set([...services.map(s => s.category), 'Gift Cards'])]}
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
            />

            <CartDrawer 
                isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cart={cart} removeFromCart={removeFromCart} 
                finalTotal={finalTotal} handleCheckoutStart={handleCheckoutStart} 
                requiresGroupLink={requiresGroupLink} paypalData={paypalData} setPaypalData={setPaypalData} coupon={coupon} 
            />

            <footer className="bg-white border-t border-slate-200 text-slate-500 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="text-slate-800 font-bold text-xl mb-4 tracking-wider">TECNOBYTE</h4>
                        <p className="text-[14px] leading-relaxed text-slate-500">Innovación y seguridad en cada transacción. Tu aliado digital de confianza global.</p>
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold mb-4">Ayuda</h4>
                        <ul className="space-y-3 text-[14px]">
                            <li className="cursor-pointer hover:text-indigo-600 transition-colors"><a href="/resoluciones" className="block w-full">Centro de Resoluciones</a></li>
                            <li className="cursor-pointer pt-1"><a href="/resoluciones" className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all">¡Haz clic aquí!</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold mb-4">Síguenos</h4>
                        <div className="flex gap-4">
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Facebook size={18} /></a>
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-pink-600 hover:text-white transition-all"><Instagram size={18} /></a>
                            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-900 hover:text-white transition-all"><TikTokIcon /></a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold mb-4">Legal</h4>
                        <ul className="space-y-3 text-[14px]">
                            <li className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setShowTerms(true)}>Términos y Condiciones</li>
                            <li className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setShowPrivacy(true)}>Política de Privacidad</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-slate-100 text-[13px] text-slate-400 font-mono">
                    © {new Date().getFullYear()} TecnoByte LLC. Todos los derechos reservados.
                </div>
            </footer>

            <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Términos y Condiciones" content={legalInfo.terms} />
            <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Política de Privacidad y Aviso Legal" content={legalInfo.privacy} />
            
            <TecnoBot />
            <SocialProofPopup />
        </div>
    );
};

const OrderVerificationWrapper = () => {
    const { pathname } = useLocation();
    const orderId = pathname.split('/').pop();
    return <OrderVerification orderId={orderId} />;
};

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
