import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LoginForm } from "../../components/auth/LoginForm";
import { COLORS, FONTS } from "../../constants/theme";

/**
 * Pantalla de inicio de sesión.
 *
 * Esta pantalla actúa como contenedor visual (layout) para el
 * componente `LoginForm`, que contiene toda la lógica de autenticación.
 * La separación permite reutilizar `LoginForm` en otros contextos
 * si fuera necesario.
 *
 * La imagen de fondo (Hero.png) se muestra con opacidad 0.15 para
 * mantener el branding sin distraer del formulario principal.
 *
 * Navegación: al pulsar "atrás" se regresa a la ruta anterior en la
 * pila del navigator (normalmente la landing `/`).
 */
export default function LoginPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/Hero.png")}
        style={styles.background}
        imageStyle={{ opacity: 0.15 }}
      >
        {/* BOTÓN VOLVER */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.orange} />
        </TouchableOpacity>

        {/* CONTENEDOR CENTRAL PARA EL FORMULARIO */}
        <View style={styles.formContainer}>
          <LoginForm />
        </View>

        {/* BRANDING INFERIOR — mismo patrón visual que en el menú hamburguesa */}
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
      </ImageBackground>
    </View>
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
  formContainer: {
    flex: 1,
    justifyContent: "center", // Centra el formulario verticalmente en la pantalla
  },
  footerBranding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
    gap: 10,
    // Opacidad reducida para que el branding no compita visualmente con el formulario
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
