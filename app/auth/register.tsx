import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { COLORS, FONTS } from "../../constants/theme";

/**
 * Pantalla de registro de nuevo usuario.
 *
 * A diferencia de la pantalla de login, aquí se necesitan dos capas extra:
 * - `KeyboardAvoidingView`: el formulario de registro tiene varios campos,
 *   y en iOS el teclado puede tapar los últimos inputs si no se ajusta
 *   el comportamiento (en Android el sistema lo maneja con "height").
 * - `ScrollView`: el formulario es más largo que la pantalla en dispositivos
 *   pequeños, por lo que necesita ser desplazable.
 *
 * Navegación: al pulsar "atrás" se redirige a `/` con `replace` (no `back`)
 * para evitar que el usuario quede atrapado en un estado de pila inconsistente
 * si llegó aquí desde la landing page.
 */
export default function RegisterPage() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // iOS: desplaza la pantalla hacia arriba; Android: reduce la altura del contenido
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/Hero.png")}
          style={styles.background}
          // Opacidad reducida igual que en login para mantener coherencia visual
          imageStyle={{ opacity: 0.15 }}
        >
          {/* BOTÓN VOLVER */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.orange} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* FORMULARIO DE REGISTRO */}
            <RegisterForm />

            {/* BRANDING AL FINAL DEL SCROLL — queda visible al llegar al final del formulario */}
            <View style={styles.footerBranding}>
              <Text style={styles.footerLogoText}>
                Evolut<Text style={{ color: COLORS.orange }}>Fit</Text>
              </Text>
              <Image
                source={require("../../assets/images/diagrama.png")}
                style={styles.footerLogoImg}
                resizeMode="contain"
              />
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    // paddingTop deja espacio para el botón "atrás" posicionado absolutamente
    paddingTop: 120,
    paddingBottom: 40,
  },
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
  footerBranding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    gap: 10,
    opacity: 0.5,
  },
  footerLogoText: {
    fontFamily: FONTS.secondaryBold,
    fontSize: 20,
    color: "#fff",
  },
  footerLogoImg: {
    height: 25,
    width: 25,
  },
});
