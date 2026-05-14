import axios from 'axios';
import { auth } from '../pages/firebase';
import { SERVER_URL } from '../config/constants';

/**
 * Instancia de Axios configurada para TecnoByte.
 * Incluye interceptores para adjuntar automáticamente el ID Token de Firebase.
 */
const api = axios.create({
    baseURL: SERVER_URL,
    timeout: 30000, // 30 segundos
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para peticiones: adjuntar token si existe
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            try {
                // Obtenemos el token (si ya expiró, Firebase lo refresca automáticamente)
                const idToken = await user.getIdToken();
                config.headers.Authorization = `Bearer ${idToken}`;
            } catch (error) {
                console.error("Error al obtener ID Token:", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para respuestas: manejar expiración de sesión (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Si recibimos un 401 es que el token es inválido o expiró irremediablemente
            if (error.response.status === 401 && !error.config._retry) {
                console.warn("Sesión expirada detectada (401).");
                // Podríamos forzar un logout o redirigir al login
                // window.location.href = '/login';
            }
        } else if (error.request) {
            console.error("No se recibió respuesta del servidor (Posible caída o timeout):", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
