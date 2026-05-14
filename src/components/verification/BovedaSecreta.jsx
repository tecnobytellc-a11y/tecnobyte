import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, Key, Copy } from 'lucide-react';
import api from '../../utils/api';

const BovedaSecreta = ({ cofreId }) => {
    const [estado, setEstado] = useState('cargando');
    const [datos, setDatos] = useState(null);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const revelarCodigo = async () => {
            try {
                const res = await api.post('/reloadly/abrir-cofre', { cofre: cofreId });
                const json = res.data;
                
                if (json.success && json.datos) {
                    setDatos(json.datos);
                    setEstado('exito');
                } else {
                    setMensaje(json.mensaje || "El cofre no se pudo abrir.");
                    setEstado('error');
                }
            } catch (e) {
                setMensaje("Error de conexión con la bóveda segura.");
                setEstado('error');
            }
        };
        setTimeout(revelarCodigo, 1500); // Pequeño delay para efecto visual de seguridad
    }, [cofreId]);

    return (
        <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center p-4 font-sans text-white">
            <div className="max-w-md w-full bg-gray-900 border border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.2)] text-center animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-600"></div>
                
                <h1 className="text-2xl font-bold font-orbitron mb-2 tracking-wide text-cyan-400">BÓVEDA SECRETA</h1>
                <p className="text-gray-400 text-xs mb-8 uppercase tracking-widest">Entrega de Producto Digital</p>

                {estado === 'cargando' && (
                    <div className="space-y-4 py-8 animate-pulse">
                        <Lock size={48} className="mx-auto text-indigo-400 animate-bounce" />
                        <p className="text-sm text-gray-300 font-mono">Desencriptando bóveda de un solo uso...</p>
                    </div>
                )}

                {estado === 'exito' && datos && (
                    <div className="animate-scale-in">
                        <div className="bg-red-900/40 border-l-4 border-red-500 p-3 mb-6 text-left rounded">
                            <p className="text-red-400 font-bold text-[11px] uppercase flex items-center gap-1">
                                <AlertTriangle size={14}/> ¡Atención! No recargues la página
                            </p>
                            <p className="text-red-300 text-[10px] mt-1 leading-relaxed">
                                Este enlace se ha autodestruido por seguridad. Copia tu PIN ahora. Si sales, se perderá para siempre.
                            </p>
                        </div>

                        <p className="text-gray-300 text-sm mb-2">Producto: <span className="font-bold text-white">{datos.producto}</span></p>
                        
                        <div className="flex items-center justify-between gap-3 bg-black/80 py-4 px-4 rounded-xl border border-cyan-500/50 shadow-inner mb-4">
                            <Key className="text-indigo-400 flex-shrink-0" size={24} />
                            <span className="text-xl sm:text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 select-all break-all">
                                {datos.pin}
                            </span>
                            <button onClick={() => navigator.clipboard.writeText(datos.pin)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-cyan-400 border border-gray-600 flex-shrink-0">
                                <Copy size={20} />
                            </button>
                        </div>

                        {datos.serial && datos.serial !== "N/A" && (
                            <p className="text-xs text-gray-500">Serial: {datos.serial}</p>
                        )}
                    </div>
                )}

                {estado === 'error' && (
                    <div className="space-y-3 py-6">
                        <AlertTriangle size={48} className="mx-auto text-red-500" />
                        <p className="text-sm text-red-400 font-bold uppercase">{mensaje}</p>
                        <p className="text-[11px] text-gray-400">Si crees que esto es un error, contacta a soporte técnico.</p>
                    </div>
                )}

                <div className="mt-8">
                    <button onClick={() => window.location.href = '/'} className="px-6 py-2 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-sm transition-all">
                        ← Volver a la tienda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BovedaSecreta;
