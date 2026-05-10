import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader, Check, AlertTriangle } from 'lucide-react';
import { SERVER_URL } from '../../config/constants';

const OrderVerification = ({ orderId }) => {
    const [status, setStatus] = useState('loading');
    const [data, setData] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                // Consulta 100% real al backend
                const res = await fetch(`${SERVER_URL}/api/get-order?id=${orderId}`);
                const json = await res.json();
                
                if (res.ok && json.success && json.order) {
                    setData(json.order);
                    setStatus('found'); // ORDEN REAL ENCONTRADA
                } else {
                    setStatus('not_found'); // ORDEN FALSA O NO EXISTE
                }
            } catch (e) {
                setStatus('error'); // ERROR DE INTERNET / SERVIDOR CAÍDO
            }
        };
        // Mantenemos 1.5s de retraso para que el usuario pueda apreciar el sistema de seguridad consultando
        setTimeout(verify, 1500); 
    }, [orderId]);

    return (
        <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center p-4 font-sans text-white">
            <div className="max-w-md w-full bg-gray-900 border border-indigo-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(79,70,229,0.15)] text-center animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-600"></div>

                <ShieldCheck size={56} className="mx-auto mb-4 text-indigo-400" />
                <h1 className="text-2xl font-bold font-orbitron mb-2 tracking-wide">SISTEMA DE VERIFICACIÓN</h1>
                <p className="text-gray-400 text-xs mb-8 uppercase tracking-widest">TecnoByte LLC - Red Segura</p>

                <div className="bg-black/50 border border-gray-700 rounded-xl p-5 mb-8 shadow-inner">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">ID de Orden Escaneada</p>
                    <p className="text-2xl font-mono font-bold text-cyan-400 tracking-wider">{orderId}</p>
                </div>

                {status === 'loading' && (
                    <div className="space-y-4 py-4 animate-pulse">
                        <Loader size={36} className="mx-auto text-cyan-400 animate-spin" />
                        <p className="text-sm text-gray-300 font-mono">Consultando base de datos...</p>
                    </div>
                )}

                {status === 'found' && data && (
                    <div className="space-y-4 text-left bg-green-900/10 border border-green-500/30 p-6 rounded-xl animate-scale-in">
                        <div className="flex items-center justify-center gap-2 text-green-400 mb-4 border-b border-green-500/20 pb-3">
                            <Check size={24} strokeWidth={3} />
                            <span className="font-bold tracking-wider">ORDEN AUTÉNTICA</span>
                        </div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Cliente:</span> <span className="text-white font-bold">{data.user}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Fecha:</span> <span className="text-white">{new Date(data.date).toLocaleDateString('es-VE')}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Monto:</span> <span className="text-green-400 font-mono font-bold">${data.total}</span></div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-400">Estado:</span> 
                            {/* Color dinámico dependiendo del estado real */}
                            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${data.status.includes('PENDIENTE') ? 'bg-yellow-600' : 'bg-green-600'}`}>
                                {data.status}
                            </span>
                        </div>
                    </div>
                )}

                {status === 'not_found' && (
                    <div className="space-y-3 text-left bg-red-900/10 border border-red-500/30 p-6 rounded-xl animate-scale-in">
                        <div className="flex items-center justify-center gap-2 text-red-500 mb-2 border-b border-red-500/20 pb-3">
                            <AlertTriangle size={24} strokeWidth={3} />
                            <span className="font-bold tracking-wider">ORDEN NO ENCONTRADA</span>
                        </div>
                        <p className="text-sm text-gray-300 text-center leading-relaxed">Esta orden no existe en nuestra base de datos. Puede tratarse de un código inválido o falso.</p>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="space-y-3 text-left bg-yellow-900/10 border border-yellow-500/30 p-6 rounded-xl animate-scale-in">
                        <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2 border-b border-yellow-500/20 pb-3">
                            <AlertTriangle size={24} strokeWidth={3} />
                            <span className="font-bold tracking-wider">ERROR DE CONEXIÓN</span>
                        </div>
                        <p className="text-sm text-gray-300 text-center leading-relaxed">No pudimos conectar con los servidores en este momento. Intenta de nuevo más tarde.</p>
                    </div>
                )}

                <div className="mt-10">
                    <button onClick={() => window.location.href = '/'} className="px-6 py-2 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-sm transition-all">
                        ← Volver a la tienda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderVerification;
