import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';

const MOCK_PURCHASES = [
    { name: "Juan C.", product: "Amazon Gift Card $50", time: "hace 2 min" },
    { name: "Maria P.", product: "1000 Pavos Fortnite", time: "hace 5 min" },
    { name: "Alex R.", product: "Xbox Game Pass (1 Mes)", time: "hace 12 min" },
    { name: "Carlos T.", product: "100 Diamantes Free Fire", time: "hace 1 min" },
    { name: "GamerVzla", product: "PSN Card $10", time: "hace 8 min" },
];

const SocialProofPopup = () => {
    const [currentPurchase, setCurrentPurchase] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show first popup after 10s
        const initialTimer = setTimeout(() => {
            showRandomPurchase();
        }, 10000);

        return () => clearTimeout(initialTimer);
    }, []);

    const showRandomPurchase = () => {
        const randomItem = MOCK_PURCHASES[Math.floor(Math.random() * MOCK_PURCHASES.length)];
        setCurrentPurchase(randomItem);
        setIsVisible(true);

        // Hide after 5 seconds
        setTimeout(() => {
            setIsVisible(false);
            
            // Schedule next popup (between 30s and 60s)
            const nextTime = Math.floor(Math.random() * 30000) + 30000;
            setTimeout(showRandomPurchase, nextTime);
        }, 5000);
    };

    return (
        <AnimatePresence>
            {isVisible && currentPurchase && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 left-6 z-40 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-3 flex items-center gap-4 shadow-2xl hover:border-indigo-500/50 transition-colors cursor-default max-w-[300px]"
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                            <ShoppingBag size={18} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-gray-900">
                            <CheckCircle2 size={10} className="text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-[11px] text-gray-400 font-bold mb-0.5">
                            <span className="text-white">{currentPurchase.name}</span> acaba de comprar
                        </p>
                        <p className="text-sm font-bold text-cyan-400 leading-tight">
                            {currentPurchase.product}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">
                            Verificado {currentPurchase.time}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SocialProofPopup;
