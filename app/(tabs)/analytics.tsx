import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import api from "../../api/API";
import { COLORS, FONTS } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/workouts/my-workouts");
        setWorkouts(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const stats = useMemo(() => {
    let vol = 0;
    workouts.forEach((w) =>
      w.exercises.forEach((ex) =>
        ex.sets.forEach((s) => (vol += s.reps * s.weight)),
      ),
    );
    return { vol, count: workouts.length };
  }, [workouts]);

  const chartData = useMemo(() => {
    const last = workouts.slice(-6).reverse();
    if (last.length === 0) return null;
    return {
      labels: last.map((w) =>
        new Date(w.createdAt).toLocaleDateString("es", {
          day: "2-digit",
          month: "short",
        }),
      ),
      datasets: [
        {
          data: last.map((w) => {
            let v = 0;
            w.exercises.forEach((ex) =>
              ex.sets.forEach((s) => (v += s.reps * s.weight)),
            );
            return v;
          }),
        },
      ],
    };
  }, [workouts]);

  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1, backgroundColor: COLORS.primaryBg }}
        color={COLORS.orange}
      />
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>
        Análisis de <Text style={{ color: COLORS.orange }}>Progreso</Text>
      </Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>VOLUMEN TOTAL</Text>
          <Text style={styles.kpiValue}>{stats.vol.toLocaleString()} kg</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>SESIONES</Text>
          <Text style={styles.kpiValue}>{stats.count}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Evolución de Carga</Text>
      {chartData && (
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#1a1a1a",
  backgroundGradientTo: "#1a1a1a",
  color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBg, padding: 20 },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontFamily: FONTS.secondaryBold,
    marginBottom: 25,
  },
  kpiRow: { flexDirection: "row", gap: 15, marginBottom: 30 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  kpiLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 5 },
  kpiValue: { color: "#fff", fontSize: 22, fontFamily: FONTS.secondaryBold },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
    fontFamily: FONTS.secondaryBold,
  },
  chart: { borderRadius: 16 },
});
