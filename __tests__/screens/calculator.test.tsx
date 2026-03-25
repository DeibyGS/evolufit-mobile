/**
 * Tests para HealthCalculator (calculator)
 *
 * La pantalla delega el fetching y el estado offline al hook useOfflineCache.
 * Los tests verifican renderizado y comportamiento del OfflineBanner.
 */
import { render, screen } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUseOfflineCache = jest.fn();
jest.mock("../../hooks/useOfflineCache", () => ({
  useOfflineCache: (...args: any[]) => mockUseOfflineCache(...args),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

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

jest.mock("../../api/API", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

// ─── Import del componente (después de los mocks) ────────────────────────────
import HealthCalculator from "../../app/(tabs)/calculator";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockUseOfflineCache.mockReturnValue({
    data: [],
    loading: false,
    isOffline: false,
    refetch: jest.fn(),
  });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("HealthCalculator (calculator)", () => {
  it("se renderiza sin errores", () => {
    expect(() => render(<HealthCalculator />)).not.toThrow();
  });

  it("muestra OfflineBanner cuando useOfflineCache reporta isOffline: true", () => {
    mockUseOfflineCache.mockReturnValue({
      data: [],
      loading: false,
      isOffline: true,
      refetch: jest.fn(),
    });

    render(<HealthCalculator />);
    expect(screen.getByTestId("offline-banner")).toBeTruthy();
  });

  it("no muestra OfflineBanner cuando hay conexión", () => {
    render(<HealthCalculator />);
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
});
