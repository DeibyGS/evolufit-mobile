import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const LIMIT = 10;

  // Flag to skip the first NetInfo emission (fires immediately on subscribe)
  // and avoid duplicating the initial fetchLeaderboard() call from useFocusEffect.
  const isFirstNetInfoEmit = useRef(true);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard(1, true);
    }, []),
  );

  const fetchLeaderboard = useCallback(async (pageNumber = 1, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(
        `/rm/leaderboard?page=${pageNumber}&limit=${LIMIT}`,
      );

      const newItems = res.data.records || [];
      const moreExist = res.data.hasNextPage || false;

      setRanking((prev) => (isInitial ? newItems : [...prev, ...newItems]));
      setHasNextPage(moreExist);
      setPage(pageNumber);
      setIsOffline(false);
    } catch (error: any) {
      const isNetworkError = !error.response && error.message === "Network Error";
      if (isNetworkError) {
        setIsOffline(true);
      } else {
        console.error("Error al obtener ranking:", error);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Proactive NetInfo subscription: react to connectivity changes immediately
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Skip the first emission to avoid duplicating the useFocusEffect load call.
      if (isFirstNetInfoEmit.current) {
        isFirstNetInfoEmit.current = false;
        return;
      }

      if (state.isConnected === false) {
        // No internet — show offline banner without waiting for the next fetch to fail
        setIsOffline(true);
      } else if (state.isConnected === true) {
        // Reconnected — reload page 1 so data is fresh again
        setIsOffline(false);
        fetchLeaderboard(1, true);
      }
    });

    // Cleanup: remove listener on unmount to prevent memory leaks
    return () => unsubscribe();
  }, [fetchLeaderboard]);

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchLeaderboard(page + 1);
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* BANNER OFFLINE — visible cuando no hay conexión a internet */}
        <OfflineBanner visible={isOffline} />

        <View style={styles.header}>
          <Text style={styles.title}>
            Hall of <Text style={{ color: COLORS.orange }}>Fame</Text> 🏆
          </Text>
          <Text style={styles.subtitle}>
            Los récords actuales por cada ejercicio
          </Text>
        </View>

        <View style={styles.listContainer}>
          {ranking.map((item, index) => {
            const isMe = item.user?._id === user?._id;

            return (
              <View
                key={`${item._id}-${index}`}
                style={[styles.row, isMe && styles.isMeRow]}
              >
                {/* LADO IZQUIERDO: Ejercicio y Atleta verticalmente para ganar espacio horizontal */}
                <View style={styles.mainInfoCol}>
                  {/* Nombre Ejercicio */}
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{item._id}</Text>
                    <Text style={styles.muscleGroup}>{item.muscleGroup}</Text>
                  </View>

                  {/* Info Atleta */}
                  <View style={styles.athleteInfo}>
                    <View style={[styles.avatar, isMe && styles.avatarMe]}>
                      <Text
                        style={[styles.avatarText, isMe && { color: "#000" }]}
                      >
                        {item.user?.name?.[0] || "?"}
                        {item.user?.lastname?.[0] || ""}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.athleteName}>
                        {item.user?.name} {item.user?.lastname}{" "}
                        {isMe ? "(Tú)" : ""}
                      </Text>
                      <Text style={styles.statusText}>
                        {isMe ? "¡Tu mejor marca! 🔥" : "Récord a batir ⚡"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* LADO DERECHO: El Peso */}
                <View style={styles.weightCol}>
                  <Text style={styles.weightValue}>
                    {Math.round(item.maxWeight)}
                  </Text>
                  <Text style={styles.weightUnit}>Kg</Text>
                </View>
              </View>
            );
          })}
        </View>

        {hasNextPage && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={handleLoadMore}
            disabled={loadingMore}
            activeOpacity={0.8}
          >
            {loadingMore ? (
              <ActivityIndicator color={COLORS.orange} />
            ) : (
              <>
                <Text style={styles.loadMoreText}>Ver más guerreros</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.orange} />
              </>
            )}
          </TouchableOpacity>
        )}

        {ranking.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={50} color="#333" />
            <Text style={styles.emptyText}>
              No hay récords registrados todavía.
            </Text>
          </View>
        )}
      </ScrollView>
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
  },
  header: { marginVertical: 25 },
  title: { fontSize: 28, fontFamily: FONTS.secondaryBold, color: "#fff" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 5 },
  listContainer: { gap: 12 },
  row: {
    flexDirection: "row",
    backgroundColor: "#141414",
    padding: 18,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  isMeRow: {
    borderColor: COLORS.orange,
    borderLeftWidth: 5,
    backgroundColor: "rgba(255,165,0,0.02)",
  },
  mainInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.secondaryBold,
    // Eliminamos el truncado para que se lea completo
  },
  muscleGroup: {
    color: COLORS.orange,
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 2,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  athleteInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarMe: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  avatarText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  athleteName: { color: "#aaa", fontSize: 12, textTransform: "capitalize" },
  statusText: { color: "#555", fontSize: 10, marginTop: 1 },
  weightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 65,
  },
  weightValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },
  weightUnit: { color: "#666", fontSize: 10, fontWeight: "700" },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    borderRadius: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  loadMoreText: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 14,
  },
  emptyContainer: { alignItems: "center", marginTop: 50, gap: 15 },
  emptyText: { color: "#444", fontFamily: FONTS.primary },
});
