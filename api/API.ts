import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

/**
 * CONFIGURACIÓN CENTRAL DE LA API - EVOLUTFIT
 */
export const BASE_URL = "https://evolufit-backend.onrender.com/api";
export const WAKEUP_URL = "https://evolufit-backend.onrender.com/api/rm";

// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 segundos antes de dar error de conexión
});

/**
 * INTERCEPTOR DE PETICIONES
 * Añade el token de autenticación de Zustand automáticamente si existe.
 */
api.interceptors.request.use(
  async (config) => {
    // Obtenemos el token directamente del store de Zustand
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
 * Maneja errores globales, como la expiración del token (401).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expira, cerramos sesión automáticamente
      useAuthStore.getState().logout();
      console.log("Sesión expirada o token inválido.");
    }
    return Promise.reject(error);
  },
);

export default api;
