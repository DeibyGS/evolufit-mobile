import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Definimos la forma del usuario para tener autocompletado (TypeScript)
interface User {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
  // añade aquí otros campos que devuelva tu backend
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuth: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuth: false,

      // Acción para iniciar sesión
      login: (user, token) =>
        set({
          user,
          token,
          isAuth: true,
        }),

      // Acción para cerrar sesión
      logout: () =>
        set({
          user: null,
          token: null,
          isAuth: false,
        }),

      // Útil para cuando el usuario edita su perfil
      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: "auth-storage", // Nombre de la "llave" en el almacenamiento
      storage: createJSONStorage(() => AsyncStorage), // Usamos el storage nativo del móvil
    },
  ),
);
