import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../../api/API";
import OfflineBanner from "../../components/OfflineBanner";
import { COLORS, FONTS } from "../../constants/theme";
import { MUSCLE_GROUPS } from "../../data/exercises";
import { useAuthStore } from "../../store/useAuthStore";

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  /**
   * Bandera para ignorar la primera emisión de NetInfo.
   * Al suscribirse, NetInfo dispara inmediatamente con el estado actual de red.
   * Sin esta ref, esa emisión inicial llamaría a fetchPosts() por segunda vez,
   * duplicando la petición que ya hace el useEffect de búsqueda al montar.
   * Se usa useRef (no useState) porque cambiar este flag no debe causar re-render.
   */
  const isFirstNetInfoEmit = useRef(true);

  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });

  /**
   * Carga publicaciones desde la API con soporte para paginación.
   *
   * Se envuelve en useCallback porque es dependencia del useEffect de NetInfo.
   * Sin useCallback, la función se recrearía en cada render y el useEffect
   * se re-ejecutaría en bucle infinito.
   *
   * No implementa caché AsyncStorage porque el contenido de comunidad cambia
   * constantemente — mostrar posts desactualizados offline aportaría poco valor.
   *
   * @param isNextPage - true para cargar la siguiente página, false para reiniciar desde la 1
   */
  const fetchPosts = useCallback(
    async (isNextPage = false) => {
      if (isNextPage) setLoadingMore(true);
      else setLoading(true);

      try {
        const currentPage = isNextPage ? page + 1 : 1;
        const response = await api.get("/social", {
          params: {
            muscle: filterMuscle,
            search,
            sort: sortBy,
            page: currentPage,
            limit: 8,
          },
        });

        const { posts: newPosts, hasNextPage: next } = response.data;
        setPosts((prev) => (isNextPage ? [...prev, ...newPosts] : newPosts));
        setHasNextPage(next);
        setPage(currentPage);
        // Si la petición tuvo éxito, la conexión se restableció — ocultar el banner
        setIsOffline(false);
      } catch (error: any) {
        // Distinguimos error de red (sin respuesta del servidor) de error de servidor (con respuesta).
        // !error.response → Axios no recibió respuesta (timeout, sin red)
        // error.message === "Network Error" → confirmación de Axios para errores de conectividad
        const isNetworkError = !error.response && error.message === "Network Error";
        if (isNetworkError) {
          setIsOffline(true);
        } else {
          Toast.show({
            type: "error",
            text1: "Error de conexión",
            text2: "No pudimos cargar la comunidad ",
          });
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filterMuscle, search, sortBy, page],
  );

  /**
   * Recarga los posts cuando cambian los filtros de búsqueda.
   * El debounce de 500ms evita lanzar una petición por cada tecla pulsada
   * en el campo de búsqueda — espera a que el usuario deje de escribir.
   */
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchPosts(false);
    }, 500);
    return () => clearTimeout(delay);
  }, [filterMuscle, search, sortBy]);

  /**
   * Suscripción proactiva a cambios de conectividad (Capa 1 del patrón offline dual).
   * Detecta la pérdida de red ANTES de que falle el siguiente fetch,
   * mostrando el banner inmediatamente sin esperar al error.
   * Al reconectar, recarga la página 1 para mostrar datos actualizados.
   */
  useEffect(() => {
    isFirstNetInfoEmit.current = true;
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Ignoramos la primera emisión para no duplicar la carga inicial del componente
      if (isFirstNetInfoEmit.current) {
        isFirstNetInfoEmit.current = false;
        return;
      }

      if (state.isConnected === false) {
        setIsOffline(true);
      } else if (state.isConnected === true) {
        setIsOffline(false);
        fetchPosts(false);
      }
    });

    // Al desmontar el componente, eliminamos el listener para evitar fugas de memoria
    return () => unsubscribe();
  }, [fetchPosts]);

  const handleLike = async (postId: string) => {
    try {
      const response = await api.patch(`/social/${postId}/like`);
      const { likes, isLiked } = response.data;

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likesCount: likes,
                likes: isLiked
                  ? [...post.likes, user?._id]
                  : post.likes.filter((id: string) => id !== user?._id),
              }
            : post,
        ),
      );

      if (isLiked) {
        Toast.show({
          type: "success",
          text1: "¡Rutina apoyada! 🔥",
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo procesar el like",
      });
    }
  };

  const handlePublish = async () => {
    if (!newPost.title || !newPost.content || newPost.tags.length === 0) {
      return Toast.show({
        type: "info",
        text1: "Datos incompletos",
        text2: "Título, contenido y etiquetas son necesarios 🏋️",
      });
    }

    setLoading(true);
    try {
      await api.post("/social", {
        title: newPost.title,
        content: newPost.content,
        muscleGroups: newPost.tags,
      });

      setShowModal(false);
      setNewPost({ title: "", content: "", tags: [] });
      fetchPosts(false);

      Toast.show({
        type: "success",
        text1: "¡Rutina compartida! 🚀",
        text2: "Tu conocimiento ya está en el feed.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error al publicar",
        text2: "Inténtalo de nuevo más tarde",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="barbell-outline" size={40} color="#333" />
        </View>
        <Text style={styles.emptyTitle}>¡Zona de Silencio!</Text>
        <Text style={styles.emptySubtitle}>
          Parece que nadie ha compartido rutinas de{" "}
          <Text style={{ color: COLORS.orange, fontWeight: "bold" }}>
            {filterMuscle || "esta categoría"}
          </Text>{" "}
          aún.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.emptyBtnText}>SÉ EL PRIMERO 🔥</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPost = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item._id;
    const hasLiked = item.likes?.includes(user?._id);
    const isMe = item.author?._id === user?._id;

    return (
      <View
        style={[
          styles.card,
          isExpanded && styles.cardExpanded,
          isMe && styles.isMeCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, isMe && styles.avatarMe]}>
            <Text style={[styles.avatarText, isMe && { color: "#000" }]}>
              {item.author?.name?.[0]}
              {item.author?.lastname?.[0]}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.author?.name} {item.author?.lastname} {isMe ? "(Tú)" : ""}
            </Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.likesBadge}>
            <Ionicons name="heart" size={12} color={COLORS.orange} />
            <Text style={styles.likesText}>{item.likesCount || 0}</Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text
          style={styles.postContent}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {item.content}
        </Text>

        <View style={styles.tagContainer}>
          {item.muscleGroups?.map((tag: string) => (
            <Text key={tag} style={styles.tagText}>
              #{tag}
            </Text>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, hasLiked && styles.actionBtnActive]}
            onPress={() => handleLike(item._id)}
          >
            <Ionicons
              name={hasLiked ? "heart" : "heart-outline"}
              size={18}
              color={hasLiked ? COLORS.orange : "#666"}
            />
            <Text
              style={[styles.actionLabel, hasLiked && { color: COLORS.orange }]}
            >
              Me gusta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => setExpandedId(isExpanded ? null : item._id)}
          >
            <Text style={styles.detailBtnText}>
              {isExpanded ? "Ver menos" : "Ver detalle"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* BANNER OFFLINE — visible cuando no hay conexión a internet */}
            <OfflineBanner visible={isOffline} />
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Comunidad{" "}
                  <Text style={{ color: COLORS.orange }}>EvolutFit</Text> 🤝
                </Text>
                <Text style={styles.subtitle}>
                  Explora rutinas de otros atletas
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addBtnAbs}
                onPress={() => setShowModal(true)}
              >
                <Ionicons name="add" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
              <View style={styles.searchBox}>
                <Ionicons
                  name="search"
                  size={18}
                  color="#444"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar rutinas..."
                  placeholderTextColor="#444"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <View style={styles.sortContainer}>
                {["recent", "popular"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.sortBtn,
                      sortBy === s && styles.sortBtnActive,
                    ]}
                    onPress={() => setSortBy(s)}
                  >
                    <Text
                      style={[
                        styles.sortBtnText,
                        sortBy === s && { color: "#000" },
                      ]}
                    >
                      {s === "recent" ? "Más recientes" : "Populares"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.muscleScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.muscleChip,
                    filterMuscle === "" && styles.muscleChipActive,
                  ]}
                  onPress={() => setFilterMuscle("")}
                >
                  <Text
                    style={[
                      styles.muscleChipText,
                      filterMuscle === "" && { color: "#000" },
                    ]}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>
                {MUSCLE_GROUPS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.muscleChip,
                      filterMuscle === m && styles.muscleChipActive,
                    ]}
                    onPress={() => setFilterMuscle(m)}
                  >
                    <Text
                      style={[
                        styles.muscleChipText,
                        filterMuscle === m && { color: "#000" },
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
        ListFooterComponent={() =>
          hasNextPage && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => fetchPosts(true)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color={COLORS.orange} />
              ) : (
                <>
                  <Text style={styles.loadMoreText}>Ver más rutinas</Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={COLORS.orange}
                  />
                </>
              )}
            </TouchableOpacity>
          )
        }
        ListEmptyComponent={renderEmptyState}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>
              Compartir <Text style={{ color: COLORS.orange }}>Rutina</Text>
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título de la rutina"
              placeholderTextColor="#333"
              value={newPost.title}
              onChangeText={(v) => setNewPost({ ...newPost, title: v })}
            />

            <TextInput
              style={[
                styles.modalInput,
                { height: 120, textAlignVertical: "top" },
              ]}
              placeholder="Escribe el entrenamiento detallado..."
              placeholderTextColor="#333"
              multiline
              value={newPost.content}
              onChangeText={(v) => setNewPost({ ...newPost, content: v })}
            />

            <Text style={styles.tagLabel}>Selecciona músculos:</Text>
            <View style={styles.tagSelection}>
              {MUSCLE_GROUPS.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    const tags = newPost.tags.includes(m)
                      ? newPost.tags.filter((t) => t !== m)
                      : [...newPost.tags, m];
                    setNewPost({ ...newPost, tags });
                  }}
                  style={[
                    styles.tagItem,
                    newPost.tags.includes(m) && styles.tagItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagItemText,
                      newPost.tags.includes(m) && { color: "#000" },
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.publishBtn}
                onPress={handlePublish}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.publishBtnText}>PUBLICAR AHORA </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowModal(false);
                  setNewPost({ title: "", content: "", tags: [] });
                }}
              >
                <Text style={{ color: "#666", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 20,
  },
  header: { marginVertical: 25, position: "relative" },
  title: { fontSize: 28, fontFamily: FONTS.secondaryBold, color: "#fff" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 5 },
  addBtnAbs: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: COLORS.orange,
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  filterBar: { marginBottom: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  searchInput: { flex: 1, color: "#fff" },
  sortContainer: { flexDirection: "row", gap: 10, marginBottom: 15 },
  sortBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#222",
  },
  sortBtnActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  sortBtnText: { color: "#666", fontSize: 12, fontWeight: "bold" },
  muscleScroll: { flexDirection: "row" },
  muscleChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#141414",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  muscleChipActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  muscleChipText: { color: "#666", fontSize: 12, fontWeight: "bold" },

  card: {
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  cardExpanded: { borderColor: COLORS.orange },
  isMeCard: {
    borderColor: COLORS.orange,
    borderLeftWidth: 5,
    backgroundColor: "rgba(255,165,0,0.02)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avatarMe: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  avatarText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  date: { color: "#444", fontSize: 10 },
  likesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,165,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  likesText: {
    color: COLORS.orange,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
  postTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FONTS.secondaryBold,
    marginBottom: 8,
  },
  postContent: { color: "#aaa", fontSize: 14, lineHeight: 20 },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
  },
  tagText: { color: COLORS.orange, fontSize: 11, fontWeight: "700" },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  actionBtnActive: {
    backgroundColor: "rgba(255,165,0,0.05)",
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  actionLabel: { color: "#666", fontSize: 12, fontWeight: "bold" },
  detailBtn: {
    flex: 1,
    backgroundColor: COLORS.orange,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailBtnText: { color: "#000", fontWeight: "bold", fontSize: 12 },

  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 30,
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

  // --- ESTILOS EMPTY STATE ---
  emptyContainer: {
    backgroundColor: "#141414",
    padding: 40,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    borderStyle: "dashed",
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: FONTS.secondaryBold,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  emptyBtn: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  emptyBtnText: {
    color: COLORS.orange,
    fontSize: 12,
    fontFamily: FONTS.secondaryBold,
    letterSpacing: 1,
  },

  // --- ESTILOS MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#141414",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.orange,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: FONTS.secondaryBold,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  tagLabel: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  tagSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 25,
  },
  tagItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#222",
  },
  tagItemActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  tagItemText: { color: "#666", fontSize: 11, fontWeight: "bold" },
  modalActions: { gap: 10 },
  publishBtn: {
    backgroundColor: COLORS.orange,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
  },
  publishBtnText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  cancelBtn: { padding: 15, alignItems: "center" },
});
