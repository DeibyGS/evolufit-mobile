import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { Button } from "../ui/Button";
import { InputStandard } from "../ui/InputStandard";

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = () => {
    if (!email) {
      Alert.alert("Atención", "Por favor, introduce tu email.");
      return;
    }

    // SIMULACIÓN DE FLUJO (Backend-Pending como en Web)
    console.log("Simulando recuperación para:", email);

    // Feedback informativo
    Alert.alert(
      "Función en desarrollo",
      "El sistema de recuperación por correo se habilitará en la próxima actualización del TFG.",
    );

    setIsSent(true);
  };

  return (
    <View style={styles.card}>
      {/* Badge WIP (Work In Progress) */}
      <View style={styles.wipBadge}>
        <Text style={styles.wipText}>En desarrollo</Text>
      </View>

      <Text style={styles.title}>Recuperar Contraseña</Text>

      {!isSent ? (
        <>
          <Text style={styles.description}>
            Introduce tu correo y te enviaremos un enlace para restablecer tu
            acceso.
          </Text>

          <InputStandard
            label="Email"
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Button title="Enviar Enlace" onPress={handleSubmit} />
        </>
      ) : (
        <View style={styles.successState}>
          <Text style={styles.successText}>✅ Flujo de prueba para:</Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.infoText}>
            El envío real estará disponible próximamente.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.footer}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.footerText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
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
    overflow: "hidden", // Importante para el badge cortado
    position: "relative",
  },
  wipBadge: {
    backgroundColor: COLORS.orange,
    paddingVertical: 4,
    width: 150,
    position: "absolute",
    top: 15,
    right: -40,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    zIndex: 10,
  },
  wipText: {
    color: "#000",
    fontSize: 10,
    fontFamily: FONTS.secondaryBold,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: FONTS.secondaryBold,
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  successState: {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.3)",
    borderStyle: "dashed",
    marginBottom: 20,
    alignItems: "center",
  },
  successText: { color: "#fff", fontFamily: FONTS.primary, fontSize: 14 },
  emailText: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    marginVertical: 5,
  },
  infoText: { color: COLORS.tertiaryText, fontSize: 12, textAlign: "center" },
  footer: { marginTop: 20, alignItems: "center" },
  footerText: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 14,
  },
});
