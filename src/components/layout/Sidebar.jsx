import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LayoutGrid } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, categories, activeCategory, setActiveCategory }) => {
    // Filtrar "All" o "Todas" como se solicitó
    const visibleCategories = categories.filter(
        cat => cat.toLowerCase() !== 'all' && cat.toLowerCase() !== 'todas'
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-full w-80 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.05)] border-r border-slate-100 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <LayoutGrid className="text-indigo-600" size={24} />
                                Categorías
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="space-y-1">
                                {/* All button hidden via logic, rest mapped */}
                                {visibleCategories.map((cat, i) => {
                                    const isActive = activeCategory === cat;
                                    return (
                                        <motion.button
                                            key={cat}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => {
                                                setActiveCategory(cat);
                                                onClose();
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left font-medium transition-all ${
                                                isActive 
                                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>{cat}</span>
                                            {isActive && <ChevronRight size={18} className="text-indigo-500" />}
                                        </motion.button>
                                    );
                                })}

                                {/* SMM Link */}
                                <motion.a
                                    href="https://www.tecnobyte.lat/smm"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: visibleCategories.length * 0.05 }}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left font-medium text-slate-600 hover:bg-indigo-600 hover:text-white transition-all border border-transparent hover:shadow-md mt-2 group"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:bg-white animate-pulse" />
                                        SMM
                                    </span>
                                    <ChevronRight size={18} className="text-slate-400 group-hover:text-white" />
                                </motion.a>
                            </div>
                        </div>

                        {/* Footer area inside sidebar */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">
                                TecnoByte Global Store
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
