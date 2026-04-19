import React, { useEffect, useState } from 'react';

const SMMXZ = () => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const obtenerServicios = async () => {
      try {
        console.log("📡 Intentando conectar con el servidor...");
        
        // IMPORTANTE: Asegúrate de que esta ruta coincida con tu backend
        const res = await fetch('https://api-paypal-secure.vercel.app/api/v2/smm/services');
        
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }

        const json = await res.json();
        console.log("📦 Datos recibidos del backend:", json);

        if (json.success && Array.isArray(json.data)) {
          setServicios(json.data);
        } else {
          console.warn("⚠️ Los datos llegaron pero no tienen el formato esperado o la lista está vacía.");
          setError("No se encontraron servicios en la base de datos.");
        }
      } catch (err) {
        console.error("💥 Error al leer smm_services:", err.message);
        setError("Error de conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    obtenerServicios();
  }, []);

  // Filtrado lógico por nombre o categoría
  const serviciosFiltrados = servicios.filter(s => 
    s.name?.toLowerCase().includes(filtro.toLowerCase()) || 
    s.category?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header Limpio */}
      <header className="border-b border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-black">
              SMMXZ <span className="text-gray-300">HUB</span>
            </h1>
            <p className="text-gray-400 mt-2 font-medium uppercase tracking-widest text-xs">
              TecnoByte Digital Infrastructure
            </p>
          </div>
          <div className="relative w-full md:w-1/3">
            <input 
              type="text" 
              placeholder="Buscar servicio..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando Firebase...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-500 font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-xs underline font-black uppercase"
            >
              Reintentar conexión
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {serviciosFiltrados.map((s) => (
              <div 
                key={s.id} 
                className="group border border-gray-100 rounded-3xl p-8 hover:border-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col"
              >
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-tighter mb-4">
                    {s.category}
                  </span>
                  <h3 className="text-xl font-bold leading-tight text-gray-800 group-hover:text-black transition-colors">
                    {s.name}
                  </h3>
                  
                  {/* El SmmId lo podemos usar para auditoría interna o debug si lo necesitas */}
                  <p className="text-[10px] text-gray-300 mt-2 font-mono">REF: {s.SmmId}</p>

                  <div className="mt-8">
                    <p className="text-xs text-gray-400 font-bold uppercase">Precio Final</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-black">{s.sell_price}</span>
                      <span className="text-sm font-bold text-gray-300">TNB</span>
                    </div>
                  </div>
                </div>
                
                <button className="mt-10 w-full bg-black text-white py-5 rounded-2xl font-black text-sm hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10">
                  ORDENAR AHORA
                </button>
              </div>
            ))}
          </div>
        )}

        {!cargando && serviciosFiltrados.length === 0 && !error && (
          <div className="text-center py-32">
            <p className="text-gray-300 text-lg font-medium">No se encontraron productos en esta categoría.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SMMXZ;
