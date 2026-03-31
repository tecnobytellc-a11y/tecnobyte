import React from 'react';
import { AlertTriangle } from 'lucide-react';

const BlockedScreen = () => (
  <div className="blocked-screen font-sans fixed inset-0 w-full h-full bg-black z-[99999999] flex items-center justify-center overflow-hidden">
    <div className="max-w-md p-8 bg-[#111] border-2 border-red-600 rounded-2xl text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-scale-in">
      <AlertTriangle size={64} className="text-red-600 mx-auto mb-6 animate-pulse"/>
      <h1 className="text-3xl font-bold text-white mb-2 tracking-widest font-orbitron">ACCESO DENEGADO</h1>
      <p className="text-gray-400 mb-4 text-sm">Su dirección IP ha sido marcada como sospechosa.</p>
    </div>
  </div>
);

export default BlockedScreen;
