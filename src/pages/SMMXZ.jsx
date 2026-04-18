import React, { useEffect, useState } from 'react';

const SMMXZ = () => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const obtenerServicios = async () => {
      try {
        const res = await fetch('/api/v2/smm/services');
        const json = await res.json();
        if (json.success) {
          setServicios(json.data);
        }
      } catch (error) {
        console.error("Error al conectar con el puente SMMXZ");
      } finally {
        setCargando(false);
      }
    };
    obtenerServicios();
  }, []);

  const serviciosFiltrados = servicios.filter(s => 
    s.name.toLowerCase().includes(filtro.toLowerCase()) || 
    s.category.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header Estilo TecnoByte White */}
      <header className="border-b border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black">SMM <span className="text-gray-400">BRIDGE</span></h1>
            <p className="text-gray-500 font-medium">Infraestructura global de servicios digitales.</p>
          </div>
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar servicio (ej. Instagram, TikTok...)" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-all"
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Sincronizando Base de Datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {serviciosFiltrados.map((s) => (
              <div key={s.id} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-black hover:shadow-2xl hover:shadow-gray-100 transition-all duration-300 flex flex-col">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{s.category}</span>
                  <h3 className="text-lg font-bold leading-tight text-gray-800 group-hover:text-black">{s.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-black">{s.sell_price}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">TNB</span>
                  </div>
                </div>
                
                <button className="mt-8 w-full bg-black text-white py-4 rounded-xl font-black text-sm hover:bg-gray-800 transform active:scale-95 transition-all">
                  ADQUIRIR SERVICIO
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SMMXZ;
