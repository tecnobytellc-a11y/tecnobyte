import React from 'react';
import { X, Shield, FileTextIcon } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white font-orbitron flex items-center gap-2">
              {title.includes("Privacidad") ? <Shield size={24} className="text-indigo-500"/> : <FileTextIcon size={24} className="text-indigo-500"/>}
              {title}
            </h2>
          </div>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {content || "Cargando..."}
        </div>
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
