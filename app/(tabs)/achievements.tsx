import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../../api/API";
import OfflineBanner from "../../components/OfflineBanner";
import { COLORS, FONTS } from "../../constants/theme";
import achievementsData from "../../data/achievements.json";
import { useOfflineCache } from "../../hooks/useOfflineCache";
import { checkAndNotifyAchievements } from "../../hooks/useNotifications";
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

/**
 * Pantalla de logros — muestra el sistema de reconocimientos basado en volumen total levantado.
 *
 * Delega la gestión offline al hook `useOfflineCache`, que implementa el patrón
 * offline dual (NetInfo proactivo + try/catch reactivo) y gestiona el caché en AsyncStorage.
 *
 * Los logros no se guardan en el servidor: son datos locales (`achievements.json`)
 * que se desbloquean cuando el volumen total acumulado supera el umbral de cada logro.
 * Solo el volumen total viene de la API.
 *
 * `useMemo` en `filteredAchievements` evita recalcular el filtro en cada render;
 * solo se recalcula cuando cambia el filtro seleccionado.
 */
export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState("Todos");

  const categories = ["Todos", "Bronce", "Plata", "Oro", "Épico"];

  const { data: totalWeight, loading, isOffline } = useOfflineCache<number>(
    "cache:total-volume",
    async () => {
      const res = await api.get("/workouts/total-volume");
      return Number(res.data.totalVolume ?? res.data.totalWeight ?? res.data ?? 0);
    },
  );

  const volume = totalWeight ?? 0;

  // Cuando el volumen ya se ha cargado, detectar logros recién desbloqueados y notificar
  useEffect(() => {
    if (loading || volume === 0) return;

    const unlockedIds = achievementsData
      .filter((ach) => volume >= ach.targetWeight)
      .map((ach) => ach.id);

    const titleMap = Object.fromEntries(
      achievementsData.map((ach) => [ach.id, ach.title]),
    );

    // fire-and-forget: no bloquea el render
    checkAndNotifyAchievements(unlockedIds, titleMap);
  }, [volume, loading]);

  const filteredAchievements = useMemo(() => {
    return filter === "Todos"
      ? achievementsData
      : achievementsData.filter((ach) => ach.category === filter);
  }, [filter]);

  const renderAchievement = ({ item }: { item: any }) => {
    const isUnlocked = volume >= item.targetWeight;
    const progress = Math.min((volume / item.targetWeight) * 100, 100);

    return (
      <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.badge,
              styles[item.category.toLowerCase() as keyof typeof styles],
            ]}
          >
            <Text style={styles.badgeText}>{item.category}</Text>
          </View>
          {isUnlocked && (
            <Text style={styles.unlockedIcon}>✓ Desbloqueado</Text>
          )}
        </View>

        <View style={styles.imageContainer}>
          {/* ✅ Carga desde Cloudinary usando la URL del JSON */}
          <Image
            source={{ uri: item.imagePath }}
            style={[
              styles.medalImg,
              !isUnlocked && { opacity: 0.3, tintColor: "gray" },
            ]}
          />
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>
          )}
        </View>

        <Text style={styles.achTitle}>{item.title}</Text>
        <Text style={styles.equivalence}>⚡ {item.equivalence}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {!isUnlocked && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
              <Text style={styles.progressText}>
                Faltan {(item.targetWeight - volume).toLocaleString()} kg
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OfflineBanner visible={isOffline} />
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Mis <Text style={{ color: COLORS.orange }}>Logros</Text>
          </Text>
          <Text style={styles.subtitle}>Evolución de {user?.name}</Text>
        </View>
        <View style={styles.volumeBadge}>
          <Text style={styles.volumeLabel}>VOLUMEN TOTAL</Text>
          <Text style={styles.volumeValue}>
            {volume.toLocaleString()} kg
          </Text>
        </View>
      </View>

      {/* FILTROS */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilter(cat)}
              style={[
                styles.filterBtn,
                filter === cat && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  filter === cat && styles.filterBtnTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        key={filter}
        data={filteredAchievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  title: { fontSize: 26, fontFamily: FONTS.secondaryBold, color: "#fff" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  volumeBadge: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  volumeLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  volumeValue: { fontSize: 18, fontWeight: "900", color: "#000" },

  filterContainer: { marginBottom: 20 },
  filterBar: { flexDirection: "row" },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#1a1a1a",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  filterBtnActive: {
    backgroundColor: "rgba(255, 165, 0, 0.15)",
    borderColor: COLORS.orange,
  },
  filterBtnText: { color: "#666", fontSize: 13, fontWeight: "600" },
  filterBtnTextActive: { color: COLORS.orange, fontWeight: "bold" },

  card: {
    backgroundColor: "#1a1a1a",
    padding: 22,
    borderRadius: 25,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardLocked: { opacity: 0.8 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  bronce: {
    backgroundColor: "#cd7f3220",
    borderWidth: 1,
    borderColor: "#cd7f32",
  },
  plata: {
    backgroundColor: "#c0c0c020",
    borderWidth: 1,
    borderColor: "#c0c0c0",
  },
  oro: {
    backgroundColor: COLORS.orange + "20",
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  épico: {
    backgroundColor: "#a335ee20",
    borderWidth: 1,
    borderColor: "#a335ee",
  },
  badgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  unlockedIcon: { color: COLORS.orange, fontWeight: "bold", fontSize: 12 },

  imageContainer: {
    alignItems: "center",
    marginVertical: 15,
    justifyContent: "center",
  },
  medalImg: { width: 120, height: 120, resizeMode: "contain" },
  lockOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  lockEmoji: { fontSize: 32 },

  achTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: FONTS.secondaryBold,
    textAlign: "center",
  },
  equivalence: {
    color: COLORS.orange,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "700",
  },
  description: {
    color: "#888",
    textAlign: "center",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },

  progressSection: { marginTop: 20 },
  progressBarBg: {
    height: 8,
    backgroundColor: "#222",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: COLORS.orange },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressPercent: { color: COLORS.orange, fontWeight: "bold", fontSize: 11 },
  progressText: { color: "#666", fontSize: 11, fontWeight: "500" },
});
