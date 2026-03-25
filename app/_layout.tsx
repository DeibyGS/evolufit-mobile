import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { COLORS } from "../constants/theme";
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  getNotificationPrefs,
} from "../hooks/useNotifications";

/**
 * CONFIGURACIÓN DEL SISTEMA DE NOTIFICACIONES TOAST
 *
 * Se define fuera del componente para que el objeto no se recree en
 * cada render, ya que es estático y no depende del estado.
 *
 * Se personalizan tres variantes del tema oscuro de EvolutFit:
 * - success: confirmaciones de acciones (login, guardado, etc.)
 * - error:   errores críticos (credenciales incorrectas, fallo de red)
 * - info:    mensajes neutros o de estado (servidor despertando, etc.)
 */
const toastConfig = {
  // Borde naranja EvolutFit para feedback positivo
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: COLORS.orange,
        backgroundColor: "#1a1a1a",
        height: "auto",
        minHeight: 60,
        paddingVertical: 10,
        borderLeftWidth: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 13, color: "#fff", fontWeight: "bold" }}
      text2Style={{ fontSize: 11, color: "#aaa", lineHeight: 18 }}
      text2NumberOfLines={5}
    />
  ),

  // Borde rojo vibrante para errores críticos
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ff4444",
        backgroundColor: "#1a1a1a",
        borderLeftWidth: 10,
      }}
      text1Style={{ fontSize: 13, color: "#fff", fontWeight: "bold" }}
      // Texto secundario en rojo para reforzar la gravedad del error
      text2Style={{ fontSize: 11, color: "#ff4444" }}
    />
  ),

  // Estética minimalista (gris/blanco) para mensajes de estado no críticos
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#555",
        backgroundColor: "#1a1a1a",
        borderLeftWidth: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      // Título en naranja para llamar la atención sin alarmar
      text1Style={{ fontSize: 13, color: COLORS.orange, fontWeight: "bold" }}
      text2Style={{ fontSize: 11, color: "#eee", lineHeight: 18 }}
      text2NumberOfLines={5}
    />
  ),
};

/**
 * Evita que el splash screen se oculte automáticamente antes de que
 * las fuentes estén cargadas. Se controla manualmente en el useEffect.
 */
SplashScreen.preventAutoHideAsync();

/**
 * Layout raíz de la aplicación (Expo Router).
 *
 * Responsabilidades:
 * 1. Cargar fuentes personalizadas (Poppins, Roboto) antes de mostrar UI.
 * 2. Controlar el splash screen hasta que las fuentes estén listas.
 * 3. Definir la estructura de navegación con Stack.
 * 4. Montar el componente Toast como capa global sobre toda la app.
 *
 * Decisión de arquitectura: el Toast se coloca aquí (nivel raíz) para
 * que pueda dispararse desde cualquier pantalla sin necesidad de
 * instanciarlo en cada una.
 *
 * Nota sobre `gestureEnabled: false` en (auth) y (tabs):
 * Impide que el usuario vuelva atrás con gesto de swipe entre grupos
 * de rutas, forzando la navegación explícita y evitando estados
 * inconsistentes (ej: volver a login estando ya autenticado).
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
  });

  useEffect(() => {
    // Se oculta el splash tanto si las fuentes cargaron como si hubo error,
    // para no bloquear la app indefinidamente ante un fallo de carga.
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    // Solicitar permisos de notificaciones al arrancar la app (solo la primera vez).
    // Si el usuario los concede, aplicar las preferencias guardadas (p.ej. reactivar
    // el recordatorio diario si estaba activado antes de reinstalar la app).
    const initNotifications = async () => {
      const granted = await requestNotificationPermission();
      if (!granted) return;

      const prefs = await getNotificationPrefs();
      if (prefs.dailyReminder) {
        await scheduleDailyReminder(true);
      }
    };

    initNotifications();
  }, []);

  // Mientras las fuentes no están listas, no se renderiza nada
  // (el splash screen sigue visible gracias a preventAutoHideAsync)
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.primaryBg },
          animation: "fade_from_bottom",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>

      {/*
        Toast montado como última capa para que siempre aparezca
        por encima de modales y otros overlays.
        topOffset={60} para evitar solapamiento con la barra de estado.
      */}
      <Toast config={toastConfig} topOffset={60} />
    </SafeAreaProvider>
  );
}
