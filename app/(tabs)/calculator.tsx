import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

export default function HealthCalculator() {
  const insets = useSafeAreaInsets();

  // --- ESTADOS ---
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "hombre",
    activity: "1.2",
  });

  const [errors, setErrors] = useState<any>({}); // Estado para errores por campo
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalculated, setIsCalculated] = useState(false);
  const [emptyState, setEmptyState] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/health");
      setHistory(
        Array.isArray(res.data) ? res.data : res.data ? [res.data] : [],
      );
    } catch (error) {
      console.error("Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => a.imc - b.imc).slice(0, 3);
  }, [history]);

  // --- LÓGICA DE CÁLCULO LOCAL ---
  const handleCalculate = () => {
    setErrors({}); // Limpiar errores previos
    const { weight, height, age, gender, activity } = formData;

    const isAnyFieldEmpty =
      !formData.weight || !formData.height || !formData.age;
    setEmptyState(isAnyFieldEmpty);

    if (!weight || !height || !age) {
      return Toast.show({
        type: "error",
        text1: "Campos incompletos",
        text2: "Rellena los campos obligatorios 📋",
      });
    }

    const hMeters = Number(height) / 100;
    const imc = (Number(weight) / hMeters ** 2).toFixed(1);
    const tmb =
      gender === "hombre"
        ? 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5
        : 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161;
    const tdee = Math.round(tmb * Number(activity));

    setResults({
      weight: Number(weight),
      imc: Number(imc),
      tmb: Math.round(tmb),
      tdee,
      activity,
    });
    setIsCalculated(true);
    Toast.show({ type: "success", text1: "¡Análisis completado!" });
  };

  // --- LÓGICA DE GUARDADO (CON FIX DE ERRORES API) ---
  const saveResults = async () => {
    setErrors({}); // Resetear errores al intentar guardar

    try {
      const payload = {
        weight: formData.weight === "" ? undefined : Number(formData.weight),
        height: formData.height === "" ? undefined : Number(formData.height),
        age: Number(formData.age),
        gender: formData.gender,
        activity: Number(formData.activity),
        // Datos calculados
        imc: results?.imc ? Number(results.imc) : undefined,
        tmb: results?.tmb ? Number(results.tmb) : undefined,
        tdee: results?.tdee ? Number(results.tdee) : undefined,
      };

      await api.post("/health", payload);

      Toast.show({ type: "success", text1: "¡Progreso guardado! 🔥" });
      setIsCalculated(false);
      setResults(null);
      setFormData({
        weight: "",
        height: "",
        age: "",
        gender: "hombre",
        activity: "1.2",
      });
      fetchHistory();
    } catch (error: any) {
      const data = error.response?.data;

      // SI HAY ERRORES DE VALIDACIÓN (Igual que en tu componente WEB)
      if (data?.errors && Array.isArray(data.errors)) {
        const apiErrors: any = {};
        data.errors.forEach((err: any) => {
          // err.path suele ser el nombre del campo (weight, height, etc)
          apiErrors[err.path] = err.message;
        });

        setErrors(apiErrors); // Esto activará los bordes rojos y los textos
        setIsCalculated(false); // Reseteamos cálculo para que corrija
        return Toast.show({
          type: "error",
          text1: "Datos inválidos",
          text2: "Revisa los campos marcados en rojo",
        });
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: data?.message || "Error de conexión",
      });
    }
  };

  const getMedalStyle = (index: number) => {
    if (index === 0) return { color: "#FFD700", label: "ORO 🥇" };
    if (index === 1) return { color: "#C0C0C0", label: "PLATA 🥈" };
    if (index === 2) return { color: "#CD7F32", label: "BRONCE 🥉" };
    return null;
  };

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.orange} />
      </View>
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.title}>
          Salud & <Text style={{ color: COLORS.orange }}>Fitness</Text>
        </Text>

        <View style={styles.card}>
          <View style={styles.genderRow}>
            {["hombre", "mujer"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => {
                  setFormData({ ...formData, gender: g });
                  setIsCalculated(false);
                }}
                style={[
                  styles.genderBtn,
                  formData.gender === g && styles.genderBtnActive,
                ]}
              >
                <Ionicons
                  name={g === "hombre" ? "male" : "female"}
                  size={18}
                  color={formData.gender === g ? "#000" : "#666"}
                />
                <Text
                  style={[
                    styles.genderText,
                    formData.gender === g && { color: "#000" },
                  ]}
                >
                  {g.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Edad</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.age && styles.inputError,
                  emptyState && { borderColor: COLORS.orange },
                ]}
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(v) => {
                  setFormData({ ...formData, age: v });
                  setIsCalculated(false);
                }}
                placeholder="25"
                placeholderTextColor="#333"
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.weight && styles.inputError,
                  emptyState && { borderColor: COLORS.orange },
                ]}
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(v) => {
                  setFormData({ ...formData, weight: v });
                  setIsCalculated(false);
                }}
                placeholder="70"
                placeholderTextColor="#333"
              />
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight}</Text>
              )}
            </View>
          </View>

          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={[
              styles.input,
              errors.height && styles.inputError,
              emptyState && { borderColor: COLORS.orange },
            ]}
            keyboardType="numeric"
            value={formData.height}
            onChangeText={(v) => {
              setFormData({ ...formData, height: v });
              setIsCalculated(false);
            }}
            placeholder="175"
            placeholderTextColor="#333"
          />
          {errors.height && (
            <Text style={styles.errorText}>{errors.height}</Text>
          )}

          <TouchableOpacity
            style={[styles.mainBtn, isCalculated && styles.saveBtn]}
            onPress={isCalculated ? saveResults : handleCalculate}
          >
            <Text style={styles.mainBtnText}>
              {isCalculated ? "💾 GUARDAR EN RANKING" : "CALCULAR MÉTRICAS"}
            </Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.resultsGrid}>
            <View style={styles.resItem}>
              <Text style={styles.resLabel}>IMC</Text>
              <Text style={styles.resVal}>{results.imc}</Text>
            </View>
            <View style={styles.resItem}>
              <Text style={styles.resLabel}>TMB</Text>
              <Text style={styles.resVal}>{results.tmb}</Text>
            </View>
            <View style={styles.resItem}>
              <Text style={styles.resLabel}>TDEE</Text>
              <Text style={styles.resVal}>{results.tdee}</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Ranking Personal (Top 3)</Text>
        {sortedHistory.map((record, index) => {
          const medal = getMedalStyle(index);
          return (
            <View
              key={record._id}
              style={[
                styles.historyCard,
                medal && { borderColor: medal.color, borderLeftWidth: 4 },
              ]}
            >
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>
                  {new Date(record.createdAt).toLocaleDateString()}
                </Text>
                {medal && (
                  <Text
                    style={{
                      color: medal.color,
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {medal.label}
                  </Text>
                )}
              </View>
              <View style={styles.historyBody}>
                <Text style={styles.historyText}>{record.weight}kg</Text>
                <Text style={styles.historyText}>IMC: {record.imc}</Text>
                <Text style={[styles.historyText, { color: COLORS.orange }]}>
                  {record.tdee} kcal
                </Text>
              </View>
            </View>
          );
        })}
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryBg,
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.secondaryBold,
    color: "#fff",
    marginVertical: 20,
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
    marginBottom: 8,
    letterSpacing: 1,
  },
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  genderBtnActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  genderText: { color: "#666", fontSize: 11, fontWeight: "bold" },
  row: { flexDirection: "row", gap: 15 },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#222",
  },
  inputError: { borderColor: "#ff4d4d" }, // Borde rojo para error
  errorText: {
    color: "#ff4d4d",
    fontSize: 10,
    marginBottom: 10,
    marginLeft: 5,
  }, // Texto de error
  mainBtn: {
    backgroundColor: COLORS.orange,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 15,
  },
  saveBtn: { backgroundColor: "#4CAF50" },
  mainBtnText: { color: "#000", fontFamily: FONTS.secondaryBold, fontSize: 13 },
  resultsGrid: { flexDirection: "row", gap: 10, marginTop: 20 },
  resItem: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: COLORS.orange,
  },
  resLabel: { color: "#666", fontSize: 9, marginBottom: 5 },
  resVal: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: FONTS.secondaryBold,
    marginTop: 35,
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: "#141414",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  historyDate: { color: "#555", fontSize: 11 },
  historyBody: { flexDirection: "row", justifyContent: "space-between" },
  historyText: { color: "#ccc", fontSize: 13, fontWeight: "600" },
});
