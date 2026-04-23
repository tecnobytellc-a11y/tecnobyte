import React, { useState, useEffect, useMemo } from 'react';
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
  Package
} from 'lucide-react';

// ==========================================
// MOCK DATA & CUSTOM HOOK (Ready for Production API)
// ==========================================
const MOCK_SERVICES = [
  {
    id: 1,
    category: "Instagram",
    name: "Instagram Likes [High Quality]",
    price_per_1000: 0.50,
    min_quantity: 100,
    max_quantity: 10000,
    estimated_time: "5-10 minutos",
    link_format: "https://instagram.com/p/...",
    drop_rate: "5%",
    refill: true,
    start_time: "Instantáneo",
    quality: "Alta",
    description: "Likes de perfiles reales y activos. Entrega rápida y segura para el algoritmo de Instagram."
  },
  {
    id: 2,
    category: "Instagram",
    name: "Instagram Followers [Guaranteed]",
    price_per_1000: 2.10,
    min_quantity: 50,
    max_quantity: 50000,
    estimated_time: "1-2 horas",
    link_format: "https://instagram.com/usuario",
    drop_rate: "0-2%",
    refill: true,
    start_time: "0-1 hora",
    quality: "Premium",
    description: "Seguidores de alta retención con garantía de reposición de 30 días. Ideales para cuentas comerciales."
  },
  {
    id: 3,
    category: "TikTok",
    name: "TikTok Views [Fast]",
    price_per_1000: 0.01,
    min_quantity: 500,
    max_quantity: 1000000,
    estimated_time: "1 minuto",
    link_format: "https://vm.tiktok.com/...",
    drop_rate: "0%",
    refill: false,
    start_time: "Instantáneo",
    quality: "Intermedia",
    description: "Vistas ultra rápidas para impulsar tu video en la sección 'Para Ti' de TikTok."
  },
  {
    id: 4,
    category: "TikTok",
    name: "TikTok Followers [Real]",
    price_per_1000: 3.50,
    min_quantity: 100,
    max_quantity: 20000,
    estimated_time: "12-24 horas",
    link_format: "https://tiktok.com/@usuario",
    drop_rate: "10%",
    refill: true,
    start_time: "0-6 horas",
    quality: "Alta",
    description: "Seguidores de perfiles mundiales. Puede haber una ligera caída inicial cubierta por la garantía."
  },
  {
    id: 5,
    category: "YouTube",
    name: "YouTube Subscribers [No Drop]",
    price_per_1000: 15.00,
    min_quantity: 100,
    max_quantity: 5000,
    estimated_time: "24-48 horas",
    link_format: "https://youtube.com/channel/...",
    drop_rate: "0%",
    refill: true,
    start_time: "12-24 horas",
    quality: "Premium",
    description: "Suscriptores seguros, 100% orgánicos visualmente y sin caídas. Perfectos para alcanzar los requisitos de monetización."
  },
  {
    id: 6,
    category: "Spotify",
    name: "Spotify Monthly Listeners [Premium]",
    price_per_1000: 4.20,
    min_quantity: 1000,
    max_quantity: 100000,
    estimated_time: "1-3 días",
    link_format: "https://open.spotify.com/artist/...",
    drop_rate: "2%",
    refill: true,
    start_time: "24 horas",
    quality: "Premium",
    description: "Oyentes mensuales de cuentas premium, mejoran tu posicionamiento en recomendaciones y playlists algorítmicas."
  }
];

