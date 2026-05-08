import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowDownToLine, Wallet, ShieldCheck, Zap, History, Loader, AlertTriangle, CheckCircle2, Lock, ArrowUpRight, ArrowDownRight, CalendarDays, Eye, X, Copy, Mail, KeyRound, UserCog } from 'lucide-react';
import { auth, db } from '../../pages/firebase'; 
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import axios from 'axios';
import VortexWelcomeScreen from './VortexWelcomeScreen';

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
    const [twoFactorType, setTwoFactorType] = useState(null); 
    const [isSendingEmail, setIsSendingEmail] = useState(false); 
    const [emailSentMessage, setEmailSentMessage] = useState('');
    
    // === INYECCIÓN: ESTADOS NUEVOS KYC y WELCOME ===
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [hasKyc, setHasKyc] = useState(false);
    const [isLoadingKyc, setIsLoadingKyc] = useState(false);

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
                            setTwoFactorType(data.twoFactorType || 'app');
                        }
                        
                        setHasKyc(data.kyc_verificado === true);
                        setIsFirstVisit(data.is_first_vortex_visit !== false);
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

const handleRequestEmailCode = async () => {
        if (!auth.currentUser) return;
        setIsSendingEmail(true);
        setEmailSentMessage('');

        try {
            const res = await axios.post('https://api-paypal-secure.vercel.app/api/2fa-email-generate', {
                userId: auth.currentUser.uid,
                email: auth.currentUser.email
            });

            if (res.data.success) {
                setEmailSentMessage('✅ Código enviado a tu correo.');
            } else {
                setEmailSentMessage('❌ Error: ' + res.data.message);
            }
        } catch (error) {
            setEmailSentMessage('❌ Error enviando el código.');
        }
        setIsSendingEmail(false);
    };
    
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

    const render2FAInput = (colorColor, borderFocus) => (
        <div className={`bg-slate-50 border border-slate-200 p-5 rounded-xl relative shadow-inner`}>
            <div className="flex justify-between items-center mb-3">
                <label className={`block text-xs font-bold text-${colorColor}-700 uppercase tracking-widest flex items-center gap-2`}>
                    <Lock size={14}/> Código de Seguridad 2FA
                </label>
                {twoFactorType === 'email' && (
                    <button 
                        type="button" 
                        onClick={handleRequestEmailCode}
                        disabled={isSendingEmail}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border border-${colorColor}-200 bg-white hover:bg-${colorColor}-50 text-${colorColor}-600 flex items-center gap-1 transition-colors shadow-sm`}
                    >
                        {isSendingEmail ? <Loader size={12} className="animate-spin" /> : <Mail size={12} />}
                        {isSendingEmail ? 'Enviando...' : 'Pedir Código'}
                    </button>
                )}
            </div>
            
            <input type="text" maxLength="6" required placeholder={twoFactorType === 'email' ? "Revisa tu correo" : "Revisa Google Auth / Authy"} value={codigo2fa} onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))} className={`w-full bg-white border border-slate-200 rounded-xl p-3 text-center tracking-[0.5em] text-slate-800 font-mono text-xl focus:border-${borderFocus} focus:ring-1 focus:ring-${borderFocus} outline-none transition-colors shadow-sm`} />
            
            {emailSentMessage && (
                <p className={`text-[10px] font-bold mt-2 text-right ${emailSentMessage.includes('✅') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {emailSentMessage}
                </p>
            )}
        </div>
    );
    
    const triggerKycFlow = async () => {
        setIsLoadingKyc(true);
        try {
            const response = await axios.post('https://api-paypal-secure.vercel.app/api/kyc/generate-session', {
                vendorData: auth.currentUser?.uid || "Invitado_Bancario"
            });
            if (response.data.success) {
                window.location.href = response.data.url || response.data.verificationUrl;
            } else {
                alert("No se pudo iniciar el escáner de seguridad.");
                setIsLoadingKyc(false);
            }
        } catch (error) {
            alert("Error de conexión con Didit. Intenta de nuevo.");
            setIsLoadingKyc(false);
        }
    };

    if (!isLoadingSaldo && isFirstVisit) {
        return <VortexWelcomeScreen onAccept={() => setIsFirstVisit(false)} />;
    }

    if (!isLoadingSaldo && !isFirstVisit && !hasKyc) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up flex items-center justify-center min-h-[70vh]">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center max-w-md">
                    <ShieldCheck size={64} className="text-indigo-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Verificación Requerida</h2>
                    <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">
                        Por normativas internacionales AML y para proteger a la comunidad, necesitas completar tu verificación de identidad (KYC) antes de acceder a Vortex Pay.
                    </p>
                    <button 
                        onClick={triggerKycFlow}
                        disabled={isLoadingKyc}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 text-sm disabled:opacity-50"
                    >
                        {isLoadingKyc ? "Conectando al Escáner..." : "Completar KYC Ahora"}
                    </button>
                    <p className="text-xs text-slate-400 mt-4">Nivel de seguridad bancaria garantizado por Didit.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up relative">
            
            {/* CABECERA VORTEX */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-100 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-green-100 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-5">
                    {/* INYECCIÓN: Ícono actualizado con la imagen solicitada */}
                    <img src="https://www.tecnobyte.lat/1001200188.png" alt="Vortex Pay Logo" className="w-28 h-28 object-contain drop-shadow-md filter brightness-0" />
                    <div>
                        <h1 className="text-4xl font-black font-orbitron text-slate-800 tracking-widest">
                            VOR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">TEX</span>
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-wide">Envía, recibe y retira. Así de simple.</p>
                    </div>
                </div>

                <div className="relative z-10 text-center md:text-right bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm min-w-[220px]">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center justify-center md:justify-end gap-1">
                        <Wallet size={14} className="text-cyan-600"/> Saldo Disponible
                    </p>
                    {/* === INYECCIÓN: MINI LOADER DE SALDO === */}
                    {isLoadingSaldo ? (
                        <div className="flex justify-center md:justify-end items-center h-10 mt-1">
                            <Loader className="animate-spin text-cyan-600" size={24} />
                        </div>
                    ) : (
                        <p className="text-4xl font-mono font-black text-slate-800">${Number(saldoReal).toFixed(2)}</p>
                    )}
                </div>
            </div>

            {/* SISTEMA DE PESTAÑAS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
                
                <div className="md:col-span-4 space-y-3 shrink-0">
                    <button onClick={() => { setActiveTab('enviar'); resetForm(); }} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'enviar' ? 'bg-cyan-50 border-cyan-200 text-cyan-700 border shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm'}`}><Send size={20} /> Enviar a un Amigo</button>
                    <button onClick={() => { setActiveTab('retirar'); resetForm(); }} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'retirar' ? 'bg-green-50 border-green-200 text-green-700 border shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm'}`}><ArrowDownToLine size={20} /> Retirar a USDT</button>
                    <button onClick={() => { setActiveTab('historial'); resetForm(); }} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'historial' ? 'bg-slate-800 border-slate-700 text-white border shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm'}`}><History size={20} /> Historial Financiero</button>
                    
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mt-6 shadow-sm mb-3">
                        <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={16}/> Protección Bancaria</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">Vortex Pay opera bajo cifrado AES-256. Todo movimiento de fondos requiere autenticación 2FA para proteger tu dinero contra accesos no autorizados.</p>
                    </div>

                    {/* NUEVO AVISO LEGAL */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm">
                        <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                            <strong className="text-slate-700">Nota Importante:</strong> Vortex Pay no actúa como entidad bancaria, custodio de fondos, ni casa de cambio de divisas. Es un servicio tecnológico proporcionado por TecnoByte diseñado para permitir a los usuarios el intercambio de saldo entre cuentas (ej. como modalidad de regalo). La opción de retiro a USDT está habilitada estrictamente como una alternativa para usuarios ante situaciones de emergencia que requieran disponer de su saldo, aplicándose una comisión por el servicio por parte de TecnoByte.
                        </p>
                    </div>
                </div>

                <div className="md:col-span-8 flex-grow">
                    <AnimatePresence mode="wait">
                        
                        {/* ================= FORMULARIO P2P ================= */}
                        {activeTab === 'enviar' && status === 'idle' && (
                            <motion.div key="enviar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-md space-y-6 h-full">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Zap className="text-cyan-600"/> Transferencia Inmediata</h3>
                                <p className="text-sm text-slate-500 mb-8 font-medium">Envía Saldo a cualquier usuario de la red. Tiempo estimado: Instante.</p>
                                
                                <form onSubmit={handleProcesar} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Destinatario (Correo de TecnoByte)</label>
                                        <input type="email" required placeholder="correo@amigo.com" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors shadow-inner" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                                                <span>Monto a Enviar (USD)</span>
                                                {/* === INYECCIÓN: LOADER EN EL BOTÓN MÁX === */}
                                                <span onClick={() => !isLoadingSaldo && setMonto(saldoReal.toString())} className="text-cyan-600 cursor-pointer hover:underline">Máx: {isLoadingSaldo ? '...' : `$${Number(saldoReal).toFixed(2)}`}</span>
                                            </label>
                                            
                                            <div className="flex items-center w-full bg-slate-50 border border-slate-200 shadow-inner rounded-xl px-4 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-colors">
                                                <span className="text-slate-400 font-bold text-2xl">$</span>
                                                <input type="number" step="0.01" min="0.10" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full bg-transparent py-4 pl-2 text-slate-800 font-mono text-2xl outline-none" />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-center text-xs">
                                            <div className="flex justify-between text-slate-500 mb-2 font-medium"><span>Monto bruto:</span> <span className="text-slate-800">${numMonto.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-red-600 pb-2 border-b border-slate-200 font-medium"><span>Comisión Vortex (1.5%):</span> <span>-${comisionP2P.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm font-bold text-cyan-700 mt-2"><span>Tu amigo recibe:</span> <span>${recibeAmigo > 0 ? recibeAmigo.toFixed(2) : '0.00'}</span></div>
                                        </div>
                                    </div>

                                    {render2FAInput('cyan', 'cyan-500')}

                                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-md mt-4">Procesar Transferencia</button>
                                </form>
                            </motion.div>
                        )}

                        {/* ================= FORMULARIO RETIRO CRYPTO ================= */}
                        {activeTab === 'retirar' && status === 'idle' && (
                            <motion.div key="retirar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-md space-y-6 h-full">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><ArrowDownToLine className="text-emerald-500"/> Retiro a Billetera BSC</h3>
                                <p className="text-sm text-slate-500 mb-8 font-medium">Convierte tu Saldo a Tether (USDT) a través de la red Binance Smart Chain (BEP20).</p>
                                
                                <form onSubmit={handleProcesar} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dirección USDT (Red BEP20)</label>
                                        <input type="text" required placeholder="Ej: 0x1234abcd..." value={walletBsc} onChange={(e) => setWalletBsc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors shadow-inner" />
                                        <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1 font-bold"><AlertTriangle size={12}/> Verifica bien la dirección. Las transferencias crypto son irreversibles.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                                                <span>Monto a Retirar (USD)</span>
                                                {/* === INYECCIÓN: LOADER EN EL BOTÓN MÁX === */}
                                                <span onClick={() => !isLoadingSaldo && setMonto(saldoReal.toString())} className="text-emerald-600 cursor-pointer hover:underline">Máx: {isLoadingSaldo ? '...' : `$${Number(saldoReal).toFixed(2)}`}</span>
                                            </label>
                                            
                                            <div className="flex items-center w-full bg-slate-50 border border-slate-200 shadow-inner rounded-xl px-4 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors">
                                                <span className="text-slate-400 font-bold text-2xl">$</span>
                                                <input type="number" step="0.01" min="10.00" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full bg-transparent py-4 pl-2 text-slate-800 font-mono text-2xl outline-none" />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-center text-xs">
                                            <div className="flex justify-between text-slate-500 mb-2 font-medium"><span>Retiro bruto:</span> <span className="text-slate-800">${numMonto.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-red-600 pb-2 border-b border-slate-200 font-medium"><span>Comisión Red (5.4% + $0.33):</span> <span>-${comisionCrypto.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm font-bold text-emerald-700 mt-2"><span>Recibes en USDT:</span> <span>{recibeCrypto > 0 ? recibeCrypto.toFixed(2) : '0.00'} USDT</span></div>
                                        </div>
                                    </div>

                                    {render2FAInput('emerald', 'emerald-500')}

                                    <button type="submit" disabled={recibeCrypto <= 0} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-md mt-4">Confirmar Retiro</button>
                                </form>
                            </motion.div>
                        )}

                        {/* ================= HISTORIAL REAL ================= */}
                        {activeTab === 'historial' && (
                            <motion.div key="historial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 h-full space-y-6 shadow-md">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><History className="text-slate-400"/> Registro Financiero Real</h3>
                                <p className="text-sm text-slate-500 mb-6 font-medium">Registro auditado de todos tus movimientos en la red.</p>
                                
                                <div className="space-y-3 overflow-y-auto pr-2 hide-scrollbar h-full min-h-[400px]">
                                    {isLoadingHistory ? (
                                        <div className="py-12 flex justify-center"><Loader className="animate-spin text-cyan-600" size={40} /></div>
                                    ) : transacciones.length > 0 ? (
                                        transacciones.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-colors group relative overflow-hidden">
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`p-3 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        {tx.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-slate-800 font-bold text-sm mb-1">{tx.source}</h4>
                                                        <div className="flex items-center gap-2 text-[10px] font-mono font-medium">
                                                            <span className="flex items-center gap-1 text-slate-400"><CalendarDays size={10} /> {tx.date}</span>
                                                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${tx.status === 'Completado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>{tx.status}</span>
                                                            <span className="text-indigo-500">ID: {tx.txId}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`font-mono font-bold text-lg ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                    </div>
                                                    <button onClick={() => setDetailsModal({ isOpen: true, transaction: tx })} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm" title="Ver Detalles Profundos"><Eye size={16}/></button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12"><p className="text-slate-500 font-medium">No hay movimientos registrados.</p></div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ESTADOS DE PROCESAMIENTO */}
                        {status === 'processing' && (
                            <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full space-y-4 shadow-md">
                                <Loader className={`animate-spin mb-6 ${activeTab === 'enviar' ? 'text-cyan-600' : 'text-emerald-500'}`} size={64} />
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Asegurando Bóveda</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Validando código 2FA de capa bancaria y blindando fondos a través del protocolo cifrado...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full relative overflow-hidden shadow-emerald-500/10 shadow-xl space-y-4">
                                <CheckCircle2 className={`${activeTab === 'enviar' ? 'text-cyan-500' : 'text-emerald-500'} mb-6 relative z-10`} size={80} strokeWidth={1.5} />
                                <h3 className="text-3xl font-black text-slate-800 mb-4 relative z-10 tracking-tight">¡Operación Certificada!</h3>
                                <p className="text-slate-500 font-medium mb-10 relative z-10 max-w-md mx-auto leading-relaxed">{mensaje}</p>
                                <button onClick={resetForm} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700 relative z-10 shadow-md uppercase tracking-widest text-sm Finalizar">Finalizar</button>
                                <div className="absolute inset-0 bg-emerald-50/50 animate-pulse pointer-events-none"></div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* ================= MODAL DE DETALLES PROFUNDO (DRAWER) ================= */}
            <AnimatePresence>
                {detailsModal.isOpen && detailsModal.transaction && (
                    <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={() => setDetailsModal({ isOpen: false })}>
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-lg h-full bg-slate-50 border-l border-slate-200 shadow-2xl p-8 flex flex-col space-y-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 shrink-0">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-orbitron tracking-wider"><ShieldCheck className="text-indigo-600" /> Detalles del Protocolo</h3>
                                <button onClick={() => setDetailsModal({ isOpen: false })} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"><X size={20}/></button>
                            </div>

                            <div className="flex-grow space-y-6 overflow-y-auto pr-2 hide-scrollbar">
                                <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className={`inline-flex p-4 rounded-full mb-3 ${detailsModal.transaction.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>{detailsModal.transaction.type === 'credit' ? <ArrowDownRight size={32} /> : <ArrowUpRight size={32} />}</div>
                                    <p className="text-sm text-slate-500 font-bold mb-1">{detailsModal.transaction.source}</p>
                                    <p className={`text-4xl font-black font-mono ${detailsModal.transaction.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>{detailsModal.transaction.type === 'credit' ? '+' : '-'}${detailsModal.transaction.amount.toFixed(2)}</p>
                                    <span className={`mt-3 inline-block text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${detailsModal.transaction.status === 'Completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{detailsModal.transaction.status}</span>
                                </div>

                                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold flex items-center gap-1.5"><CalendarDays size={14}/> Fecha</span> <span className="text-slate-700 font-medium">{detailsModal.transaction.date}</span></div>
                                    <div className="flex justify-between items-center text-xs"><span className="text-slate-500 font-bold flex items-center gap-1.5"><KeyRound size={14}/> ID Único de Protocolo</span> <span className="text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded">{detailsModal.transaction.txId}</span></div>
                                </div>

                                {detailsModal.transaction.vortexType === 'P2P' && (
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap size={14} className="text-cyan-600"/> Rastreo P2P</h4>
                                        <div className="text-xs space-y-3 font-medium">
                                            <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Emisor</span> <span className="text-slate-700">{detailsModal.transaction.emisor}</span></div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Receptor</span> <span className="text-slate-800 font-bold">{detailsModal.transaction.recipientDetails || detailsModal.transaction.recipient}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500 font-bold">Comisión (1.5%)</span> <span className="text-red-500">-${(detailsModal.transaction.comision || 0).toFixed(3)}</span></div>
                                            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-cyan-700"><span>Tu amigo recibió neto:</span> <span>${(detailsModal.transaction.montoNeto || detailsModal.transaction.amount).toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                )}

                                {detailsModal.transaction.vortexType === 'CRYPTO' && (
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ArrowDownToLine size={14} className="text-emerald-500"/> Rastreo Blockchain</h4>
                                        <div className="text-xs space-y-3 font-medium">
                                            <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Red de Salida</span> <span className="text-slate-700">BEP20</span></div>
                                            <div className="space-y-1.5 border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Dirección de Destino</span> <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm text-slate-800 font-mono break-all">{detailsModal.transaction.walletDestination || detailsModal.transaction.bep20Address} <button onClick={() => copyToClipboard(detailsModal.transaction.walletDestination || detailsModal.transaction.bep20Address, 'Dirección')} className="text-slate-400 hover:text-emerald-600 bg-white border border-slate-200 shadow-sm p-1 rounded"><Copy size={12}/></button></div></div>
                                            <div className="flex justify-between"><span className="text-slate-500 font-bold">Comisión Red (5.4%+$0.33)</span> <span className="text-red-500">-${(detailsModal.transaction.comisionCobrada || detailsModal.transaction.comision).toFixed(2)}</span></div>
                                            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-emerald-700"><span>Recibiste neto USDT:</span> <span>{(detailsModal.transaction.montoNeto || detailsModal.transaction.netCrypto).toFixed(2)} USDT</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setDetailsModal({ isOpen: false })} className="w-full mt-4 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-widest border border-slate-300 shadow-sm shrink-0">Cerrar Detalles</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ================= MODAL DE REQUISITO DE ACTIVACIÓN DE 2FA ================= */}
            <AnimatePresence>
                {is2faActivationModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden space-y-6">
                            
                            <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-100 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex justify-between items-center relative z-10 border-b border-slate-100 pb-4">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-orbitron tracking-wider">
                                    <Lock className="text-amber-500" /> Requisito de Seguridad
                                </h3>
                                <button onClick={() => setIs2faActivationModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><X size={20}/></button>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4 relative z-10 py-4">
                                <div className="p-4 rounded-full bg-amber-50 border border-amber-200 text-amber-500 mb-2 shadow-sm">
                                    <UserCog size={48} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 tracking-tight">Debes activar tu 2FA</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Para garantizar la seguridad bancaria de tu cuenta, Vortex Pay requiere que la Autenticación de Dos Factores (2FA) esté activada antes de realizar cualquier envío o retiro de fondos.
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 relative z-10 shadow-inner">
                                <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">¿Cómo activarlo?</h5>
                                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 shadow-sm">1</span>
                                    Ve a la sección de <strong className="text-slate-800">"Mi Perfil"</strong> en el menú principal.
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 shadow-sm">2</span>
                                    Busca la pestaña de <strong className="text-slate-800">"Seguridad Bancaria"</strong>.
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 shadow-sm">3</span>
                                    Sigue los pasos para escanear el <strong className="text-slate-800">Código QR</strong> con tu App.
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 relative z-10 border-t border-slate-100">
                                <button onClick={() => setIs2faActivationModalOpen(false)} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest border border-slate-300 shadow-sm">Entendido</button>
                                <button onClick={() => window.location.href = '/perfil'} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest shadow-md">Ir a Mi Perfil</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default VortexPayDashboard;
