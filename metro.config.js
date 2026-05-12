const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Solo transformar los paquetes que realmente lo necesitan (native modules + reanimated).
// Sin esto, el babel plugin de Reanimated procesa todos los node_modules, causando
// compilaciones de más de 1 hora en primera carga.
config.transformer.transformIgnorePatterns = [
  "node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|expo-router|react-native-reanimated|react-native-worklets|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-chart-kit|react-native-toast-message|react-native-checkbox|expo-checkbox|@react-navigation|zustand)/)",
];

module.exports = config;
