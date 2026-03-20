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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: isAvailable ? 1.02 : 1, boxShadow: isAvailable ? "0 20px 25px -5px rgba(0, 0, 0, 0.4)" : "none" }}
        className={`bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transition-colors duration-300 shadow-lg flex flex-col h-full relative overflow-hidden ${!isAvailable ? 'opacity-70 grayscale' : 'hover:border-indigo-500'}`}
    >
        {!isAvailable && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <div className="bg-gray-900 border border-red-500/50 p-4 rounded-xl text-center shadow-2xl">
                    <Clock className="w-10 h-10 text-red-500 mx-auto mb-2" />
                    <h3 className="text-white font-bold text-lg">CERRADO</h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-[200px]">Disponible solo de<br/>Lunes a Jueves</p>
                </div>
            </div>
        )}
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-indigo-400">
                <DynamicIcon name={service.icon} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white leading-tight">{service.title}</h3>
                <p className="text-xs text-indigo-400 font-mono">Fee: 13.60% + $0.47</p>
            </div>
        </div>
        <div className="flex-1 space-y-3 mb-4">
            <div className="bg-indigo-500/10 border border-indigo-500/50 rounded py-1 px-2 mb-2 text-center">
                <p className="text-[10px] font-bold text-indigo-200 tracking-wide">COMISION DE PAYPAL INCLUIDA</p>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
                <label className="text-xs text-gray-400 block mb-1">Envías (PayPal USD)</label>
                <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">$</span>
                    <input type="number" value={amountSend} onChange={(e) => setAmountSend(e.target.value)} placeholder="100.00" className="bg-transparent w-full text-white font-mono focus:outline-none" disabled={!isAvailable}/>
                </div>
            </div>
            <div className="flex justify-center text-gray-500">
                <ChevronDown size={16} />
            </div>
            {service.type === 'usdt' && (
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-2">
                    <label className="text-xs text-yellow-500 font-bold block">¿Dónde recibes?</label>
                    <div className="flex gap-2 text-xs mb-2">
                        <div className="flex-1 py-1 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 text-center font-bold">Dirección USDT (BEP20)</div>
                    </div>
                    <input type="text" value={receiveAddress} onChange={(e) => setReceiveAddress(e.target.value)} placeholder="Ej: 0x123... (Tu dirección de depósito Binance)" className="w-full bg-black/30 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-yellow-500 focus:outline-none font-mono" disabled={!isAvailable}/>
                    <p className="text-[9px] text-gray-400 mt-1">*Si usas tu dirección de Binance, el envío es interno y gratuito.</p>
                </div>
            )}
            <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                <label className="text-xs text-indigo-300 block mb-1">Recibes Aproximadamente</label>
                <div className="text-xl font-bold text-white font-mono">{amountSend ? receiveValue : '---'}</div>
                {service.type === 'bs' && <p className="text-[10px] text-gray-400 mt-1 text-right">Tasa: {exchangeRate.toFixed(2)} Bs/USD</p>}
            </div>
        </div>
        <motion.button 
            whileHover={isAvailable ? { scale: 1.02 } : {}}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            onClick={handleAdd} 
            className="w-full py-2 bg-indigo-600 rounded-lg text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={!amountSend || parseFloat(amountSend) <= 0 || !isAvailable}
        >
            {isAvailable ? "Añadir al Carrito" : "No Disponible"}
        </motion.button>
    </motion.div>
  );
};

export default ExchangeCard;
