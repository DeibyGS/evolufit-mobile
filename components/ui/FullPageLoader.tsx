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

/**
 * Loader de pantalla completa mostrado durante el cold start del servidor en Render.
 *
 * El servidor gratuito de Render se duerme tras 15 minutos de inactividad.
 * Al despertar tarda hasta 30 segundos, durante los cuales este componente
 * ocupa toda la pantalla para evitar mostrar una UI rota o incompleta.
 *
 * Comportamiento de la animación:
 * - Cada 4 segundos rota al siguiente mensaje motivacional.
 * - `Animated.sequence` ejecuta fade-out (500ms) + fade-in (500ms) de forma encadenada.
 * - `setTimeout` de 500ms retrasa el cambio de texto hasta el punto medio del fade-out,
 *   evitando que el usuario vea el texto antiguo mientras desaparece.
 *
 * @decision `useNativeDriver: true` delega la animación de opacidad al hilo nativo
 *           (no al hilo de JS), lo que garantiza 60fps incluso si JS está ocupado
 *           procesando la respuesta inicial del servidor.
 */
export const FullPageLoader = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade-out → fade-in encadenados para una transición suave entre mensajes
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

      // Cambiamos el mensaje en el punto medio del fade-out (500ms),
      // cuando el texto ya es invisible, para evitar el parpadeo de contenido.
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
