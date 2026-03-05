import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";

/**
 * EVOLUTFIT - FOOTER NATIVO (Versión TFG DAM)
 * Basado íntegramente en Design Tokens para evitar hardcoding.
 */
export const Footer = () => {
  const openLinkedIn = () => {
    Linking.openURL("https://www.linkedin.com/in/deibygorrin/");
  };

  return (
    <View style={styles.footerContainer}>
      {/* SECCIÓN ACADÉMICA */}
      <View style={styles.academicSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TFG • FP DAM</Text>
        </View>
        <Text style={styles.academicText}>
          Proyecto Final de Grado Superior{"\n"}Desarrollo de Aplicaciones
          Multiplataforma
        </Text>
      </View>

      <View style={styles.divider} />

      {/* SECCIÓN COPYRIGHT Y AUTOR */}
      <View style={styles.bottomSection}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} EvolutFit. Todos los derechos reservados.
        </Text>

        <TouchableOpacity
          onPress={openLinkedIn}
          activeOpacity={0.7}
          style={styles.authorContainer}
        >
          <Text style={styles.authorText}>
            Desarrollado por <Text style={styles.authorLink}>Deiby Gorrin</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SIZES.paddingMin,
    paddingTop: 40,
    paddingBottom: SIZES.footerPaddingBottom,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    marginBottom: 50,
  },
  academicSection: {
    alignItems: "center",
    marginBottom: SIZES.gapMax,
  },
  badge: {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    paddingHorizontal: SIZES.badgePaddingHorizontal,
    paddingVertical: SIZES.badgePaddingVertical,
    borderRadius: SIZES.radiusFull,
    marginBottom: SIZES.gapMin / 2,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.2)",
  },
  badgeText: {
    color: COLORS.orange,
    fontSize: SIZES.fontBadge,
    fontFamily: FONTS.secondaryBold,
    letterSpacing: 1,
  },
  academicText: {
    color: COLORS.tertiaryText,
    fontSize: SIZES.fontAcademic,
    fontFamily: FONTS.primary,
    textAlign: "center",
    lineHeight: SIZES.fontAcademic * 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.glassBorder,
    width: "100%",
    marginBottom: SIZES.gapMin,
  },
  bottomSection: {
    alignItems: "center",
    gap: SIZES.gapMin / 2,
  },
  copyrightText: {
    color: COLORS.tertiaryText,
    fontSize: SIZES.fontCopyright,
    fontFamily: FONTS.primary,
  },
  authorContainer: {
    paddingVertical: SIZES.gapMin / 4,
  },
  authorText: {
    color: COLORS.tertiaryText,
    fontSize: SIZES.fontAcademic,
    fontFamily: FONTS.primary,
  },
  authorLink: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    textDecorationLine: "underline",
  },
});
