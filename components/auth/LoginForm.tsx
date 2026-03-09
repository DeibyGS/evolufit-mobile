import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../api/API";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/Button";
import { FullPageLoader } from "../ui/FullPageLoader";

export const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [emptyState, setEmptyState] = useState(false);

  const handleSubmit = async () => {
    setErrors({});
    const isAnyFieldEmpty = !formData.email || !formData.password;
    setEmptyState(isAnyFieldEmpty);

    if (isAnyFieldEmpty) {
      const newErrors: any = {};
      if (!formData.email) newErrors.email = "El correo es obligatorio";
      if (!formData.password)
        newErrors.password = "La contraseña es obligatoria";
      setErrors(newErrors);

      return Toast.show({
        type: "error",
        text1: "Campos incompletos",
        text2: "Por favor, rellena todos los campos 📋",
      });
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const { user, token } = response.data;

      login(user, token);

      Toast.show({
        type: "success",
        text1: "¡Bienvenido de nuevo! 🔥",
        text2: "Sesión iniciada correctamente",
      });

      setIsLoading(false);
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      const data = error.response?.data;

      if (data?.errors && Array.isArray(data.errors)) {
        const apiErrors: any = {};
        data.errors.forEach((err: any) => {
          const fieldName = Array.isArray(err.path) ? err.path[0] : err.path;
          apiErrors[fieldName] = err.message;
        });

        setErrors(apiErrors);
        return Toast.show({
          type: "error",
          text1: "Error de validación",
          text2: "Revisa los campos marcados en rojo",
        });
      }

      const errorMessage = data?.message || "Error de conexión";
      if (error.message === "Network Error") {
        Toast.show({
          type: "info",
          text1: "Servidor despertando",
          text2: "Preparando sesión. Reintenta en 15 segundos. ⏳",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Fallo al entrar",
          text2: errorMessage,
        });
      }
    }
  };

  return (
    <View style={styles.card}>
      {isLoading && <FullPageLoader />}

      <Text style={styles.title}>Iniciar Sesión</Text>
      <View style={styles.underline} />

      {/* INPUT EMAIL */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            emptyState && !formData.email && styles.inputEmpty,
            errors.email && styles.inputError,
          ]}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => {
            setFormData({ ...formData, email: text });
            if (errors.email) setErrors({ ...errors, email: null });
            if (emptyState) setEmptyState(false);
          }}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* INPUT PASSWORD */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={[
            styles.input,
            emptyState && !formData.password && styles.inputEmpty,
            errors.password && styles.inputError,
          ]}
          placeholder="********"
          placeholderTextColor="#555"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => {
            setFormData({ ...formData, password: text });
            if (errors.password) setErrors({ ...errors, password: null });
            if (emptyState) setEmptyState(false);
          }}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: "#ccc",
    fontFamily: FONTS.primary,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    fontFamily: FONTS.primary,
    fontSize: 16,
  },
  inputEmpty: {
    borderColor: COLORS.orange,
    borderWidth: 1.2,
  },
  inputError: {
    borderColor: "#ff4d4d",
    borderWidth: 1.2,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 11,
    marginTop: 5,
    marginLeft: 5,
    fontFamily: FONTS.primary,
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
