module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand)",
  ],
  moduleNameMapper: {
    // Permite importar desde rutas relativas al proyecto sin problemas
    "^@/(.*)$": "<rootDir>/$1",
  },
  testEnvironment: "node",
  // Reporters: 'default' muestra la salida en terminal, jest-html-reporters
  // genera test-report.html con los resultados en formato visual (TFG demo)
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: ".",
        filename: "test-report.html",
        pageTitle: "EvolutFit — Frontend Tests",
        openReport: false,
      },
    ],
  ],
};
