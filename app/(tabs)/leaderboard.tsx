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

  /**
   * Bandera para ignorar la primera emisión de NetInfo al suscribirse.
   * Sin esta ref, la emisión inicial duplicaría la carga que ya ejecuta useFocusEffect.
   * Se usa useRef (no useState) porque cambiar este flag no debe causar re-render.
   */
  const isFirstNetInfoEmit = useRef(true);

  /**
   * useFocusEffect en lugar de useEffect para recargar el ranking cada vez
   * que el usuario navega a esta pantalla (no solo al montarla por primera vez).
   * Esto es importante porque otro usuario puede haber registrado un nuevo récord
   * mientras navegabas por otras pantallas — el leaderboard debe estar siempre actualizado.
   */
  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard(1, true);
    }, []),
  );

  /**
   * Obtiene el ranking de récords 1RM paginado desde la API.
   *
   * Se envuelve en useCallback con dependencias vacías [] porque no captura
   * ningún estado externo — usa setRanking con función updater para acceder
   * al estado anterior sin necesitar ranking como dependencia.
   * Esto es necesario para que el useEffect de NetInfo no entre en bucle infinito.
   *
   * @param pageNumber - Número de página a cargar (por defecto 1)
   * @param isInitial - true activa el spinner de carga completa, false activa el de "cargando más"
   */
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
      // Si la petición tuvo éxito, la conexión se restableció — ocultar el banner
      setIsOffline(false);
    } catch (error: any) {
      // Distinguimos error de red de error de servidor
      // !error.response → Axios no recibió respuesta del servidor (sin conexión)
      // error.message === "Network Error" → confirmación de Axios para errores de red
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

  /**
   * Suscripción proactiva a cambios de conectividad (Capa 1 del patrón offline dual).
   * Detecta la pérdida de red antes de que falle el siguiente fetch.
   * Al reconectar, recarga desde la página 1 para mostrar datos actualizados.
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Ignoramos la primera emisión para no duplicar la carga inicial de useFocusEffect
      if (isFirstNetInfoEmit.current) {
        isFirstNetInfoEmit.current = false;
        return;
      }

      if (state.isConnected === false) {
        setIsOffline(true);
      } else if (state.isConnected === true) {
        setIsOffline(false);
        fetchLeaderboard(1, true);
      }
    });

    // Al desmontar el componente, eliminamos el listener para evitar fugas de memoria
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
                <Ionicons name="chevron-down" size={16} color={COLORS.orange} />
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
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  loadMoreText: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 14,
  },
  emptyContainer: { alignItems: "center", marginTop: 50, gap: 15 },
  emptyText: { color: "#444", fontFamily: FONTS.primary },
});
