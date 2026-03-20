import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ exchangeRate }) => {
  const [date, setDate] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setDate(new Date()), 1000); return () => clearInterval(timer); }, []);
  const venTime = date.toLocaleString('es-VE', { timeZone: 'America/Caracas', dateStyle: 'short', timeStyle: 'medium' });

  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900/30 border border-indigo-500/30 backdrop-blur-md"
        >
            <RefreshCw size={14} className="text-green-400 animate-spin" />
            <span className="text-sm font-mono text-green-400 font-bold">Tasa Actual: {exchangeRate?.toFixed(2)} Bs/USD | {venTime} (VET)</span>
        </motion.div>
        
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 font-orbitron drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        >
            EL FUTURO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">DIGITAL</span>
        </motion.h1>
        
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
            Soluciones digitales inmediatas. Números virtuales, recargas de juegos y exchange automatizado al alcance de un clic.
        </motion.p>
        
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex justify-center gap-4"
        >
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#services" 
            className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-500"
          >
              Ver Servicios
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
