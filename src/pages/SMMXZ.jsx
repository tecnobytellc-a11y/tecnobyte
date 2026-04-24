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
  Layers
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
        const querySnapshot = await getDocs(collection(db, "smm_service"));
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
      const matchesRefill = !onlyRefillFilter || service.refill === true;

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

  return (
    <div className="min-h-screen bg-[#0f1117] text-white selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
              <Zap className="w-3.5 h-3.5" />
              Panel de Pedidos SMM
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
              TecnoByte <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">SMM</span>
            </h1>
            <p className="text-gray-400 max-w-xl mt-4 text-sm md:text-base leading-relaxed">
              Potencia tu presencia en redes sociales con nuestros servicios automatizados de alta calidad y entrega rápida.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="self-end bg-[#1a1d27] border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400">Mi Saldo:</span>
              <span className="font-bold text-white">${userBalance.toFixed(2)}</span>
            </div>

            <div className="w-full md:w-96 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar servicio o red social..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-[#1a1d27] border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-lg"
              />
            </div>

            <div className="flex gap-2 self-end">
              <button 
                onClick={() => setOnlyRefillFilter(!onlyRefillFilter)}
                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${onlyRefillFilter ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Solo con Refill
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-400 font-medium tracking-wide">Cargando catálogo de servicios de producción...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#1a1d27]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-400" />
                        Categoría
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="block w-full appearance-none bg-[#0f1117] border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                          <option value="">Todas las categorías</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        Servicio
                      </label>
                      <div className="relative">
                        <select
                          value={selectedServiceId}
                          onChange={(e) => setSelectedServiceId(e.target.value)}
                          disabled={filteredServices.length === 0}
                          className="block w-full appearance-none bg-[#0f1117] border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`transition-all duration-500 ease-in-out origin-top ${selectedService ? 'opacity-100 scale-y-100 h-auto' : 'opacity-0 scale-y-0 h-0 overflow-hidden'}`}>
                    <div className="space-y-6 pt-2">
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-emerald-400" />
                            Enlace / URL
                          </label>
                          {lastUsedLink && (
                            <button 
                              type="button" 
                              onClick={() => setLink(lastUsedLink)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
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
                          className="block w-full bg-[#0f1117] border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-400" />
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
                          className="block w-full bg-[#0f1117] border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-4">
                          <input 
                            type="checkbox" 
                            id="dripFeed" 
                            checked={isDripFeed}
                            onChange={(e) => setIsDripFeed(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-700 text-indigo-500 focus:ring-indigo-500 bg-[#0f1117]"
                          />
                          <label htmlFor="dripFeed" className="text-sm font-semibold text-gray-300 flex items-center gap-2 cursor-pointer">
                            <Layers className="w-4 h-4 text-orange-400" />
                            Habilitar Drip-Feed (Entrega por Goteo)
                          </label>
                        </div>

                        {isDripFeed && (
                          <div className="grid grid-cols-2 gap-4 bg-[#0f1117]/50 p-4 rounded-xl border border-gray-800">
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Rondas (Veces)</label>
                              <input 
                                type="number" 
                                min="2" 
                                value={runs} 
                                onChange={(e) => setRuns(parseInt(e.target.value) || 2)}
                                className="w-full bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Intervalo (Minutos)</label>
                              <input 
                                type="number" 
                                min="1" 
                                value={interval} 
                                onChange={(e) => setInterval(parseInt(e.target.value) || 60)}
                                className="w-full bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" 
                              />
                            </div>
                            <div className="col-span-2 text-xs text-indigo-300 text-center bg-indigo-500/10 py-1.5 rounded">
                              Cantidad Total a recibir: <strong>{parseInt(quantity || 0) * runs}</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!isBalanceSufficient}
                        className={`w-full relative group overflow-hidden font-bold text-lg rounded-xl px-6 py-4 transition-all mt-4
                          ${isBalanceSufficient 
                            ? 'bg-white text-black hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]' 
                            : 'bg-red-500/20 text-red-300 cursor-not-allowed border border-red-500/30'
                          }`}
                      >
                        {isBalanceSufficient && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />}
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

            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
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
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-indigo-100">
                    <span>Precio por 1000:</span>
                    <span className="font-bold">${parseFloat(selectedService.price_per_1000 || 0).toFixed(3)}</span>
                  </div>
                )}
              </div>

              {selectedService ? (
                <div className="bg-[#1a1d27]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Info className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">Detalles del Servicio</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedService.id}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleFavorite(selectedService.id)}
                      className={`p-2 rounded-lg border transition-all ${favorites.includes(selectedService.id) ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-[#0f1117] border-gray-700 text-gray-500 hover:text-gray-300'}`}
                    >
                      <Star className={`w-5 h-5 ${favorites.includes(selectedService.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <DetailRow 
                      icon={<Clock className="w-4 h-4 text-blue-400" />}
                      label="Tiempo Estimado"
                      value={selectedService.estimated_time || 'N/A'}
                      highlight
                    />
                    <DetailRow 
                      icon={<Zap className="w-4 h-4 text-yellow-400" />}
                      label="Tiempo de Inicio"
                      value={selectedService.start_time || 'N/A'}
                    />
                    <DetailRow 
                      icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                      label="Tasa de Caída"
                      value={selectedService.drop_rate || 'N/A'}
                    />
                    <DetailRow 
                      icon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
                      label="Garantía (Refill)"
                      value={selectedService.refill ? "Sí, habilitado" : "Sin garantía"}
                      valueColor={selectedService.refill ? "text-emerald-400" : "text-gray-400"}
                    />
                    <DetailRow 
                      icon={<CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      label="Calidad"
                      value={selectedService.quality || 'Estándar'}
                    />
                    {selectedService.server_status && (
                      <DetailRow 
                        icon={<Activity className="w-4 h-4 text-orange-400" />}
                        label="Estado de Red"
                        value={selectedService.server_status}
                        valueColor={selectedService.server_status === "Fluido" ? "text-emerald-400" : selectedService.server_status === "Congestionado" ? "text-red-400" : "text-yellow-400"}
                      />
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {selectedService.description || 'Sin descripción disponible.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a1d27]/40 border border-gray-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[300px]">
                  <AlertCircle className="w-10 h-10 text-gray-600 mb-4" />
                  <p className="text-gray-400 font-medium">Selecciona un servicio para ver sus detalles técnicos e información de entrega.</p>
                </div>
              )}

              <div className="mt-6 space-y-6 text-sm text-gray-400 bg-[#1a1d27]/40 border border-red-900/30 rounded-3xl p-6 md:p-8">
                <div>
                  <h4 className="text-white font-bold mb-3">
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

                <div className="pt-6 border-t border-red-900/30">
                  <h4 className="text-red-400 font-bold mb-3">
                    ⚠ ¡WARNING!
                  </h4>
                  <ul className="space-y-2 pl-2 text-red-200/70">
                    <li>★ Por favor, no realice varios pedidos al mismo tiempo ni utilice varios sitios web simultáneamente. Espere a que el pedido actual se complete antes de realizar uno nuevo en cualquier lugar.</li>
                    <li>★ No se proporciona ninguna garantía para los servicios sin recarga si hay una caída o entrega parcial. Pero si está utilizando servicios de recarga y tiene un problema con la caída o el pedido, abra un ticket de soporte.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value, highlight, valueColor = "text-white" }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-2.5 text-gray-400">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-sm font-semibold ${highlight ? 'bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/20' : valueColor} text-right max-w-[50%] truncate`}>
      {value}
    </span>
  </div>
);

export default SMMXZ;