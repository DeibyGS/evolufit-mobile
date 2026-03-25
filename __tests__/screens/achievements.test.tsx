/**
 * Tests para AchievementsScreen
 *
 * La pantalla delega el fetching al hook useOfflineCache y
 * calcula los logros a partir de datos locales (achievements.json).
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
    get: jest.fn().mockResolvedValue({ data: { totalVolume: 0 } }),
  },
}));

// ─── Import del componente (después de los mocks) ────────────────────────────
import AchievementsScreen from "../../app/(tabs)/achievements";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockUseOfflineCache.mockReturnValue({
    data: { totalVolume: 0 },
    loading: false,
    isOffline: false,
    refetch: jest.fn(),
  });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("AchievementsScreen", () => {
  it("se renderiza sin errores", () => {
    expect(() => render(<AchievementsScreen />)).not.toThrow();
  });

  it("muestra OfflineBanner cuando useOfflineCache reporta isOffline: true", () => {
    mockUseOfflineCache.mockReturnValue({
      data: { totalVolume: 0 },
      loading: false,
      isOffline: true,
      refetch: jest.fn(),
    });

    render(<AchievementsScreen />);
    expect(screen.getByTestId("offline-banner")).toBeTruthy();
  });

  it("no muestra OfflineBanner cuando hay conexión", () => {
    render(<AchievementsScreen />);
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
});
