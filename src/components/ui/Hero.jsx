import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ exchangeRate }) => {
  const [date, setDate] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setDate(new Date()), 1000); return () => clearInterval(timer); }, []);
  const venTime = date.toLocaleString('es-VE', { timeZone: 'America/Caracas', dateStyle: 'short', timeStyle: 'medium' });

  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden bg-slate-50">
      {/* Premium Background Blurs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-80 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        
        {/* Tasa de Cambio Badge */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm backdrop-blur-md"
        >
            <RefreshCw size={16} className="text-indigo-600 animate-spin-slow" style={{ animationDuration: '3s' }} />
            <span className="text-sm font-medium text-slate-600 tracking-wide">
              Tasa: <strong className="text-indigo-900 font-bold">{exchangeRate?.toFixed(2)} Bs/USD</strong> <span className="text-slate-400 font-mono text-xs ml-2">| {venTime}</span>
            </span>
        </motion.div>
        
        {/* Main Headline */}
        <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 drop-shadow-sm"
        >
            Soluciones Globales <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 inline-block mt-2">
              Sin Límites
            </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-6 text-xl sm:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light"
        >
            Tarjetas de regalo, recargas internacionales y activos digitales. 
            <strong className="font-semibold text-slate-700"> Todo en un solo lugar.</strong>
        </motion.p>
        
        {/* Call to Action */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 flex justify-center gap-4"
        >
          <motion.a 
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            href="#services" 
            className="group px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg transition-all shadow-lg flex items-center gap-3"
          >
              Explorar Catálogo
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
