import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from './firebase'; // IMPORTANTE: Ajusta esta ruta a tu archivo de configuración de Firebase
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Search, 
  ChevronDown, 
  Link as LinkIcon, 
  Hash, 
  Clock, 
  Wallet, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  TrendingUp,
  Package,
  Star,
  Activity,
  History,
  Filter,
  Layers,
  Menu,
  X,
  ShoppingCart,
  CreditCard,
  Code,
  FileText,
  HelpCircle,
  MessageSquare,
  List
} from 'lucide-react';

// ==========================================
// CUSTOM HOOK: Conectado a Producción (Firebase)
// ==========================================
const useServices = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "smm_services"));
        const servicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(servicesList);
      } catch (error) {
        console.error("Error al obtener los servicios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return { services: data, loading };
};

// ==========================================
// COMPONENT MAIN
// ==========================================
const SMMXZ = () => {
  const { services, loading } = useServices();

  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");

  // ESTADOS DE PRODUCCIÓN
  const [userBalance, setUserBalance] = useState(0); 
  const [lastUsedLink, setLastUsedLink] = useState(""); 
  const [isDripFeed, setIsDripFeed] = useState(false); 
  const [runs, setRuns] = useState(2); 
  const [interval, setInterval] = useState(60); 
  const [onlyRefillFilter, setOnlyRefillFilter] = useState(false); 
  const [favorites, setFavorites] = useState([]); 

  // NUEVOS ESTADOS: Navegación y Menú
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("new_order"); // 'new_order', 'history', 'tickets'
  
  // Estados para Tickets
  const [ticketOrderNumber, setTicketOrderNumber] = useState("");
  const [ticketReason, setTicketReason] = useState("");

  // Lógica de Favicon para esta ruta
  useEffect(() => {
    let faviconTag = document.querySelector("link[rel~='icon']");
    if (!faviconTag) {
      faviconTag = document.createElement('link');
      faviconTag.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(faviconTag);
    }
    faviconTag.href = '/favicon.ico';
  }, []);

  // Lógica de Saldo Real (Firebase Auth + Firestore)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'usuario', user.uid);
        const unsubscribeDb = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserBalance(data.saldo_tnb ? parseFloat(data.saldo_tnb) : 0);
          }
        });
        return () => unsubscribeDb();
      } else {
        setUserBalance(0);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category));
    return Array.from(cats).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = globalSearch === "" || 
        (service.name && service.name.toLowerCase().includes(globalSearch.toLowerCase())) ||
        (service.category && service.category.toLowerCase().includes(globalSearch.toLowerCase()));
      
      const matchesCategory = selectedCategory === "" || service.category === selectedCategory;
      const matchesRefill = !onlyRefillFilter || (service.refill === true || service.refill === "true");

      return matchesSearch && matchesCategory && matchesRefill;
    });
  }, [services, globalSearch, selectedCategory, onlyRefillFilter]);

  const selectedService = useMemo(() => {
    return services.find(s => s.id.toString() === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  useEffect(() => {
    setSelectedServiceId("");
    setQuantity("");
    setLink("");
    setIsDripFeed(false); 
  }, [selectedCategory]);

  const totalCost = useMemo(() => {
    if (!selectedService || !quantity || isNaN(quantity)) return "0.000";
    const qty = parseInt(quantity, 10);
    if (qty < 0) return "0.000";
    
    let cost = (qty / 1000) * selectedService.price_per_1000;
    
    if (isDripFeed && runs > 1) {
      cost = cost * runs;
    }

    return cost.toFixed(4); 
  }, [selectedService, quantity, isDripFeed, runs]);

  const isBalanceSufficient = parseFloat(totalCost) <= userBalance;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!selectedService) {
      alert("Selecciona un servicio primero.");
      return;
    }
    if (!link.trim()) {
      alert("El enlace es obligatorio.");
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (!qtyNum || qtyNum < selectedService.min_quantity || qtyNum > selectedService.max_quantity) {
      alert(`La cantidad base debe estar entre ${selectedService.min_quantity} y ${selectedService.max_quantity}.`);
      return;
    }
    if (!isBalanceSufficient) {
      alert("Saldo insuficiente para completar esta orden.");
      return;
    }

    console.log("Nueva Orden Lista Para Enviar:", {
      serviceId: selectedService.id,
      link,
      quantity: qtyNum,
      cost: totalCost,
      isDripFeed,
      runs: isDripFeed ? runs : 1,
      interval: isDripFeed ? interval : 0
    });

    alert("¡Orden procesada con éxito!");
    setLastUsedLink(link);
    setLink("");
    setQuantity("");
    setSelectedServiceId("");
    setIsDripFeed(false);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketOrderNumber.trim() || !ticketReason.trim()) {
      alert("Por favor completa el número de orden y el motivo.");
      return;
    }
    console.log("Ticket enviado:", { order: ticketOrderNumber, reason: ticketReason });
    alert("Ticket abierto correctamente. Te responderemos pronto.");
    setTicketOrderNumber("");
    setTicketReason("");
  };

  // Claves conocidas para no repetirlas en la extracción de datos "extras"
  const knownKeys = ['id', 'name', 'category', 'price_per_1000', 'min_quantity', 'max_quantity', 'link_format', 'description', 'estimated_time', 'start_time', 'drop_rate', 'refill', 'quality', 'server_status', 'drip_feed', 'cancel', 'type', 'before'];
  
  // Extraer cualquier otro dato que exista en el documento y no esté en la lista de arriba
  const extraDetails = selectedService ? Object.keys(selectedService).filter(key => !knownKeys.includes(key)) : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-indigo-500/30 font-sans">
      
      {/* MENÚ LATERAL (SIDEBAR) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-indigo-600">TecnoByte <span className="text-gray-800">Panel</span></h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                <SidebarItem icon={<ShoppingCart />} label="Nuevo Pedido" active={currentView === "new_order"} onClick={() => {setCurrentView("new_order"); setIsSidebarOpen(false);}} />
                <SidebarItem icon={<List />} label="Servicios y Precios" onClick={() => {alert("Próximamente: Vista de precios"); setIsSidebarOpen(false);}} />
                <SidebarItem icon={<History />} label="Historial de Pedidos" active={currentView === "history"} onClick={() => {setCurrentView("history"); setIsSidebarOpen(false);}} />
                <SidebarItem icon={<CreditCard />} label="Añadir Saldo" onClick={() => {alert("Próximamente: Pasarela de pago"); setIsSidebarOpen(false);}} />
                <SidebarItem icon={<MessageSquare />} label="Soporte / Tickets" active={currentView === "tickets"} onClick={() => {setCurrentView("tickets"); setIsSidebarOpen(false);}} />
                <SidebarItem icon={<Code />} label="API para Desarrolladores" onClick={() => {alert("Próximamente: Documentación API"); setIsSidebarOpen(false);}} />
                <SidebarItem icon={<FileText />} label="Términos de Servicio" onClick={() => {alert("Próximamente: Términos"); setIsSidebarOpen(false);}} />
                <SidebarItem icon={<HelpCircle />} label="Preguntas Frecuentes" onClick={() => {alert("Próximamente: FAQ"); setIsSidebarOpen(false);}} />
              </nav>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">TB</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Usuario Activo</p>
                  <p className="text-xs text-gray-500">Saldo: ${userBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SUPERIOR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 hidden sm:block">
              TecnoByte <span className="text-indigo-600">SMM</span>
            </h1>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-3">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-500 font-medium">Mi Saldo:</span>
            <span className="font-bold text-gray-900">${userBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* VISTA: HISTORIAL DE PEDIDOS */}
        {currentView === "history" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Historial de Pedidos</h2>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                      <th className="p-4 font-semibold">ID Orden</th>
                      <th className="p-4 font-semibold">Servicio</th>
                      <th className="p-4 font-semibold">Enlace</th>
                      <th className="p-4 font-semibold">Cantidad</th>
                      <th className="p-4 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder para datos reales de Firebase de pedidos */}
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-500">
                        <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>No tienes pedidos recientes.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: TICKETS DE SOPORTE */}
        {currentView === "tickets" && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Soporte Técnico</h2>
            <p className="text-gray-500 mb-8">Abre un ticket si tienes problemas con alguna orden específica de tu historial.</p>
            
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <form onSubmit={handleTicketSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Número de Orden SMM</label>
                  <input
                    type="text"
                    value={ticketOrderNumber}
                    onChange={(e) => setTicketOrderNumber(e.target.value)}
                    placeholder="Ej: 84729"
                    className="block w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Motivo / Problema</label>
                  <textarea
                    value={ticketReason}
                    onChange={(e) => setTicketReason(e.target.value)}
                    placeholder="Describe el problema (ej: El pedido aparece como completado pero no llegaron los seguidores...)"
                    rows={4}
                    className="block w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl px-6 py-4 transition-all shadow-md hover:shadow-lg"
                >
                  Abrir Ticket de Soporte
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VISTA: PANEL PRINCIPAL (NUEVO PEDIDO) */}
        {currentView === "new_order" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-2">
                  Crear <span className="text-indigo-600">Nuevo Pedido</span>
                </h2>
                <p className="text-gray-500 max-w-xl mt-2 text-sm md:text-base leading-relaxed">
                  Selecciona la categoría, el servicio e ingresa tu enlace para procesar la orden inmediatamente.
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="w-full md:w-96 relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar servicio o red social..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>

                <div className="flex gap-2 self-end">
                  <button 
                    onClick={() => setOnlyRefillFilter(!onlyRefillFilter)}
                    className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${onlyRefillFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Solo con Refill
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-600 font-medium tracking-wide">Cargando catálogo de servicios...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLUMNA IZQUIERDA: FORMULARIO */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Package className="w-4 h-4 text-indigo-500" />
                            Categoría
                          </label>
                          <div className="relative">
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="block w-full appearance-none bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                              <option value="">Todas las categorías</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            Servicio
                          </label>
                          <div className="relative">
                            <select
                              value={selectedServiceId}
                              onChange={(e) => setSelectedServiceId(e.target.value)}
                              disabled={filteredServices.length === 0}
                              className="block w-full appearance-none bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                              <option value="">
                                {filteredServices.length === 0 ? "No hay servicios..." : "Seleccione un servicio..."}
                              </option>
                              {filteredServices.map(srv => (
                                <option key={srv.id} value={srv.id}>
                                  {srv.id} - {srv.name} (${srv.price_per_1000}/k)
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`transition-all duration-500 ease-in-out origin-top ${selectedService ? 'opacity-100 scale-y-100 h-auto' : 'opacity-0 scale-y-0 h-0 overflow-hidden'}`}>
                        <div className="space-y-6 pt-2">
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-emerald-500" />
                                Enlace / URL
                              </label>
                              {lastUsedLink && (
                                <button 
                                  type="button" 
                                  onClick={() => setLink(lastUsedLink)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors font-medium"
                                >
                                  <History className="w-3.5 h-3.5" />
                                  Usar último enlace
                                </button>
                              )}
                            </div>
                            <input
                              type="url"
                              value={link}
                              onChange={(e) => setLink(e.target.value)}
                              placeholder={selectedService?.link_format || "https://..."}
                              className="block w-full bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-blue-500" />
                                Cantidad {isDripFeed && "(Por entrega)"}
                              </label>
                              {selectedService && (
                                <span className="text-xs text-gray-500 font-medium">
                                  Min: {selectedService.min_quantity} - Max: {selectedService.max_quantity}
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              min={selectedService?.min_quantity}
                              max={selectedService?.max_quantity}
                              placeholder={`Ej: ${selectedService?.min_quantity || 1000}`}
                              className="block w-full bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                          </div>

                          <div className="pt-2">
                            <div className="flex items-center gap-2 mb-4">
                              <input 
                                type="checkbox" 
                                id="dripFeed" 
                                checked={isDripFeed}
                                onChange={(e) => setIsDripFeed(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"
                              />
                              <label htmlFor="dripFeed" className="text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-pointer select-none">
                                <Layers className="w-4 h-4 text-orange-500" />
                                Habilitar Drip-Feed (Entrega por Goteo)
                              </label>
                            </div>

                            {isDripFeed && (
                              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div>
                                  <label className="text-xs text-gray-600 mb-1 block font-medium">Rondas (Veces)</label>
                                  <input 
                                    type="number" 
                                    min="2" 
                                    value={runs} 
                                    onChange={(e) => setRuns(parseInt(e.target.value) || 2)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" 
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 mb-1 block font-medium">Intervalo (Minutos)</label>
                                  <input 
                                    type="number" 
                                    min="1" 
                                    value={interval} 
                                    onChange={(e) => setInterval(parseInt(e.target.value) || 60)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" 
                                  />
                                </div>
                                <div className="col-span-2 text-xs text-indigo-800 text-center bg-indigo-100 py-2 rounded-lg font-medium">
                                  Cantidad Total a recibir: <strong className="text-indigo-900 text-sm">{parseInt(quantity || 0) * runs}</strong>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={!isBalanceSufficient}
                            className={`w-full relative overflow-hidden font-bold text-lg rounded-xl px-6 py-4 transition-all mt-4 shadow-md
                              ${isBalanceSufficient 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-[0.99]' 
                                : 'bg-red-50 text-red-400 cursor-not-allowed border border-red-200 shadow-none'
                              }`}
                          >
                            <span className="relative flex items-center justify-center gap-2">
                              {isBalanceSufficient ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                              {isBalanceSufficient ? 'Confirmar Pedido' : 'Saldo Insuficiente'}
                            </span>
                          </button>
                        </div>
                      </div>

                    </form>
                  </div>
                </div>

                {/* COLUMNA DERECHA: DETALLES Y COSTOS */}
                <div className="lg:col-span-5 space-y-6">
                  
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-8 shadow-lg relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <h3 className="text-indigo-100 font-medium text-sm flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4" />
                      Costo Total a Descontar
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-black tracking-tight ${isBalanceSufficient ? 'text-white' : 'text-red-300'}`}>
                        ${totalCost}
                      </span>
                      <span className="text-indigo-200 font-medium">USD</span>
                    </div>
                    
                    {selectedService && (
                      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm text-indigo-100">
                        <span>Precio por 1000:</span>
                        <span className="font-bold bg-white/20 px-2 py-1 rounded">${parseFloat(selectedService.price_per_1000 || 0).toFixed(3)}</span>
                      </div>
                    )}
                  </div>

                  {selectedService ? (
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
                      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <Info className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">Detalles del Servicio</h3>
                            <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedService.id}</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => toggleFavorite(selectedService.id)}
                          className={`p-2 rounded-lg border transition-all ${favorites.includes(selectedService.id) ? 'bg-yellow-50 border-yellow-200 text-yellow-500' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                        >
                          <Star className={`w-5 h-5 ${favorites.includes(selectedService.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* LISTA COMPLETA DE DETALLES DEL DOCUMENTO */}
                      <div className="space-y-4">
                        <DetailRow icon={<Clock className="w-4 h-4 text-blue-500" />} label="Tiempo Estimado" value={selectedService.estimated_time ?? 'N/A'} highlight />
                        <DetailRow icon={<Zap className="w-4 h-4 text-yellow-500" />} label="Tiempo de Inicio" value={selectedService.start_time ?? 'N/A'} />
                        <DetailRow icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} label="Tasa de Caída" value={selectedService.drop_rate ?? 'N/A'} />
                        <DetailRow icon={<CheckCircle2 className="w-4 h-4 text-cyan-500" />} label="Calidad" value={selectedService.quality ?? 'N/A'} />
                        
                        {/* Datos solicitados explícitamente */}
                        <DetailRow 
                          icon={<ShieldCheck className="w-4 h-4 text-purple-500" />} 
                          label="Garantía (Refill)" 
                          value={String(selectedService.refill) === "true" || selectedService.refill === true ? "Sí, habilitado" : "Sin garantía"} 
                          valueColor={String(selectedService.refill) === "true" || selectedService.refill === true ? "text-emerald-600" : "text-gray-500"} 
                        />
                        <DetailRow icon={<Layers className="w-4 h-4 text-orange-500" />} label="Drip-feed" value={String(selectedService.drip_feed) === "true" || selectedService.drip_feed === true ? "Soportado" : "No soportado"} />
                        <DetailRow icon={<AlertCircle className="w-4 h-4 text-red-500" />} label="Cancelación" value={String(selectedService.cancel) === "true" || selectedService.cancel === true ? "Permitida" : "No permitida"} />
                        <DetailRow icon={<Package className="w-4 h-4 text-indigo-500" />} label="Tipo (Type)" value={selectedService.type ?? 'N/A'} />
                        <DetailRow icon={<Clock className="w-4 h-4 text-gray-500" />} label="Previo (Before)" value={selectedService.before ?? 'N/A'} />
                        
                        {selectedService.server_status && (
                          <DetailRow 
                            icon={<Activity className="w-4 h-4 text-orange-500" />} 
                            label="Estado de Red" 
                            value={selectedService.server_status} 
                            valueColor={selectedService.server_status === "Fluido" ? "text-emerald-600" : selectedService.server_status === "Congestionado" ? "text-red-500" : "text-yellow-600"} 
                          />
                        )}

                        {/* EXTRACCIÓN DINÁMICA DE CUALQUIER OTRO DATO QUE ESTÉ EN EL DOCUMENTO */}
                        {extraDetails.map(key => (
                          <DetailRow 
                            key={key}
                            icon={<Hash className="w-4 h-4 text-gray-400" />} 
                            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')} 
                            value={String(selectedService[key])} 
                          />
                        ))}
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                          <span className="text-indigo-600 font-bold block mb-1">Descripción:</span>
                          {selectedService.description || 'Sin descripción disponible en la base de datos.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[300px]">
                      <AlertCircle className="w-10 h-10 text-gray-400 mb-4" />
                      <p className="text-gray-500 font-medium">Selecciona un servicio para extraer y ver **todos** sus detalles técnicos y de entrega.</p>
                    </div>
                  )}

                  <div className="mt-6 space-y-6 text-sm text-gray-600 bg-red-50 border border-red-100 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div>
                      <h4 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-red-500" />
                        DETALLES A CONSIDERAR:
                      </h4>
                      <ul className="space-y-2 pl-2">
                        <li>✶ Si el video se elimina después de realizar un pedido, no hay reembolso en este caso.</li>
                        <li>✶ Tenga en cuenta: la hora de inicio y la velocidad de entrega pueden fluctuar dependiendo de la carga del servidor.</li>
                        <li>✶ Normalmente no hay caídas o hay pocas caídas, pero una actualización de la plataforma puede cambiar esta realidad.</li>
                        <li>✶ No se proporcionarán reembolsos, recargas ni soporte si el enlace se cambia o se elimina.</li>
                        <li>✶ Sin embargo, tenga en cuenta que estas son solo estimaciones.</li>
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-red-200">
                      <h4 className="text-red-600 font-bold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        ¡ADVERTENCIA!
                      </h4>
                      <ul className="space-y-2 pl-2 text-red-800">
                        <li>★ Por favor, no realice varios pedidos al mismo tiempo ni utilice varios sitios web simultáneamente. Espere a que el pedido actual se complete antes de realizar uno nuevo en cualquier lugar.</li>
                        <li>★ No se proporciona ninguna garantía para los servicios sin recarga si hay una caída o entrega parcial. Pero si está utilizando servicios de recarga y tiene un problema, abra un ticket de soporte.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// COMPONENTE PARA ITEMS DEL SIDEBAR
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-semibold
      ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
  >
    <div className={`${active ? 'text-indigo-600' : 'text-gray-400'}`}>
      {icon}
    </div>
    {label}
  </button>
);

// COMPONENTE DE FILA DE DETALLE AJUSTADO PARA TEMA CLARO
const DetailRow = ({ icon, label, value, highlight, valueColor = "text-gray-900" }) => (
  <div className="flex items-center justify-between group py-1">
    <div className="flex items-center gap-2.5 text-gray-600">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-sm font-bold ${highlight ? 'bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100' : valueColor} text-right max-w-[50%] truncate`}>
      {value}
    </span>
  </div>
);

export default SMMXZ;