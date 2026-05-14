import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import DynamicIcon from '../ui/DynamicIcon';
import { motion } from 'framer-motion';

const ExchangeCard = ({ service, addToCart, exchangeRate, isAvailable }) => {
  const [amountSend, setAmountSend] = useState('');
  const [receiveAddress, setReceiveAddress] = useState('');
  
  const calculateReceive = (amount) => { 
      if (!amount || isNaN(amount)) return 0; 
      const numAmount = parseFloat(amount); 
      const fee = (numAmount * 0.136) + 0.47; 
      const net = numAmount - fee; 
      return net > 0 ? net : 0; 
  };
  
  const netUSDT = calculateReceive(amountSend);
  const receiveValue = service.type === 'bs' 
      ? (netUSDT * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs' 
      : netUSDT.toFixed(2) + ' USDT';
      
  const handleAdd = () => { 
      if(!amountSend || parseFloat(amountSend) <= 0) return; 
      if(service.type === 'usdt' && !receiveAddress) { 
          alert("Por favor ingresa tu dirección de billetera para recibir los fondos."); 
          return; 
      } 
      addToCart({ 
          ...service, 
          price: parseFloat(amountSend), 
          title: `${service.title} (Envía $${amountSend})`, 
          description: `Recibes: ${receiveValue} en ${receiveAddress || 'Banco'}`, 
          exchangeData: { 
              sendAmount: parseFloat(amountSend), 
              receiveAmount: receiveValue, 
              receiveType: service.type === 'usdt' ? 'bep20' : 'bank_transfer', 
              receiveAddress: service.type === 'usdt' ? receiveAddress : 'Cuenta Bancaria Registrada' 
          } 
      }); 
      setAmountSend(''); 
      setReceiveAddress(''); 
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: isAvailable ? 1.02 : 1, boxShadow: isAvailable ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)" : "none", y: isAvailable ? -5 : 0 }}
        className={`bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 shadow-sm flex flex-col h-full relative overflow-hidden ${!isAvailable ? 'opacity-80 grayscale' : 'hover:border-indigo-300'}`}
    >
        {!isAvailable && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="bg-white border border-red-200 p-5 rounded-2xl text-center shadow-xl">
                    <Clock className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h3 className="text-slate-800 font-bold text-lg">CERRADO</h3>
                    <p className="text-slate-500 text-xs mt-1 max-w-[200px] leading-relaxed">Disponible solo de<br/>Lunes a Jueves</p>
                </div>
            </div>
        )}
        <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                <DynamicIcon name={service.icon} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{service.title}</h3>
                <p className="text-xs text-indigo-600 font-mono font-medium mt-1">Fee: 13.60% + $0.47</p>
            </div>
        </div>
        <div className="flex-1 space-y-4 mb-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg py-1.5 px-3 mb-2 text-center shadow-sm">
                <p className="text-[10px] font-bold text-indigo-700 tracking-wider">COMISION DE PAYPAL INCLUIDA</p>
            </div>
            
            {/* Input Envías */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide">Envías (PayPal USD)</label>
                <div className="flex items-center gap-3">
                    <span className="text-emerald-500 font-bold text-xl">$</span>
                    <input 
                        type="number" 
                        value={amountSend} 
                        onChange={(e) => setAmountSend(e.target.value)} 
                        placeholder="100.00" 
                        className="bg-white border border-slate-200 shadow-sm rounded-lg w-full text-slate-800 text-lg font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-2 px-3 transition-colors" 
                        disabled={!isAvailable}
                    />
                </div>
            </div>
            
            <div className="flex justify-center text-slate-300">
                <ChevronDown size={20} />
            </div>
            
            {/* Address USDT si aplica */}
            {service.type === 'usdt' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-inner">
                    <label className="text-xs font-bold text-amber-600 block uppercase tracking-wide">¿Dónde recibes?</label>
                    <div className="flex gap-2 text-xs mb-2">
                        <div className="flex-1 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-center font-bold tracking-wide shadow-sm">Dirección USDT (BEP20)</div>
                    </div>
                    <input 
                        type="text" 
                        value={receiveAddress} 
                        onChange={(e) => setReceiveAddress(e.target.value)} 
                        placeholder="Ej: 0x123... (Tu dirección Binance)" 
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono transition-colors" 
                        disabled={!isAvailable}
                    />
                    <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed">*Si usas tu dirección de Binance, el envío es interno y gratuito.</p>
                </div>
            )}
            
            {/* Recibes Aproximadamente */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-inner">
                <label className="text-xs font-bold text-indigo-500 block mb-2 uppercase tracking-wide">Recibes Aproximadamente</label>
                <div className="text-2xl font-black text-slate-800 font-mono">{amountSend ? receiveValue : '---'}</div>
                {service.type === 'bs' && <p className="text-[11px] text-slate-500 mt-1.5 font-medium text-right">Tasa: {exchangeRate.toFixed(2)} Bs/USD</p>}
            </div>
        </div>
        
        <motion.button 
            whileHover={isAvailable ? { scale: 1.02 } : {}}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            onClick={handleAdd} 
            className="w-full py-3.5 bg-indigo-600 rounded-xl text-white font-bold text-sm tracking-wide hover:bg-indigo-700 transition-all shadow-md disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed" 
            disabled={!amountSend || parseFloat(amountSend) <= 0 || !isAvailable}
        >
            {isAvailable ? "Añadir al Carrito" : "No Disponible"}
        </motion.button>
    </motion.div>
  );
};

export default ExchangeCard;
