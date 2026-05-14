import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import DynamicIcon from '../ui/DynamicIcon';
import { CUSTOM_ICONS } from '../../config/constants';
import { motion } from 'framer-motion';

// --- INYECCIÓN: Se agregó 'db' para leer el rango
import { auth, db } from '../../pages/firebase';
import { doc, getDoc } from 'firebase/firestore'; 
// ------------------------------------------------

// INYECCIÓN: Importar el observador de sesión de Firebase
import { onAuthStateChanged } from 'firebase/auth'; 

const ProductCard = ({ service, addToCart, exchangeRateBs, idx, multipackages }) => {
  const packages = multipackages ? multipackages[service.title] : null;
  const [selectedPkg, setSelectedPkg] = useState(packages ? packages[0] : null);

  // --- INYECCIÓN: ESTADO DE SESIÓN EN TIEMPO REAL ---
  const [activeUser, setActiveUser] = useState(null);

  // --- INYECCIÓN: ESTADO PARA RANGO VIP Y CASHBACK ---
  const [cashbackPct, setCashbackPct] = useState(0);

  useEffect(() => {
    // Escucha activamente si el usuario está logueado para no pedirle el correo
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setActiveUser(user);
        
        // --- INYECCIÓN: LECTURA DEL RANGO AL INICIAR SESIÓN ---
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const pts = data.tecnoPoints_acumulados || 0;
                    const rangoActual = data.rango || '';
                    if (pts >= 15000 || rangoActual.toLowerCase() === 'diamante') {
                        setCashbackPct(5);
                    } else if (pts >= 5000 || rangoActual.toLowerCase() === 'oro') {
                        setCashbackPct(2);
                    } else {
                        setCashbackPct(0);
                    }
                }
            } catch (error) {
                console.error("Error leyendo rango VIP:", error);
            }
        } else {
            setCashbackPct(0);
        }
        // -----------------------------------------------------
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

  // --- INYECCIÓN: FILTRO DE EXCLUSIÓN EXACTO PARA EL BADGE ---
  const isExcludedFromCashback = 
    service.isTnbRecharge || 
    service.title.toLowerCase().includes('cambio paypal a usdt') || 
    service.title.toLowerCase().includes('cambio paypal a bolívares') || 
    service.title.toLowerCase().includes('recarga saldo tnb');

  const showCashbackBadge = cashbackPct > 0 && !isExcludedFromCashback;
  // -----------------------------------------------------------

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: idx * 0.05 }}
        className="glass-card product-card rounded-3xl p-6 transition-all duration-300 group shadow-sm flex flex-col justify-between"
    >
      <div>
        {customIconUrl ? (
          <div className="flex justify-start mb-6">
            <img 
              src={customIconUrl}
              alt={service.title} 
              className="w-16 h-16 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <DynamicIcon name={service.icon} />
          </div>
        )}
        
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{service.title}</h3>

        {/* --- INYECCIÓN: ETIQUETA VISUAL VIP --- */}
        {showCashbackBadge && (
            <div className="mb-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-2.5 rounded-full shadow-sm">
                <span className="text-xs">💎</span> {cashbackPct}% Cashback VIP
            </div>
        )}
        {/* -------------------------------------- */}

        <p className="text-slate-500 text-sm mb-4 leading-relaxed">{service.description}</p>
        
        {packages && selectedPkg && (
          <div className="mb-4">
            <label className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wide">Selecciona un paquete:</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer transition-all shadow-inner"
              value={selectedPkg.id}
              onChange={(e) => setSelectedPkg(packages.find(p => p.id === e.target.value))}
            >
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id} className="bg-white text-slate-800">
                  {pkg.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 🎛️ MÓDULO DE RECARGA TNB */}
        {service.isTnbRecharge && (
            <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs text-slate-500 font-bold mb-2 uppercase tracking-wide">
                    Monto a recargar (USD):
                </label>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl text-slate-400 font-bold">$</span>
                    <input 
                        type="number" 
                        min={1} 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-white border border-slate-200 shadow-inner rounded-lg py-2.5 px-4 text-slate-800 text-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                </div>
                
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setIsForFriend(false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isForFriend ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border border-transparent'}`}
                    >Para mí</button>
                    <button 
                        onClick={() => setIsForFriend(true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isForFriend ? 'bg-pink-600 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border border-transparent'}`}
                    >Para un amigo</button>
                </div>

                {isForFriend ? (
                    <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="space-y-3">
                        <input type="email" placeholder="Correo de tu amigo" value={tnbData.friendEmail} onChange={e => setTnbData({...tnbData, friendEmail: e.target.value})} className="w-full bg-white border border-slate-200 shadow-inner rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all" />
                        <input type="text" placeholder="Nombre de tu amigo" value={tnbData.friendName} onChange={e => setTnbData({...tnbData, friendName: e.target.value})} className="w-full bg-white border border-slate-200 shadow-inner rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all" />
                        <input type="text" placeholder="De parte de (Tu Nombre)" value={tnbData.senderName} onChange={e => setTnbData({...tnbData, senderName: e.target.value})} className="w-full bg-white border border-slate-200 shadow-inner rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all" />
                    </motion.div>
                ) : (
                    // Si NO hay sesión activa, pide el correo
                    !activeUser && (
                        <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="space-y-3">
                            <input type="email" placeholder="Tu correo (Para recibir la recarga)" value={tnbData.myEmail} onChange={e => setTnbData({...tnbData, myEmail: e.target.value})} className="w-full bg-white border border-slate-200 shadow-inner rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                        </motion.div>
                    )
                )}
            </div>
        )}

      {/* 🎛️ MÓDULO VISUAL DE RANGO LIBRE (AMAZON) */}
        {service.isCustomAmount && !service.isTnbRecharge && (
            <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Monto (${service.minAmount} - ${service.maxAmount})
                </label>
                <div className="flex items-center gap-3">
                    <span className="text-2xl text-slate-400 font-bold">$</span>
                    <input 
                        type="number" 
                        min={service.minAmount} 
                        max={service.maxAmount}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-white border border-slate-200 shadow-inner rounded-lg py-2.5 px-4 text-slate-800 text-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Precio a pagar:</span>
                    <span className="text-indigo-600 font-extrabold">${precioFinalCalculado.toFixed(2)} USD</span>
                </div>
            </div>
        )}
      
      <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-slate-800">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-mono mt-0.5">
            ≈ {(currentPrice * exchangeRateBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs
          </span>
        </div>
        
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 text-white shadow-md transition-colors group/btn"
        >
          <div className="relative">
            <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline-block">Comprar</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
