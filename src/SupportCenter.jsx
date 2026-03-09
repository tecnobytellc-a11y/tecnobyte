import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, Clock, FileText, X, Send, User, Bot, PlusCircle, Search, HelpCircle, PhoneCall, Mail, Smartphone, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
// 1. Importamos las herramientas de Firebase directamente aquí
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, orderBy } from 'firebase/firestore';

// 2. Coloca aquí los mismos datos de tu Firebase que ya tienes en tu panel de administración
const firebaseConfig = {
          apiKey: "AIzaSyBgqPltYbC8ZSzLszFA1y6FegfHJn91Ozg",
          authDomain: "tecnobyte-52ae0.firebaseapp.com",
          projectId: "tecnobyte-52ae0",
          storageBucket: "tecnobyte-52ae0.firebasestorage.app",
          messagingSenderId: "727089895868",
          appId: "1:727089895868:web:0412acf7c812a1f07b73b9",
          measurementId: "G-XC1PJ1PB6W"
        };

// 3. Inicializamos la base de datos de forma aislada solo para este componente
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function SupportCenter() {
  const [activeTab, setActiveTab] = useState('abiertos');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientCases, setClientCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  
  // Estados del Chat Real
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatData, setChatData] = useState(null); // Documento de Firebase del chat actual
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Estados para creación de chat
  const [startForm, setStartForm] = useState({ orderId: '', email: '' });
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Estados de Modales Adicionales
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

