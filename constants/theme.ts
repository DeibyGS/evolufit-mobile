/**
 * EVOLUTFIT - DESIGN TOKENS (MOBILE)
 * Este archivo es la traducción técnica de variables.scss para React Native.
 * Centraliza la identidad visual para garantizar consistencia entre Web y App.
 */

export const COLORS = {
  // COLORES DE FONDO (Basado en tu Modo Oscuro)
  primaryBg: "rgb(17, 17, 17)", // Gris casi negro
  secondaryBg: "rgba(255, 255, 255, 1)",
  tertiaryBg: "rgb(10, 10, 10)",

  // COLORES DE TEXTO (Jerarquía visual)
  primaryText: "rgba(255, 255, 255, 0.87)",
  secondaryText: "rgba(66, 66, 66, 1)",
  tertiaryText: "rgba(158, 158, 158, 1)",

  // MARCA (Naranja corporativo)
  orange: "#FFA500",
  orangeLight: "#FFC500",
  orangeGradient: ["#FFA500", "#FFC500"] as const, // Para expo-linear-gradient

  // ESTADOS (Semántica)
  error: "#ff4d4d",
  info: "#0070f3",

  // GLASSMORPHISM (Basado en tu mixin card-glass)
  glassBg: "rgba(255, 255, 255, 0.02)",
  glassBorder: "rgba(255, 255, 255, 0.05)",

  chartColors: [
    "#FFA500", // Naranja (Tu marca)
    "#00E5FF", // Cyan (Contraste alto)
    "#70FF00", // Lima (Energía)
    "#FF007A", // Magenta (Intensidad)
    "#8C52FF", // Violeta (Fuerza)
    "#FFD700", // Dorado (Logros)
    "#00FFD1", // Turquesa
  ],
};

export const SIZES = {
  // ESPACIADO BASE
  paddingMin: 16,
  paddingMax: 32,
  gapMin: 12,
  gapMax: 20,
  gapSection: 40,

  // COMPONENTES ESPECÍFICOS
  headerHeight: 65,
  headerPaddingVertical: 15,
  footerPaddingTop: 20,
  footerPaddingBottom: 35, // Para el área segura de iOS

  // BADGES Y BOTONES
  badgePaddingVertical: 4,
  badgePaddingHorizontal: 12,
  iconSizeMedium: 35,

  // BORDES
  radius: 20,
  radiusSmall: 10,
  radiusFull: 50,

  // TIPOGRAFÍA UNIFICADA
  fontBadge: 10,
  fontCopyright: 11,
  fontAcademic: 12,
  fontLabel: 13,
  fontMain: 16,
  fontLogo: 22, // Ajustado para el Header
  fontHeader: 28,
  fontGiant: 42,

  iconMenu: 28,
  radiusButton: 12,
  iconHamburger: 22,
};

export const SHADOWS = {
  /** Réplica del efecto de elevación de tus botones naranjas */
  orange: {
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6, // Necesario para Android
  },
  /** Sombra sutil para tarjetas tipo Glass */
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
};

// En constants/theme.ts añade:

export const FONTS = {
  primary: "Roboto-Regular",
  primaryBold: "Roboto-Bold",
  secondary: "Poppins-Regular",
  secondaryBold: "Poppins-Bold",
};

/**
 * TIPADO DE TYPESCRIPT
 * Exportamos los tipos para que tus componentes tengan autocompletado total.
 */
export type ThemeColors = typeof COLORS;
export type ThemeSizes = typeof SIZES;
export type ThemeShadows = typeof SHADOWS;
export type ThemeFonts = typeof FONTS;
