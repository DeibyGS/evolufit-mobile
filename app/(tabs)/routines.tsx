import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
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
import { COLORS, FONTS } from "../../constants/theme";
import { EXERCISES_DB, MUSCLE_GROUPS } from "../../data/exercises";
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

export default function RoutinesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // --- ESTADOS PRINCIPALES ---
  const [isStarted, setIsStarted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE LA SESIÓN ACTIVA ---
  const [routineName, setRoutineName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [series, setSeries] = useState([
    { id: Date.now().toString(), reps: "", weight: "" },
  ]);
  const [workoutList, setWorkoutList] = useState<any[]>([]);

  // --- ESTADOS DE PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 4;

  // --- NUEVOS ESTADOS PARA ELIMINACIÓN ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    return EXERCISES_DB.filter((ex) => ex.group === selectedGroup);
  }, [selectedGroup]);

  // --- FETCH HISTORIAL CON PAGINACIÓN ---
  const fetchHistory = useCallback(
    async (isNextPage = false) => {
      if (isNextPage) setLoadingMore(true);
      else setLoading(true);

      try {
        const pageToFetch = isNextPage ? page + 1 : 1;
        const response = await api.get(`/workouts/my-workouts`, {
          params: { page: pageToFetch, limit: LIMIT },
        });

        const newRecords = response.data.workouts || [];
        const hasMore = response.data.hasNextPage || false;

        setHistory((prev) =>
          isNextPage ? [...prev, ...newRecords] : newRecords,
        );
        setHasNextPage(hasMore);
        setPage(pageToFetch);
      } catch (error) {
        console.error("Error cargando historial", error);
        Toast.show({ type: "error", text1: "Error al cargar el historial" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchHistory(false);
  }, []);

  // --- LÓGICA DE ELIMINACIÓN ---
  const handleDeleteWorkout = async () => {
    if (!recordToDelete) return;
    try {
      await api.delete(`/workouts/${recordToDelete}`);
      setShowDeleteModal(false);
      setRecordToDelete(null);
      Toast.show({ type: "success", text1: "Entrenamiento eliminado 🗑️" });
      fetchHistory(false); // Recargar desde pág 1 para actualizar lista
    } catch (error) {
      Toast.show({ type: "error", text1: "Error al eliminar" });
    }
  };

  // --- LÓGICA DE SESIÓN ACTIVA ---
  const addSet = () => {
    setSeries([...series, { id: Date.now().toString(), reps: "", weight: "" }]);
  };

  const updateSet = (id: string, field: string, value: string) => {
    setSeries(series.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addExerciseToSession = () => {
    if (!selectedExercise || series.some((s) => s.reps === "")) {
      return Toast.show({
        type: "error",
        text1: "¡Atención!",
        text2: "Completa las repeticiones de todos los sets 🏋️‍♂️",
      });
    }
    const newEntry = {
      muscleGroup: selectedGroup,
      exerciseName: selectedExercise,
      sets: series.map((s) => ({
        reps: Number(s.reps),
        weight: Number(s.weight || 0),
      })),
    };
    setWorkoutList([...workoutList, newEntry]);
    setSelectedExercise("");
    setSeries([{ id: Date.now().toString(), reps: "", weight: "" }]);
    Toast.show({ type: "success", text1: "Ejercicio añadido 💪" });
  };

  const finishSession = async () => {
    if (workoutList.length === 0) {
      return Toast.show({
        type: "error",
        text1: "Añade al menos un ejercicio",
      });
    }

    Alert.alert("Finalizar Sesión", "¿Estás listo para guardar tu progreso?", [
      { text: "Seguir entrenando", style: "cancel" },
      {
        text: "Guardar 🔥",
        onPress: async () => {
          try {
            const payload = {
              routineName:
                routineName || `Rutina de ${selectedGroup || "Fuerza"}`,
              exercises: workoutList,
            };
            await api.post("/workouts", payload);
            Toast.show({ type: "success", text1: "¡Entrenamiento guardado!" });
            setIsStarted(false);
            setWorkoutList([]);
            setRoutineName("");
            setSelectedGroup("");
            fetchHistory(false);
          } catch (error) {
            Toast.show({ type: "error", text1: "Error al guardar sesión" });
          }
        },
      },
    ]);
  };

  if (loading && page === 1)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!isStarted ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Mis <Text style={{ color: COLORS.orange }}>Rutinas</Text>
            </Text>
            <Text style={styles.subtitle}>
              Hola, {user?.name}. ¿Qué entrenamos hoy?
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => setIsStarted(true)}
          >
            <Ionicons name="play" size={20} color="#000" />
            <Text style={styles.startBtnText}>NUEVO ENTRENAMIENTO</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Historial de Sesiones</Text>

          {history.length > 0 ? (
            history.map((item: any) => (
              <View key={item._id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.routineTitle} numberOfLines={1}>
                      {item.routineName}
                    </Text>
                  </View>

                  {/* BOTÓN ELIMINAR REGISTRO */}
                  <TouchableOpacity
                    onPress={() => {
                      setRecordToDelete(item._id);
                      setShowDeleteModal(true);
                    }}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
                  </TouchableOpacity>
                </View>

                <View style={styles.exercisePreviewList}>
                  {item.exercises.map((ex: any, idx: number) => (
                    <View key={idx} style={styles.detailedExerciseItem}>
                      <View style={styles.exerciseNameRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={COLORS.orange}
                        />
                        <Text style={styles.exerciseSummary}>
                          {ex.exerciseName}
                        </Text>
                      </View>
                      <View style={styles.setsInfoContainer}>
                        {ex.sets.map((set: any, sIdx: number) => (
                          <Text key={sIdx} style={styles.setTextInfo}>
                            {set.reps}x{set.weight}kg
                            {sIdx < ex.sets.length - 1 ? "  |  " : ""}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No hay entrenamientos registrados aún.
            </Text>
          )}

          {hasNextPage && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => fetchHistory(true)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color={COLORS.orange} />
              ) : (
                <>
                  <Text style={styles.loadMoreText}>Ver más registros</Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={COLORS.orange}
                  />
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.activeHeader}>
            <TextInput
              style={styles.nameInput}
              placeholder="Nombre de la rutina..."
              placeholderTextColor="#555"
              value={routineName}
              onChangeText={setRoutineName}
            />
            <TouchableOpacity
              onPress={() => setIsStarted(false)}
              style={styles.cancelBtn}
            >
              <Ionicons name="close" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>1. Selecciona Grupo Muscular</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {MUSCLE_GROUPS.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => {
                  setSelectedGroup(g);
                  setSelectedExercise("");
                }}
                style={[
                  styles.groupChip,
                  selectedGroup === g && styles.groupChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedGroup === g && styles.chipTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedGroup && (
            <View style={styles.configBox}>
              <Text style={styles.label}>2. Elige el ejercicio</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {filteredExercises.map((e) => (
                  <TouchableOpacity
                    key={e.id}
                    onPress={() => setSelectedExercise(e.name)}
                    style={[
                      styles.exerciseChip,
                      selectedExercise === e.name && styles.exerciseChipActive,
                    ]}
                  >
                    <Text style={{ color: "#fff", fontSize: 13 }}>
                      {e.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedExercise && (
                <View style={styles.setsContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                      SET
                    </Text>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                      REPS
                    </Text>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                      PESO (KG)
                    </Text>
                  </View>
                  {series.map((s, idx) => (
                    <View key={s.id} style={styles.setRow}>
                      <View style={styles.setNumberCircle}>
                        <Text style={styles.setNumberText}>{idx + 1}</Text>
                      </View>
                      <TextInput
                        style={styles.setInput}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor="#333"
                        onChangeText={(v) => updateSet(s.id, "reps", v)}
                      />
                      <TextInput
                        style={styles.setInput}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor="#333"
                        onChangeText={(v) => updateSet(s.id, "weight", v)}
                      />
                    </View>
                  ))}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.addSetBtn} onPress={addSet}>
                      <Ionicons name="add" size={18} color={COLORS.orange} />
                      <Text style={styles.addSetBtnText}>Añadir Set</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveExBtn}
                      onPress={addExerciseToSession}
                    >
                      <Text style={styles.saveExBtnText}>Añadir Ejercicio</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {workoutList.length > 0 && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumen de la Sesión</Text>
              {workoutList.map((item, index) => (
                <View key={index} style={styles.summaryItem}>
                  <View>
                    <Text style={styles.summaryExName}>
                      {item.exerciseName}
                    </Text>
                    <Text style={styles.summaryExSets}>
                      {item.sets.length} series registradas
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setWorkoutList(workoutList.filter((_, i) => i !== index))
                    }
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.finishBtn}
                onPress={finishSession}
              >
                <Text style={styles.finishBtnText}>FINALIZAR Y GUARDAR 🔥</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="trash-outline" size={30} color={COLORS.orange} />
            </View>
            <Text style={styles.modalTitle}>¿Eliminar entrenamiento?</Text>
            <Text style={styles.modalText}>
              Esta acción no se puede deshacer. Perderás este registro de
              entrenamiento. 🏋️‍♂️
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleDeleteWorkout}
              >
                <Text style={styles.modalConfirmText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
  },
  header: { marginVertical: 20 },
  title: { fontSize: 28, fontFamily: FONTS.secondaryBold, color: "#fff" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 5 },
  startBtn: {
    backgroundColor: COLORS.orange,
    flexDirection: "row",
    padding: 18,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  startBtnText: {
    color: "#000",
    fontFamily: FONTS.secondaryBold,
    marginLeft: 10,
    fontSize: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FONTS.secondaryBold,
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: "#141414",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dateBadge: {
    backgroundColor: "rgba(255,165,0,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: { color: COLORS.orange, fontSize: 11, fontWeight: "bold" },
  routineTitle: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 16,
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 77, 77, 0.05)",
    borderRadius: 10,
  },
  exercisePreviewList: { gap: 12 },
  detailedExerciseItem: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 12,
  },
  exerciseNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  exerciseSummary: { color: COLORS.orange, fontSize: 13, fontWeight: "bold" },
  setsInfoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingLeft: 22,
  },
  setTextInfo: { color: "#666", fontSize: 11 },
  emptyText: { color: "#444", textAlign: "center", marginTop: 20 },
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
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  nameInput: {
    color: "#fff",
    fontSize: 22,
    fontFamily: FONTS.secondaryBold,
    flex: 1,
  },
  cancelBtn: { padding: 5 },
  label: {
    color: COLORS.orange,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chipScroll: { marginBottom: 20 },
  groupChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  groupChipActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  chipText: { color: "#888", fontWeight: "bold" },
  chipTextActive: { color: "#000" },
  configBox: {
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  exerciseChip: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 10,
    backgroundColor: "#000",
  },
  exerciseChipActive: {
    borderColor: COLORS.orange,
    backgroundColor: "rgba(255,165,0,0.05)",
  },
  setsContainer: { marginTop: 10 },
  tableHeader: { flexDirection: "row", marginBottom: 10, paddingHorizontal: 5 },
  tableHeaderText: {
    color: "#444",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  setNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  setNumberText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  setInput: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    flex: 2,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  addSetBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  addSetBtnText: { color: COLORS.orange, fontWeight: "bold", fontSize: 14 },
  saveExBtn: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveExBtnText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  summaryBox: {
    marginTop: 30,
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 25,
  },
  summaryTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.secondaryBold,
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  summaryExName: { color: COLORS.orange, fontWeight: "bold", fontSize: 15 },
  summaryExSets: { color: "#666", fontSize: 12 },
  finishBtn: {
    backgroundColor: COLORS.orange,
    padding: 18,
    borderRadius: 15,
    marginTop: 25,
  },
  finishBtnText: {
    color: "#000",
    textAlign: "center",
    fontFamily: FONTS.secondaryBold,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#141414",
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,165,0,0.1)",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.secondaryBold,
    color: "#fff",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 25,
  },
  modalBtnRow: { flexDirection: "row", gap: 12 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: "#222",
    alignItems: "center",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: COLORS.orange,
    alignItems: "center",
  },
  modalCancelText: { color: "#888", fontWeight: "bold" },
  modalConfirmText: { color: "#000", fontWeight: "bold" },
});
