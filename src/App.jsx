import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Instagram, ShoppingCart } from 'lucide-react';

// === CONFIGURATION & STORES ===
import { SERVER_URL, RATE_API_CONFIG, INITIAL_RATE_BS, DEFAULT_CONTACT_INFO, GLOBAL_STYLES } from './config/constants';
import { reportSuspiciousIP } from './utils/security';

// === UI COMPONENTS ===
import Navbar from './components/ui/Navbar';
import Hero from './components/ui/Hero';
import BlockedScreen from './components/ui/BlockedScreen';
import LegalModal from './components/ui/LegalModal';
import CartDrawer from './components/layout/CartDrawer';

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

    const [view, setView] = useState('home'); // Retrocompatibility for navbar
    const [cart, setCart] = useState([]); 
    const [isCartOpen, setIsCartOpen] = useState(false); 
    const [activeCategory, setActiveCategory] = useState('All'); 
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

    // Handle view changes and sync with React Router
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

    if (isLoadingSecurity || isLoadingCatalog) return <div className="fixed inset-0 bg-[#0a0a12] flex flex-col items-center justify-center z-[100]"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div><h2 className="text-white font-orbitron text-xl tracking-widest animate-pulse">CARGANDO TIENDA</h2><p className="text-gray-500 text-xs mt-2 font-mono">Conectando con el servidor...</p></div>;
    if (isBlocked) return <BlockedScreen />;

    // Detect Boveda Secreta
    const urlParams = new URLSearchParams(window.location.search);
    const cofreId = urlParams.get('cofre');
    if (cofreId) return <BovedaSecreta cofreId={cofreId} />;

    return (
        <div className="bg-[#0a0a12] text-gray-100 min-h-screen font-sans flex flex-col">
            <style>{GLOBAL_STYLES}</style>
            <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} setView={setView} />
            
            <main className="flex-grow pt-6 pb-20">
                <Routes>
                    <Route path="/" element={
                        <>
                            <Hero exchangeRate={exchangeRateBs} />
                            <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                                <div className="flex flex-wrap justify-center gap-4 mb-12">
                                    {['All', ...new Set(services.map(s => s.category))].map(cat => ( 
                                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full border transition-all font-bold tracking-wide ${activeCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:border-indigo-400 hover:text-white'}`}>{cat}</button> 
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {(activeCategory === 'All' ? services : services.filter(s => s.category === activeCategory))
                                    .map((service, idx) => ( 
                                        service.category === 'Exchange' 
                                            ? <ExchangeCard key={`exc-${service.id || idx}`} service={service} addToCart={addToCart} exchangeRate={exchangeRateBs} isAvailable={isExchangeAvailable} /> 
                                            : <ProductCard key={`prod-${service.id || idx}`} service={service} addToCart={addToCart} exchangeRateBs={exchangeRateBs} idx={idx} multipackages={multipackages} /> 
                                    ))}
                                </div>
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
                </Routes>
            </main>

            <CartDrawer 
                isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cart={cart} removeFromCart={removeFromCart} 
                finalTotal={finalTotal} handleCheckoutStart={handleCheckoutStart} 
                requiresGroupLink={requiresGroupLink} paypalData={paypalData} setPaypalData={setPaypalData} coupon={coupon} 
            />

            <footer className="bg-black border-t border-indigo-900/30 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="text-white font-orbitron font-bold text-xl mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">TECNOBYTE</h4>
                        <p className="text-[14px] leading-relaxed">Innovación y seguridad en cada transacción. Tu aliado digital de confianza.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Ayuda</h4>
                        <ul className="space-y-3 text-[14px]">
                            <li className="cursor-pointer hover:text-cyan-400 transition-colors"><a href="/resoluciones" className="block w-full">Centro de Resoluciones</a></li>
                            <li className="cursor-pointer pt-1"><a href="/resoluciones" className="bg-red-600/20 text-red-500 border border-red-500/50 text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all">¡Haz clic aquí!</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Síguenos</h4>
                        <div className="flex gap-4">
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-900 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Facebook size={18} /></a>
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-900 rounded-full hover:bg-pink-600 hover:text-white transition-all"><Instagram size={18} /></a>
                            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-900 rounded-full hover:bg-cyan-600 hover:text-white transition-all"><TikTokIcon /></a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-3 text-[14px]">
                            <li className="cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => setShowTerms(true)}>Términos y Condiciones</li>
                            <li className="cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => setShowPrivacy(true)}>Política de Privacidad</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-gray-900 text-[13px] text-gray-500 font-mono">
                    © {new Date().getFullYear()} TecnoByte LLC. Todos los derechos reservados.
                </div>
            </footer>

            <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Términos y Condiciones" content={legalInfo.terms} />
            <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Política de Privacidad y Aviso Legal" content={legalInfo.privacy} />
            
            {/* AI & Marketing Overlay Components */}
            <TecnoBot />
            <SocialProofPopup />
        </div>
    );
};

// Wrapper para params de React Router
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
