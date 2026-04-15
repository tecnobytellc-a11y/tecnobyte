import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../pages/firebase';

const VortexWelcomeScreen = ({ onAccept }) => {
    const [accepted, setAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            if (auth.currentUser) {
                await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
                    is_first_vortex_visit: false
                });
            }
            onAccept(); // Proceder al dashboard
        } catch (error) {
            console.error("Error al actualizar la base de datos", error);
            alert("No se pudo conectar al servidor para guardar tu aceptación. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up flex items-center justify-center min-h-[80vh]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center max-w-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-50 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10"></div>
                
                <div className="relative z-10 space-y-6">
                    <img src="https://www.tecnobyte.lat/1001200188.png" alt="Vortex Pay" className="w-24 h-24 mx-auto object-contain mb-4 filter brightness-0" />
                    
                    <h2 className="text-3xl font-black font-orbitron text-slate-800 tracking-tight">Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">Vortex Pay</span></h2>
                    
                    <p className="text-slate-500 font-medium leading-relaxed text-sm">
                        Vortex Pay es el servicio avanzado de Tecnobite diseñado para permitir el intercambio instantáneo y seguro de saldo entre usuarios del ecosistema. Construido con arquitectura de <strong>cifrado AES-256</strong> y protegido por tecnología de autenticación múltiple, Vortex garantiza que tus fondos permanezcan seguros en cada transacción.
                    </p>

                    <p className="text-slate-500 font-medium leading-relaxed text-sm">
                        Nuestra misión es ofrecerte una alternativa para enviar tu saldo TNB a otros usuarios de la red a nivel internacional en segundos, así como brindar un canal de retiro rápido de tus fondos en situaciones de transferencia entre billeteras.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col items-center gap-3 shadow-inner my-6">
                        <a href="/terminos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold tracking-wide transition-colors uppercase text-sm">
                            <FileText size={18} /> Leer Términos y Condiciones
                        </a>
                        
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" id="vortex-terms" 
                                className="w-5 h-5 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500 cursor-pointer"
                                checked={accepted} onChange={(e) => setAccepted(e.target.checked)} 
                            />
                            <label htmlFor="vortex-terms" className="text-sm text-slate-700 font-bold cursor-pointer">
                                He leído y acepto los Términos y Condiciones
                            </label>
                        </div>
                    </div>

                    <button 
                        onClick={handleAccept} 
                        disabled={!accepted || isLoading}
                        className={`w-full font-black uppercase tracking-widest py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 ${accepted && !isLoading ? 'bg-slate-800 hover:bg-slate-900 text-white transform hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isLoading ? "PROCESANDO..." : "IR A VORTEX"} <ArrowRight size={20} />
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono mt-4">
                        <ShieldCheck size={14} className="text-green-500" /> Seguridad bancaria Nivel 2
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VortexWelcomeScreen;
