import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../api/API";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { Button } from "../ui/Button";
import { FullPageLoader } from "../ui/FullPageLoader";
import { InputStandard } from "../ui/InputStandard";

export const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleSubmit = async () => {
    // 1. Validaciones de Front-end
    if (
      !formData.name ||
      !formData.lastname ||
      !formData.email ||
      !formData.password
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 14 || ageNum > 100) {
      Alert.alert("Error", "La edad debe estar entre 14 y 100 años.");
      return;
    }

    if (!formData.acceptTerms) {
      Alert.alert("Términos", "Debes aceptar los términos y condiciones.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Envío a la API (usando tu instancia de Axios)
      const response = await api.post("/auth/register", {
        name: formData.name,
        lastname: formData.lastname,
        age: ageNum,
        email: formData.email,
        password: formData.password,
      });

      Alert.alert(
        "¡Éxito!",
        "Cuenta creada correctamente. Ya puedes iniciar sesión.",
      );
      router.replace("/auth/login");
    } catch (error: any) {
      setIsLoading(false);
      const msg = error.response?.data?.message || "Error al registrar usuario";
      Alert.alert("Error de Registro", msg);
    }
  };

  return (
    <View style={styles.card}>
      {isLoading && <FullPageLoader />}

      <Text style={styles.title}>Crear Cuenta</Text>
      <View style={styles.underline} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <InputStandard
            label="Nombre"
            placeholder="Nombre"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>
        <View style={{ width: 15 }} />
        <View style={{ flex: 1 }}>
          <InputStandard
            label="Apellidos"
            placeholder="Apellidos"
            value={formData.lastname}
            onChangeText={(text) =>
              setFormData({ ...formData, lastname: text })
            }
          />
        </View>
      </View>

      <InputStandard
        label="Edad"
        placeholder="25"
        keyboardType="numeric"
        value={formData.age}
        onChangeText={(text) => setFormData({ ...formData, age: text })}
      />

      <InputStandard
        label="Email"
        placeholder="atleta@evolufit.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />

      <InputStandard
        label="Contraseña"
        placeholder="••••••"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      <InputStandard
        label="Confirmar Contraseña"
        placeholder="••••••"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) =>
          setFormData({ ...formData, confirmPassword: text })
        }
      />

      <View style={styles.termsGroup}>
        <Checkbox
          value={formData.acceptTerms}
          onValueChange={(value) =>
            setFormData({ ...formData, acceptTerms: value })
          }
          color={formData.acceptTerms ? COLORS.orange : undefined}
        />
        <Text style={styles.termsText}>Acepto los términos y condiciones</Text>
      </View>

      <Button
        title={isLoading ? "Procesando..." : "Registrarse"}
        onPress={handleSubmit}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={styles.loginLink}>Inicia sesión</Text>
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
  },
  title: {
    fontFamily: FONTS.secondaryBold,
    color: "#fff",
    fontSize: 26,
    textAlign: "center",
  },
  underline: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.orange,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  termsGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  termsText: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 5,
  },
  footerText: { color: COLORS.tertiaryText, fontFamily: FONTS.primary },
  loginLink: { color: COLORS.orange, fontFamily: FONTS.secondaryBold },
});
