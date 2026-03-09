import React, { useState } from 'react';
import { MessageCircle, AlertCircle, CheckCircle, Clock, FileText, X, Send, User, Bot, PlusCircle, Search } from 'lucide-react';

export default function SupportCenter() {
  const [activeTab, setActiveTab] = useState('abiertos'); // 'abiertos' o 'cerrados'
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStatus, setChatStatus] = useState('bot');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hola, soy la IA de asistencia de TecnoByte LLC. Puedo ayudarte con tus pedidos o transferirte con un agente humano si hay una controversia. ¿Cuál es tu ID de orden?' }
  ]);

  // Simulador de Casos (Luego lo conectaremos a tu Firebase)
  const mockCases = [
    { id: 'PP-R-789012', orderId: 'TB-9821', date: '08 Mar 2026', issue: 'Servicio no recibido', amount: '15.00', status: 'abierto', lastUpdate: 'Esperando respuesta del vendedor' },
    { id: 'PP-R-654321', orderId: 'TB-7654', date: '01 Mar 2026', issue: 'Error en la entrega', amount: '25.50', status: 'cerrado', lastUpdate: 'Reembolso emitido' },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages([...messages, { sender: 'user', text: inputMessage }]);
    setInputMessage('');

    if (inputMessage.toLowerCase().includes('humano') || inputMessage.toLowerCase().includes('agente')) {
        setChatStatus('esperando_admin');
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', text: 'CASO ESCALADO: He notificado a un administrador de TecnoByte. Evaluaremos tu IP y detalles del pago. Un agente tomará el chat pronto.' }]);
        }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-sans pb-20">
      
      {/* HEADER TIPO PAYPAL (Barra de Navegación del Centro) */}
      <div className="bg-[#0a0a12] border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src="https://tecnobyte.lat/logo.png" alt="TecnoByte" className="h-8 filter brightness-0 invert" />
          <div className="h-6 w-px bg-gray-700 mx-2"></div>
          <h1 className="text-xl font-bold tracking-wide text-gray-200">Centro de Resoluciones</h1>
        </div>
        <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-bold transition">
          <MessageCircle className="w-4 h-4" /> Asistente / Soporte
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* RESUMEN DE LA CUENTA Y BOTÓN DE REPORTAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#11111a] border border-gray-800 rounded-xl p-6 md:p-8 mb-10 shadow-lg">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2">Gestiona tus controversias</h2>
            <p className="text-gray-400 text-sm">Resuelve problemas con tus compras o comunícate directamente con TecnoByte LLC para evitar retenciones.</p>
          </div>
          <button className="mt-6 md:mt-0 flex items-center gap-2 bg-transparent border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-6 py-3 rounded-lg font-bold transition-all w-full md:w-auto justify-center">
            <PlusCircle className="w-5 h-5" /> Reportar un Problema
          </button>
        </div>

        {/* MÉTRICAS (Igual que PayPal) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#11111a] border-l-4 border-indigo-500 rounded-r-xl p-5 border-y border-r border-gray-800">
            <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Casos Abiertos</div>
            <div className="text-3xl font-black text-white">1</div>
          </div>
          <div className="bg-[#11111a] border-l-4 border-orange-500 rounded-r-xl p-5 border-y border-r border-gray-800">
            <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Requieren tu Acción</div>
            <div className="text-3xl font-black text-white">0</div>
          </div>
          <div className="bg-[#11111a] border-l-4 border-green-500 rounded-r-xl p-5 border-y border-r border-gray-800">
            <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Casos Cerrados</div>
            <div className="text-3xl font-black text-white">1</div>
          </div>
        </div>

        {/* PESTAÑAS (TABS) */}
        <div className="border-b border-gray-800 mb-6 flex gap-8">
          <button 
            onClick={() => setActiveTab('abiertos')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'abiertos' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Casos Abiertos
            {activeTab === 'abiertos' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-t-md"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('cerrados')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'cerrados' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Casos Cerrados
            {activeTab === 'cerrados' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-t-md"></div>}
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input type="text" placeholder="Buscar por ID de Caso o ID de Orden..." className="w-full bg-[#11111a] border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>

        {/* TABLA DE CASOS */}
        <div className="bg-[#11111a] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a24] border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Fecha / ID de Caso</th>
                <th className="p-4 font-bold">Motivo</th>
                <th className="p-4 font-bold text-right">Importe</th>
                <th className="p-4 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mockCases.filter(c => c.status === activeTab).length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No tienes casos {activeTab} en este momento.
                  </td>
                </tr>
              ) : (
                mockCases.filter(c => c.status === activeTab).map((c, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-[#1a1a24] transition-colors cursor-pointer">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{c.date}</div>
                      <div className="text-xs text-indigo-400 mt-1">{c.id}</div>
                      <div className="text-xs text-gray-500">Orden: {c.orderId}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{c.issue}</td>
                    <td className="p-4 text-sm text-white font-mono text-right font-bold">${c.amount} USD</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {c.status === 'abierto' ? <Clock className="w-4 h-4 text-orange-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                        <span className={`text-xs font-bold uppercase ${c.status === 'abierto' ? 'text-orange-400' : 'text-green-400'}`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{c.lastUpdate}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAJA DE CHAT FLOTANTE (Igual que antes pero pulida) */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-10 md:right-10 w-full md:w-[400px] h-[100dvh] md:h-[550px] bg-[#11111a] md:border border-indigo-500 md:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              {chatStatus === 'bot' ? <Bot className="text-white w-7 h-7 bg-white/20 p-1 rounded-full" /> : <User className="text-white w-7 h-7 bg-white/20 p-1 rounded-full" />}
              <div>
                <h4 className="font-bold text-sm text-white tracking-wide">{chatStatus === 'bot' ? 'IA TecnoByte LLC' : 'Soporte Humano'}</h4>
                <p className="text-xs text-indigo-200">{chatStatus === 'esperando_admin' ? 'Buscando agente disponible...' : 'En línea'}</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#0a0a12] scrollbar-thin scrollbar-thumb-indigo-600">
            <div className="text-center text-xs text-gray-500 mb-2">Tu IP está siendo registrada por seguridad.</div>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-[#1a1a24] border border-gray-700 text-gray-200 rounded-2xl rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-[#11111a] border-t border-gray-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu consulta o 'humano'..." 
                className="flex-1 bg-[#1a1a24] border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition transform hover:scale-105">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
