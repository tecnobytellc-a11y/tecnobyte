import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowDownToLine, Wallet, ShieldCheck, Zap, History, Loader, AlertTriangle, CheckCircle2, Lock, ArrowUpRight, ArrowDownRight, CalendarDays, Eye, X, Copy, Mail, KeyRound } from 'lucide-react';
// import { auth, db } from '../../pages/firebase'; // Descomentar para producción

// 🔥 HELPER: Generador simulado de ID de Transacción Bancaria (Ej: VTX-A1B2-C3D4)
const generateTxId = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'VTX-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    result += '-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

const VortexPayDashboard = ({ saldoTnb = 755.50 }) => {
    const [activeTab, setActiveTab] = useState('enviar');
    const [monto, setMonto] = useState('');
    const [destinatario, setDestinatario] = useState('');
    const [walletBsc, setWalletBsc] = useState('');
    const [codigo2fa, setCodigo2fa] = useState('');
    
    const [status, setStatus] = useState('idle');
    const [mensaje, setMensaje] = useState('');
    
    const [transacciones, setTransacciones] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // --- INYECCIÓN: ESTADOS PARA EL MODAL DE DETALLES PROFUNDO ---
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, transaction: null });

    const numMonto = parseFloat(monto) || 0;
    const comisionP2P = numMonto * 0.015;
    const recibeAmigo = numMonto - comisionP2P;
    const comisionCrypto = (numMonto * 0.054) + 0.33;
    const recibeCrypto = numMonto - comisionCrypto;

    const handleProcesar = async (e) => {
        e.preventDefault();
        if (numMonto <= 0 || numMonto > saldoTnb || codigo2fa.length < 6) return;

        setStatus('processing');
        const txId = generateTxId(); // Generamos el ID único para la simulación

        setTimeout(() => {
            setStatus('success');
            if (activeTab === 'enviar') {
                setMensaje(`¡Envío exitoso! ID: ${txId}. Se han transferido $${recibeAmigo.toFixed(2)} TNB a ${destinatario}.`);
            } else {
                setMensaje(`¡Retiro solicitado! ID: ${txId}. $${recibeCrypto.toFixed(2)} USDT en camino a tu billetera BEP20.`);
            }
        }, 3000);
    };

    const cargarHistorialSimulado = () => {
        setIsLoadingHistory(true);
        setTimeout(() => {
            setTransacciones([
                { 
                    id: 1, 
                    txId: generateTxId(), // ID de 10+ caracteres alfanuméricos
                    type: 'debit', 
                    sourceType: 'P2P',
                    amount: 150.00, 
                    comisionCobrada: 2.25,
                    montoNeto: 147.75,
                    emisor: 'tu_correo@tecnobyte.com',
                    source: 'Envío a jesxsve16@gmail.com', 
                    recipientDetails: 'jesxsve16@gmail.com',
                    date: '23 Mar 2026, 14:35', 
                    status: 'Completado' 
                },
                { 
                    id: 2, 
                    txId: generateTxId(),
                    type: 'credit', 
                    sourceType: 'RECARGA',
                    amount: 500.00, 
                    source: 'Recarga de Saldo TNB', 
                    date: '21 Mar 2026, 09:12', 
                    status: 'Completado' 
                },
                { 
                    id: 3, 
                    txId: generateTxId(),
                    type: 'debit', 
                    sourceType: 'CRYPTO',
                    amount: 200.00, 
                    comisionCobrada: 11.13, // 5.4% + 0.33
                    montoNeto: 188.87,
                    source: 'Retiro USDT (BSC)', 
                    walletDestination: '0x32A4f56dBcB0e45C52Ea4D804664F8eBcBE1D9E7',
                    date: '15 Mar 2026, 18:01', 
                    status: 'Procesando' 
                }
            ]);
            setIsLoadingHistory(false);
        }, 1000);
    };

    useEffect(() => {
        if (activeTab === 'historial') cargarHistorialSimulado();
    }, [activeTab]);

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copiado al portapapeles.`);
    };

    const resetForm = () => {
        setStatus('idle'); setMonto(''); setDestinatario(''); setWalletBsc(''); setCodigo2fa('');
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up relative">
            
            {/* CABECERA VORTEX */}
            <div className="bg-gradient-to-r from-[#0a0f18] to-[#11111a] border border-cyan-500/30 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-5">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-cyan-400 rotate-45 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                        <div className="absolute inset-0 border-2 border-green-400 -rotate-45 rounded-sm shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
                        <span className="font-black text-2xl text-white z-10 font-orbitron">X</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-orbitron text-white tracking-widest">VOR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">TEX</span> Pay</h1>
                        <p className="text-sm text-gray-400 font-medium tracking-wide">Envía, recibe y retira. Así de simple.</p>
                    </div>
                </div>
                <div className="relative z-10 text-center md:text-right bg-black/40 p-5 rounded-2xl border border-gray-800 backdrop-blur-md min-w-[220px]">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center justify-center md:justify-end gap-1"><Wallet size={14} className="text-cyan-400"/> Saldo Disponible</p>
                    <p className="text-4xl font-mono font-black text-white">${Number(saldoTnb).toFixed(2)}</p>
                </div>
            </div>

            {/* SISTEMA DE PESTAÑAS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-3">
                    {['enviar', 'retirar', 'historial'].map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); resetForm(); }} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all uppercase tracking-widest text-xs ${activeTab === tab ? 'bg-gray-800 border border-gray-600 text-white shadow-lg' : 'bg-[#11111a] border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'}`}>
                            {tab === 'enviar' && <Send size={18} />}
                            {tab === 'retirar' && <ArrowDownToLine size={18} />}
                            {tab === 'historial' && <History size={18} />}
                            {tab === 'enviar' ? 'Enviar Saldo P2P' : tab === 'retirar' ? 'Retirar a USDT' : 'Ver Histórico'}
                        </button>
                    ))}
                </div>

                {/* Área Principal */}
                <div className="md:col-span-8">
                    <AnimatePresence mode="wait">
                        {status === 'idle' && activeTab !== 'historial' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    {activeTab === 'enviar' ? <Zap className="text-cyan-400"/> : <ArrowDownToLine className="text-green-400"/>}
                                    {activeTab === 'enviar' ? 'Transferencia P2P Blindada' : 'Retiro Crypto BEP20'}
                                </h3>
                                
                                <form onSubmit={handleProcesar} className="space-y-6">
                                    {activeTab === 'enviar' ? (
                                        <input type="email" required placeholder="Correo del destinatario en TecnoByte" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors" />
                                    ) : (
                                        <input type="text" required placeholder="Dirección USDT (Red BEP20) Ej: 0x..." value={walletBsc} onChange={(e) => setWalletBsc(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm focus:border-green-500 outline-none transition-colors" />
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                                            <input type="number" step="0.01" min="0.10" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-white font-mono text-2xl focus:border-cyan-500 outline-none transition-colors" />
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex flex-col justify-center text-xs">
                                            <div className="flex justify-between text-gray-400 mb-1"><span>Monto bruto:</span> <span>${numMonto.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-red-400 pb-1 border-b border-gray-800">
                                                <span>Comisión {activeTab === 'enviar' ? '(1.5%)' : '(5.4% + $0.33)'}:</span> 
                                                <span>-${(activeTab === 'enviar' ? comisionP2P : comisionCrypto).toFixed(2)}</span>
                                            </div>
                                            <div className={`flex justify-between font-bold mt-1 ${activeTab === 'enviar' ? 'text-cyan-400' : 'text-green-400'}`}>
                                                <span>{activeTab === 'enviar' ? 'Recibe amigo' : 'Recibes USDT'}:</span> 
                                                <span>${(activeTab === 'enviar' ? recibeAmigo : recibeCrypto).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black border border-gray-700 p-5 rounded-xl">
                                        <label className="block text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={14}/> Autenticación 2FA Obligatoria</label>
                                        <input type="text" maxLength="6" required placeholder="Código de 6 dígitos" value={codigo2fa} onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))} className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-center tracking-[0.5em] text-white font-mono text-xl focus:border-cyan-500 outline-none transition-colors" />
                                    </div>

                                    <button type="submit" className={`w-full ${activeTab === 'enviar' ? 'bg-cyan-500' : 'bg-green-500'} text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg mt-4`}>
                                        Ejecutar Protocolo de {activeTab === 'enviar' ? 'Envío' : 'Retiro'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* ================= HISTORIAL CON INYECCIONES ================= */}
                        {activeTab === 'historial' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-8 h-full min-h-[500px]">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><History className="text-gray-300"/> Registro de Protocolos</h3>
                                <div className="space-y-3">
                                    {isLoadingHistory ? (
                                        <div className="py-12 flex justify-center"><Loader className="animate-spin text-cyan-400" size={40} /></div>
                                    ) : transacciones.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-gray-800 hover:border-gray-700 transition-colors group relative overflow-hidden">
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`p-3 rounded-lg ${tx.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {tx.type === 'credit' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-sm mb-1">{tx.source}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] font-mono">
                                                        <span className="text-gray-500">{tx.date}</span>
                                                        {/* INYECCIÓN: Visualización del ID de Transacción */}
                                                        <span className="text-cyan-600">ID: {tx.txId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* INYECCIÓN: Lado derecho con Monto y Botón de Ojo */}
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`font-mono font-bold text-lg ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                </div>
                                                {/* INYECCIÓN: Botón Ver Detalles (Ojo) */}
                                                <button 
                                                    onClick={() => setDetailsModal({ isOpen: true, transaction: tx })}
                                                    className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                                    title="Ver Detalles Completos"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                            {/* Efecto de fondo al hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ESTADOS DE PROCESAMIENTO */}
                        {status === 'processing' && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                                <Loader className={`animate-spin mb-6 ${activeTab === 'enviar' ? 'text-cyan-400' : 'text-green-400'}`} size={64} />
                                <h3 className="text-2xl font-bold text-white mb-2 font-orbitron tracking-widest">Ejecutando Blindaje</h3>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto">Verificando 2FA y asegurando fondos en el protocolo de capa 2...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-[#11111a] to-gray-900 border border-green-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px] relative overflow-hidden shadow-green-500/20 shadow-2xl">
                                <CheckCircle2 className={`${activeTab === 'enviar' ? 'text-cyan-400' : 'text-green-400'} mb-6 relativa z-10`} size={80} strokeWidth={1.5} />
                                <h3 className="text-3xl font-bold text-white mb-4 relativa z-10">¡Operación Certificada!</h3>
                                <p className="text-gray-300 font-medium mb-10 relativa z-10 max-w-md mx-auto leading-relaxed">{mensaje}</p>
                                <button onClick={resetForm} className="px-10 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors border border-gray-600 relativa z-10 shadow-lg uppercase tracking-widest text-sm">Finalizar</button>
                                <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ================= INYECCIÓN: MODAL DE DETALLES PROFUNDO (DRAWER) ================= */}
            <AnimatePresence>
                {detailsModal.isOpen && detailsModal.transaction && (
                    <div className="fixed inset-0 z-[110] flex justify-end bg-black/80 backdrop-blur-sm" onClick={() => setDetailsModal({ isOpen: false })}>
                        {/* Contenedor del Drawer */}
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-lg h-full bg-[#0a0f18] border-l border-gray-800 shadow-2xl p-8 flex flex-col"
                            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro
                        >
                            {/* Cabecera */}
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="text-cyan-400" /> Detalles del Protocolo
                                </h3>
                                <button onClick={() => setDetailsModal({ isOpen: false })} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800"><X size={20}/></button>
                            </div>

                            {/* Contenido Dinámico */}
                            <div className="flex-grow space-y-6 overflow-y-auto pr-2 hide-scrollbar">
                                {/* Encabezado Principal */}
                                <div className="text-center p-6 bg-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden">
                                    <div className="absolute -left-10 -top-10 opacity-5">
                                        {detailsModal.transaction.type === 'credit' ? <ArrowDownRight size={120} className="text-green-500" /> : <ArrowUpRight size={120} className="text-red-500" />}
                                    </div>
                                    <div className={`inline-flex p-4 rounded-full mb-3 ${detailsModal.transaction.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {detailsModal.transaction.type === 'credit' ? <ArrowDownRight size={32} /> : <ArrowUpRight size={32} />}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1">{detailsModal.transaction.source}</p>
                                    <p className={`text-4xl font-black font-mono ${detailsModal.transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                        {detailsModal.transaction.type === 'credit' ? '+' : '-'}${detailsModal.transaction.amount.toFixed(2)}
                                    </p>
                                    <span className={`mt-3 inline-block text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${detailsModal.transaction.status === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{detailsModal.transaction.status}</span>
                                </div>

                                {/* Datos Básicos */}
                                <div className="space-y-3 bg-[#11111a] p-5 rounded-2xl border border-gray-800">
                                    <DetailItem label="Fecha y Hora" value={detailsModal.transaction.date} icon={CalendarDays} />
                                    
                                    {/* ID DE TRANSACCIÓN BANCARIA */}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                        <span className="text-xs text-gray-500 flex items-center gap-1.5"><KeyRound size={14}/> ID de Transacción</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono text-cyan-400 font-bold">{detailsModal.transaction.txId}</span>
                                            <button onClick={() => copyToClipboard(detailsModal.transaction.txId, 'ID')} className="text-gray-600 hover:text-cyan-400"><Copy size={12}/></button>
                                        </div>
                                    </div>
                                </div>

                                {/* --- INYECCIÓN DE LÓGICA CONDICIONAL P2P --- */}
                                {detailsModal.transaction.sourceType === 'P2P' && (
                                    <div className="space-y-4 bg-gray-900 p-5 rounded-2xl border border-gray-800">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Rastreo P2P</h4>
                                        <DetailItem label="Emisor" value={detailsModal.transaction.emisor} icon={Mail} />
                                        
                                        {/* CORREO AL CUAL ENVIÉ */}
                                        <DetailItem label="Receptor (Correo)" value={detailsModal.transaction.recipientDetails} icon={Mail} highlight />

                                        <div className="border-t border-gray-800 pt-4 mt-4 space-y-2 text-xs">
                                            <div className="flex justify-between text-gray-400"><span>Monto Bruto:</span> <span>${detailsModal.transaction.amount.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-red-400"><span>Comisión Vortex (1.5%):</span> <span>-${detailsModal.transaction.comisionCobrada.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-cyan-400 font-bold text-sm"><span>Monto Neto Recibido:</span> <span>${detailsModal.transaction.montoNeto.toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                )}

                                {/* --- INYECCIÓN DE LÓGICA CONDICIONAL CRYPTO --- */}
                                {detailsModal.transaction.sourceType === 'CRYPTO' && (
                                    <div className="space-y-4 bg-gray-900 p-5 rounded-2xl border border-gray-800">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Detalles de Retiro Blockchain</h4>
                                        <DetailItem label="Red de Salida" value="Binance Smart Chain (BEP20)" />
                                        
                                        {/* CUENTA BEP20 A LA CUAL ENVIÉ */}
                                        <div className="space-y-2">
                                            <span className="text-xs text-gray-500">Dirección BEP20 de Destino</span>
                                            <div className="flex items-center gap-3 bg-black border border-gray-700 p-3 rounded-lg text-sm text-green-400 font-mono break-all">
                                                {detailsModal.transaction.walletDestination}
                                                <button onClick={() => copyToClipboard(detailsModal.transaction.walletDestination, 'Dirección')} className="text-gray-600 hover:text-green-400 flex-shrink-0"><Copy size={14}/></button>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-800 pt-4 mt-4 space-y-2 text-xs">
                                            <div className="flex justify-between text-gray-400"><span>Monto Bruto TNB:</span> <span>${detailsModal.transaction.amount.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-red-400"><span>Comisión Red (5.4% + $0.33):</span> <span>-${detailsModal.transaction.comisionCobrada.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-green-400 font-bold text-sm"><span>Monto Neto Recibido USDT:</span> <span>{detailsModal.transaction.montoNeto.toFixed(2)} USDT</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón de cierre inferior */}
                            <button onClick={() => setDetailsModal({ isOpen: false })} className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-widest border border-gray-600 shadow-lg">
                                Cerrar Detalles
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Componente pequeño reutilizable para los items de detalle
const DetailItem = ({ label, value, icon: Icon, highlight = false }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
        <span className="text-xs text-gray-500 flex items-center gap-1.5">{Icon && <Icon size={14}/>} {label}</span>
        <span className={`text-sm font-medium ${highlight ? 'text-white font-bold' : 'text-gray-300'}`}>{value}</span>
    </div>
);

export default VortexPayDashboard;
