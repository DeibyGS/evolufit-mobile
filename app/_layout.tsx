import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";

// Mantiene la pantalla de inicio visible hasta que las fuentes carguen
SplashScreen.preventAutoHideAsync();

/**
 * ROOT LAYOUT - El "corazón" de la App Mobile
 * @description
 * Este componente envuelve a todas las pantallas. Aquí cargamos los recursos
 * globales y configuramos la estética de la navegación.
 */
export default function RootLayout() {
  // 1. CARGA DE FUENTES (Sincronizado con tu theme.ts)
  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
  });

  // 2. CONTROL DE PANTALLA DE CARGA
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Si las fuentes no han cargado, no renderizamos nada (evita errores visuales)
  if (!loaded && !error) {
    return null;
  }

  return (
    /* 3. CONFIGURACIÓN DE NAVEGACIÓN GLOBAL */
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          // Ocultamos la cabecera por defecto para usar tu diseño custom
          headerShown: false,
          // Aplicamos tu color de fondo primario a todas las vistas
          contentStyle: { backgroundColor: COLORS.primaryBg },
          // Animación suave de cambio de pantalla
          animation: "fade_from_bottom",
        }}
      >
        {/* Definición de rutas principales */}
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}
