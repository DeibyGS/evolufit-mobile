/**
 * Tests para AnalyticsScreen
 *
 * La pantalla delega el fetching y el estado offline al hook useOfflineCache.
 * Los tests verifican que el OfflineBanner aparece cuando el hook señala offline.
 */
import { render, screen } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// useOfflineCache: controlamos el retorno desde cada test
const mockUseOfflineCache = jest.fn();
jest.mock("../../hooks/useOfflineCache", () => ({
  useOfflineCache: (...args: any[]) => mockUseOfflineCache(...args),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// DateTimePicker: módulo nativo — evitamos su ejecución en tests
jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

// Chart Kit: depende de react-native-svg con canvas nativo
jest.mock("react-native-chart-kit", () => ({
  LineChart: "LineChart",
  PieChart: "PieChart",
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
  },
}));

// ─── Import del componente (después de los mocks) ────────────────────────────
import AnalyticsScreen from "../../app/(tabs)/analytics";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Estado por defecto: conectado, sin datos, sin carga
  mockUseOfflineCache.mockReturnValue({
    data: [],
    loading: false,
    isOffline: false,
    refetch: jest.fn(),
  });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("AnalyticsScreen", () => {
  it("se renderiza sin errores con datos vacíos", () => {
    expect(() => render(<AnalyticsScreen />)).not.toThrow();
  });

  it("muestra OfflineBanner cuando useOfflineCache reporta isOffline: true", () => {
    mockUseOfflineCache.mockReturnValue({
      data: [],
      loading: false,
      isOffline: true,
      refetch: jest.fn(),
    });

    render(<AnalyticsScreen />);
    expect(screen.getByTestId("offline-banner")).toBeTruthy();
  });

  it("no muestra OfflineBanner cuando isOffline es false", () => {
    render(<AnalyticsScreen />);
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
});
