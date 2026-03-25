/**
 * Tests para RMCalculatorScreen
 *
 * Cubre: renderizado sin errores, comportamiento del OfflineBanner
 * con NetInfo directo (patrón dual sin useOfflineCache).
 */
import { act, render, screen } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ───────────────────────────────────────────────────────────────────

let netInfoListener: ((state: { isConnected: boolean | null }) => void) | null =
  null;

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn((cb) => {
    netInfoListener = cb;
    // NetInfo siempre emite un evento inicial al suscribirse.
    // Lo simulamos para que isFirstNetInfoEmit se consuma en el mount.
    cb({ isConnected: true });
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
      user: { _id: "u1", name: "Deiby", lastname: "Gorrin" },
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
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: { rm: 100 } }),
  },
}));

// ─── Import del componente (después de los mocks) ────────────────────────────
import RMCalculatorScreen from "../../app/(tabs)/rmCalculator";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  netInfoListener = null;
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("RMCalculatorScreen", () => {
  it("se renderiza sin errores", () => {
    expect(() => render(<RMCalculatorScreen />)).not.toThrow();
  });

  it("muestra OfflineBanner cuando NetInfo reporta sin conexión", async () => {
    render(<RMCalculatorScreen />);
    // La pantalla tiene un early return de loading — esperamos a que la API
    // mock resuelva su promesa para que el componente salga del estado carga.
    await act(async () => { await Promise.resolve(); });

    expect(screen.queryByTestId("offline-banner")).toBeNull();

    act(() => {
      netInfoListener!({ isConnected: false });
    });

    expect(screen.getByTestId("offline-banner")).toBeTruthy();
  });

  it("oculta OfflineBanner al reconectar", async () => {
    render(<RMCalculatorScreen />);
    await act(async () => { await Promise.resolve(); });

    act(() => { netInfoListener!({ isConnected: false }); });
    expect(screen.getByTestId("offline-banner")).toBeTruthy();

    act(() => { netInfoListener!({ isConnected: true }); });
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
});