// --- MAGIA: CAMBIAR TÍTULO Y FAVICON A BLANCO SOLO PARA ESTA PÁGINA ---
  useEffect(() => {
      document.title = "Centro de Resoluciones | TecnoByte LLC";
      
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.src = 'favicon.png'; // Tu imagen actual
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
          try {
              // --- 🛠️ CONTROLES DE TAMAÑO Y POSICIÓN ---
              // 1. ZOOM: Aumenta este número para hacerlo más grande (Ej: 1.5, 2.0, 2.5)
              const zoom = 1.8; 
              
              // 2. POSICIÓN: Aumenta este número para bajarlo (Ej: 5, 10, 15)
              const moverAbajo = 8; 
              
              // Calculamos el nuevo tamaño
              const newWidth = canvas.width * zoom;
              const newHeight = canvas.height * zoom;
              
              // Lo centramos horizontalmente y aplicamos el ajuste vertical
              const x = (canvas.width - newWidth) / 2;
              const y = ((canvas.height - newHeight) / 2) + moverAbajo;

              // Dibujamos la imagen con los ajustes
              ctx.drawImage(img, x, y, newWidth, newHeight);
              
              // TRUCO: Reemplazamos todos los colores por BLANCO PURO
              ctx.globalCompositeOperation = 'source-in';
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Lo aplicamos a la pestaña
              link.href = canvas.toDataURL('image/png');
          } catch (e) {
              console.error("Error cargando el favicon de soporte:", e);
          }
      };
  }, []);

  // --- BASE DE DATOS MASIVA DE PREGUNTAS FRECUENTES (FAQ) ACTUALIZADA ---
  const faqCategories = [
    {
      category: "💳 Métodos de Pago y Facturación",
      questions: [
        { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos Pago Móvil, Transferencias Bancarias (Bs), Binance Pay (USDT), Zinli, PayPal y Efectivo (Cash) en zonas seleccionadas. Todos los pagos en Bolívares se calculan a la tasa actual publicada en nuestra plataforma." },
        { q: "¿Cuánto tarda en verificarse mi pago?", a: "Si usas Binance Pay o PayPal, la verificación suele ser instantánea o tardar menos de 2 minutos. Si usas Pago Móvil o Transferencia, la verificación manual por nuestro equipo toma entre 5 y 15 minutos en horario laboral." },
        { q: "Pagué por Pago Móvil, ¿qué hago ahora?", a: "Debes ingresar el número de referencia y subir la captura de pantalla de tu pago al momento de finalizar la compra. Nuestro equipo lo verificará y tu orden cambiará a 'Completado'." },
        { q: "¿Qué pasa si envío un monto menor al total de mi factura?", a: "Tu orden quedará en estado 'Pendiente'. Deberás comunicarte por soporte para completar el pago restante, o ajustaremos la cantidad de producto/servicio entregado en base al dinero real recibido." },
        { q: "¿Aceptan tarjetas de crédito internacionales?", a: "Puedes usar tu tarjeta de crédito sin problemas a través de PayPal o recargando tu billetera Zinli, actuando estas plataformas como intermediarios 100% seguros." },
        { q: "¿Por qué mi pago por Binance Pay fue rechazado?", a: "Generalmente ocurre si el tiempo de espera del código QR (15 mins) expiró antes de que confirmaras el pago en tu app, o si intentaste enviar una criptomoneda distinta a USDT. Genera una orden nueva e inténtalo de nuevo." },
        { q: "¿Cobran comisión por pagar con PayPal?", a: "Sí, PayPal aplica una comisión por recepción de fondos (aprox. 5.4% + $0.30). Nuestra plataforma calcula automáticamente este pequeño recargo al seleccionar PayPal para cubrir los costos de la pasarela." },
        { q: "¿Puedo pedir un reembolso?", a: "Al tratarse de bienes y servicios digitales (como diamantes, cuentas o números), todas las ventas son finales. Solo emitimos reembolsos a tu cuenta o saldo a favor si el servicio no pudo ser entregado por un fallo comprobable de nuestro sistema." }
      ]
    },
    {
      category: "🎮 Recargas (Free Fire, Roblox, COD)",
      questions: [
        { q: "¿Cómo envían los Diamantes de Free Fire?", a: "La recarga se hace 100% vía ID del jugador. No necesitamos ni pedimos tu correo o contraseña del juego. Solo asegúrate de escribir tu ID correctamente al comprar." },
        { q: "¿Hay riesgo de baneo por comprar diamantes o monedas aquí?", a: "Absolutamente CERO riesgo. Somos proveedores autorizados y todas las recargas se hacen por canales oficiales (ID o Códigos). No usamos métodos fraudulentos ni reembolsos ilegales (bineros)." },
        { q: "¿Cuánto tarda en llegar mi recarga a mi cuenta?", a: "Una vez que el pago está 'Verificado', las recargas vía ID de Free Fire, Roblox o Call of Duty Mobile suelen reflejarse en tu cuenta entre 5 y 15 minutos." },
        { q: "¿Sirven las recargas para cuentas de otras regiones?", a: "La mayoría de nuestras recargas de Free Fire son válidas para la región LATAM, EEUU y Brasil. Para otros juegos como Roblox, los códigos o recargas suelen ser globales." },
        { q: "Escribí mal mi ID de jugador al comprar, ¿qué hago?", a: "¡Contáctanos de inmediato abriendo un caso de soporte! Si la recarga aún no ha sido procesada por el sistema, podemos corregirlo. Si ya fue enviada a ese ID incorrecto, lamentablemente los juegos no permiten revertir el proceso." },
        { q: "¿Tienen promociones de recarga doble en Free Fire?", a: "Sí, cuando los juegos anuncian eventos globales de recarga doble (como en PagoStore), nuestras recargas vía ID también aplican automáticamente para esos beneficios." },
        { q: "Compré un código (PIN/Gift Card) y me da error, ¿qué hago?", a: "Verifica no haber ingresado espacios extra al copiarlo, o haber confundido la letra 'O' con el número '0'. Si el problema persiste, abre un ticket con tu ID de orden para revisarlo con nuestro proveedor." },
        { q: "¿Las recargas de Roblox son por Grupo o Gift Card?", a: "Ofrecemos recargas directas y también Códigos Globales (Gift Cards). Lee atentamente la descripción del producto antes de comprar para saber el método exacto de entrega." }
      ]
    },
    {
      category: "📺 Cuentas Streaming (Netflix, Max, Disney)",
      questions: [
        { q: "¿Las cuentas son pantallas o cuentas completas?", a: "Depende del producto que selecciones. Ofrecemos tanto 'Perfiles Individuales / Pantallas' (más económicos, compartidos) como 'Cuentas Completas' privadas donde tienes el control total y puedes crear tus propios perfiles." },
        { q: "¿Qué significa 'Cuenta a mi dominio'?", a: "Significa que nosotros activaremos la suscripción premium utilizando tu propio correo electrónico personal, en lugar de entregarte un correo prefabricado por nosotros." },
        { q: "¿Qué pasa si mi pantalla de Netflix pierde conexión o pide hogar?", a: "Cuentas con garantía durante el tiempo contratado. Abre un ticket de soporte con tu ID de orden y te enviaremos el código de actualización de hogar o una cuenta de reemplazo en el menor tiempo posible." },
        { q: "¿Se puede ver en varios dispositivos a la vez en un perfil compartido?", a: "No. Si adquieres un 'Perfil / Pantalla', solo puedes usar un (1) dispositivo en simultáneo. Compartir tu perfil con terceros o usar varios televisores a la vez bloqueará la cuenta general." },
        { q: "¿Puedo renovar la misma cuenta el próximo mes?", a: "¡Sí! En servicios como Max, Disney+, Crunchyroll y Spotify, si nos avisas con 48 horas de anticipación antes de tu corte, podemos renovar la suscripción sobre la misma cuenta para que no pierdas tu progreso ni historial." },
        { q: "¿Las cuentas tienen bloqueo geográfico (Geobloqueo)?", a: "Nuestras cuentas están optimizadas para funcionar en toda Latinoamérica (Venezuela, Colombia, etc.) sin necesidad de usar VPN, salvo que la descripción del producto indique estrictamente lo contrario." },
        { q: "¿Puedo cambiar la contraseña del perfil?", a: "Si compraste un 'Perfil Compartido', está ESTRICTAMENTE PROHIBIDO cambiar la contraseña, el correo o editar perfiles ajenos. Hacerlo anulará automáticamente tu garantía sin derecho a reembolso." },
        { q: "¿Tienen planes de 3, 6 o 12 meses?", a: "Sí, contamos con planes trimestrales, semestrales y anuales con excelentes descuentos. Puedes buscarlos en el catálogo o solicitarlos directamente por el chat de ventas." }
      ]
    },
    {
      category: "📱 Números Virtuales (WhatsApp, Telegram, etc)",
      questions: [
        { q: "¿Para qué sirve un número virtual?", a: "Sirve para recibir un código SMS (OTP) y poder verificar cuentas de WhatsApp, Telegram, PayPal, Tinder, Facebook, entre otras apps, sin necesidad de exponer ni usar tu número de teléfono real." },
        { q: "¿Venden números de países específicos?", a: "Sí, contamos con disponibilidad de números de USA (+1), Colombia (+57), Argentina (+54), España (+34), UK (+44), entre docenas de otros países. El costo puede variar según el país seleccionado." },
        { q: "¿Cuánto tiempo tengo para recibir el código?", a: "Una vez que te entregamos el número temporal en el chat, tienes una ventana de aproximadamente 15 a 20 minutos para solicitar el código SMS en la aplicación que elegiste." },
        { q: "¿Qué pasa si no llega el código SMS?", a: "Si el código no llega dentro de los primeros 10 minutos, infórmanos de inmediato por el chat de soporte. Cancelaremos ese número y te generaremos uno nuevo de inmediato sin costo adicional." },
        { q: "¿El número me pertenece para siempre?", a: "No. Los números que vendemos son de alquiler temporal (Drop-Numbers, solo para 1 verificación). Una vez recibido tu código, el número es desechado de la red." },
        { q: "¿Puedo recuperar un número virtual antiguo que compré hace tiempo?", a: "Imposible. Por políticas de seguridad y privacidad de las redes de telecomunicaciones, los números se destruyen del sistema luego de ser usados. No se pueden volver a activar bajo ninguna circunstancia." },
        { q: "¿Me pueden banear el WhatsApp por usar esto?", a: "Nuestros números son limpios (no VoIP quemados). Sin embargo, WhatsApp tiene políticas de seguridad estrictas. Recomendamos usar la app oficial de WhatsApp Business, no enviar spam masivo en las primeras 24 horas y poner foto de perfil para evitar baneos del algoritmo de Meta." }
      ]
    },
    {
      category: "🛡️ Seguridad, Garantías y Soporte",
      questions: [
        { q: "¿Cuál es su horario de atención al cliente?", a: "Nuestra tienda web recibe pagos y procesa órdenes automatizadas 24/7. Sin embargo, nuestro equipo de soporte humano y despachos manuales opera todos los días de 8:00 AM a 10:00 PM (Hora de Venezuela)." },
        { q: "¿Están mis datos seguros con TecnoByte LLC?", a: "Totalmente seguros. Utilizamos encriptación SSL de grado militar para la transmisión de datos. No almacenamos credenciales de tarjetas bancarias, y tus registros de compras se mantienen 100% confidenciales." },
        { q: "¿Cómo funcionan las garantías?", a: "Todos nuestros servicios digitales tienen garantía por el tiempo exacto contratado (Ej. 1 mes de Netflix = 30 días de garantía). La garantía cubre caídas de servicio, pero se anula si incumples las normas (como cambiar contraseñas en perfiles compartidos)." },
        { q: "¿Emiten factura formal de mi compra?", a: "Sí, al concretarse tu pedido, el sistema genera y envía automáticamente a tu correo electrónico un comprobante digital (invoice) internacional emitido por TecnoByte LLC." }
      ]
    }
  ];

  // --- BÚSQUEDA DE CASOS EN LA BASE DE DATOS ---
  const handleSearchCases = async (e) => {
      if(e) e.preventDefault();
      if(!searchQuery.trim()) return;
      
      setLoadingCases(true);
      try {
          // Busca casos asociados a ese OrderId o a ese Email
          const q = query(collection(db, "support_cases"), where("orderId", "==", searchQuery.trim()));
          const querySnapshot = await getDocs(q);
          
          const cases = [];
          querySnapshot.forEach((doc) => {
              cases.push({ id: doc.id, ...doc.data() });
          });
          
          setClientCases(cases);
      } catch (error) {
          console.error("Error buscando casos:", error);
          alert("Error al buscar en el sistema.");
      } finally {
          setLoadingCases(false);
      }
  };

  // --- LÓGICA DE INICIO DE CHAT (REAL) ---
  const handleStartChat = async (e) => {
      e.preventDefault();
      if(!startForm.orderId || !startForm.email) return alert("Por favor llena ambos campos");
      setIsStartingChat(true);

      try {
          // Obtenemos la IP del cliente usando una API gratuita
          let clientIp = 'Desconocida';
          try {
              const resIp = await fetch('https://api.ipify.org?format=json');
              const dataIp = await resIp.json();
              clientIp = dataIp.ip;
          } catch(e) {}

          const newCaseData = {
              orderId: startForm.orderId,
              userEmail: startForm.email,
              ip: clientIp,
              device: navigator.userAgent,
              status: 'esperando_admin',
              adminId: null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastMessage: 'Chat Iniciado por el Cliente'
          };

          const docRef = await addDoc(collection(db, "support_cases"), newCaseData);
          const caseId = docRef.id;

          // Mensaje automático del bot
          await addDoc(collection(db, "support_cases", caseId, "messages"), {
              sender: 'bot',
              text: `Hola. Soy el asistente virtual de TecnoByte LLC. He notificado a nuestro equipo sobre tu orden ${startForm.orderId}. Un asesor humano te atenderá por aquí en breve. Por favor, describe tu problema detalladamente.`,
              timestamp: serverTimestamp()
          });

          // Cargamos el chat localmente
          setChatData({ id: caseId, ...newCaseData });
          setIsStartingChat(false);
      } catch (error) {
          console.error(error);
          alert("No se pudo iniciar el chat de soporte. Verifica tu conexión.");
          setIsStartingChat(false);
      }
  };

  // --- ESCUCHADOR DE MENSAJES EN TIEMPO REAL ---
  useEffect(() => {
      if (!chatData) return;

      const q = query(collection(db, "support_cases", chatData.id, "messages"), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(loadedMessages);
      });

      // Escuchar también si el admin cierra el caso
      const caseUnsub = onSnapshot(doc(db, "support_cases", chatData.id), (docSnap) => {
          if (docSnap.exists()) {
              setChatData({ id: docSnap.id, ...docSnap.data() });
          }
      });

      return () => { unsubscribe(); caseUnsub(); };
  }, [chatData]);

  // --- ENVIAR MENSAJE (REAL) ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatData) return;

    const textToSend = inputMessage;
    setInputMessage(''); // Limpiar rápido

    try {
        await addDoc(collection(db, "support_cases", chatData.id, "messages"), {
            sender: 'user',
            text: textToSend,
            timestamp: serverTimestamp()
        });

        await updateDoc(doc(db, "support_cases", chatData.id), {
            lastMessage: textToSend,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error(error);
        alert("Error enviando el mensaje.");
    }
  };

  const openExistingChat = (caseObj) => {
      setChatData(caseObj);
      setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-sans pb-20">
      
      {/* HEADER TIPO PAYPAL */}
      <div className="bg-[#0a0a12] border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src="https://tecnobyte.lat/logo.png" alt="TecnoByte" className="h-8 filter brightness-0 invert" />
          <div className="h-6 w-px bg-gray-700 mx-2"></div>
          <h1 className="text-xl font-bold tracking-wide text-gray-200">Centro de Resoluciones</h1>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowContactModal(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-bold transition border border-gray-700">
                <PhoneCall className="w-4 h-4 text-green-400" /> Contacto
            </button>
            <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-bold transition shadow-lg shadow-indigo-900/50">
                <MessageCircle className="w-4 h-4" /> Asistencia en Línea
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* PANEL PRINCIPAL DEL CLIENTE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#11111a] border border-gray-800 rounded-xl p-6 md:p-8 mb-10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-5">
              <ShieldCheck size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black mb-2">Protección al Comprador</h2>
            <p className="text-gray-400 text-sm max-w-2xl">Rastrea el estado de tus reclamos, comunícate con nuestro equipo de soporte humano o consulta nuestra extensa base de conocimientos.</p>
          </div>
          <button onClick={() => { setChatData(null); setIsChatOpen(true); }} className="mt-6 md:mt-0 relative z-10 flex items-center gap-2 bg-transparent border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-6 py-3 rounded-lg font-bold transition-all w-full md:w-auto justify-center">
            <PlusCircle className="w-5 h-5" /> Abrir Nuevo Caso
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA DEL CLIENTE PARA RASTREO REAL */}
        <div className="mb-6">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Rastrea un caso existente</label>
            <form onSubmit={handleSearchCases} className="relative flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ingresa tu ID de Orden (Ej: TB-123456)..." 
                        className="w-full bg-[#11111a] border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                </div>
                <button type="submit" disabled={loadingCases} className="bg-gray-800 hover:bg-indigo-600 border border-gray-700 hover:border-indigo-500 px-6 rounded-lg font-bold transition-colors disabled:opacity-50">
                    {loadingCases ? 'Buscando...' : 'Rastrear'}
                </button>
            </form>
        </div>

        {/* TABLA DE CASOS DEL CLIENTE */}
        <div className="bg-[#11111a] border border-gray-800 rounded-xl overflow-hidden mb-16">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a24] border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">ID del Caso / Orden</th>
                <th className="p-4 font-bold hidden md:table-cell">Último Mensaje</th>
                <th className="p-4 font-bold text-center">Estado</th>
                <th className="p-4 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clientCases.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No hay casos cargados. Ingresa tu ID de orden arriba para buscar.
                  </td>
                </tr>
              ) : (
                clientCases.map((c, i) => (
                  <tr key={i} className="hover:bg-[#1a1a24] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-indigo-400 text-sm">{c.id}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">ORDEN: {c.orderId}</div>
                    </td>
                    <td className="p-4 text-xs text-gray-400 hidden md:table-cell max-w-xs truncate" title={c.lastMessage}>{c.lastMessage}</td>
                    <td className="p-4 text-center">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide
                            ${c.status === 'esperando_admin' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                              c.status === 'en_progreso' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                              'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                            {c.status.replace('_', ' ')}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                        <button onClick={() => openExistingChat(c)} className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded transition">Ver Chat</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SECCIÓN MASIVA DE PREGUNTAS FRECUENTES */}
        <div>
            <div className="text-center mb-10">
                <HelpCircle className="w-12 h-12 text-indigo-500 mx-auto mb-4 opacity-50" />
                <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Base de Conocimientos</h2>
                <p className="text-gray-400 text-sm">Todo lo que necesitas saber sobre TecnoByte, explicado al detalle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqCategories.map((cat, catIndex) => (
                    <div key={catIndex} className="bg-[#11111a] border border-gray-800 rounded-xl overflow-hidden h-fit">
                        <div className="bg-[#1a1a24] border-b border-gray-800 p-4">
                            <h3 className="font-bold text-indigo-400 text-sm">{cat.category}</h3>
                        </div>
                        <div className="divide-y divide-gray-800/50">
                            {cat.questions.map((faq, faqIndex) => {
                                const uniqueIndex = `${catIndex}-${faqIndex}`;
                                const isOpen = activeFaq === uniqueIndex;
                                return (
                                    <div key={faqIndex} className="p-4 cursor-pointer hover:bg-gray-800/30 transition" onClick={() => setActiveFaq(isOpen ? null : uniqueIndex)}>
                                        <div className="flex justify-between items-center gap-4">
                                            <h4 className={`text-sm font-semibold ${isOpen ? 'text-white' : 'text-gray-300'}`}>{faq.q}</h4>
                                            {isOpen ? <ChevronUp className="text-indigo-400 shrink-0 w-4 h-4"/> : <ChevronDown className="text-gray-600 shrink-0 w-4 h-4"/>}
                                        </div>
                                        {isOpen && (
                                            <div className="mt-3 text-xs text-gray-400 leading-relaxed border-l-2 border-indigo-500 pl-3">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* MODAL DE CONTACTO DIRECTO */}
      {showContactModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-in">
              <div className="bg-[#11111a] border border-gray-700 rounded-2xl w-full max-w-sm relative shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center relative">
                      <button onClick={()=>setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20}/></button>
                      <PhoneCall className="w-12 h-12 text-white mx-auto mb-2 drop-shadow-md" />
                      <h3 className="text-xl font-bold text-white">Canales Directos</h3>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-xs text-gray-400 text-center mb-4">Si tienes una emergencia comercial o prefieres un trato directo, contáctanos por nuestras vías oficiales.</p>
                      
                      <a href="https://wa.me/19047400467" target="_blank" className="flex items-center gap-4 bg-green-900/20 border border-green-500/30 hover:border-green-500 p-4 rounded-xl transition group">
                          <Smartphone className="text-green-400 w-8 h-8 group-hover:scale-110 transition-transform"/>
                          <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">WhatsApp Oficial</div>
                              <div className="text-white font-bold text-lg">+1 (904) 740-0467</div>
                          </div>
                      </a>

                      <a href="mailto:soporte@tecnobyte.lat" className="flex items-center gap-4 bg-indigo-900/20 border border-indigo-500/30 hover:border-indigo-500 p-4 rounded-xl transition group">
                          <Mail className="text-indigo-400 w-8 h-8 group-hover:scale-110 transition-transform"/>
                          <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Correo de Soporte</div>
                              <div className="text-white font-bold text-sm">soporte@tecnobyte.lat</div>
                          </div>
                      </a>
                      
                      <a href="mailto:reclamos@tecnobyte.lat" className="flex items-center gap-4 bg-red-900/20 border border-red-500/30 hover:border-red-500 p-4 rounded-xl transition group">
                          <AlertTriangle className="text-red-400 w-8 h-8 group-hover:scale-110 transition-transform"/>
                          <div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dpto. de Reclamos</div>
                              <div className="text-white font-bold text-sm">reclamos@tecnobyte.lat</div>
                          </div>
                      </a>
                  </div>
              </div>
          </div>
      )}

      {/* CAJA DE CHAT FLOTANTE (REAL TIME FIRESTORE) */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-10 md:right-10 w-full md:w-[400px] h-[100dvh] md:h-[600px] bg-[#11111a] md:border border-indigo-500 md:rounded-2xl shadow-2xl flex flex-col z-[90] overflow-hidden">
          
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              {chatData?.status === 'esperando_admin' ? <Bot className="text-white w-7 h-7 bg-white/20 p-1 rounded-full" /> : <User className="text-white w-7 h-7 bg-white/20 p-1 rounded-full" />}
              <div>
                <h4 className="font-bold text-sm text-white tracking-wide">
                    {!chatData ? 'Nuevo Ticket' : chatData.status === 'esperando_admin' ? 'Asistente Virtual' : 'Soporte Humano'}
                </h4>
                <p className="text-xs text-indigo-200">
                    {!chatData ? 'Identifícate' : chatData.status === 'esperando_admin' ? 'Buscando agente disponible...' : 'Agente Conectado'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!chatData ? (
              // FORMULARIO PARA INICIAR CHAT NUEVO
              <div className="flex-1 p-6 flex flex-col justify-center bg-[#0a0a12]">
                  <div className="text-center mb-6">
                      <ShieldCheck className="w-12 h-12 text-indigo-500 mx-auto mb-2 opacity-50" />
                      <h3 className="text-white font-bold text-lg">Verificación Requerida</h3>
                      <p className="text-xs text-gray-400 mt-1">Para brindarte soporte sobre una compra, necesitamos vincular este chat a tu orden.</p>
                  </div>
                  <form onSubmit={handleStartChat} className="space-y-4">
                      <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">ID de tu Orden</label>
                          <input type="text" required value={startForm.orderId} onChange={e=>setStartForm({...startForm, orderId: e.target.value})} placeholder="Ej: TB-987654" className="w-full bg-[#1a1a24] border border-gray-700 text-white rounded-lg p-3 outline-none focus:border-indigo-500 transition"/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Correo de la Compra</label>
                          <input type="email" required value={startForm.email} onChange={e=>setStartForm({...startForm, email: e.target.value})} placeholder="tu@correo.com" className="w-full bg-[#1a1a24] border border-gray-700 text-white rounded-lg p-3 outline-none focus:border-indigo-500 transition"/>
                      </div>
                      <button type="submit" disabled={isStartingChat} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg mt-4 transition disabled:opacity-50 shadow-lg">
                          {isStartingChat ? 'Conectando...' : 'Iniciar Conversación Segura'}
                      </button>
                  </form>
              </div>
          ) : (
              // ÁREA DE MENSAJES REAL TIME
              <>
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#0a0a12] scrollbar-thin scrollbar-thumb-indigo-600">
                    <div className="text-center text-[10px] text-gray-500 mb-2 font-mono bg-gray-900/50 py-1 rounded">
                        CASO ID: {chatData.id} <br/> Tu IP está registrada.
                    </div>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-[#1a1a24] border border-gray-700 text-gray-200 rounded-2xl rounded-bl-sm'}`}>
                          {msg.sender !== 'user' && <span className="block text-[9px] font-bold uppercase text-indigo-400 mb-1">{msg.sender === 'bot' ? 'Soporte IA' : 'Soporte Humano'}</span>}
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && <div className="text-center text-xs text-gray-500 mt-10">Conectado. Esperando mensajes...</div>}
                  </div>
                  
                  {/* CAJA DE TEXTO */}
                  {chatData.status !== 'cerrado' ? (
                      <div className="p-3 bg-[#11111a] border-t border-gray-800">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <input 
                            type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Escribe tu mensaje..." 
                            className="flex-1 bg-[#1a1a24] border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition transform hover:scale-105">
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                  ) : (
                      <div className="p-4 bg-[#11111a] border-t border-gray-800 text-center text-xs text-gray-500 font-bold flex flex-col items-center gap-1">
                          <Clock size={16} /> Este caso fue resuelto y cerrado.
                      </div>
                  )}
              </>
          )}
        </div>
      )}
    </div>
  );
}