// Reemplazar el interior de fetchServices con la llamada a la API real cuando esté disponible.
const useServices = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // SIMULACIÓN DE LATENCIA DE RED PARA PRODUCCIÓN
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // PARA CONECTAR A LA API REAL:
        // const res = await fetch('https://api-paypal-secure.vercel.app/api/v2/smm/services');
        // const json = await res.json();
        // setData(json.data);
        
        setData(MOCK_SERVICES);
      } catch (error) {
        console.error("Error fetching services:", error);
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

  // 1. Obtener lista de categorías únicas de forma dinámica
  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category));
    return Array.from(cats).sort();
  }, [services]);

  // 2. Filtrar servicios en base a la categoría seleccionada Y la búsqueda global
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = globalSearch === "" || 
        service.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        service.category.toLowerCase().includes(globalSearch.toLowerCase());
      
      const matchesCategory = selectedCategory === "" || service.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, globalSearch, selectedCategory]);

  // 3. Obtener el objeto del servicio seleccionado actualmente
  const selectedService = useMemo(() => {
    return services.find(s => s.id.toString() === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  // 4. Lógica de limpieza: si cambia la categoría, deseleccionamos el servicio actual
  // para forzar al usuario a elegir uno de la nueva categoría.
  useEffect(() => {
    setSelectedServiceId("");
    setQuantity("");
    setLink("");
  }, [selectedCategory]);

  // 5. Cálculo estricto del Costo Total en tiempo real
  // Fórmula: (Cantidad / 1000) * Precio_por_1000
  const totalCost = useMemo(() => {
    if (!selectedService || !quantity || isNaN(quantity)) return "0.000";
    const qty = parseInt(quantity, 10);
    if (qty < 0) return "0.000";
    const cost = (qty / 1000) * selectedService.price_per_1000;
    return cost.toFixed(4); // 4 decimales para mayor precisión en SMM
  }, [selectedService, quantity]);

  // Manejo de la orden
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
      alert(`La cantidad debe estar entre ${selectedService.min_quantity} y ${selectedService.max_quantity}.`);
      return;
    }

    // Aquí iría la llamada a la API para crear la orden
    console.log("Nueva Orden Creada:", {
      serviceId: selectedService.id,
      link,
      quantity: qtyNum,
      cost: totalCost
    });

    alert("¡Orden procesada con éxito! (Modo Desarrollo)");
    setLink("");
    setQuantity("");
    setSelectedServiceId("");
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Area */}
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

          {/* Módulo 1: Búsqueda Global */}
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
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-400 font-medium tracking-wide">Cargando catálogo de servicios...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Formulario Principal (Left Column) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#1a1d27]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Módulo 2: Categorías */}
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

                    {/* Módulo 3: Servicios */}
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

                  {/* Mostrar campos de link y cantidad SOLO si hay un servicio seleccionado */}
                  <div className={`transition-all duration-500 ease-in-out origin-top ${selectedService ? 'opacity-100 scale-y-100 h-auto' : 'opacity-0 scale-y-0 h-0 overflow-hidden'}`}>
                    <div className="space-y-6 pt-2">
                      {/* Módulo 4: Link */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-emerald-400" />
                          Enlace / URL
                        </label>
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder={selectedService?.link_format || "https://..."}
                          className="block w-full bg-[#0f1117] border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>

                      {/* Módulo 5: Cantidad */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-400" />
                            Cantidad
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

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full relative group overflow-hidden bg-white text-black font-bold text-lg rounded-xl px-6 py-4 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] mt-4"
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Confirmar Pedido
                        </span>
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>

            {/* Panel de Detalles (Right Column) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Módulo 7: Costo Total Destacado */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-indigo-100 font-medium text-sm flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4" />
                  Costo Total a Descontar
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tight">${totalCost}</span>
                  <span className="text-indigo-200 font-medium">USD</span>
                </div>
                
                {selectedService && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-indigo-100">
                    <span>Precio por 1000:</span>
                    <span className="font-bold">${selectedService.price_per_1000.toFixed(3)}</span>
                  </div>
                )}
              </div>

              {/* Módulo 8 & 6: Detalles del Servicio y Tiempo */}
              {selectedService ? (
                <div className="bg-[#1a1d27]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">Detalles del Servicio</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedService.id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <DetailRow 
                      icon={<Clock className="w-4 h-4 text-blue-400" />}
                      label="Tiempo Estimado"
                      value={selectedService.estimated_time}
                      highlight
                    />
                    <DetailRow 
                      icon={<Zap className="w-4 h-4 text-yellow-400" />}
                      label="Tiempo de Inicio"
                      value={selectedService.start_time}
                    />
                    <DetailRow 
                      icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                      label="Tasa de Caída"
                      value={selectedService.drop_rate}
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
                      value={selectedService.quality}
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {selectedService.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a1d27]/40 border border-gray-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[300px]">
                  <AlertCircle className="w-10 h-10 text-gray-600 mb-4" />
                  <p className="text-gray-400 font-medium">Selecciona un servicio para ver sus detalles técnicos e información de entrega.</p>
                </div>
              )}
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