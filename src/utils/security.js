import { SERVER_URL } from '../config/constants';
// --- INYECCIÓN DE FIRESTORE PARA LEER RANGOS ---
import { db, auth } from '../pages/firebase'; // Ajusta la ruta a tu firebase.js si es necesario
import { doc, getDoc } from 'firebase/firestore';

export const getGPUInfo = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) return 'WebGL no disponible';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        };
    } catch (e) {
        return { error: 'Error obteniendo GPU' };
    }
};

export const getAdvancedGeoData = async () => {
    // Múltiples APIs de respaldo. Si un AdBlock bloquea una, salta a la siguiente silenciosamente.
    const apis = [
        async () => {
            const r = await fetch('https://ipapi.co/json/');
            const d = await r.json();
            if (d.error) throw new Error();
            return { ip: d.ip, isp: d.org, country: d.country_name, city: d.city, region: d.region, postal: d.postal, coordinates: `${d.latitude},${d.longitude}` };
        },
        async () => {
            const r = await fetch('https://freeipapi.com/api/json');
            const d = await r.json();
            return { ip: d.ipAddress, isp: 'N/A', country: d.countryName, city: d.cityName, region: d.regionName, postal: d.zipCode, coordinates: `${d.latitude},${d.longitude}` };
        }
    ];
    for (const api of apis) {
        try { return await api(); } catch (e) { continue; }
    }
    throw new Error("Todas las APIs fueron bloqueadas");
};

export const submitOrderToPrivateServer = async (order) => {
    const gpuData = getGPUInfo();

    // --- RECOLECCIÓN DE DATOS DE HUELLA DIGITAL EXTREMA (Silenciosa) ---
    let clientData = {
        capturedAt: new Date().toISOString(),
        localTime: new Date().toString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        vendor: navigator.vendor || 'Desconocido',
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || window.doNotTrack || "No Especificado",
        isBot: navigator.webdriver ? '🚨 Detectado (Posible Bot/Scraper)' : 'Humano',
        pdfViewerEnabled: navigator.pdfViewerEnabled,
        referrer: document.referrer || 'Acceso Directo / Favorito',
        gpu: gpuData,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen?.availWidth,
            availHeight: window.screen?.availHeight,
            colorDepth: window.screen?.colorDepth,
            pixelRatio: window.devicePixelRatio,
            orientation: window.screen?.orientation?.type || 'Desconocida'
        },
        hardware: {
            concurrency: navigator.hardwareConcurrency || 'N/A',
            memory: navigator.deviceMemory || 'N/A',
            touchPoints: navigator.maxTouchPoints || 0
        },
        connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData ? 'Sí (Ahorro de datos activo)' : 'No'
        } : 'N/A'
    };

    try {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            clientData.battery = { level: Math.round(battery.level * 100) + '%', charging: battery.charging };
        }
    } catch (e) { }

    // --- EJECUCIÓN ANTI-ADBLOCK DE UBICACIÓN ---
    try {
        const geoInfo = await getAdvancedGeoData();
        clientData.network = { ip: geoInfo.ip, isp: geoInfo.isp };
        clientData.geo = { country: geoInfo.country, city: geoInfo.city, region: geoInfo.region, postal: geoInfo.postal, coordinates: geoInfo.coordinates };
    } catch (err) {
        // Si ABSOLUTAMENTE todo falla
        try {
            const fbRes = await fetch('https://api.ipify.org?format=json');
            const fbData = await fbRes.json();
            clientData.network = { ip: fbData.ip, isp: 'Oculto por AdBlock' };
            clientData.ipError = "El usuario tiene un AdBlock extremadamente estricto. Solo se capturó la IP.";
        } catch (e) {
            clientData.ipError = "Fallo total de red. Posible uso de VPN Anti-Rastreo o navegador Tor.";
        }
    }

    // ============================================================
    // --- 💎 INYECCIÓN: LECTURA DE RANGO VIP PARA CASHBACK ---
    let cashback_pendiente = false;
    let cashback_porcentaje = 0;
    
    try {
        const user = auth.currentUser;
        if (user) {
            const userDoc = await getDoc(doc(db, "usuarios", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const pts = data.tecnoPoints_acumulados || 0;
                const rangoActual = data.rango || '';
                
                if (pts >= 15000 || rangoActual.toLowerCase() === 'diamante') {
                    cashback_pendiente = true;
                    cashback_porcentaje = 5;
                } else if (pts >= 5000 || rangoActual.toLowerCase() === 'oro') {
                    cashback_pendiente = true;
                    cashback_porcentaje = 2;
                }
            }
        }
    } catch (rangoError) {
        console.error("Error al leer el rango VIP para Cashback:", rangoError);
    }
    // ============================================================

    try {
        const sanitizedOrder = {
            ...order,
            date: order.date || new Date().toISOString(),
            // --- INYECCIÓN: ESTAMPAMOS EL CASHBACK EN LA ORDEN FINAL ---
            ...(cashback_pendiente && { cashback_pendiente, cashback_porcentaje }),
            clientInfo: clientData,
            fullData: {
                ...order.fullData,
                clientInfo: clientData,
                screenshot: typeof order.fullData?.screenshot === 'string' ? order.fullData.screenshot : null,
                idDoc: typeof order.fullData?.idDoc === 'string' ? order.fullData.idDoc : null
            }
        };
        const response = await fetch(`${SERVER_URL}/api/save-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizedOrder)
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("❌ Error enviando orden:", error);
        alert(`NO SE PUDO PROCESAR LA ORDEN:\nHubo un problema de conexión con el servidor.\n\nIntenta de nuevo.`);
        return false;
    }
};

export const reportSuspiciousIP = async (ipData, reason) => {
    try {
        await fetch(`${SERVER_URL}/api/report-ip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ip: ipData.ip,
                reason,
                geo: ipData.country,
                detectedAt: new Date().toISOString()
            })
        });
    } catch (e) { }
};

