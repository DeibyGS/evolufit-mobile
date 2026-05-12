import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Representa los datos del usuario autenticado.
 *
 * Estos campos deben coincidir con lo que devuelve el backend en
 * `POST /api/auth/login` → `response.data.user`.
 * Si el backend añade nuevos campos, ampliar esta interfaz.
 */
interface User {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
}

/**
 * Define la forma completa del store de autenticación:
 * estado + acciones.
 *
 * Por qué Zustand para la autenticación:
 * - Más simple que Redux para un estado global pequeño.
 * - El middleware `persist` serializa el estado a AsyncStorage
 *   automáticamente, manteniendo la sesión entre reinicios de la app.
 * - `getState()` permite acceder al token fuera de componentes React
 *   (necesario en el interceptor de Axios).
 */
interface AuthState {
  user: User | null;
  token: string | null;
  /** Bandera derivada: true cuando user y token están presentes. */
  isAuth: boolean;
  /**
   * Guarda el usuario y el token tras un login exitoso.
   * El middleware `persist` persiste estos valores en AsyncStorage.
   */
  login: (user: User, token: string) => void;
  /**
   * Limpia todo el estado de autenticación.
   * Se invoca manualmente (botón cerrar sesión) o automáticamente
   * desde el interceptor de Axios cuando el backend devuelve 401.
   */
  logout: () => void;
  /**
   * Actualiza campos parciales del usuario sin reemplazarlo entero.
   * Útil para reflejar cambios de perfil sin necesitar un nuevo login.
   *
   * Caso borde: si `user` es null (sesión expirada antes de que se
   * llame a esta función), no se actualiza nada para evitar un estado
   * inconsistente.
   */
  updateUser: (user: Partial<User>) => void;
}

/**
 * Store global de autenticación.
 *
 * El middleware `persist` envuelve el store para sincronizar
 * automáticamente con AsyncStorage en cada cambio de estado.
 * Al abrir la app, Zustand rehidrata el store desde el almacenamiento
 * local antes de que se monte el primer componente.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuth: false,

      login: (user, token) =>
        set({
          user,
          token,
          isAuth: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuth: false,
        }),

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      // Clave bajo la que se guarda el estado en AsyncStorage
      name: "auth-storage",
      // Adaptador para que Zustand use AsyncStorage (API nativa de RN)
      // en lugar de localStorage (que no existe en React Native)
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
