import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../../api/API";
import { COLORS, FONTS } from "../../constants/theme";
import { MUSCLE_GROUPS, MuscleGroup } from "../../data/exercises";
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

interface Set {
  reps: number;
  weight: number;
}
interface Exercise {
  muscleGroup: string;
  exerciseName: string;
  sets: Set[];
}
interface Workout {
  _id: string;
  routineName: string;
  exercises: Exercise[];
  createdAt: string;
  userId: string;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>("Pecho");
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<"start" | "end">("start");

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await api.get("/workouts/my-workouts");
      if (res.data && Array.isArray(res.data.workouts)) {
        setWorkouts(res.data.workouts);
      } else {
        setWorkouts([]);
      }
    } catch (error) {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const formattedName = user?.name
    ? user.name.charAt(0).toUpperCase() +
      user.name.slice(1).toLowerCase() +
      " " +
      user.lastname.charAt(0).toUpperCase() +
      user.lastname.slice(1).toLowerCase()
    : "Usuario";

  const filteredWorkouts = useMemo(() => {
    if (!workouts || !Array.isArray(workouts)) return [];
    let endLimit = endDate ? new Date(endDate) : null;
    if (endLimit) endLimit.setHours(23, 59, 59);
    return workouts.filter((w) => {
      const workoutDate = new Date(w.createdAt);
      if (startDate && workoutDate < startDate) return false;
      if (endLimit && workoutDate > endLimit) return false;
      return true;
    });
  }, [workouts, startDate, endDate]);

  const groupStats = useMemo(() => {
    return filteredWorkouts.reduce(
      (acc, w) => {
        w.exercises.forEach((ex) => {
          if (ex.muscleGroup === selectedGroup) {
            acc.series += ex.sets.length;
            ex.sets.forEach((s) => {
              acc.reps += s.reps ?? 0;
              acc.volumen += (s.reps ?? 0) * (s.weight ?? 0);
            });
          }
        });
        return acc;
      },
      { series: 0, reps: 0, volumen: 0 },
    );
  }, [filteredWorkouts, selectedGroup]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      if (pickerType === "start") {
        if (endDate && selectedDate > endDate) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Inicio posterior al fin",
          });
        } else {
          setStartDate(selectedDate);
        }
      } else {
        if (startDate && selectedDate < startDate) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Fin anterior al inicio",
          });
        } else {
          setEndDate(selectedDate);
        }
      }
    } else if (event.type === "dismissed") {
      setShowPicker(false);
    }
  };

  const openPicker = (type: "start" | "end") => {
    setPickerType(type);
    setShowPicker(true);
  };

  const evolutionData = useMemo(() => {
    const dataPoints = [...filteredWorkouts].slice(-8).reverse();
    return {
      labels:
        dataPoints.length > 0
          ? dataPoints.map((w) =>
              new Date(w.createdAt).toLocaleDateString("es", {
                day: "2-digit",
                month: "short",
              }),
            )
          : ["-"],
      datasets: [
        {
          data:
            dataPoints.length > 0
              ? dataPoints.map((w) =>
                  w.exercises
                    .filter((ex) => ex.muscleGroup === selectedGroup)
                    .reduce(
                      (totalV, ex) =>
                        totalV +
                        ex.sets.reduce(
                          (sVol, s) => sVol + (s.reps ?? 0) * (s.weight ?? 0),
                          0,
                        ),
                      0,
                    ),
                )
              : [0],
        },
      ],
    };
  }, [filteredWorkouts, selectedGroup]);

  const hasLineData = useMemo(
    () => evolutionData.datasets[0].data.some((val) => val > 0),
    [evolutionData],
  );

  // CORRECCIÓN AQUÍ: Si no hay volumen real, devolvemos array vacío para disparar el EmptyState
  const volumePieData = useMemo(() => {
    const data = MUSCLE_GROUPS.map((group, index) => {
      const totalVol = filteredWorkouts.reduce(
        (acc, w) =>
          acc +
          w.exercises
            .filter((ex) => ex.muscleGroup === group)
            .reduce(
              (exAcc, ex) =>
                exAcc +
                ex.sets.reduce(
                  (sAcc, s) => sAcc + (s.reps ?? 0) * (s.weight ?? 0),
                  0,
                ),
              0,
            ),
        0,
      );
      return {
        name: group,
        population: totalVol,
        color: COLORS.chartColors[index % COLORS.chartColors.length],
        legendFontColor: "transparent",
        legendFontSize: 0,
      };
    });
    return data.some((item) => item.population > 0)
      ? data.filter((item) => item.population > 0)
      : [];
  }, [filteredWorkouts]);

  // CORRECCIÓN AQUÍ: Si no hay reps reales, devolvemos array vacío
  const repsPieData = useMemo(() => {
    const data = MUSCLE_GROUPS.map((group, index) => {
      const totalReps = filteredWorkouts.reduce(
        (acc, w) =>
          acc +
          w.exercises
            .filter((ex) => ex.muscleGroup === group)
            .reduce(
              (exAcc, ex) =>
                exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.reps ?? 0), 0),
              0,
            ),
        0,
      );
      return {
        name: group,
        population: totalReps,
        color: COLORS.chartColors[index % COLORS.chartColors.length],
        legendFontColor: "transparent",
        legendFontSize: 0,
      };
    });
    return data.some((item) => item.population > 0)
      ? data.filter((item) => item.population > 0)
      : [];
  }, [filteredWorkouts]);

  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1, backgroundColor: COLORS.primaryBg }}
        color={COLORS.orange}
      />
    );

  const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bar-chart-outline" size={40} color="#333" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Dashboard <Text style={{ color: COLORS.orange }}>Evolutivo</Text>
          </Text>
          <Text style={styles.subtitle}>
            Progreso de{" "}
            <Text style={styles.userNameOrange}>{formattedName}</Text>
          </Text>
        </View>

        <View style={styles.dateFilterRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => openPicker("start")}
          >
            <Ionicons name="calendar-outline" size={16} color={COLORS.orange} />
            <Text style={styles.dateText}>
              {startDate ? startDate.toLocaleDateString() : "Desde"}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "#444" }}>—</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => openPicker("end")}
          >
            <Ionicons name="calendar-outline" size={16} color={COLORS.orange} />
            <Text style={styles.dateText}>
              {endDate ? endDate.toLocaleDateString() : "Hasta"}
            </Text>
          </TouchableOpacity>
          {(startDate || endDate) && (
            <TouchableOpacity
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
              }}
            >
              <Ionicons name="close-circle" size={24} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>

        {showPicker && (
          <DateTimePicker
            value={
              pickerType === "start"
                ? startDate || new Date()
                : endDate || new Date()
            }
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
            themeVariant="dark"
            maximumDate={new Date()}
          />
        )}

        {showPicker && Platform.OS === "ios" && (
          <TouchableOpacity
            style={styles.closePickerIOS}
            onPress={() => setShowPicker(false)}
          >
            <Text style={{ color: COLORS.orange, fontWeight: "bold" }}>
              Confirmar Fecha
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.kpiGrid}>
          <View
            style={[
              styles.kpiCard,
              { borderBottomColor: COLORS.orange, borderBottomWidth: 2 },
            ]}
          >
            <Text style={styles.kpiLabel}>Volumen {selectedGroup}</Text>
            <Text style={styles.kpiValue}>
              {groupStats.volumen.toLocaleString()}{" "}
              <Text style={styles.unit}>kg</Text>
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Reps</Text>
            <Text style={styles.kpiValue}>
              {groupStats.reps.toLocaleString()}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {MUSCLE_GROUPS.map((group) => (
            <TouchableOpacity
              key={group}
              onPress={() => setSelectedGroup(group)}
              style={[
                styles.filterBtn,
                selectedGroup === group && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedGroup === group && styles.filterTextActive,
                ]}
              >
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 1. LINE CHART */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Evolución: {selectedGroup}</Text>
          {hasLineData ? (
            <LineChart
              data={evolutionData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              fromZero
              onDataPointClick={(data) => {
                const dataPoints = [...filteredWorkouts].slice(-6).reverse();
                const workoutDelDia = dataPoints[data.index];
                if (workoutDelDia) {
                  const ejercicios = workoutDelDia.exercises
                    .filter((ex) => ex.muscleGroup === selectedGroup)
                    .map((ex) => `• ${ex.exerciseName}`)
                    .join("\n");
                  Toast.show({
                    type: "success",
                    text1: `Sesión ${evolutionData.labels[data.index]}`,
                    text2: ejercicios || "Sin ejercicios",
                  });
                }
              }}
              withVerticalLines={false}
            />
          ) : (
            <EmptyState
              message={`No hay datos de evolución para ${selectedGroup}`}
            />
          )}
        </View>

        {/* 2. PIE CHART: VOLUMEN */}
        <View style={[styles.chartCard, { marginTop: 20 }]}>
          <Text style={styles.chartTitle}>Volumen por Grupo</Text>
          {volumePieData.length > 0 ? (
            <>
              <View style={{ alignItems: "center" }}>
                <PieChart
                  data={volumePieData}
                  width={width}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft={(width / 4).toString()}
                  hasLegend={false}
                />
              </View>
              <View style={styles.customLegend}>
                {volumePieData.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.legendItem, { borderColor: item.color }]}
                    onPress={() =>
                      Toast.show({
                        type: "success",
                        text1: item.name,
                        text2: `Total: ${item.population.toLocaleString()} kg`,
                      })
                    }
                  >
                    <View
                      style={[styles.dot, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.legendText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <EmptyState message="No hay datos de volumen disponibles" />
          )}
        </View>

        {/* 3. PIE CHART: REPS */}
        <View style={[styles.chartCard, { marginTop: 20 }]}>
          <Text style={styles.chartTitle}>Repeticiones por Grupo</Text>
          {repsPieData.length > 0 ? (
            <>
              <View style={{ alignItems: "center" }}>
                <PieChart
                  data={repsPieData}
                  width={width}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft={(width / 4).toString()}
                  hasLegend={false}
                />
              </View>
              <View style={styles.customLegend}>
                {repsPieData.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.legendItem, { borderColor: item.color }]}
                    onPress={() =>
                      Toast.show({
                        type: "success",
                        text1: item.name,
                        text2: `Total: ${item.population.toLocaleString()} reps`,
                      })
                    }
                  >
                    <View
                      style={[styles.dot, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.legendText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <EmptyState message="No hay datos de repeticiones disponibles" />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#1a1a1a",
  backgroundGradientTo: "#1a1a1a",
  color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 3,
  decimalPlaces: 0,
  propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.orange },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 20,
  },
  header: { marginVertical: 20 },
  title: { fontSize: 26, fontFamily: FONTS.secondaryBold, color: "#fff" },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 5 },
  userNameOrange: { color: COLORS.orange, fontWeight: "bold" },
  dateFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 25,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  dateText: { color: "#fff", fontSize: 12 },
  closePickerIOS: { alignSelf: "center", marginBottom: 15 },
  kpiGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  kpiLabel: {
    color: "#888",
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  kpiValue: { color: "#fff", fontSize: 18, fontFamily: FONTS.secondaryBold },
  unit: { fontSize: 10, color: "#666" },
  filterScroll: { marginBottom: 20 },
  filterBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  filterBtnActive: {
    borderColor: COLORS.orange,
    backgroundColor: "rgba(255, 165, 0, 0.1)",
  },
  filterText: { color: "#888", fontSize: 12 },
  filterTextActive: { color: COLORS.orange, fontWeight: "bold" },
  chartCard: {
    backgroundColor: "#141414",
    padding: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  chartTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 15,
    fontFamily: FONTS.secondaryBold,
    textAlign: "center",
  },
  emptyContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  customLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 15,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