export const processStreamingPurchase = async (finalOrder) => {
    const streamingItems = finalOrder.rawItems.filter(item => item.providerId && item.providerId > 0);
    if (streamingItems.length > 0) {
        const accountsDelivered = [];
        let deliverySuccess = false;
        for (const item of streamingItems) {
            try {
                const response = await fetch(`${SERVER_URL}/api/purchase-streaming`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service_id: item.providerId })
                });
                const result = await response.json();
                if (result.success && result.data) {
                    accountsDelivered.push({ title: item.title, ...result.data });
                    deliverySuccess = true;
                }
            } catch (error) {
                console.error(`Error auto-streaming:`, error);
            }
        }
        if (deliverySuccess) {
            finalOrder.fullData.streamingAccounts = accountsDelivered;
            finalOrder.fullData.streamingAccount = accountsDelivered[0];
            finalOrder.status = "ENTREGADO AUTOMÁTICAMENTE";
            finalOrder.deliveryStatus = "SUCCESS";
        } else {
            finalOrder.status = "PAGADO (Pendiente Entrega Manual)";
            finalOrder.deliveryStatus = "FAILED_PROVIDER";
            finalOrder.fullData.deliveryNote = "El pago fue verificado correctamente, pero hubo un error conectando con el proveedor de cuentas. Contacte soporte para entrega manual.";
        }
    } else {
        finalOrder.status = "VERIFICADO (Procesando)";
    }
    return finalOrder;
};

export const solicitarPinAutomatico = async (idProducto, valorTarjeta, precioPagado, correoCliente) => {
    try {
        const respuesta = await fetch(`${SERVER_URL}/api/comprar-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: idProducto,
                amount: valorTarjeta,
                precioPagado: precioPagado,
                identifier: correoCliente
            })
        });
        const datos = await respuesta.json();

        if (datos.success) {
            console.log("Orden procesada en el servidor. Revisa el correo.");
        } else {
            console.error("No se pudo generar la orden:", datos.mensaje);
        }
    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
    }
};
