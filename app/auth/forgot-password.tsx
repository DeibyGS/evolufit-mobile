import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";
import { COLORS } from "../../constants/theme";

/**
 * Pantalla de recuperación de contraseña.
 *
 * Actúa como contenedor visual para `ForgotPasswordForm`.
 * La funcionalidad real de envío de correo está pendiente de implementar
 * en el backend (ver `ForgotPasswordForm` — badge "En desarrollo").
 *
 * La opacidad de la imagen de fondo es ligeramente mayor que en login/register
 * (0.2 vs 0.15) al ser una pantalla más simple con menos elementos visuales.
 *
 * Navegación: `router.back()` regresa a la pantalla anterior (login).
 */
export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/Hero.png")}
        style={styles.background}
        imageStyle={{ opacity: 0.2 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.orange} />
        </TouchableOpacity>

        <ForgotPasswordForm />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBg },
  background: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  backButton: {
    position: "absolute",
    top: 55,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.3)",
  },
});
