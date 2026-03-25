/**
 * NotificationsScreen — Configuración de notificaciones locales
 *
 * Permite al usuario activar o desactivar cada tipo de notificación:
 * - Recordatorio diario a las 19:00
 * - Alerta de racha al terminar sesión
 * - Alerta de nuevo logro desbloqueado
 *
 * Las preferencias se persisten en AsyncStorage. Cambiar el switch
 * actualiza inmediatamente el planificador de notificaciones.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NotificationPrefs,
  getNotificationPrefs,
  saveNotificationPrefs,
  scheduleDailyReminder,
} from "../../hooks/useNotifications";
import { COLORS, SIZES } from "../../constants/theme";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  // Carga las preferencias guardadas al montar la pantalla
  useEffect(() => {
    getNotificationPrefs().then(setPrefs);
  }, []);

  /**
   * Actualiza una preferencia concreta, la persiste y aplica el efecto
   * secundario correspondiente (solo el recordatorio diario necesita
   * reprogramar una notificación en el sistema).
   */
  const handleToggle = async (
    key: keyof NotificationPrefs,
    value: boolean,
  ) => {
    if (!prefs) return;

    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await saveNotificationPrefs(updated);

    if (key === "dailyReminder") {
      await scheduleDailyReminder(value);
    }
  };

  if (!prefs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={COLORS.orange} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>
            Notifi<Text style={{ color: COLORS.orange }}>caciones</Text>
          </Text>
          <Text style={styles.subtitle}>Controla cuándo te avisamos</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* SECCIÓN: ALERTAS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={COLORS.orange}
            />
            <Text style={styles.cardTitle}>Alertas</Text>
          </View>

          {/* FILA 1: Recordatorio diario */}
          <SettingsRow
            icon="alarm-outline"
            label="Recordatorio diario"
            description="Te avisamos a las 19:00 si no has entrenado"
            value={prefs.dailyReminder}
            onToggle={(v) => handleToggle("dailyReminder", v)}
          />

          <View style={styles.separator} />

          {/* FILA 2: Racha activa */}
          <SettingsRow
            icon="flame-outline"
            label="Racha activa"
            description="Celebra tus días consecutivos entrenando"
            value={prefs.streakAlert}
            onToggle={(v) => handleToggle("streakAlert", v)}
          />

          <View style={styles.separator} />

          {/* FILA 3: Nuevos logros */}
          <SettingsRow
            icon="trophy-outline"
            label="Nuevos logros"
            description="Te avisamos cuando desbloquees un logro"
            value={prefs.achievementAlert}
            onToggle={(v) => handleToggle("achievementAlert", v)}
          />
        </View>

        <Text style={styles.footnote}>
          Los permisos se piden al abrir la app por primera vez.{"\n"}
          Puedes cambiarlos en Ajustes del sistema.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}

function SettingsRow({
  icon,
  label,
  description,
  value,
  onToggle,
}: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon as any}
        size={22}
        color={COLORS.orange}
        style={styles.rowIcon}
      />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#333", true: COLORS.orange }}
        thumbColor={value ? "#fff" : "#888"}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SIZES.paddingMin,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: SIZES.headerPaddingVertical,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: SIZES.fontHeader,
    fontWeight: "bold",
    color: COLORS.primaryText,
  },
  subtitle: {
    fontSize: SIZES.fontLabel,
    color: COLORS.tertiaryText,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: SIZES.radius,
    padding: SIZES.paddingMin,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: SIZES.fontMain,
    fontWeight: "600",
    color: COLORS.primaryText,
  },

  // Fila de ajuste
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowIcon: {
    marginRight: 12,
    width: 24,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: SIZES.fontMain,
    fontWeight: "500",
    color: COLORS.primaryText,
  },
  rowDescription: {
    fontSize: SIZES.fontAcademic,
    color: COLORS.tertiaryText,
    marginTop: 2,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.glassBorder,
    marginVertical: 4,
  },

  // Nota al pie
  footnote: {
    fontSize: SIZES.fontAcademic,
    color: COLORS.tertiaryText,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
});
