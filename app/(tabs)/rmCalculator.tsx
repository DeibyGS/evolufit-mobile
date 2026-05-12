import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import OfflineBanner from "../../components/OfflineBanner";
import { COLORS, FONTS } from "../../constants/theme";
import { EXERCISES_DB, MUSCLE_GROUPS } from "../../data/exercises";
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

export default function RMCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // ESTADOS DE FORMULARIO
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // ESTADOS DE VALIDACIÓN (Naranja y Rojo)
  const [errors, setErrors] = useState<any>({});
  const [emptyState, setEmptyState] = useState(false);

  // ESTADOS DE DATOS
  const [results, setResults] = useState<any>(null);
  const [savedRMs, setSavedRMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // ESTADOS DE PAGINACIÓN
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 8;

  // ESTADOS PARA EL MODAL DE ELIMINAR
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Flag to skip the first NetInfo emission (fires immediately on subscribe)
  // and avoid duplicating the initial fetchSavedRMs() call from the mount useEffect.
  const isFirstNetInfoEmit = useRef(true);

  // --- LÓGICA PARA MEJOR REGISTRO ---
  const bestResultsByExercise = useMemo(() => {
    const mapping: { [key: string]: number } = {};
    savedRMs.forEach((rm) => {
      const currentMax = mapping[rm.exerciseName] || 0;
      if (rm.brzyckiResult > currentMax) {
        mapping[rm.exerciseName] = rm.brzyckiResult;
      }
    });
    return mapping;
  }, [savedRMs]);

  // Limpiar cálculos si cambian los inputs
  useEffect(() => {
    if (isCalculated) {
      setIsCalculated(false);
      setResults(null);
    }
  }, [weight, reps, selectedExercise]);

  const filteredExercises = useMemo(
    () => EXERCISES_DB.filter((ex) => ex.group === selectedGroup),
    [selectedGroup],
  );

  // FETCH DE REGISTROS + CACHÉ OFFLINE
  const fetchSavedRMs = useCallback(
    async (isNextPage = false) => {
      if (isNextPage) setLoadingMore(true);
      else setLoading(true);

      try {
        const currentPage = isNextPage ? page + 1 : 1;
        const response = await api.get(`/rm`, {
          params: { page: currentPage, limit: LIMIT },
        });

        const newRecords = response.data.records || [];
        const hasMore = response.data.hasNextPage || false;

        setSavedRMs((prev) =>
          isNextPage ? [...prev, ...newRecords] : newRecords,
        );
        setHasNextPage(hasMore);
        setPage(currentPage);
        setIsOffline(false);

        // Persist page 1 for offline use
        if (!isNextPage) {
          await AsyncStorage.setItem("cache:rm-records", JSON.stringify(newRecords));
        }
      } catch (error: any) {
        const isNetworkError = !error.response && error.message === "Network Error";
        if (isNetworkError && !isNextPage) {
          const cached = await AsyncStorage.getItem("cache:rm-records");
          if (cached) {
            setSavedRMs(JSON.parse(cached));
            setIsOffline(true);
          } else {
            Toast.show({ type: "error", text1: "Sin conexión y sin datos guardados" });
          }
        } else {
          Toast.show({ type: "error", text1: "Error al cargar historial" });
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchSavedRMs(false);
  }, []);

  // Proactive NetInfo subscription: react to connectivity changes immediately
  useEffect(() => {
    isFirstNetInfoEmit.current = true;
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Skip the first emission to avoid duplicating the mount fetchSavedRMs() call.
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
        fetchSavedRMs(false);
      }
    });

    // Cleanup: remove listener on unmount to prevent memory leaks
    return () => unsubscribe();
  }, [fetchSavedRMs]);

  // CÁLCULO DE 1RM
  const calculateRM = () => {
    setErrors({});
    setEmptyState(false);

    const w = parseFloat(weight);
    const r = parseInt(reps);

    // Validación visual de campos vacíos
    if (!weight || !reps || !selectedExercise) {
      setEmptyState(true);
      return Toast.show({
        type: "error",
        text1: "¡Un momento!",
        text2: "Completa ejercicio, peso y reps 🏋️‍♂️",
      });
    }

    if (w <= 0 || r <= 0) {
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "Los valores deben ser positivos",
      });
    }

    const epley = w * (1 + r / 30);
    const brzycki = w / (1.0278 - 0.0278 * r);

    setResults({ epley: epley.toFixed(1), brzycki: brzycki.toFixed(1) });
    setIsCalculated(true);
  };

  // GUARDADO EN DB
  const handleSaveRM = async () => {
    setErrors({});
    try {
      const payload = {
        exerciseName: selectedExercise,
        muscleGroup: selectedGroup,
        weightUsed: Number(weight),
        repsDone: Number(reps),
        epleyResult: Number(results.epley),
        brzyckiResult: Number(results.brzycki),
      };

      await api.post("/rm", payload);
      Toast.show({ type: "success", text1: "Marca guardada ⚡" });

      setIsCalculated(false);
      setResults(null);
      setWeight("");
      setReps("");
      setEmptyState(false);
      fetchSavedRMs(false);
    } catch (error: any) {
      const data = error.response?.data;

      // Captura de errores de Zod del backend
      if (data?.errors && Array.isArray(data.errors)) {
        const apiErrors: any = {};
        data.errors.forEach((err: any) => {
          const fieldName = Array.isArray(err.path) ? err.path[0] : err.path;
          apiErrors[fieldName] = err.message;
        });
        setErrors(apiErrors);
      }

      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: data?.message || "Revisa los campos en rojo",
      });
    }
  };

  const handleDeleteRM = async () => {
    if (!recordToDelete) return;
    try {
      await api.delete(`/rm/${recordToDelete}`);
      setShowDeleteModal(false);
      Toast.show({ type: "success", text1: "Registro eliminado 🗑️" });
      fetchSavedRMs(false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error al eliminar" });
    }
  };

  if (loading && page === 1)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </View>
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OfflineBanner visible={isOffline} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Calculadora <Text style={{ color: COLORS.orange }}>1RM</Text>
          </Text>
          <Text style={styles.subtitle}>
            Mide y supera tus límites teóricos
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* FORMULARIO */}
        <View style={styles.card}>
          <Text style={styles.label}>Grupo Muscular</Text>
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
                  setEmptyState(false);
                }}
                style={[
                  styles.chip,
                  selectedGroup === g && styles.chipActive,
                  emptyState && !selectedGroup && styles.inputEmpty,
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
            <>
              <Text style={styles.label}>Ejercicio</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {filteredExercises.map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => {
                      setSelectedExercise(ex.name);
                      setErrors({ ...errors, exerciseName: null });
                    }}
                    style={[
                      styles.exChip,
                      selectedExercise === ex.name && styles.exChipActive,
                      ((emptyState && !selectedExercise) ||
                        errors.exerciseName) &&
                        styles.inputError,
                    ]}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 12,
                        fontFamily: FONTS.primary,
                      }}
                    >
                      {ex.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Peso (Kg)</Text>
              <TextInput
                style={[
                  styles.input,
                  emptyState && !weight && styles.inputEmpty,
                  errors.weightUsed && styles.inputError,
                ]}
                keyboardType="numeric"
                value={weight}
                onChangeText={(v) => {
                  setWeight(v);
                  setErrors({ ...errors, weightUsed: null });
                }}
                placeholder="0"
                placeholderTextColor="#333"
              />
              {errors.weightUsed && (
                <Text style={styles.errorText}>{errors.weightUsed}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                style={[
                  styles.input,
                  emptyState && !reps && styles.inputEmpty,
                  errors.repsDone && styles.inputError,
                ]}
                keyboardType="numeric"
                value={reps}
                onChangeText={(v) => {
                  setReps(v);
                  setErrors({ ...errors, repsDone: null });
                }}
                placeholder="0"
                placeholderTextColor="#333"
              />
              {errors.repsDone && (
                <Text style={styles.errorText}>{errors.repsDone}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.mainBtn, isCalculated && styles.saveBtnActive]}
            onPress={isCalculated ? handleSaveRM : calculateRM}
          >
            <Ionicons
              name={isCalculated ? "trophy-outline" : "calculator-outline"}
              size={20}
              color="#000"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.mainBtnText}>
              {isCalculated ? "¡GUARDAR RÉCORD! 🔥" : "CALCULAR 1RM"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESULTADOS */}
        {results && (
          <View style={styles.resultsContainer}>
            <View style={styles.resCard}>
              <Text style={styles.resLabel}>MÉTODO EPLEY</Text>
              <Text style={styles.resValue}>
                {results.epley}
                <Text style={styles.unitSmall}>kg</Text>
              </Text>
            </View>
            <View style={styles.resCard}>
              <Text style={styles.resLabel}>MÉTODO BRZYCKI</Text>
              <Text style={styles.resValue}>
                {results.brzycki}
                <Text style={styles.unitSmall}>kg</Text>
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Mi Historial Personal</Text>
        {savedRMs.map((rm, idx) => {
          const isBestRecord =
            bestResultsByExercise[rm.exerciseName] === rm.brzyckiResult;
          return (
            <View
              key={rm._id || idx}
              style={[
                styles.historyCard,
                isBestRecord && styles.historyCardBest,
              ]}
            >
              {isBestRecord && (
                <View style={styles.prBadgeFloating}>
                  <Ionicons name="flash" size={10} color="#000" />
                  <Text style={styles.prBadgeText}>NUEVA MARCA</Text>
                </View>
              )}
              <View style={styles.historyHeader}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.historyEx,
                      isBestRecord && { color: COLORS.orange },
                    ]}
                  >
                    {rm.exerciseName}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(rm.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setRecordToDelete(rm._id);
                    setShowDeleteModal(true);
                  }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
              <View style={styles.historyData}>
                <Text style={styles.historySub}>
                  {rm.weightUsed}kg x {rm.repsDone} reps
                </Text>
                <View
                  style={[styles.rmBadge, isBestRecord && styles.rmBadgeBest]}
                >
                  <Text
                    style={[
                      styles.historyRM,
                      isBestRecord && { color: "#000" },
                    ]}
                  >
                    {rm.brzyckiResult} kg
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {hasNextPage && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={() => fetchSavedRMs(true)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator color={COLORS.orange} />
            ) : (
              <Text style={styles.loadMoreText}>Ver más registros</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* MODAL ELIMINAR */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="trash-outline" size={30} color={COLORS.orange} />
            </View>
            <Text style={styles.modalTitle}>¿Eliminar récord?</Text>
            <Text style={styles.modalText}>
              Esta acción no se puede deshacer. Perderás este progreso. 🏋️‍♂️
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
                onPress={handleDeleteRM}
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
  header: { marginVertical: 20 },
  title: { fontSize: 24, fontFamily: FONTS.secondaryBold, color: "#fff" },
  subtitle: { color: "#666", fontSize: 13, fontFamily: FONTS.primary },
  loading: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.primaryBg,
  },
  card: {
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  label: {
    color: COLORS.orange,
    fontSize: 10,
    fontFamily: FONTS.secondaryBold,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  chipScroll: { marginBottom: 20 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#000",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#222",
  },
  chipActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  chipText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: FONTS.primary,
  },
  chipTextActive: { color: "#000" },
  exChip: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 8,
  },
  exChipActive: { borderColor: COLORS.orange },
  row: { flexDirection: "row", gap: 15, marginBottom: 20 },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 15,
    borderRadius: 15,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    fontFamily: FONTS.primary,
  },
  inputEmpty: { borderColor: COLORS.orange, borderWidth: 1.2 },
  inputError: { borderColor: "#ff4d4d", borderWidth: 1.2 },
  errorText: {
    color: "#ff4d4d",
    fontSize: 10,
    marginTop: 5,
    fontFamily: FONTS.primary,
    textAlign: "center",
  },
  mainBtn: {
    backgroundColor: COLORS.orange,
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnActive: { shadowColor: COLORS.orange, elevation: 5 },
  mainBtnText: { color: "#000", fontFamily: FONTS.secondaryBold, fontSize: 14 },
  resultsContainer: { flexDirection: "row", gap: 15, marginTop: 20 },
  resCard: {
    flex: 1,
    backgroundColor: "rgba(255,165,0,0.05)",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,165,0,0.1)",
  },
  resLabel: {
    color: "#555",
    fontSize: 9,
    marginBottom: 5,
    fontFamily: FONTS.primary,
  },
  resValue: { color: "#fff", fontSize: 22, fontFamily: FONTS.secondaryBold },
  unitSmall: { fontSize: 12, color: "#666" },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FONTS.secondaryBold,
    marginTop: 30,
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: "#141414",
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    position: "relative",
    overflow: "hidden",
  },
  historyCardBest: {
    borderColor: COLORS.orange,
    borderLeftWidth: 5,
    backgroundColor: "rgba(255,165,0,0.02)",
  },
  prBadgeFloating: {
    position: "absolute",
    top: 0,
    right: 60,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  prBadgeText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "900",
    fontFamily: FONTS.primary,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  historyEx: { color: "#fff", fontFamily: FONTS.secondaryBold, fontSize: 14 },
  historyDate: { color: "#333", fontSize: 11, fontFamily: FONTS.primary },
  historyData: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historySub: { color: "#666", fontSize: 12, fontFamily: FONTS.primary },
  rmBadge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#222",
  },
  rmBadgeBest: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  historyRM: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: FONTS.primary,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 77, 77, 0.05)",
    borderRadius: 10,
  },
  loadMoreBtn: { padding: 15, alignItems: "center" },
  loadMoreText: { color: COLORS.orange, fontFamily: FONTS.secondaryBold },
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
    fontFamily: FONTS.primary,
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
  modalCancelText: {
    color: "#888",
    fontWeight: "bold",
    fontFamily: FONTS.primary,
  },
  modalConfirmText: {
    color: "#000",
    fontWeight: "bold",
    fontFamily: FONTS.secondaryBold,
  },
});
