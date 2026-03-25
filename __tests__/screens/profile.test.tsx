/**
 * Tests para ProfileScreen
 *
 * Esta pantalla usa el patrón simplificado de offline (solo NetInfo, sin
 * isFirstNetInfoEmit) porque los datos del usuario vienen del store Zustand,
 * no de una petición al montar.
 */
import { act, render, screen } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ───────────────────────────────────────────────────────────────────

let netInfoListener: ((state: { isConnected: boolean | null }) => void) | null =
  null;

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn((cb) => {
    netInfoListener = cb;
    return jest.fn();
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));

jest.mock("../../components/OfflineBanner", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ visible }: { visible: boolean }) =>
      visible ? <Text testID="offline-banner">Sin conexión</Text> : null,
  };
});

jest.mock("../../store/useAuthStore", () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      user: {
        _id: "u1",
        name: "Deiby",
        lastname: "Gorrin",
        email: "deiby@test.com",
        role: "user",
      },
      token: "test-token",
      logout: jest.fn(),
      updateUser: jest.fn(),
      login: jest.fn(),
      isAuth: true,
    };
    return typeof selector === "function" ? selector(state) : state;
  },
}));

jest.mock("../../api/API", () => ({
  __esModule: true,
  default: {
    put: jest.fn().mockResolvedValue({ data: {} }),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

// ─── Import del componente (después de los mocks) ────────────────────────────
import ProfileScreen from "../../app/(tabs)/profile";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  netInfoListener = null;
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ProfileScreen", () => {
  it("se renderiza sin errores", () => {
    expect(() => render(<ProfileScreen />)).not.toThrow();
  });

  it("muestra OfflineBanner cuando NetInfo reporta sin conexión", () => {
    render(<ProfileScreen />);
    expect(screen.queryByTestId("offline-banner")).toBeNull();

    act(() => {
      netInfoListener!({ isConnected: false });
    });

    expect(screen.getByTestId("offline-banner")).toBeTruthy();
  });

  it("oculta OfflineBanner al reconectar", () => {
    render(<ProfileScreen />);

    act(() => { netInfoListener!({ isConnected: false }); });
    expect(screen.getByTestId("offline-banner")).toBeTruthy();

    act(() => { netInfoListener!({ isConnected: true }); });
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
});
