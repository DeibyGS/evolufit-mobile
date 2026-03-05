import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    {
      title: "Dashboard Analítico",
      icon: "stats-chart",
      route: "/analytics",
      color: "#FFD700",
    },
    {
      title: "Hall of Fame",
      icon: "trophy",
      route: "/dashboard/leaderboard",
      color: "#FFD700",
    },
    {
      title: "Mis Logros",
      icon: "ribbon",
      route: "/dashboard/achievements",
      color: "#4CAF50",
    },
    {
      title: "Máximos (1RM)",
      icon: "flame",
      route: "/dashboard/rm-calculator",
      color: COLORS.orange,
    },
    {
      title: "Calculadora",
      icon: "calculator",
      route: "/dashboard/calculator",
      color: "#2196F3",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* SECCIÓN BIENVENIDA */}
      <View style={styles.welcomeSection}>
        <Text style={styles.hi}>Bienvenido,</Text>
        <Text style={styles.userName}>
          {user?.name} {user?.lastname}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Herramientas de Evolución</Text>

      {/* GRID DE OPCIONES */}
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color + "15" },
              ]}
            >
              <Ionicons name={item.icon as any} size={30} color={item.color} />
            </View>
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PROXIMO ENTRENAMIENTO */}
      <View style={styles.nextWorkoutCard}>
        <View style={styles.nextWorkoutInfo}>
          <Text style={styles.nextLabel}>PRÓXIMO RETO</Text>
          <Text style={styles.nextText}>Pecho y Tríceps</Text>
        </View>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push("/routines")}
        >
          <Text style={styles.startBtnText}>EMPEZAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
    marginTop: 20,
  },
  hi: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: FONTS.primary,
    fontSize: 16,
  },
  userName: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 28,
    textTransform: "capitalize",
  },
  sectionTitle: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 18,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#1a1a1a",
    width: (width - 55) / 2,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconContainer: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  cardText: {
    color: "#fff",
    fontFamily: FONTS.primary,
    fontSize: 13,
    textAlign: "center",
  },
  nextWorkoutCard: {
    backgroundColor: COLORS.orange,
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 60, // Espacio extra para que no lo tape la barra de abajo
  },
  nextWorkoutInfo: {
    flex: 1,
  },
  nextLabel: {
    fontSize: 10,
    fontFamily: FONTS.secondaryBold,
    color: "rgba(0,0,0,0.5)",
  },
  nextText: {
    color: "#000",
    fontFamily: FONTS.secondaryBold,
    fontSize: 16,
  },
  startBtn: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: FONTS.secondaryBold,
  },
});
