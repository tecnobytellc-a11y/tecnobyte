import React from 'react';
import { Play, ShieldCheck, Zap, Globe, ChevronDown } from 'lucide-react';

const CinematicLanding = () => {
    return (
        <div className="w-full bg-white flex flex-col">
            {/* SECCIÓN 1: VIDEO HERO A PANTALLA COMPLETA */}
            <div className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* ⚠️ REEMPLAZA EL SRC CON LA URL DE TU VIDEO MP4 (Subido a Vercel, Cloudinary, etc) */}
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-90"
                >
                    <source src="/hero-video.mp4" type="video/mp4" />
                    Tu navegador no soporta videos.
                </video>

                {/* Overlays para oscurecer el video y mezclarlo con el fondo blanco hacia abajo */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-10"></div>

                {/* Contenido Principal sobre el video */}
                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-600/80 text-white text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md border border-indigo-400/50">
                        La Nueva Era Digital
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tight">
                        DESBLOQUEA TU <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">MUNDO</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto font-light drop-shadow-md">
                        El ecosistema definitivo para Gamers y Nómadas Digitales. Gift cards, números virtuales y exchange automatizado a la velocidad de la luz.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a 
                            href="#services" 
                            className="bg-white text-slate-900 font-bold py-4 px-8 rounded-full hover:bg-indigo-50 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-2"
                        >
                            <Play fill="currentColor" size={20} />
                            IR A LA TIENDA
                        </a>
                    </div>
                </div>

                {/* Flecha indicadora de scroll */}
                <div className="absolute bottom-10 z-20 animate-bounce">
                    <a href="#services" className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <ChevronDown size={40} />
                    </a>
                </div>
            </div>

            {/* SECCIÓN 2: BIOGRAFÍA Y VALORES (ADN TECNOBYTE) */}
            <div className="py-24 bg-white relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">MÁS QUE UNA TIENDA. <br/>UN ECOSISTEMA.</h2>
                        <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                            <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                                <Zap size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Velocidad Extrema</h3>
                            <p className="text-slate-500">Transacciones automatizadas. Recibe tus Gift Cards y pines al instante, sin tiempos de espera humanos.</p>
                        </div>
                        <div className="text-center p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                            <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Bóveda de Seguridad</h3>
                            <p className="text-slate-500">Tus datos y fondos están encriptados. Sistema de verificación anti-fraude nivel Enterprise.</p>
                        </div>
                        <div className="text-center p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                            <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                                <Globe size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Acceso Global</h3>
                            <p className="text-slate-500">Rompiendo fronteras. Compra saldo internacional con tu moneda local y viceversa sin fricciones.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: RECOMENDACIONES TENDENCIA */}
            <div className="py-20 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-black text-slate-800 mb-10 uppercase tracking-widest">Lo Más Buscado</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        {['Free Fire Diamonds', 'Robux Premium', 'Binance Exchange', 'Números USA'].map((item, index) => (
                            <a 
                                key={index}
                                href="#services" 
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CinematicLanding;