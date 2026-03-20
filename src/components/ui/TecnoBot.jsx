import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Mic, ScanLine, Minimize2, Maximize2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TecnoBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: '¡Hola, Guerrero! Soy Tecno-Bot 🤖. Aquí estoy para agilizar tus compras, validar pagos y guiarte en el soporte. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        
        const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate Bot Response
        setTimeout(() => {
            setIsTyping(false);
            const botMsg = { 
                id: Date.now() + 1, 
                sender: 'bot', 
                text: 'Analizando tu petición... 🦾. Recuerda que para soporte detallado debes ir al "Centro de Resoluciones".' 
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Bubble */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] border-2 border-cyan-300/50"
                    >
                        <Bot size={32} className="text-white animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`fixed bottom-6 right-6 z-50 bg-[#0a0a12]/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? 'w-[400px] h-[600px] rounded-2xl' : 'w-[350px] h-[500px] rounded-2xl'} max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 border-b border-indigo-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a12]"></div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold font-orbitron tracking-wide text-sm">Tecno-Bot IA</h3>
                                    <p className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Sistema en línea
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white transition-colors">
                                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-pink-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <div className="text-center text-[10px] text-gray-500 font-mono mb-4 border-b border-gray-800 pb-2">
                                Conexión Segura (AES-256) Establecida
                            </div>
                            
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-[0_4px_10px_rgba(79,70,229,0.3)]' 
                                            : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700 shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700 flex gap-1">
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-gray-900 border-t border-gray-800">
                            <div className="flex items-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-gray-800" title="Escanear Recibo (OCR)">
                                    <ScanLine size={20} />
                                </button>
                                
                                <div className="flex-1 bg-black/50 border border-gray-700 rounded-xl flex items-center overflow-hidden focus-within:border-cyan-500/50 transition-colors">
                                    <textarea 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Escribe tu mensaje..."
                                        className="w-full bg-transparent text-sm text-white px-3 py-2.5 focus:outline-none resize-none max-h-24 custom-scrollbar"
                                        rows={1}
                                        style={{ minHeight: '40px' }}
                                    />
                                    <button className="p-2 mr-1 text-gray-400 hover:text-indigo-400 transition-colors">
                                        <Mic size={18} />
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition-colors shadow-lg"
                                >
                                    <Send size={18} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                                </button>
                            </div>
                            <div className="text-center mt-2 flex justify-center items-center gap-1">
                                <ShieldAlert size={10} className="text-gray-500" />
                                <span className="text-[9px] text-gray-500 font-mono">Powered by TecnoByte AI • Los mensajes están encriptados</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TecnoBot;
