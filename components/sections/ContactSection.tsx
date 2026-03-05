import React, { useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { Button } from "../ui/Button";
import { InputStandard } from "../ui/InputStandard";

export const ContactSection = () => {
  // Estados para capturar los datos del formulario
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSend = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert("Error", "Por favor, rellena todos los campos.");
      return;
    }

    // Aquí iría la lógica de envío (Firebase, API, etc.)
    console.log("Datos enviados:", form);
    Alert.alert(
      "¡Enviado!",
      `Gracias ${form.name}, nos pondremos en contacto contigo pronto.`,
    );

    // Limpiar formulario y cerrar teclado
    setForm({ name: "", email: "", message: "" });
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          ¿Tienes <Text style={{ color: COLORS.orange }}>Dudas?</Text>
        </Text>
        <Text style={styles.subtitle}>
          Estamos aquí para ayudarte a evolucionar. Escríbenos y te
          responderemos en menos de 24h.
        </Text>
      </View>

      <View style={styles.formCard}>
        <InputStandard
          label="Nombre Completo"
          placeholder="Ej. Juan Pérez"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />

        <InputStandard
          label="Correo Electrónico"
          placeholder="tu@email.com"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
        />

        <InputStandard
          label="Tu Mensaje"
          placeholder="¿En qué podemos ayudarte?"
          multiline
          numberOfLines={4}
          value={form.message}
          onChangeText={(text) => setForm({ ...form, message: text })}
        />

        <View style={styles.buttonWrapper}>
          <Button title="Enviar Mensaje" onPress={handleSend} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 28,
  },
  subtitle: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: SIZES.radiusButton,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 20,
  },
  buttonWrapper: {
    marginTop: 10,
  },
});
