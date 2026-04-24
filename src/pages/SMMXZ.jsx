import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from './firebase'; // Configuración de Firebase de TecnoByte
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
// HOOK DE PRODUCCIÓN: Extracción de smm_service
// ==========================================
const useServices = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Acceso directo a la colección smm_service
        const querySnapshot = await getDocs(collection(db, "smm_service"));
        const servicesList = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            // Aseguramos que la categoría exista para evitar bloqueos en el UI
            category: docData.category || "Sin Categoría"
          };
        });
        setData(servicesList);
      } catch (error) {
        console.error("Error al obtener smm_service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return { services: data, loading };
};

// ==========================================
// COMPONENTE PRINCIPAL SMM
// ==========================================
const SMMXZ = () => {
  const { services, loading } = useServices();

  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");

  const [userBalance, setUserBalance] = useState(0); 
  const [lastUsedLink, setLastUsedLink] = useState(""); 
  const [isDripFeed, setIsDripFeed] = useState(false); 
  const [runs, setRuns] = useState(2); 
  const [interval, setInterval] = useState(60); 
  const [onlyRefillFilter, setOnlyRefillFilter] = useState(false); 
  const [favorites, setFavorites] = useState([]); 

  // Inyección de Favicon oficial
  useEffect(() => {
    let faviconTag = document.querySelector("link[rel~='icon']");
    if (!faviconTag) {
      faviconTag = document.createElement('link');
      faviconTag.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(faviconTag);
    }
    faviconTag.href = '/favicon.ico';
  }, []);

  // Conexión en tiempo real al saldo_tnb del usuario
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'usuario', user.uid);
        const unsubscribeDb = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Mapeo dinámico del saldo real
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

  // EXTRACCIÓN DINÁMICA DE CATEGORÍAS (Solución al bloqueo)
  const categories = useMemo(() => {
    if (!services.length) return [];
    // Extrae categorías únicas de los documentos de smm_service
    const cats = new Set(services.map(s => s.category));
    return Array.from(cats).filter(c => c).sort();
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
    
    let cost = (qty / 1000) * (selectedService.price_per_1000 || 0);
    
    if (isDripFeed && runs > 1) {
      cost = cost * runs;
    }

    return cost.toFixed(4); 
  }, [selectedService, quantity, isDripFeed, runs]);

  const isBalanceSufficient = parseFloat(totalCost) <= userBalance;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!selectedService) return;
    
    const qtyNum = parseInt(quantity, 10);
    if (!link.trim() || !qtyNum || !isBalanceSufficient) return;

    console.log("Orden enviada a producción:", {
      serviceId: selectedService.id,
      link,
      quantity: qtyNum,
      cost: totalCost,
      isDripFeed,
      runs: isDripFeed ? runs : 1
    });

    alert("¡Pedido realizado correctamente!");
    setLastUsedLink(link);
    setLink("");
    setQuantity("");
    setSelectedServiceId("");
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
              <Zap className="w-3.5 h-3.5" />
              Servicios Reales Activos
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
              TecnoByte <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">SMM</span>
            </h1>
          </div>

          <div className="flex flex-col gap-3">
            <div className="self-end bg-[#1a1d27] border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400">Saldo TNB:</span>
              <span className="font-bold text-white">${userBalance.toFixed(2)}</span>
            </div>

            <div className="w-full md:w-96 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Buscar en smm_service..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-[#1a1d27] border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-indigo-400">
            <div className="w-10 h-10 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Sincronizando con smm_service...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#1a1d27]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8">
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
                          className="block w-full appearance-none bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer"
                        >
                          <option value="">{categories.length > 0 ? "Selecciona Categoría" : "Cargando categorías..."}</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
                          className="block w-full appearance-none bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">Seleccione un servicio de la lista...</option>
                          {filteredServices.map(srv => (
                            <option key={srv.id} value={srv.id}>
                              {srv.name} (${srv.price_per_1000}/k)
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {selectedService && (
                    <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-emerald-400" />
                            Enlace de Destino
                          </label>
                        </div>
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder={selectedService.link_format || "https://..."}
                          className="block w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-400" />
                            Cantidad {isDripFeed && "(Goteo)"}
                          </label>
                          <span className="text-xs text-gray-500">
                            Rango: {selectedService.min_quantity} - {selectedService.max_quantity}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder={`Mínimo: ${selectedService.min_quantity}`}
                          className="block w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-4">
                          <input 
                            type="checkbox" 
                            id="dripFeed" 
                            checked={isDripFeed}
                            onChange={(e) => setIsDripFeed(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-700 text-indigo-500 bg-[#0f1117]"
                          />
                          <label htmlFor="dripFeed" className="text-sm font-semibold text-gray-300 flex items-center gap-2 cursor-pointer">
                            <Layers className="w-4 h-4 text-orange-400" />
                            Habilitar Drip-Feed
                          </label>
                        </div>

                        {isDripFeed && (
                          <div className="grid grid-cols-2 gap-4 bg-[#0f1117]/50 p-4 rounded-xl border border-gray-800">
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Rondas</label>
                              <input 
                                type="number" 
                                value={runs} 
                                onChange={(e) => setRuns(parseInt(e.target.value) || 1)}
                                className="w-full bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Minutos</label>
                              <input 
                                type="number" 
                                value={interval} 
                                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                                className="w-full bg-[#1a1d27] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" 
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!isBalanceSufficient}
                        className={`w-full font-bold text-lg rounded-xl px-6 py-4 transition-all
                          ${isBalanceSufficient 
                            ? 'bg-white text-black hover:bg-gray-200' 
                            : 'bg-red-500/20 text-red-300 cursor-not-allowed border border-red-500/30'
                          }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isBalanceSufficient ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          {isBalanceSufficient ? 'Procesar Pedido Real' : 'Saldo Insuficiente'}
                        </span>
                      </button>
                    </div>
                  )}

                </form>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <h3 className="text-indigo-100 font-medium text-sm flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4" />
                  Costo de Transacción
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black tracking-tight ${isBalanceSufficient ? 'text-white' : 'text-red-300'}`}>
                    ${totalCost}
                  </span>
                  <span className="text-indigo-200 font-medium uppercase">usd</span>
                </div>
              </div>

              {selectedService ? (
                <div className="bg-[#1a1d27]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <Info className="w-6 h-6 text-indigo-400" />
                      <div>
                        <h3 className="text-lg font-bold text-white">Detalles Técnicos</h3>
                        <p className="text-xs text-gray-500">Documento: {selectedService.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <DetailRow label="Tiempo Estimado" value={selectedService.estimated_time || 'Variable'} />
                    <DetailRow label="Garantía" value={selectedService.refill ? "Habilitada" : "No disponible"} />
                    <DetailRow label="Calidad" value={selectedService.quality || 'Real'} />
                    <DetailRow label="Estado" value="Producción" valueColor="text-emerald-400" />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-400 italic">
                    {selectedService.description || "Sin descripción adicional en la base de datos."}
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a1d27]/40 border border-gray-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[200px]">
                  <p className="text-gray-500">Selecciona un servicio para extraer su información de Firestore.</p>
                </div>
              )}

              <div className="space-y-6 text-sm text-gray-400 bg-[#1a1d27]/40 border border-red-900/30 rounded-3xl p-6">
                <h4 className="text-white font-bold uppercase tracking-wider">Advertencias de Producción:</h4>
                <ul className="space-y-3 list-disc pl-4 text-xs">
                  <li>No realice varios pedidos al mismo tiempo para el mismo enlace.</li>
                  <li>Si el destino es privado o el enlace cambia, el sistema no puede procesar el reembolso.</li>
                  <li>La velocidad de entrega es real y depende de la carga actual de los servidores.</li>
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, valueColor = "text-white" }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-400">{label}</span>
    <span className={`text-sm font-semibold ${valueColor} truncate max-w-[60%]`}>{value}</span>
  </div>
);

export default SMMXZ;