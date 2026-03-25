/**
 * Tests para useNotifications
 *
 * Cubre las funciones exportadas del hook:
 * - getNotificationPrefs / saveNotificationPrefs
 * - checkAndNotifyStreak (lógica de racha)
 * - checkAndNotifyAchievements (detección de logros nuevos)
 * - scheduleDailyReminder (delegación a expo-notifications)
 *
 * expo-notifications se mockea completamente porque requiere APIs nativas.
 * AsyncStorage usa el mock oficial.
 */

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock de expo-notifications — todas las funciones usadas en el hook
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notif-id"),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: {
    DAILY: "daily",
    TIME_INTERVAL: "timeInterval",
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  checkAndNotifyAchievements,
  checkAndNotifyStreak,
  getNotificationPrefs,
  saveNotificationPrefs,
  scheduleDailyReminder,
} from "../../hooks/useNotifications";

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getNotificationPrefs", () => {
  it("devuelve los valores por defecto si no hay nada guardado", async () => {
    const prefs = await getNotificationPrefs();
    expect(prefs).toEqual({
      dailyReminder: true,
      streakAlert: true,
      achievementAlert: true,
    });
  });

  it("devuelve las preferencias guardadas previamente", async () => {
    await saveNotificationPrefs({
      dailyReminder: false,
      streakAlert: true,
      achievementAlert: false,
    });
    const prefs = await getNotificationPrefs();
    expect(prefs.dailyReminder).toBe(false);
    expect(prefs.achievementAlert).toBe(false);
  });
});

describe("scheduleDailyReminder", () => {
  it("llama a scheduleNotificationAsync cuando enabled es true", async () => {
    await scheduleDailyReminder(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: "💪 ¡Hora de entrenar!" }),
      }),
    );
  });

  it("NO programa notificación cuando enabled es false", async () => {
    await scheduleDailyReminder(false);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("cancela el recordatorio anterior antes de programar uno nuevo", async () => {
    (
      Notifications.getAllScheduledNotificationsAsync as jest.Mock
    ).mockResolvedValueOnce([
      {
        identifier: "old-id",
        content: { data: { type: "daily_reminder" } },
        trigger: {},
      },
    ]);

    await scheduleDailyReminder(true);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "old-id",
    );
  });
});

describe("checkAndNotifyStreak", () => {
  it("no envía notificación en el primer entrenamiento (racha = 1)", async () => {
    await checkAndNotifyStreak();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("envía notificación cuando la racha llega a 2 días", async () => {
    // Simular que ayer entrenó
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    await AsyncStorage.setItem(
      "notifications:streak",
      JSON.stringify({ lastDate: yesterdayStr, count: 1 }),
    );

    await checkAndNotifyStreak();

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining("2 días seguidos"),
        }),
      }),
    );
  });

  it("no duplica la notificación si ya entrenó hoy", async () => {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(
      "notifications:streak",
      JSON.stringify({ lastDate: today, count: 3 }),
    );

    await checkAndNotifyStreak();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("reinicia la racha si han pasado más de 1 día", async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const oldDate = threeDaysAgo.toISOString().split("T")[0];
    await AsyncStorage.setItem(
      "notifications:streak",
      JSON.stringify({ lastDate: oldDate, count: 10 }),
    );

    await checkAndNotifyStreak();
    // Racha reiniciada a 1 — no se notifica
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe("checkAndNotifyAchievements", () => {
  const titleMap = { ach_001: "Primer Kilo", ach_002: "Diez Kilos" };

  it("envía notificación para logros recién desbloqueados", async () => {
    await checkAndNotifyAchievements(["ach_001"], titleMap);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: "🏆 ¡Nuevo logro desbloqueado!",
          body: "Primer Kilo",
        }),
      }),
    );
  });

  it("no re-notifica logros que ya se vieron antes", async () => {
    await AsyncStorage.setItem(
      "notifications:seen_achievements",
      JSON.stringify(["ach_001"]),
    );

    await checkAndNotifyAchievements(["ach_001"], titleMap);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("solo notifica los logros nuevos, no los ya vistos", async () => {
    await AsyncStorage.setItem(
      "notifications:seen_achievements",
      JSON.stringify(["ach_001"]),
    );

    await checkAndNotifyAchievements(["ach_001", "ach_002"], titleMap);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ body: "Diez Kilos" }),
      }),
    );
  });

  it("no envía notificación si achievementAlert está desactivado", async () => {
    await saveNotificationPrefs({
      dailyReminder: true,
      streakAlert: true,
      achievementAlert: false,
    });

    await checkAndNotifyAchievements(["ach_001"], titleMap);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
