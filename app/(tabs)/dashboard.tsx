import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { COLORS, FONTS } from "../../constants/theme";
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // ESTADO PARA EL MODAL DE CONFIRMACIÓN (Consistente con Profile)
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const menuItems = [
    {
      title: "Dashboard Analítico",
      icon: "stats-chart",
      route: "/analytics",
      color: "#FFD700",
    },
    {
      title: "Mis Rutinas",
      icon: "fitness",
      route: "/routines",
      color: COLORS.orange,
    },
    {
      title: "Hall of Fame",
      icon: "trophy",
      route: "/leaderboard",
      color: "#FFD700",
    },
    {
      title: "Mis Logros",
      icon: "ribbon",
      route: "/achievements",
      color: "#4CAF50",
    },
    {
      title: "Máximos (1RM)",
      icon: "flame",
      route: "/rmCalculator",
      color: COLORS.orange,
    },
    {
      title: "Calculadora",
      icon: "calculator",
      route: "/calculator",
      color: "#2196F3",
    },
    {
      title: "Comunidad",
      icon: "people",
      route: "/socialRoutines",
      color: "#9C27B0",
    },
    { title: "Mi Perfil", icon: "person", route: "/profile", color: "#4CAF50" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryBg }}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
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
                <Ionicons
                  name={item.icon as any}
                  size={30}
                  color={item.color}
                />
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

        {/* BOTÓN CERRAR SESIÓN (Mejorado) */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MODAL DE CONFIRMACIÓN (Idéntico al de Profile para consistencia) */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <Ionicons
                name="log-out-outline"
                size={30}
                color={COLORS.orange}
              />
            </View>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres salir? Tu progreso se queda guardado.
              💪
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Me quedo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setShowLogoutModal(false);
                  logout();
                  router.replace("/auth/login");
                  Toast.show({
                    type: "success",
                    text1: "Sesión cerrada",
                    text2: "¡Vuelve pronto!",
                  });
                }}
              >
                <Text style={styles.modalConfirmText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  welcomeSection: { marginBottom: 30, marginTop: 20 },
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
  iconContainer: { padding: 15, borderRadius: 15, marginBottom: 12 },
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
    marginBottom: 20,
  },
  nextWorkoutInfo: { flex: 1 },
  nextLabel: {
    fontSize: 10,
    fontFamily: FONTS.secondaryBold,
    color: "rgba(0,0,0,0.5)",
  },
  nextText: { color: "#000", fontFamily: FONTS.secondaryBold, fontSize: 16 },
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
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 10,
    backgroundColor: "rgba(255, 68, 68, 0.05)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.1)",
  },
  logoutText: {
    color: "#ff4444",
    fontFamily: FONTS.secondaryBold,
    marginLeft: 10,
    fontSize: 15,
  },

  // ESTILOS DEL MODAL (Consistencia total)
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
    borderWidth: 1,
    borderColor: "#222",
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,165,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
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
    lineHeight: 20,
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
