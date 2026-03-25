/**
 * Tests para DashboardScreen
 *
 * Estrategia:
 * - Mockeamos todas las dependencias nativas (NetInfo, router, safeArea, etc.)
 * - Controlamos el listener de NetInfo para simular cambios de conectividad
 * - Verificamos que OfflineBanner se muestra / oculta correctamente
 */

import { act, render, screen } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// NetInfo: capturamos el listener para dispararlo manualmente
let netInfoListener: ((state: { isConnected: boolean | null }) => void) | null =
  null;

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn((cb) => {
    netInfoListener = cb;
    return jest.fn(); // unsubscribe
  }),
}));

// AsyncStorage (necesario porque useAuthStore usa zustand/persist con AsyncStorage)
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// expo-router: evitamos errores de NavigationContainer
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// react-native-safe-area-context: devolvemos insets vacíos
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// react-native-toast-message: componente vacío
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

// @expo/vector-icons: reemplazamos los iconos con un Text plano para tests
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// OfflineBanner: lo mockeamos para poder comprobar si se renderiza
// El mock devuelve un componente sencillo con testID para poder buscarlo
jest.mock("../components/OfflineBanner", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ visible }: { visible: boolean }) =>
      visible ? <Text testID="offline-banner">Sin conexión</Text> : null,
  };
});

// useAuthStore: devolvemos un usuario de prueba
jest.mock("../store/useAuthStore", () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { name: "Deiby", lastname: "Gorrin" },
      logout: jest.fn(),
    }),
}));

// ─── Import del componente (DESPUÉS de los mocks) ────────────────────────────
// Importamos aquí, después de declarar los mocks, para que Jest los aplique
import DashboardScreen from "../app/(tabs)/dashboard";

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  netInfoListener = null;
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("DashboardScreen — OfflineBanner", () => {
  /**
   * Test 6: Renderiza OfflineBanner cuando NetInfo reporta isConnected: false
   *
   * Al disparar el listener con isConnected: false, el estado isOffline del
   * componente pasa a true → OfflineBanner debe aparecer en pantalla.
   */
  it("muestra OfflineBanner cuando NetInfo reporta isConnected: false", async () => {
    render(<DashboardScreen />);

    // Al montar, el listener queda registrado
    expect(netInfoListener).not.toBeNull();

    // Inicialmente NO debe estar el banner (isOffline = false por defecto)
    expect(screen.queryByTestId("offline-banner")).toBeNull();

    // Simulamos pérdida de conexión
    act(() => {
      netInfoListener!({ isConnected: false });
    });

    // Ahora debe aparecer el banner
    expect(screen.getByTestId("offline-banner")).toBeTruthy();
  });

  /**
   * Test 7: NO renderiza OfflineBanner cuando isConnected: true
   *
   * Cuando la conectividad está activa (o se restaura), el banner no debe
   * estar presente en el árbol de componentes.
   */
  it("no muestra OfflineBanner cuando NetInfo reporta isConnected: true", async () => {
    render(<DashboardScreen />);

    expect(netInfoListener).not.toBeNull();

    // Primero ponemos offline
    act(() => {
      netInfoListener!({ isConnected: false });
    });
    expect(screen.getByTestId("offline-banner")).toBeTruthy();

    // Luego restauramos la conexión
    act(() => {
      netInfoListener!({ isConnected: true });
    });

    // El banner debe desaparecer
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
});
