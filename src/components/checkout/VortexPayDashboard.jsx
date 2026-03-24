import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowDownToLine, Wallet, ShieldCheck, Zap, History, Loader, AlertTriangle, CheckCircle2, Lock, ArrowUpRight, ArrowDownRight, CalendarDays, Eye, X, Copy, Mail, KeyRound, UserCog } from 'lucide-react';
import { auth, db } from '../../pages/firebase'; 
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const VortexPayDashboard = () => { 
    const [activeTab, setActiveTab] = useState('enviar'); 
    const [monto, setMonto] = useState('');
    const [destinatario, setDestinatario] = useState('');
    const [walletBsc, setWalletBsc] = useState('');
    const [codigo2fa, setCodigo2fa] = useState('');
    
    const [status, setStatus] = useState('idle'); 
    const [mensaje, setMensaje] = useState('');
    
    const [transacciones, setTransacciones] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const [detailsModal, setDetailsModal] = useState({ isOpen: false, transaction: null });
    const [is2faActivationModalOpen, setIs2faActivationModalOpen] = useState(false);
    
    const [saldoReal, setSaldoReal] = useState(0);
    const [is2faActive, setIs2faActive] = useState(false);
    
    // === INYECCIÓN: PANTALLA DE CARGA DEL SALDO ===
    const [isLoadingSaldo, setIsLoadingSaldo] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        
                        setSaldoReal(parseFloat(data.saldo_tnb) || 0); 
                        
                        if (data.twoFactorSecret) {
                            setIs2faActive(true); 
                        }
                    }
                } catch (error) {
                    console.error("Error cargando el saldo_tnb:", error);
                } finally {
                    setIsLoadingSaldo(false); // Quitamos la mini pantalla de carga al terminar
                }
            } else {
                setSaldoReal(0);
                setIs2faActive(false);
                setIsLoadingSaldo(false); // Quitamos la carga si no hay usuario
            }
        });

        return () => unsubscribe();
    }, []);

    const numMonto = parseFloat(monto) || 0;
    const comisionP2P = numMonto * 0.015;
    const recibeAmigo = numMonto - comisionP2P;
    const comisionCrypto = (numMonto * 0.054) + 0.33;
    const recibeCrypto = numMonto - comisionCrypto;

    const handleProcesar = async (e) => {
        e.preventDefault();

        if (!auth.currentUser) {
            alert("Debes iniciar sesión.");
            return;
        }

        if (!is2faActive) {
            setIs2faActivationModalOpen(true);
            return; 
        }

        if (numMonto <= 0 || numMonto > saldoReal) {
            alert("Monto inválido o fondos insuficientes en tu cuenta.");
            return;
        }

        if (activeTab === 'retirar' && recibeCrypto <= 0) {
            alert("El monto a retirar debe ser mayor a la comisión de red.");
            return;
        }

        if (codigo2fa.length < 6) {
            alert("Ingresa un código 2FA válido de 6 dígitos.");
            return;
        }

        setStatus('processing');
        
        try {
            const idToken = await auth.currentUser.getIdToken(true);
            // === INYECCIÓN: URL ABSOLUTA DIRECTA AL SERVIDOR ===
            const endpoint = activeTab === 'enviar' 
                ? 'https://api-paypal-secure.vercel.app/api/vortex-pay-transfer' 
                : 'https://api-paypal-secure.vercel.app/api/vortex-pay-withdraw';
                
            const idempotencyKey = crypto.randomUUID(); 
            
            const payload = activeTab === 'enviar' 
                ? { destinatario, monto, codigo2fa, idempotencyKey } 
                : { walletBsc, monto, codigo2fa, idempotencyKey };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                if (activeTab === 'enviar') {
                    setMensaje(`¡Envío exitoso! ID: ${data.txId}. Se han transferido $${recibeAmigo.toFixed(2)} TNB a ${destinatario}. Comisión cobrada: $${comisionP2P.toFixed(2)}`);
                } else {
                    setMensaje(`¡Retiro solicitado! ID: ${data.txId}. $${recibeCrypto.toFixed(2)} USDT en camino a tu billetera BEP20. Un administrador lo procesará tras verificar seguridad.`);
                }
                setSaldoReal(prev => prev - numMonto);
            } else {
                setStatus('idle');
                alert(`Error del Servidor: ${data.message}`);
            }
        } catch (error) {
            console.error("Error en la transacción Vortex Pay:", error);
            setStatus('idle');
            alert("Error de conexión con el protocolo bancario. Revisa tu internet.");
        }
    };

    const cargarHistorialReal = async () => {
        if (!auth.currentUser) return;
        setIsLoadingHistory(true);
        try {
            const q = query(collection(db, "usuarios", auth.currentUser.uid, "historial_vortex_pay"), orderBy("date", "desc"), limit(20));
            const querySnapshot = await getDocs(q);
            const historyData = [];
            
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                historyData.push({
                    ...data,
                    date: data.date && data.date.toDate ? data.date.toDate().toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Reciente'
                });
            });
            setTransacciones(historyData);
        } catch (error) {
            console.error("Error obteniendo el historial real:", error);
        }
        setIsLoadingHistory(false);
    };

    useEffect(() => {
        if (activeTab === 'historial') {
            cargarHistorialReal(); 
        }
    }, [activeTab]);

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copiado al portapapeles.`);
    };

    const resetForm = () => {
        setStatus('idle');
        setMonto('');
        setDestinatario('');
        setWalletBsc('');
        setCodigo2fa('');
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up relative">
            
            {/* CABECERA VORTEX */}
            <div className="bg-gradient-to-r from-[#0a0f18] to-[#11111a] border border-cyan-500/30 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-5">
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
                    {/* === INYECCIÓN: MINI LOADER DE SALDO === */}
                    {isLoadingSaldo ? (
                        <div className="flex justify-center md:justify-end items-center h-10 mt-1">
                            <Loader className="animate-spin text-cyan-400" size={24} />
                        </div>
                    ) : (
                        <p className="text-4xl font-mono font-black text-white">${Number(saldoReal).toFixed(2)}</p>
                    )}
                </div>
            </div>

            {/* SISTEMA DE PESTAÑAS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
                
                <div className="md:col-span-4 space-y-3 shrink-0">
                    <button onClick={() => { setActiveTab('enviar'); resetForm(); }} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'enviar' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 border shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-[#11111a] border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'}`}><Send size={20} /> Enviar a un Amigo</button>
                    <button onClick={() => { setActiveTab('retirar'); resetForm(); }} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'retirar' ? 'bg-green-500/10 border-green-500/50 text-green-400 border shadow-[0_0_20px_rgba(74,222,128,0.15)]' : 'bg-[#11111a] border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'}`}><ArrowDownToLine size={20} /> Retirar a USDT</button>
                    <button onClick={() => { setActiveTab('historial'); resetForm(); }} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'historial' ? 'bg-gray-800 border-gray-600 text-white border shadow-lg' : 'bg-[#11111a] border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'}`}><History size={20} /> Historial Financiero</button>
                    
                    <div className="bg-gradient-to-br from-gray-900 to-[#11111a] border border-gray-800 p-5 rounded-xl mt-6">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={16}/> Protección Bancaria</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">Vortex Pay opera bajo cifrado AES-256. Todo movimiento de fondos requiere autenticación 2FA para proteger tu dinero contra accesos no autorizados.</p>
                    </div>
                </div>

                <div className="md:col-span-8 flex-grow">
                    <AnimatePresence mode="wait">
                        
                        {/* ================= FORMULARIO P2P ================= */}
                        {activeTab === 'enviar' && status === 'idle' && (
                            <motion.div key="enviar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 h-full">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Zap className="text-cyan-400"/> Transferencia Inmediata</h3>
                                <p className="text-sm text-gray-400 mb-8">Envía Saldo a cualquier usuario de la red. Tiempo estimado: Instante.</p>
                                
                                <form onSubmit={handleProcesar} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Destinatario (Correo de TecnoByte)</label>
                                        <input type="email" required placeholder="correo@amigo.com" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                                                <span>Monto a Enviar (USD)</span>
                                                {/* === INYECCIÓN: LOADER EN EL BOTÓN MÁX === */}
                                                <span onClick={() => !isLoadingSaldo && setMonto(saldoReal.toString())} className="text-cyan-400 cursor-pointer hover:underline">Máx: {isLoadingSaldo ? '...' : `$${Number(saldoReal).toFixed(2)}`}</span>
                                            </label>
                                            
                                            <div className="flex items-center w-full bg-black/50 border border-gray-700 rounded-xl px-4 focus-within:border-cyan-500 transition-colors">
                                                <span className="text-gray-400 font-bold text-2xl">$</span>
                                                <input type="number" step="0.01" min="0.10" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full bg-transparent py-4 pl-2 text-white font-mono text-2xl outline-none" />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex flex-col justify-center text-xs">
                                            <div className="flex justify-between text-gray-400 mb-2"><span>Monto bruto:</span> <span>${numMonto.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-red-400 pb-2 border-b border-gray-800"><span>Comisión Vortex (1.5%):</span> <span>-${comisionP2P.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm font-bold text-cyan-400 mt-2"><span>Tu amigo recibe:</span> <span>${recibeAmigo > 0 ? recibeAmigo.toFixed(2) : '0.00'}</span></div>
                                        </div>
                                    </div>

                                    <div className="bg-cyan-900/10 border border-cyan-500/20 p-5 rounded-xl relative">
                                        <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={14}/> Código de Seguridad 2FA</label>
                                        <input type="text" maxLength="6" required placeholder="Ingresa los 6 dígitos" value={codigo2fa} onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-center tracking-[0.5em] text-white font-mono text-xl focus:border-cyan-500 outline-none transition-colors" />
                                    </div>

                                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg mt-4">Procesar Transferencia</button>
                                </form>
                            </motion.div>
                        )}

                        {/* ================= FORMULARIO RETIRO CRYPTO ================= */}
                        {activeTab === 'retirar' && status === 'idle' && (
                            <motion.div key="retirar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 h-full">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><ArrowDownToLine className="text-green-400"/> Retiro a Billetera BSC</h3>
                                <p className="text-sm text-gray-400 mb-8">Convierte tu Saldo a Tether (USDT) a través de la red Binance Smart Chain (BEP20).</p>
                                
                                <form onSubmit={handleProcesar} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dirección USDT (Red BEP20)</label>
                                        <input type="text" required placeholder="Ej: 0x1234abcd..." value={walletBsc} onChange={(e) => setWalletBsc(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white font-mono text-sm focus:border-green-500 outline-none transition-colors" />
                                        <p className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> Verifica bien la dirección. Las transferencias crypto son irreversibles.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                                                <span>Monto a Retirar (USD)</span>
                                                {/* === INYECCIÓN: LOADER EN EL BOTÓN MÁX === */}
                                                <span onClick={() => !isLoadingSaldo && setMonto(saldoReal.toString())} className="text-green-400 cursor-pointer hover:underline">Máx: {isLoadingSaldo ? '...' : `$${Number(saldoReal).toFixed(2)}`}</span>
                                            </label>
                                            
                                            <div className="flex items-center w-full bg-black/50 border border-gray-700 rounded-xl px-4 focus-within:border-green-500 transition-colors">
                                                <span className="text-gray-400 font-bold text-2xl">$</span>
                                                <input type="number" step="0.01" min="10.00" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full bg-transparent py-4 pl-2 text-white font-mono text-2xl outline-none" />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex flex-col justify-center text-xs">
                                            <div className="flex justify-between text-gray-400 mb-2"><span>Retiro bruto:</span> <span>${numMonto.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-red-400 pb-2 border-b border-gray-800"><span>Comisión Red (5.4% + $0.33):</span> <span>-${comisionCrypto.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm font-bold text-green-400 mt-2"><span>Recibes en USDT:</span> <span>{recibeCrypto > 0 ? recibeCrypto.toFixed(2) : '0.00'} USDT</span></div>
                                        </div>
                                    </div>

                                    <div className="bg-green-900/10 border border-green-500/20 p-5 rounded-xl relative">
                                        <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={14}/> Código de Seguridad 2FA</label>
                                        <input type="text" maxLength="6" required placeholder="Ingresa los 6 dígitos" value={codigo2fa} onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-center tracking-[0.5em] text-white font-mono text-xl focus:border-green-500 outline-none transition-colors" />
                                    </div>

                                    <button type="submit" disabled={recibeCrypto <= 0} className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg mt-4">Confirmar Retiro</button>
                                </form>
                            </motion.div>
                        )}

                        {/* ================= HISTORIAL REAL ================= */}
                        {activeTab === 'historial' && (
                            <motion.div key="historial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 h-full space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><History className="text-gray-300"/> Registro Financiero Real</h3>
                                <p className="text-sm text-gray-400 mb-6">Registro auditado de todos tus movimientos en la red.</p>
                                
                                <div className="space-y-3 overflow-y-auto pr-2 hide-scrollbar h-full min-h-[400px]">
                                    {isLoadingHistory ? (
                                        <div className="py-12 flex justify-center"><Loader className="animate-spin text-cyan-400" size={40} /></div>
                                    ) : transacciones.length > 0 ? (
                                        transacciones.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-gray-800 hover:border-gray-700 transition-colors group relative overflow-hidden">
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`p-3 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {tx.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm mb-1">{tx.source}</h4>
                                                        <div className="flex items-center gap-2 text-[10px] font-mono">
                                                            <span className="flex items-center gap-1 text-gray-500"><CalendarDays size={10} /> {tx.date}</span>
                                                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${tx.status === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{tx.status}</span>
                                                            <span className="text-cyan-600">ID: {tx.txId}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`font-mono font-bold text-lg ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                    </div>
                                                    <button onClick={() => setDetailsModal({ isOpen: true, transaction: tx })} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" title="Ver Detalles Profundos"><Eye size={16}/></button>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 pointer-events-none"></div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12"><p className="text-gray-500">No hay movimientos registrados.</p></div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ESTADOS DE PROCESAMIENTO */}
                        {status === 'processing' && (
                            <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#11111a] border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full space-y-4">
                                <Loader className={`animate-spin mb-6 ${activeTab === 'enviar' ? 'text-cyan-400' : 'text-green-400'}`} size={64} />
                                <h3 className="text-2xl font-bold text-white mb-2">Asegurando Bóveda</h3>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto">Validando código 2FA de capa bancaria y blindando fondos a través del protocolo cifrado...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-[#11111a] to-gray-900 border border-gray-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full relative overflow-hidden shadow-green-500/20 shadow-2xl space-y-4">
                                <CheckCircle2 className={`${activeTab === 'enviar' ? 'text-cyan-400' : 'text-green-400'} mb-6 relative z-10`} size={80} strokeWidth={1.5} />
                                <h3 className="text-3xl font-bold text-white mb-4 relative z-10">¡Operación Certificada!</h3>
                                <p className="text-gray-300 font-medium mb-10 relative z-10 max-w-md mx-auto leading-relaxed">{mensaje}</p>
                                <button onClick={resetForm} className="px-10 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors border border-gray-600 relative z-10 shadow-lg uppercase tracking-widest text-sm Finalizar">Finalizar</button>
                                <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* ================= MODAL DE DETALLES PROFUNDO (DRAWER) ================= */}
            <AnimatePresence>
                {detailsModal.isOpen && detailsModal.transaction && (
                    <div className="fixed inset-0 z-[110] flex justify-end bg-black/80 backdrop-blur-sm" onClick={() => setDetailsModal({ isOpen: false })}>
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-lg h-full bg-[#0a0f18] border-l border-gray-800 shadow-2xl p-8 flex flex-col space-y-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800 shrink-0">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-orbitron tracking-wider"><ShieldCheck className="text-cyan-400" /> Detalles del Protocolo</h3>
                                <button onClick={() => setDetailsModal({ isOpen: false })} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800"><X size={20}/></button>
                            </div>

                            <div className="flex-grow space-y-6 overflow-y-auto pr-2 hide-scrollbar">
                                <div className="text-center p-6 bg-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden">
                                    <div className={`inline-flex p-4 rounded-full mb-3 ${detailsModal.transaction.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{detailsModal.transaction.type === 'credit' ? <ArrowDownRight size={32} /> : <ArrowUpRight size={32} />}</div>
                                    <p className="text-sm text-gray-400 mb-1">{detailsModal.transaction.source}</p>
                                    <p className={`text-4xl font-black font-mono ${detailsModal.transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{detailsModal.transaction.type === 'credit' ? '+' : '-'}${detailsModal.transaction.amount.toFixed(2)}</p>
                                    <span className={`mt-3 inline-block text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${detailsModal.transaction.status === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{detailsModal.transaction.status}</span>
                                </div>

                                <div className="space-y-3 bg-[#11111a] p-5 rounded-2xl border border-gray-800">
                                    <div className="flex justify-between items-center text-xs border-b border-gray-800/50 pb-2"><span className="text-gray-500 flex items-center gap-1.5"><CalendarDays size={14}/> Fecha</span> <span className="text-gray-300">{detailsModal.transaction.date}</span></div>
                                    <div className="flex justify-between items-center text-xs"><span className="text-gray-500 flex items-center gap-1.5"><KeyRound size={14}/> ID Único de Protocolo</span> <span className="text-cyan-400 font-mono font-bold">{detailsModal.transaction.txId}</span></div>
                                </div>

                                {detailsModal.transaction.vortexType === 'P2P' && (
                                    <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap size={14} className="text-cyan-400"/> Rastreo P2P</h4>
                                        <div className="text-xs space-y-3">
                                            <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Emisor</span> <span className="text-gray-300">{detailsModal.transaction.emisor}</span></div>
                                            <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Receptor</span> <span className="text-white font-bold">{detailsModal.transaction.recipientDetails || detailsModal.transaction.recipient}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Comisión (1.5%)</span> <span className="text-red-400">-${(detailsModal.transaction.comision || 0).toFixed(3)}</span></div>
                                            <div className="flex justify-between pt-2 border-t border-gray-800 text-sm font-bold text-cyan-400"><span>Tu amigo recibió neto:</span> <span>${(detailsModal.transaction.montoNeto || detailsModal.transaction.amount).toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                )}

                                {detailsModal.transaction.vortexType === 'CRYPTO' && (
                                    <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-1.5"><ArrowDownToLine size={14} className="text-green-400"/> Rastreo Blockchain</h4>
                                        <div className="text-xs space-y-3">
                                            <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Red de Salida</span> <span className="text-gray-300">BEP20</span></div>
                                            <div className="space-y-1.5 border-b border-gray-800 pb-2"><span className="text-gray-500">Dirección de Destino</span> <div className="flex items-center gap-2 bg-black border border-gray-700 p-2 rounded-lg text-sm text-green-400 font-mono break-all">{detailsModal.transaction.walletDestination || detailsModal.transaction.bep20Address} <button onClick={() => copyToClipboard(detailsModal.transaction.walletDestination || detailsModal.transaction.bep20Address, 'Dirección')} className="text-gray-600 hover:text-green-400"><Copy size={12}/></button></div></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Comisión Red (5.4%+$0.33)</span> <span className="text-red-400">-${(detailsModal.transaction.comisionCobrada || detailsModal.transaction.comision).toFixed(2)}</span></div>
                                            <div className="flex justify-between pt-2 border-t border-gray-800 text-sm font-bold text-green-400"><span>Recibiste neto USDT:</span> <span>{(detailsModal.transaction.montoNeto || detailsModal.transaction.netCrypto).toFixed(2)} USDT</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setDetailsModal({ isOpen: false })} className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-widest border border-gray-600 shrink-0">Cerrar Detalles</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ================= MODAL DE REQUISITO DE ACTIVACIÓN DE 2FA ================= */}
            <AnimatePresence>
                {is2faActivationModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0a0f18] border border-yellow-500/50 rounded-2xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] relative overflow-hidden space-y-6">
                            
                            <div className="absolute -left-10 -top-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex justify-between items-center relative z-10 border-b border-gray-800 pb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-orbitron tracking-wider">
                                    <Lock className="text-yellow-400" /> Requisito de Seguridad
                                </h3>
                                <button onClick={() => setIs2faActivationModalOpen(false)} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800"><X size={20}/></button>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4 relative z-10 py-4">
                                <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 mb-2">
                                    <UserCog size={48} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-lg font-bold text-white">Debes activar tu 2FA</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Para garantizar la seguridad bancaria de tu cuenta, Vortex Pay requiere que la Autenticación de Dos Factores (2FA) esté activada antes de realizar cualquier envío o retiro de fondos.
                                </p>
                            </div>

                            <div className="bg-black/50 border border-gray-800 rounded-xl p-5 space-y-3 relative z-10">
                                <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">¿Cómo activarlo?</h5>
                                <div className="flex items-center gap-3 text-xs text-gray-300">
                                    <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center font-bold text-yellow-400">1</span>
                                    Ve a la sección de <strong className="text-white">"Mi Perfil"</strong> en el menú principal.
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-300">
                                    <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center font-bold text-yellow-400">2</span>
                                    Busca la pestaña de <strong className="text-white">"Seguridad Bancaria"</strong>.
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-300">
                                    <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center font-bold text-yellow-400">3</span>
                                    Sigue los pasos para escanear el <strong className="text-white">Código QR</strong> con tu App.
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 relative z-10 border-t border-gray-800">
                                <button onClick={() => setIs2faActivationModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest border border-gray-600 shadow-lg">Entendido</button>
                                <button onClick={() => window.location.href = '/perfil'} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl transition-all text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.3)]">Ir a Mi Perfil</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default VortexPayDashboard;
