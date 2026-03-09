import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";

// Extendemos las props de TextInput para que admita todas las nativas (como keyboardType o multiline)
interface InputProps extends TextInputProps {
  label: string;
}

export const InputStandard = ({ label, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={[styles.label, isFocused && { color: "#fff" }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          props.multiline && styles.inputMultiline,
          isFocused && styles.inputFocused,
        ]}
        placeholderTextColor="rgba(255, 255, 255, 0.3)"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: SIZES.radiusButton,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#fff",
    fontFamily: FONTS.primary,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top", // Importante para que el texto empiece arriba en Android
    paddingTop: 15,
  },
  inputFocused: {
    borderColor: COLORS.orange,
    backgroundColor: "rgba(255, 165, 0, 0.05)", // Un toque sutil de naranja de fondo
  },
});
