import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

/**
 * CONFIGURACIÓN CENTRAL DE LA API - EVOLUTFIT
 *
 * Se centraliza aquí toda la lógica HTTP para que cualquier cambio
 * (URL base, cabeceras, manejo de errores) se aplique globalmente
 * sin tocar cada componente individualmente.
 */
export const BASE_URL = "https://evolufit-backend.onrender.com/api";

/**
 * URL de "wake-up" para el servidor en Render.
 * Render apaga instancias gratuitas tras inactividad; hacer un GET
 * a este endpoint antes del login evita el cold start de ~30 segundos.
 */
export const WAKEUP_URL = "https://evolufit-backend.onrender.com/api/rm";

/**
 * Instancia de Axios con configuración base.
 *
 * Motivo para usar una instancia en lugar de axios global:
 * - Permite definir baseURL y headers por defecto una sola vez.
 * - Los interceptores se aplican solo a esta instancia, sin afectar
 *   llamadas externas que pudieran usarse en otros módulos.
 * - Timeout de 60s porque el servidor en Render tarda en despertar
 *   tras inactividad (cold start).
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

/**
 * INTERCEPTOR DE PETICIONES
 *
 * Inyecta automáticamente el JWT en la cabecera Authorization antes
 * de que cada petición salga hacia el backend.
 *
 * Por qué se usa `useAuthStore.getState()` en lugar de un hook:
 * - Los interceptores de Axios viven fuera del árbol de React,
 *   por lo que no pueden usar hooks. `getState()` accede al store
 *   de Zustand directamente sin necesitar contexto de React.
 *
 * Caso borde: si el usuario no está autenticado, `token` será null
 * y la cabecera Authorization no se añade, permitiendo que las rutas
 * públicas (login, register) funcionen correctamente.
 */
api.interceptors.request.use(
  async (config) => {
    // Acceso directo al store sin hook (context-free)
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * INTERCEPTOR DE RESPUESTAS
 *
 * Maneja errores HTTP de forma centralizada.
 *
 * Lógica de 401 (No autorizado):
 * - Ocurre cuando el JWT ha expirado o es inválido.
 * - Se llama a `logout()` directamente desde el store para limpiar
 *   el estado global, lo que a su vez redirige al usuario a la pantalla
 *   de login gracias al guard en `app/_layout.tsx`.
 *
 * Caso borde: si el backend devuelve 401 en una ruta pública por error
 * de configuración, también dispararía el logout. Monitorizar si ocurre.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido: forzar cierre de sesión
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default api;
