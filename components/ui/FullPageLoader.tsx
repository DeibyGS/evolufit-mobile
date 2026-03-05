import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Modal,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { COLORS, FONTS } from "../../constants/theme";

const messages = [
  "Preparando tus mancuernas...",
  "Calentando el servidor...",
  "Ajustando el cinturón de fuerza...",
  "Cargando tus récords personales...",
  "Activando el modo bestia...",
  "Sincronizando tus músculos...",
  "Optimizando cada repetición...",
  "Encendiendo la motivación...",
];

export const FullPageLoader = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Animación sutil de desvanecimiento al cambiar el texto
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Spinner Nativo */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={COLORS.orange} />
          </View>

          {/* Logo EvolutFit */}
          <Text style={styles.logoText}>
            Evolut<Text style={{ color: COLORS.orange }}>Fit</Text>
          </Text>

          {/* Mensajes Motivacionales Animados */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.loadingText}>{messages[msgIndex]}</Text>
          </Animated.View>

          {/* Badge de Aviso de Servidor */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Servidor despertando (30s)</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.95)", // Fondo oscuro con transparencia
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 30,
    width: "100%",
  },
  spinnerContainer: {
    marginBottom: 30,
    transform: [{ scale: 1.5 }], // Hacemos el spinner más grande
  },
  logoText: {
    fontFamily: FONTS.secondaryBold,
    color: "#fff",
    fontSize: 32,
    letterSpacing: 3,
    marginBottom: 15,
  },
  loadingText: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    minHeight: 24,
  },
  badge: {
    marginTop: 40,
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.2)",
  },
  badgeText: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
