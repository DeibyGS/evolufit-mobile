import { TextStyle, ViewStyle } from "react-native";
import { COLORS, FONTS, SIZES } from "./theme";

/**
 * EVOLUTFIT - SISTEMA DE DISEÑO (MIXINS NATIVOS)
 * Traducción técnica de mixins.scss para React Native.
 * Centraliza estilos reutilizables para mantener la coherencia visual.
 */
export const MIXINS = {
  // =============================================================================
  // BOTONES Y ELEMENTOS DE ACCIÓN
  // =============================================================================

  btnBase: {
    padding: SIZES.paddingMin,
    borderRadius: SIZES.radius,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  } as ViewStyle,

  btnText: {
    fontFamily: FONTS.secondaryBold, // Poppins-Bold
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#000",
  } as TextStyle,

  btnSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: SIZES.radius,
    padding: 12,
  } as ViewStyle,

  // =============================================================================
  // CONTENEDORES Y TARJETAS (CARDS)
  // =============================================================================

  cardGlass: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: SIZES.radius,
    padding: SIZES.paddingMax,
  } as ViewStyle,

  resultCardStyle: {
    backgroundColor: COLORS.glassBg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: SIZES.radius,
  } as ViewStyle,

  // =============================================================================
  // ESTRUCTURA Y LAYOUT
  // =============================================================================

  sectionContainer: {
    flex: 1,
    padding: SIZES.paddingMax,
    backgroundColor: COLORS.primaryBg,
  } as ViewStyle,

  sectionHeader: {
    alignItems: "center",
    marginBottom: 48,
    paddingTop: 24,
  } as ViewStyle,

  // =============================================================================
  // FORMULARIOS
  // =============================================================================

  inputStandard: {
    fontFamily: FONTS.primary, // Roboto-Regular
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: SIZES.radius,
    color: "#FFFFFF",
    fontSize: 16,
  } as ViewStyle,

  labelStandard: {
    fontFamily: FONTS.secondaryBold, // Poppins-Bold
    color: COLORS.tertiaryText,
    fontSize: 13,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  } as TextStyle,

  // =============================================================================
  // COMPONENTES DE DATOS E HISTORIAL
  // =============================================================================

  historyCardBase: {
    backgroundColor: COLORS.glassBg,
    borderRadius: SIZES.radius,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  } as ViewStyle,

  // =============================================================================
  // UTILIDADES VISUALES
  // =============================================================================

  flexCenter: (
    direction: "row" | "column" = "row",
    gap: number = 0,
  ): ViewStyle => ({
    flexDirection: direction,
    alignItems: "center",
    justifyContent: "center",
    gap: gap,
  }),

  badgeStyle: (
    bg = "rgba(255, 255, 255, 0.05)",
    color = "#888",
  ): ViewStyle => ({
    backgroundColor: bg,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  }),

  avatarBase: (size: number = 45): ViewStyle => ({
    width: size,
    height: size,
    backgroundColor: "rgb(34, 34, 34)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.3)",
  }),

  // =============================================================================
  // NAVEGACIÓN
  // =============================================================================

  navLinkBase: (isActive: boolean = false): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 16,
    backgroundColor: isActive ? "rgba(255, 165, 0, 0.08)" : "transparent",
    borderLeftWidth: 3,
    borderLeftColor: isActive ? COLORS.orange : "transparent",
  }),
};
