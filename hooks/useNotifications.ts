/**
 * useNotifications — Gestión centralizada de notificaciones locales
 *
 * Responsabilidades:
 * - Solicitar permisos al sistema operativo
 * - Leer/guardar las preferencias del usuario en AsyncStorage
 * - Programar/cancelar el recordatorio diario (19:00)
 * - Enviar notificaciones inmediatas de racha y logro
 * - Calcular la racha de días consecutivos entrenando (sin llamada al backend)
 *
 * Patrón de racha: se guarda en AsyncStorage la fecha del último
 * entrenamiento y el contador de días seguidos. Cada vez que se
 * termina una sesión se actualiza y, si el contador ≥ 2, se notifica.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import achievementsData from "../data/achievements.json";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  dailyReminder: boolean;
  streakAlert: boolean;
  achievementAlert: boolean;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PREFS_KEY = "notifications:prefs";
const STREAK_KEY = "notifications:streak";

const DEFAULT_PREFS: NotificationPrefs = {
  dailyReminder: true,
  streakAlert: true,
  achievementAlert: true,
};

// ─── Configuración del handler ────────────────────────────────────────────────

/**
 * Define cómo se muestran las notificaciones cuando la app está en primer plano.
 * Si no se llama aquí, las notificaciones solo aparecen cuando la app está cerrada.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Permisos ─────────────────────────────────────────────────────────────────

/**
 * Solicita permiso de notificaciones al sistema.
 * En iOS muestra el diálogo nativo la primera vez.
 * En Android con API ≥ 33 también requiere permiso explícito.
 * Devuelve true si el permiso fue concedido.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Preferencias ─────────────────────────────────────────────────────────────

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as NotificationPrefs) : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function saveNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// ─── Recordatorio diario ──────────────────────────────────────────────────────

/**
 * Programa una notificación recurrente a las 19:00 o la cancela.
 * Antes de programar una nueva, cancela cualquier recordatorio anterior
 * para evitar duplicados entre sesiones.
 */
export async function scheduleDailyReminder(enabled: boolean): Promise<void> {
  // Cancelar recordatorio existente (identificado por su data.type)
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === "daily_reminder") {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  if (!enabled) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💪 ¡Hora de entrenar!",
      body: "No rompas tu racha. Tu rutina de hoy te está esperando.",
      data: { type: "daily_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });
}

// ─── Racha de días ────────────────────────────────────────────────────────────

interface StreakData {
  lastDate: string; // ISO date "YYYY-MM-DD"
  count: number;
}

/**
 * Actualiza la racha de días seguidos entrenando y, si la preferencia
 * está activa y la racha es ≥ 2, envía una notificación inmediata.
 *
 * Lógica:
 * - Si último entrenamiento fue ayer → racha continúa (count + 1)
 * - Si último entrenamiento fue hoy → ya contado, no duplicar
 * - Si fue hace más de un día → racha se reinicia a 1
 */
export async function checkAndNotifyStreak(): Promise<void> {
  const prefs = await getNotificationPrefs();

  const today = new Date().toISOString().split("T")[0];

  let streak: StreakData = { lastDate: "", count: 0 };
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (raw) streak = JSON.parse(raw);
  } catch {
    // Si no hay dato previo, empezamos desde cero
  }

  // Calcular diferencia de días
  const last = streak.lastDate ? new Date(streak.lastDate) : null;
  const todayDate = new Date(today);
  const diffDays = last
    ? Math.round(
        (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      )
    : -1;

  let newCount = streak.count;

  if (diffDays === 0) {
    // Ya entrenó hoy — no duplicar notificación
    return;
  } else if (diffDays === 1) {
    // Ayer entrenó → racha continúa
    newCount = streak.count + 1;
  } else {
    // Rompió la racha o primer entrenamiento
    newCount = 1;
  }

  await AsyncStorage.setItem(
    STREAK_KEY,
    JSON.stringify({ lastDate: today, count: newCount }),
  );

  if (!prefs.streakAlert || newCount < 2) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🔥 ¡${newCount} días seguidos!`,
      body: "Estás imparable. Sigue así y bate tu récord.",
      data: { type: "streak" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}

// ─── Logros ───────────────────────────────────────────────────────────────────

const SEEN_ACHIEVEMENTS_KEY = "notifications:seen_achievements";

/**
 * Compara los logros actualmente desbloqueados con los que ya se
 * notificaron antes. Por cada logro nuevo, envía una notificación.
 * Actualiza la lista de logros ya vistos en AsyncStorage.
 *
 * @param unlockedIds Array de IDs de logros actualmente desbloqueados
 * @param achievementsMap Mapa de ID → título del logro
 */
export async function checkAndNotifyAchievements(
  unlockedIds: string[],
): Promise<void> {
  const achievementsMap = Object.fromEntries(
    achievementsData.map((a: { id: string; title: string }) => [a.id, a.title]),
  );
  const prefs = await getNotificationPrefs();
  if (!prefs.achievementAlert) return;

  let seen: string[] = [];
  try {
    const raw = await AsyncStorage.getItem(SEEN_ACHIEVEMENTS_KEY);
    if (raw) seen = JSON.parse(raw);
  } catch {
    // Primera vez — ninguno visto aún
  }

  const newlyUnlocked = unlockedIds.filter((id) => !seen.includes(id));

  for (const id of newlyUnlocked) {
    const title = achievementsMap[id] ?? "Logro desbloqueado";
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🏆 ¡Nuevo logro desbloqueado!",
        body: title,
        data: { type: "achievement" },
      },
      trigger: null,
    });
  }

  if (newlyUnlocked.length > 0) {
    await AsyncStorage.setItem(
      SEEN_ACHIEVEMENTS_KEY,
      JSON.stringify([...seen, ...newlyUnlocked]),
    );
  }
}
