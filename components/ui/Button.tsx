import React, { useEffect, useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle; // Permite pasar estilos extra desde fuera
}

export const Button = ({ title, onPress, style }: ButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de pulso constante (PulseGlow)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.orange,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: SIZES.radiusButton,
    alignItems: "center", // Asegura que el texto esté centrado
    justifyContent: "center",
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  text: {
    color: "#000",
    fontFamily: FONTS.secondaryBold,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 16,
  },
});
