import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Importamos 'api' que es tu instancia de Axios configurada
import api from "../../api/API";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/Button";
import { FullPageLoader } from "../ui/FullPageLoader";
import { InputStandard } from "../ui/InputStandard";

export const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    // 1. Validación de campos
    if (!formData.email || !formData.password) {
      Alert.alert("Campos vacíos", "Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Petición con Axios (api)
      // No necesitas BASE_URL aquí porque ya está configurada en tu instancia 'api'
      const response = await api.post("/auth/login", formData);

      // 3. Gestión de éxito
      // Axios devuelve el cuerpo de la respuesta en '.data' automáticamente
      const { user, token } = response.data;

      login(user, token); // Guardamos en Zustand + AsyncStorage

      // Limpiamos cargando antes de navegar
      setIsLoading(false);

      // Navegación al Dashboard
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      setIsLoading(false);

      // 4. Manejo de errores profesional
      // Capturamos el mensaje que viene del backend o un error genérico
      const errorMessage = error.response?.data?.message || "Error de conexión";

      if (error.message === "Network Error") {
        Alert.alert(
          "Servidor despertando",
          "Estamos preparando tu sesión en Render. Por favor, espera 15 segundos y reintenta.",
        );
      } else {
        Alert.alert("Error de Inicio de Sesión", errorMessage);
      }
    }
  };

  return (
    <View style={styles.card}>
      {/* El loader se activa sobre el formulario */}
      {isLoading && <FullPageLoader />}

      <Text style={styles.title}>Iniciar Sesión</Text>
      <View style={styles.underline} />

      <InputStandard
        label="Email"
        placeholder="ejemplo@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />

      <InputStandard
        label="Contraseña"
        placeholder="********"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => router.push("/auth/forgot-password")}
      >
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <Button
        title={isLoading ? "Conectando..." : "Entrar"}
        onPress={handleSubmit}
        style={{ width: "100%" }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.registerLink}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(17, 17, 17, 0.95)",
    padding: 25,
    borderRadius: SIZES.radiusButton,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    // Sombras para dar profundidad premium
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    width: "100%",
  },
  title: {
    fontFamily: FONTS.secondaryBold,
    color: "#fff",
    fontSize: 28,
    textAlign: "center",
  },
  underline: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.orange,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 25,
    borderRadius: 2,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotText: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 5,
  },
  footerText: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
  },
  registerLink: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
  },
});
