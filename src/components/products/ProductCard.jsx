import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import DynamicIcon from '../ui/DynamicIcon';
import { CUSTOM_ICONS } from '../../config/constants';
import { motion } from 'framer-motion';
import { auth } from '../../pages/firebase';
// INYECCIÓN: Importar el observador de sesión de Firebase
import { onAuthStateChanged } from 'firebase/auth'; 

const ProductCard = ({ service, addToCart, exchangeRateBs, idx, multipackages }) => {
  const packages = multipackages ? multipackages[service.title] : null;
  const [selectedPkg, setSelectedPkg] = useState(packages ? packages[0] : null);

  // --- INYECCIÓN: ESTADO DE SESIÓN EN TIEMPO REAL ---
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    // Escucha activamente si el usuario está logueado para no pedirle el correo
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setActiveUser(user);
    });
    return () => unsubscribe();
  }, []);
  // --------------------------------------------------

  useEffect(() => {
    if (packages && packages.length > 0) {
      setSelectedPkg(packages[0]);
    }
  }, [packages]);

  // --- INICIO MÓDULO RANGO LIBRE Y RECARGA TNB ---
  const [customAmount, setCustomAmount] = useState(service.minAmount || 10);
  const [isForFriend, setIsForFriend] = useState(false);
  const [tnbData, setTnbData] = useState({ friendEmail: '', friendName: '', senderName: '', myEmail: '' });

  const calcularPrecioConComision = (montoDeseado) => {
      const monto = parseFloat(montoDeseado) || 0;
      if (service.isTnbRecharge) return monto; 
      if (monto < 10) return monto + 0.14;
      if (monto >= 10 && monto <= 50) return monto * 1.02;
      return monto * 1.015;
  };

  const precioFinalCalculado = calcularPrecioConComision(customAmount);

  const currentPrice = (service.isCustomAmount || service.isTnbRecharge) 
    ? precioFinalCalculado 
    : (packages && selectedPkg ? selectedPkg.price : (service.price || 0));
    
  const currentTitle = packages && selectedPkg ? `${selectedPkg.title} - ${service.title}` : service.title;
  
  const handleAdd = () => {
    if (service.isTnbRecharge) {
        if (isForFriend && (!tnbData.friendEmail || !tnbData.friendName)) {
            alert("Por favor, completa los datos de tu amigo para enviarle la recarga.");
            return;
        }
        // INYECCIÓN: Usa el estado en tiempo real (activeUser) en lugar del síncrono
        if (!isForFriend && !activeUser && !tnbData.myEmail) {
            alert("Por favor, ingresa tu correo para recibir la recarga (o inicia sesión).");
            return;
        }

        addToCart({
            ...service,
            title: `Recarga Saldo TNB ($${customAmount})` + (isForFriend ? ` Regalo para ${tnbData.friendName}` : ''),
            faceValue: Number(customAmount),
            price: Number(precioFinalCalculado.toFixed(2)),
            tnbData: { isForFriend, ...tnbData, myEmail: activeUser ? activeUser.email : tnbData.myEmail }
        });
    } else if (service.isCustomAmount) {
      addToCart({
        ...service,
        title: `${service.title} de $${customAmount}`, 
        faceValue: Number(customAmount),               
        price: Number(precioFinalCalculado.toFixed(2)) 
      });
    } else if (packages && selectedPkg) {
      addToCart({ ...service, ...selectedPkg, title: currentTitle, price: currentPrice, packageId: selectedPkg.id });
    } else {
      addToCart(service);
    }
  };

  const customIconUrl = CUSTOM_ICONS[service.title];

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: idx * 0.05 }}
        whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)" }}
        className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500 transition-colors duration-300 group shadow-lg flex flex-col justify-between"
    >
      <div>
        {customIconUrl ? (
          <div className="flex justify-start mb-6">
            <img 
              src={customIconUrl}
              alt={service.title} 
              className="w-16 h-16 object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" 
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-indigo-400 group-hover:text-cyan-400 group-hover:scale-110 transition-transform">
            <DynamicIcon name={service.icon} />
          </div>
        )}
        
        <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
        <p className="text-gray-400 text-sm mb-4">{service.description}</p>
        
        {packages && selectedPkg && (
          <div className="mb-4">
            <label className="text-xs text-indigo-300 font-bold block mb-2 uppercase tracking-wide">Selecciona un paquete:</label>
            <select 
              className="w-full bg-black/60 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 outline-none cursor-pointer transition-colors hover:border-gray-400"
              value={selectedPkg.id}
              onChange={(e) => setSelectedPkg(packages.find(p => p.id === e.target.value))}
            >
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id} className="bg-gray-900 text-white">
                  {pkg.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 🎛️ MÓDULO DE RECARGA TNB */}
        {service.isTnbRecharge && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-indigo-500/30">
                <label className="block text-xs text-indigo-300 font-bold mb-2 uppercase tracking-wide">
                    Monto a recargar (USD):
                </label>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl text-cyan-400 font-bold">$</span>
                    <input 
                        type="number" 
                        min={1} 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white text-xl focus:outline-none focus:border-indigo-500"
                    />
                </div>
                
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setIsForFriend(false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${!isForFriend ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                    >Para mí</button>
                    <button 
                        onClick={() => setIsForFriend(true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${isForFriend ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                    >Para un amigo</button>
                </div>

                {isForFriend ? (
                    <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="space-y-3">
                        <input type="email" placeholder="Correo de tu amigo" value={tnbData.friendEmail} onChange={e => setTnbData({...tnbData, friendEmail: e.target.value})} className="w-full bg-black/60 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-pink-500 outline-none transition-colors" />
                        <input type="text" placeholder="Nombre de tu amigo" value={tnbData.friendName} onChange={e => setTnbData({...tnbData, friendName: e.target.value})} className="w-full bg-black/60 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-pink-500 outline-none transition-colors" />
                        <input type="text" placeholder="De parte de (Tu Nombre)" value={tnbData.senderName} onChange={e => setTnbData({...tnbData, senderName: e.target.value})} className="w-full bg-black/60 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-pink-500 outline-none transition-colors" />
                    </motion.div>
                ) : (
                    // Si NO hay sesión activa, pide el correo
                    !activeUser && (
                        <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="space-y-3">
                            <input type="email" placeholder="Tu correo (Para recibir la recarga)" value={tnbData.myEmail} onChange={e => setTnbData({...tnbData, myEmail: e.target.value})} className="w-full bg-black/60 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-colors" />
                        </motion.div>
                    )
                )}
            </div>
        )}

      {/* 🎛️ MÓDULO VISUAL DE RANGO LIBRE (AMAZON) */}
        {service.isCustomAmount && !service.isTnbRecharge && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <label className="block text-sm text-gray-400 mb-2">
                    ¿De cuánto quieres la Gift Card? (Entre ${service.minAmount} y ${service.maxAmount})
                </label>
                <div className="flex items-center gap-3">
                    <span className="text-2xl text-cyan-400 font-bold">$</span>
                    <input 
                        type="number" 
                        min={service.minAmount} 
                        max={service.maxAmount}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white text-xl focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-gray-400">Precio final a pagar:</span>
                    <span className="text-green-400 font-bold">${precioFinalCalculado.toFixed(2)} USD</span>
                </div>
            </div>
        )}
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            ≈ {(currentPrice * exchangeRateBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs
          </span>
        </div>
        
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd} 
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-colors group/btn"
        >
          <div className="relative">
            <ShoppingCart size={16} className="group-hover/btn:scale-95 transition-transform" />
            <div className="absolute -top-1 -right-1 bg-green-500 text-black text-[10px] font-extrabold w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none border border-indigo-600">+</div>
          </div>
          <span className="text-[9px] font-bold uppercase whitespace-nowrap">Agregar al carrito</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
