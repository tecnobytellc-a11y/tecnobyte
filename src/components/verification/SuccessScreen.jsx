import React from 'react';
import { Check, User, Link as LinkIcon } from 'lucide-react';

const SuccessScreen = ({ lastOrder, setView }) => {
    // Lógica del botón de WhatsApp
    const handleWhatsApp = () => {
        const orderText = lastOrder?.orderId ? ` Mi número de orden es ${lastOrder.orderId}.` : '';
        const text = encodeURIComponent(`Hola equipo de TecnoByte, tengo un problema con mi compra.${orderText}`);
        window.open(`https://wa.me/19047400467?text=${text}`, '_blank');
    };

    // Lógica nativa para generar el PDF de la factura
    const handleDownloadPDF = async () => {
        const orderId = lastOrder?.orderId || 'N/A';
        const date = lastOrder?.date ? new Date(lastOrder.date).toLocaleString('es-VE') : new Date().toLocaleString('es-VE');
        const user = lastOrder?.user || 'Cliente';
        const email = lastOrder?.fullData?.email || 'N/A';
        const phone = lastOrder?.fullData?.phone || 'N/A';
        const method = lastOrder?.paymentMethod || 'N/A';
        const idNumber = lastOrder?.fullData?.idNumber || 'N/A';
        
        const rawItems = lastOrder?.rawItems || [];
        const subtotal = rawItems.reduce((acc, item) => acc + item.price, 0);
        const hasCoupon = !!lastOrder?.couponData;
        const discountAmount = hasCoupon ? subtotal - parseFloat(lastOrder.total) : 0;
        
        // 🚀 Generador de QR Híbrido (Intenta local, si falla usa API de respaldo segura)
        let qrImageSrc = '';
        try {
            if (typeof QRCode !== 'undefined') {
                qrImageSrc = await window.QRCode.toDataURL(`https://www.tecnobyte.lat/verificar-orden/${orderId}`, {
                    width: 75, margin: 0, color: { dark: '#000000', light: '#ffffff' }
                });
            } else {
                throw new Error("Librería qrcode no importada");
            }
        } catch (err) {
            console.error('Usando QR de respaldo:', err);
            // Fallback infalible si la librería local falla
            qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.tecnobyte.lat/verificar-orden/${orderId}`;
        }

        const printWindow = window.open('', '_blank');
        
        // Plantilla HTML de la Factura (Logo asumiendo un base64 en App original, aquí pondré uno de muestra o de la web)
        const LOGO_FACTURA_BASE64 = "/logo.png"; // Fallback URL if base64 absent in original extraction
        const html = `
          <html>
            <head>
              <title>Factura TecnoByte - ${orderId}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;600&display=swap');
                body { font-family: 'Inter', sans-serif; background-color: #0a0a12; color: #ffffff; padding: 40px; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .container { max-width: 800px; margin: 0 auto; background: #11111a; border: 1px solid #4f46e5; border-radius: 12px; padding: 40px; box-sizing: border-box; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2d2d3b; padding-bottom: 20px; margin-bottom: 30px; }
                
                .logo-container { position: relative; display: inline-block; margin-bottom: 5px; }
                .logo-img { position: relative; left: -4px; z-index: 2; max-height: 180px; max-width: 400px; width: auto; object-fit: contain; filter: brightness(0) invert(1); }

                .invoice-title { font-size: 24px; color: #fff; font-weight: 600; text-align: right; letter-spacing: 1px; }
                .grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .col { width: 48%; }
                .label { font-size: 11px; color: #8b8b9f; text-transform: uppercase; margin-bottom: 4px; font-weight: 600; letter-spacing: 1px; }
                .value { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
                th { background: #1a1a24; color: #8b8b9f; text-align: left; padding: 14px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #2d2d3b; }
                td { padding: 14px; border-bottom: 1px solid #2d2d3b; font-size: 14px; }
                .totals { width: 320px; margin-left: auto; }
                .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #a1a1aa; }
                .totals-row.discount { color: #4ade80; }
                .totals-row.grand { border-top: 2px solid #4f46e5; font-size: 18px; font-weight: bold; color: #4f46e5; margin-top: 10px; padding-top: 15px; }
                .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #8b8b9f; border-top: 1px solid #2d2d3b; padding-top: 20px; line-height: 1.6; }
                .highlight { color: #22d3ee; font-weight: 600; }
                @media print {
                    body { background-color: #0a0a12 !important; }
                    .container { border: 1px solid #4f46e5 !important; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div>
                    <div class="logo-container">
                      <img class="logo-img" src="${LOGO_FACTURA_BASE64}" alt="TecnoByte Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                      <div style="display: none; font-family: 'Orbitron', sans-serif; font-size: 32px; color: #ffffff; font-weight: 900; letter-spacing: 2px; position: relative; z-index: 2;">TECNOBYTE</div>
                    </div>
                    <div style="font-size: 12px; color: #8b8b9f; margin-top: 4px;">TecnoByte LLC</div>
                  </div>
                  
                  <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 15px;">
                    <div>
                      <div class="invoice-title">FACTURA DIGITAL</div>
                      <div class="label" style="text-align: right; margin-top: 5px; color: #22d3ee;">ORDEN #${orderId}</div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="text-align: right; max-width: 140px;">
                        <div style="color: #4ade80; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3;">¡Escanea aquí para saber el estatus de tu orden!</div>
                        <div style="color: #4ade80; font-size: 20px; line-height: 0.8; margin-top: 6px;">➔</div>
                      </div>
                      <div style="background: white; padding: 6px; border-radius: 8px; display: flex; justify-content: center; align-items: center;">
                        <img src="${qrImageSrc}" width="75" height="75" alt="QR Verificación" style="display:block;" />
                      </div>
                    </div>
                  </div>

                </div>
                
                <div class="grid">
                  <div class="col">
                    <div class="label">Facturado a:</div>
                    <div class="value">${user}</div>
                    
                    <div class="label">Cédula / Documento:</div>
                    <div class="value">${idNumber}</div>
                    
                    <div class="label">Correo Electrónico:</div>
                    <div class="value">${email}</div>
                    <div class="label">Teléfono / WhatsApp:</div>
                    <div class="value">${phone}</div>
                  </div>
                  <div class="col" style="text-align: right;">
                    <div class="label">Fecha de Emisión:</div>
                    <div class="value">${date}</div>
                    <div class="label">Método de Pago:</div>
                    <div class="value" style="text-transform: uppercase;">${method.replace('_', ' ')}</div>
                    <div class="label">Estado de la Orden:</div>
                    <div class="value" style="color: #4ade80;">PAGADO / COMPLETADO</div>
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Descripción del Servicio / Producto</th>
                      <th style="text-align: right;">Precio (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rawItems.map(item => `
                      <tr>
                        <td><strong>${item.title}</strong><br><span style="font-size: 11px; color: #8b8b9f; text-transform: uppercase;">${item.category || ''}</span></td>
                        <td style="text-align: right; font-family: monospace; font-size: 15px;">$${item.price.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

                <div class="totals">
                  <div class="totals-row">
                    <span>Subtotal:</span>
                    <span style="font-family: monospace;">$${subtotal.toFixed(2)}</span>
                  </div>
                  ${hasCoupon ? `
                  <div class="totals-row discount">
                    <span>Cupón Canjeado (${lastOrder.couponData.code} -${(lastOrder.couponData.discountType || lastOrder.couponData.type) === 'fixed' ? '$' : ''}${lastOrder.couponData.discountValue || lastOrder.couponData.amount || lastOrder.couponData.percent || lastOrder.couponData.value}${(lastOrder.couponData.discountType || lastOrder.couponData.type) !== 'fixed' ? '%' : ''}):</span>
                    <span style="font-family: monospace;">-$${discountAmount.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div class="totals-row grand">
                    <span>TOTAL PAGADO:</span>
                    <span style="font-family: monospace;">$${parseFloat(lastOrder?.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div class="footer">
                  <p>Escanea el código QR de arriba para verificar la autenticidad de esta orden.</p>
                  <p>WhatsApp: <span class="highlight">+1 (904) 740-0467</span> | Correos: <span class="highlight">soporte@tecnobyte.lat</span> / <span class="highlight">reclamos@tecnobyte.lat</span></p>
                  <p style="margin-top: 15px;">Gracias por confiar en los servicios digitales de TecnoByte LLC.</p>
                </div>
              </div>
              <script>
                window.onload = function() { setTimeout(function(){ window.print(); }, 800); }
              </script>
            </body>
          </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    };
  
    if (!lastOrder) return null;

    const rawItems = lastOrder.rawItems || [];
    const subtotal = rawItems.reduce((acc, item) => acc + item.price, 0);

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 animate-scale-in">
            {/* Encabezado Visual */}
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <Check size={40} className="text-green-500" strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-2 font-orbitron tracking-wide">
                    ¡COMPRA EXITOSA!
                </h2>
                <p className="text-gray-400 text-lg">
                    Tu orden ha sido registrada y procesada correctamente en nuestra base de datos.
                </p>
            </div>

            {/* Tarjeta de Resumen en Pantalla */}
            <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl mb-8">
                {/* Info Orden */}
                <div className="bg-indigo-900/40 border-b border-indigo-500/30 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Número de Orden</p>
                        <p className="text-white font-mono text-2xl font-bold">{lastOrder.orderId}</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Fecha de Procesamiento</p>
                        <p className="text-white text-sm">{new Date(lastOrder.date).toLocaleString('es-VE')}</p>
                    </div>
                </div>

                {/* Grid Cliente y Pago */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-800">
                    <div className="space-y-4">
                        <h4 className="text-white font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
                            <User size={18} className="text-cyan-400" /> Datos del Cliente
                        </h4>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Nombre Completo</p>
                            <p className="text-gray-200 text-sm font-medium">{lastOrder.user}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Contacto</p>
                            <p className="text-gray-200 text-sm">{lastOrder.fullData?.email || 'No registrado'} <br/> {lastOrder.fullData?.phone || 'No registrado'}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-white font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
                            <Check size={18} className="text-green-400" /> Información de Pago
                        </h4>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Método Seleccionado</p>
                            <p className="text-white font-bold uppercase tracking-wider">{lastOrder.paymentMethod.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Monto Total</p>
                            <p className="text-green-400 font-mono text-xl font-bold">${lastOrder.total}</p>
                            {lastOrder.paymentMethod.includes('bs') && (
                                <p className="text-xs text-gray-400">≈ {lastOrder.amountBs} Bs</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <button onClick={() => setView('home')} className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                     Volver al Inicio
                 </button>
                 <button onClick={handleDownloadPDF} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-colors">
                     Descargar Factura
                 </button>
                 <button onClick={handleWhatsApp} className="px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-colors">
                     Soporte WhatsApp
                 </button>
            </div>
            
        </div>
    );
};

export default SuccessScreen;
