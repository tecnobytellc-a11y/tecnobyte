import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowDownToLine, Wallet, ShieldCheck, Zap, History, Loader, AlertTriangle, CheckCircle2, Lock, ArrowUpRight, ArrowDownRight, CalendarDays } from 'lucide-react';
import { auth, db } from '../../pages/firebase'; // Ajusta la ruta según tu proyecto
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const VortexPayDashboard = ({ saldoTnb = 150.00 }) => { // Saldo simulado para pruebas
    const [activeTab, setActiveTab] = useState('enviar'); // 'enviar', 'retirar', 'historial'
    const [monto, setMonto] = useState('');
    const [destinatario, setDestinatario] = useState('');
    const [walletBsc, setWalletBsc] = useState('');
    const [codigo2fa, setCodigo2fa] = useState('');
    
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [mensaje, setMensaje] = useState('');
    
    const [transacciones, setTransacciones] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Matemáticas de Comisiones en Tiempo Real
    const numMonto = parseFloat(monto) || 0;
    
    // P2P: 1.5%
    const comisionP2P = numMonto * 0.015;
    const recibeAmigo = numMonto - comisionP2P;

    // Crypto: 5.4% + $0.33
    const comisionCrypto = (numMonto * 0.054) + 0.33;
    const recibeCrypto = numMonto - comisionCrypto;

    const handleProcesar = async (e) => {
        e.preventDefault();

        if (numMonto <= 0 || numMonto > saldoTnb) {
            alert("Monto inválido o fondos insuficientes.");
            return;
        }

        if (activeTab === 'retirar' && recibeCrypto <= 0) {
            alert("El monto a retirar debe ser mayor a la comisión.");
            return;
        }

        if (codigo2fa.length < 6) {
            alert("Ingresa un código 2FA válido de 6 dígitos.");
            return;
        }

        setStatus('processing');
        
        // Aquí irá la llamada blindada al backend en el futuro. 
        // Por ahora simulamos el tiempo de proceso bancario.
        setTimeout(() => {
            setStatus('success');
            if (activeTab === 'enviar') {
                setMensaje(`¡Envío exitoso! Se han transferido $${recibeAmigo.toFixed(2)} TNB a ${destinatario}. Comisión cobrada: $${comisionP2P.toFixed(2)}`);
            } else {
                setMensaje(`¡Retiro solicitado! $${recibeCrypto.toFixed(2)} USDT en camino a tu billetera BEP20. Un administrador lo procesará tras verificar seguridad.`);
            }
        }, 3000);
    };

    const cargarHistorialFalso = () => {
        setIsLoadingHistory(true);
        setTimeout(() => {
            setTransacciones([
                { id: 1, type: 'debit', amount: 15.00, source: 'Envío a Jesus_Ve', date: '23 Mar 2026', status: 'Completado' },
                { id: 2, type: 'credit', amount: 50.00, source: 'Recarga de Saldo TNB', date: '21 Mar 2026', status: 'Completado' },
                { id: 3, type: 'debit', amount: 100.00, source: 'Retiro USDT (BSC)', date: '15 Mar 2026', status: 'Procesando' }
            ]);
            setIsLoadingHistory(false);
        }, 1000);
    };

    useEffect(() => {
        if (activeTab === 'historial') {
            cargarHistorialFalso(); // Reemplazar por Firebase luego
        }
    }, [activeTab]);

    const resetForm = () => {
        setStatus('idle');
        setMonto('');
        setDestinatario('');
        setWalletBsc('');
        setCodigo2fa('');
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
            
            {/* CABECERA VORTEX */}
            <div className="bg-gradient-to-r from-[#0a0f18] to-[#11111a] border border-cyan-500/30 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Efectos de fondo neón */}
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-5">
                    {/* Logo Visual (Rombos Cruzados) */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-cyan-400 rotate-45 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                        <div className="absolute inset-0 border-2 border-green-400 -rotate-45 rounded-sm shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
                        <span className="font-black text-2xl text-white z-10 font-orbitron">X</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-orbitron text-white tracking-widest">
                            VOR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">TEX</span>
                        </h1>
                        <p className="text-sm text-gray-400 font-medium tracking-wide">Envía, recibe y retira. Así de simple.</p>
                    </div>
                </div>

                <div className="relative z-10 text-center md:text-right bg-black/40 p-5 rounded-2xl border border-gray-800 backdrop-blur-md min-w-[220px]">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center justify-center md:justify-end gap-1">
                        <Wallet size={14} className="text-cyan-400"/> Saldo Disponible
                    </p>
                    <p className="text-4xl font-mono font-black text-white">${Number(saldoTnb).toFixed(2)}</p>
                </div>
            </div>

            {/* SISTEMA DE PESTAÑAS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Menú Lateral */}
                <div className="md:col-span-4 space-y-3">
                    <button 
                        onClick={() => { setActiveTab('enviar'); resetForm(); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'enviar' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 border shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-[#11111a] border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                    >
                        <Send size={20} /> Enviar a un Amigo
                    </button>

                    <button 
                        onClick={() => { setActiveTab('retirar'); resetForm(); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'retirar' ? 'bg-green-500/10 border-green-500/50 text-green-400 border shadow-[0_0_20px_rgba(74,222,128,0.15)]' : 'bg-[#11111a] border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                    >
                        <ArrowDownToLine size={20} /> Retirar a USDT
                    </button>

                    <button 
                        onClick={() => { setActiveTab('historial'); resetForm(); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'historial' ? 'bg-gray-800 border-gray-600 text-white border shadow-lg' : 'bg-[#11111a] border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                    >
                        <History size={20} /> Historial Financiero
                    </button>
                    
                    {/* Caja de Seguridad */}
                    <div className="bg-gradient-to-br from-gray-900 to-[#11111a] border border-gray-800 p-5 rounded-xl mt-6">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={16}/> Protección Bancaria</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                            Vortex Pay opera bajo cifrado AES-256. Todo movimiento de fondos requiere autenticación 2FA para proteger tu dinero contra accesos no autorizados.
                        </p>
                    </div>
                </div>

                {/* Área Principal (Formularios y Vistas) */}
                <div className="md:col-span-8">
                    <AnimatePresence mode="wait">
                        
                        {/* ================= FORMULARIO P2P ================= */}
                        {activeTab === 'enviar' && status === 'idle' && (
                            <motion.div key="enviar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Zap className="text-cyan-400"/> Transferencia Inmediata</h3>
                                <p className="text-sm text-gray-400 mb-8">Envía Saldo a cualquier usuario de la red. Tiempo estimado: Instante.</p>
                                
                                <form onSubmit={handleProcesar} className="space-y-6">
                                    {/* Destinatario */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Destinatario (Correo de TecnoByte)</label>
                                        <input type="email" required placeholder="correo@amigo.com" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors" />
                                    </div>

                                    {/* Monto y Desglose */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                                                <span>Monto a Enviar (USD)</span>
                                                <span onClick={() => setMonto(saldoTnb.toString())} className="text-cyan-400 cursor-pointer hover:underline">Máx: ${saldoTnb.toFixed(2)}</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                                                <input type="number" step="0.01" min="0.10" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-white font-mono text-2xl focus:border-cyan-500 outline-none transition-colors" />
                                            </div>
                                        </div>
                                        
                                        {/* Ticket de Resumen Matemático */}
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex flex-col justify-center">
                                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                                <span>Monto bruto:</span> <span>${numMonto.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-red-400/80 mb-2 border-b border-gray-800 pb-2">
                                                <span>Comisión Vortex (1.5%):</span> <span>-${comisionP2P.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold text-cyan-400">
                                                <span>Tu amigo recibe:</span> <span>${recibeAmigo > 0 ? recibeAmigo.toFixed(2) : '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campo 2FA Obligatorio */}
                                    <div className="bg-cyan-900/10 border border-cyan-500/20 p-5 rounded-xl">
                                        <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={14}/> Código de Seguridad 2FA</label>
                                        <input type="text" maxLength="6" required placeholder="Ingresa los 6 dígitos" value={codigo2fa} onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-center tracking-[0.5em] text-white font-mono text-xl focus:border-cyan-500 outline-none transition-colors" />
                                    </div>

                                    <button type="submit" disabled={!monto || !destinatario || codigo2fa.length < 6} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-4">
                                        Procesar Transferencia
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* ================= FORMULARIO RETIRO CRYPTO ================= */}
                        {activeTab === 'retirar' && status === 'idle' && (
                            <motion.div key="retirar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><ArrowDownToLine className="text-green-400"/> Retiro a Billetera BSC</h3>
                                <p className="text-sm text-gray-400 mb-8">Convierte tu Saldo a Tether (USDT) a través de la red Binance Smart Chain (BEP20).</p>
                                
                                <form onSubmit={handleProcesar} className="space-y-6">
                                    {/* Wallet */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dirección USDT (Red BEP20)</label>
                                        <input type="text" required placeholder="Ej: 0x1234abcd..." value={walletBsc} onChange={(e) => setWalletBsc(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm focus:border-green-500 outline-none transition-colors" />
                                        <p className="text-[10px] text-yellow-500 mt-2 flex items-center gap-1"><AlertTriangle size={12}/> Verifica bien la dirección. Las transferencias crypto son irreversibles.</p>
                                    </div>

                                    {/* Monto y Desglose */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                                                <span>Monto a Retirar (USD)</span>
                                                <span onClick={() => setMonto(saldoTnb.toString())} className="text-green-400 cursor-pointer hover:underline">Máx: ${saldoTnb.toFixed(2)}</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                                                <input type="number" step="0.01" min="10.00" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-white font-mono text-2xl focus:border-green-500 outline-none transition-colors" />
                                            </div>
                                        </div>
                                        
                                        {/* Ticket de Resumen Matemático Crypto */}
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex flex-col justify-center">
                                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                                <span>Retiro bruto:</span> <span>${numMonto.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-red-400/80 mb-2 border-b border-gray-800 pb-2">
                                                <span>Comisión de Red (5.4% + $0.33):</span> <span>-${comisionCrypto.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold text-green-400">
                                                <span>Recibes en USDT:</span> <span>{recibeCrypto > 0 ? recibeCrypto.toFixed(2) : '0.00'} USDT</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campo 2FA Obligatorio */}
                                    <div className="bg-green-900/10 border border-green-500/20 p-5 rounded-xl">
                                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={14}/> Código de Seguridad 2FA</label>
                                        <input type="text" maxLength="6" required placeholder="Ingresa los 6 dígitos" value={codigo2fa} onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-center tracking-[0.5em] text-white font-mono text-xl focus:border-green-500 outline-none transition-colors" />
                                    </div>

                                    <button type="submit" disabled={!monto || !walletBsc || codigo2fa.length < 6 || recibeCrypto <= 0} className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] mt-4">
                                        Confirmar Retiro
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* ================= HISTORIAL ================= */}
                        {activeTab === 'historial' && (
                            <motion.div key="historial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 h-full min-h-[500px]">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><History className="text-gray-300"/> Movimientos Financieros</h3>
                                <p className="text-sm text-gray-400 mb-6">Registro de todos tus envíos y retiros de Vortex Pay.</p>

                                <div className="space-y-3">
                                    {isLoadingHistory ? (
                                        <div className="py-12 flex justify-center"><Loader className="animate-spin text-cyan-400" size={40} /></div>
                                    ) : transacciones.length > 0 ? (
                                        transacciones.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-gray-800 hover:border-gray-700 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {tx.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm mb-1">{tx.source}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono"><CalendarDays size={10} /> {tx.date}</span>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${tx.status === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{tx.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`font-mono font-bold text-lg ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No hay movimientos recientes.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ================= ESTADOS DE PROCESAMIENTO ================= */}
                        {status === 'processing' && (
                            <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                                <Loader className={`animate-spin mb-6 ${activeTab === 'enviar' ? 'text-cyan-400' : 'text-green-400'}`} size={64} />
                                <h3 className="text-2xl font-bold text-white mb-2">Asegurando Transacción</h3>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto">Validando código 2FA y asegurando los fondos a través del protocolo cifrado...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-[#11111a] to-gray-900 border border-gray-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px] relative overflow-hidden">
                                <CheckCircle2 className={`${activeTab === 'enviar' ? 'text-cyan-400' : 'text-green-400'} mb-6 relative z-10`} size={80} />
                                <h3 className="text-3xl font-bold text-white mb-4 relative z-10">¡Operación Aprobada!</h3>
                                <p className="text-gray-300 font-medium mb-10 relative z-10 max-w-md mx-auto leading-relaxed">{mensaje}</p>
                                <button onClick={resetForm} className="px-10 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors border border-gray-600 relative z-10 shadow-lg uppercase tracking-widest text-sm">
                                    Finalizar
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VortexPayDashboard;
