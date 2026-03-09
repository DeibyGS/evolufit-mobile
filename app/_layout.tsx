import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message"; // Importación limpia
import { COLORS } from "../constants/theme";

// 1. CONFIGURACIÓN DEL TOAST (Fuera del componente para mayor rendimiento)
const toastConfig = {
  // SUCCESS: Naranja EvolutFit
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: COLORS.orange,
        backgroundColor: "#1a1a1a",
        height: "auto",
        minHeight: 60,
        paddingVertical: 10,
        borderLeftWidth: 10, // Un poco más grueso para que resalte el color
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 13, color: "#fff", fontWeight: "bold" }}
      text2Style={{ fontSize: 11, color: "#aaa", lineHeight: 18 }}
      text2NumberOfLines={5}
    />
  ),

  // ERROR: Rojo vibrante para alertas críticas
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ff4444",
        backgroundColor: "#1a1a1a",
        borderLeftWidth: 10,
      }}
      text1Style={{ fontSize: 13, color: "#fff", fontWeight: "bold" }}
      text2Style={{ fontSize: 11, color: "#ff4444" }} // Texto 2 en rojo suave para énfasis
    />
  ),

  // INFO: Estética minimalista (Gris/Blanco) - Ideal para tus mensajes de "Hulk" o "Cardio"
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#555", // Gris oscuro para que sea neutro y elegante
        backgroundColor: "#1a1a1a",
        borderLeftWidth: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 13, color: COLORS.orange, fontWeight: "bold" }} // Título en naranja para llamar la atención
      text2Style={{ fontSize: 11, color: "#eee", lineHeight: 18 }}
      text2NumberOfLines={5}
    />
  ),
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

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
        {/* Definimos el esqueleto de la navegación */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>

      {/* El Toast siempre al final, como última capa del pastel */}
      <Toast config={toastConfig} topOffset={60} />
    </SafeAreaProvider>
  );
}
