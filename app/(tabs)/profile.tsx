import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Estado offline controlado exclusivamente por la suscripción de NetInfo de abajo
  const [isOffline, setIsOffline] = useState(false);

  // ESTADOS DEL FORMULARIO
  const [showPassForm, setShowPassForm] = useState(false);
  const [passData, setPassData] = useState({
    oldPassword: "",
    password: "",
    confirmPass: "",
  });

  // ESTADOS DE VALIDACIÓN
  const [errors, setErrors] = useState<any>({});
  const [emptyState, setEmptyState] = useState(false);

  /**
   * Un solo estado configurable para manejar los dos modales de confirmación
   * (cerrar sesión y eliminar cuenta). Evita duplicar estados y lógica de modal.
   * El campo `isDanger` controla el color del botón de confirmación (rojo vs naranja).
   * El campo `onConfirm` permite inyectar la acción específica de cada modal.
   */
  // ESTADO MODAL
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
  });

  /**
   * Suscripción a cambios de conectividad (patrón simplificado).
   * Esta pantalla no hace fetch al montar — los datos del usuario vienen de Zustand,
   * que ya actúa como caché en memoria. Por eso no necesita isFirstNetInfoEmit
   * ni lógica de recarga al reconectar.
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        setIsOffline(true);
      } else if (state.isConnected === true) {
        setIsOffline(false);
      }
    });

    // Al desmontar el componente, eliminamos el listener para evitar fugas de memoria
    return () => unsubscribe();
  }, []);

  /**
   * Gestiona el flujo de cambio de contraseña con validación en dos capas:
   * 1. Validación frontend: campos vacíos y coincidencia de contraseñas (sin petición al servidor)
   * 2. Validación backend: errores Zod devueltos como array de {path, message}
   *    que se mapean a campos específicos del formulario para mostrarlos inline.
   */
  // --- LÓGICA: CAMBIAR CONTRASEÑA ---
  const handleChangePassword = async () => {
    // 1. Limpieza inicial
    setErrors({});
    setEmptyState(false);

    const { oldPassword, password, confirmPass } = passData;

    // 2. Validación de campos vacíos (Frontend)
    const isAnyFieldEmpty = !oldPassword || !password || !confirmPass;
    if (isAnyFieldEmpty) {
      setEmptyState(true);
      return Toast.show({
        type: "error",
        text1: "Campos incompletos",
        text2: "Por favor, completa todos los campos 📋",
      });
    }

    // 3. Validación de coincidencia (Frontend)
    if (password !== confirmPass) {
      setErrors({ confirmPass: "Las contraseñas no coinciden" });
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: "Las contraseñas nuevas no coinciden.",
      });
    }

    try {
      // Petición al backend usando el router de AUTH que configuramos
      const response = await api.patch("/auth/change-password", {
        oldPassword,
        password,
      });

      Toast.show({
        type: "success",
        text1: "¡Éxito! 🔐",
        text2: response.data.message || "Contraseña actualizada correctamente.",
      });

      setShowPassForm(false);
      setPassData({ oldPassword: "", password: "", confirmPass: "" });
    } catch (error: any) {
      const data = error.response?.data;

      // 4. Captura de errores de Zod (Backend)
      if (data?.errors && Array.isArray(data.errors)) {
        const apiErrors: any = {};
        data.errors.forEach((err: any) => {
          const fieldName = Array.isArray(err.path) ? err.path[0] : err.path;
          apiErrors[fieldName] = err.message;
        });
        setErrors(apiErrors);
        return Toast.show({
          type: "error",
          text1: "Error de validación",
          text2: "Revisa los campos en rojo",
        });
      }

      // 5. Errores de negocio (Contraseña incorrecta, etc.)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: data?.message || "No se pudo actualizar la contraseña.",
      });
    }
  };

  // --- LÓGICA: ELIMINAR CUENTA ---
  const handleDeleteAccount = () => {
    setModalConfig({
      visible: true,
      title: "⚠️ ¿Eliminar cuenta?",
      message:
        "Esta acción es irreversible y perderás todo tu progreso. ¿Realmente quieres continuar?",
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/users/${user?._id}`);
          logout();
          router.replace("/auth/login");
          Toast.show({
            type: "success",
            text1: "Cuenta eliminada",
            text2: "Esperamos verte de nuevo pronto.",
          });
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se pudo completar la acción.",
          });
        }
      },
    });
  };

  // --- LÓGICA: CERRAR SESIÓN ---
  const handleLogout = () => {
    setModalConfig({
      visible: true,
      title: "Cerrar Sesión",
      message:
        "¿Estás seguro de que quieres salir? Tu progreso se queda bien guardado. 💪",
      isDanger: false,
      onConfirm: () => {
        logout();
        router.replace("/auth/login");
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* BANNER OFFLINE — visible cuando no hay conexión a internet */}
      <OfflineBanner visible={isOffline} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Mi <Text style={{ color: COLORS.orange }}>Perfil</Text>
          </Text>
          <Text style={styles.subtitle}>Gestiona tu cuenta y seguridad</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.orange} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="person-circle-outline"
              size={20}
              color={COLORS.orange}
            />
            <Text style={styles.cardTitle}>Datos Personales</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Nombre Completo</Text>
            <Text style={styles.value}>
              {user?.name} {user?.lastname}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Edad</Text>
            <Text style={styles.value}>{user?.age} años</Text>
          </View>
        </View>

        {/* SECCIÓN 2: SEGURIDAD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.orange}
            />
            <Text style={styles.cardTitle}>Seguridad</Text>
          </View>

          {!showPassForm ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowPassForm(true)}
            >
              <Text style={styles.primaryBtnText}>Cambiar Contraseña</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.form}>
              {/* INPUT: ACTUAL */}
              <View>
                <TextInput
                  style={[
                    styles.input,
                    emptyState && !passData.oldPassword && styles.inputEmpty,
                    errors.oldPassword && styles.inputError,
                  ]}
                  placeholder="Contraseña Actual"
                  placeholderTextColor="#444"
                  secureTextEntry
                  value={passData.oldPassword}
                  onChangeText={(v) => {
                    setPassData({ ...passData, oldPassword: v });
                    if (errors.oldPassword)
                      setErrors({ ...errors, oldPassword: null });
                  }}
                />
                {errors.oldPassword && (
                  <Text style={styles.errorText}>{errors.oldPassword}</Text>
                )}
              </View>

              {/* INPUT: NUEVA */}
              <View>
                <TextInput
                  style={[
                    styles.input,
                    emptyState && !passData.password && styles.inputEmpty,
                    errors.password && styles.inputError,
                  ]}
                  placeholder="Nueva Contraseña"
                  placeholderTextColor="#444"
                  secureTextEntry
                  value={passData.password}
                  onChangeText={(v) => {
                    setPassData({ ...passData, password: v });
                    if (errors.password)
                      setErrors({ ...errors, password: null });
                  }}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* INPUT: CONFIRMAR */}
              <View>
                <TextInput
                  style={[
                    styles.input,
                    emptyState && !passData.confirmPass && styles.inputEmpty,
                    errors.confirmPass && styles.inputError,
                  ]}
                  placeholder="Confirmar Nueva Contraseña"
                  placeholderTextColor="#444"
                  secureTextEntry
                  value={passData.confirmPass}
                  onChangeText={(v) => {
                    setPassData({ ...passData, confirmPass: v });
                    if (errors.confirmPass)
                      setErrors({ ...errors, confirmPass: null });
                  }}
                />
                {errors.confirmPass && (
                  <Text style={styles.errorText}>{errors.confirmPass}</Text>
                )}
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.saveBtnText}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowPassForm(false);
                    setErrors({});
                    setEmptyState(false);
                  }}
                >
                  <Text style={{ color: "#666", fontFamily: FONTS.primary }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Zona de Peligro</Text>
            <Text style={styles.dangerText}>
              Eliminar tu cuenta borrará todos tus récords y rutinas
              permanentemente.
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteBtnText}>Eliminar Cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECCIÓN 3: NOTIFICACIONES */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/notifications")}
          activeOpacity={0.75}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={COLORS.orange}
            />
            <Text style={styles.cardTitle}>Notificaciones</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#555"
              style={{ marginLeft: "auto" }}
            />
          </View>
          <Text style={styles.label}>
            Configura recordatorios y alertas de entrenamiento
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal visible={modalConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalIconCircle,
                {
                  backgroundColor: modalConfig.isDanger
                    ? "rgba(255,77,77,0.1)"
                    : "rgba(255,165,0,0.1)",
                },
              ]}
            >
              <Ionicons
                name={
                  modalConfig.isDanger ? "warning-outline" : "log-out-outline"
                }
                size={30}
                color={modalConfig.isDanger ? "#ff4d4d" : COLORS.orange}
              />
            </View>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalText}>{modalConfig.message}</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() =>
                  setModalConfig({ ...modalConfig, visible: false })
                }
              >
                <Text style={styles.modalCancelText}>Me quedo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  {
                    backgroundColor: modalConfig.isDanger
                      ? "#ff4d4d"
                      : COLORS.orange,
                  },
                ]}
                onPress={() => {
                  setModalConfig({ ...modalConfig, visible: false });
                  modalConfig.onConfirm();
                }}
              >
                <Text
                  style={[
                    styles.modalConfirmText,
                    { color: modalConfig.isDanger ? "#fff" : "#000" },
                  ]}
                >
                  Confirmar
                </Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  title: { fontSize: 24, fontFamily: FONTS.secondaryBold, color: "#fff" },
  subtitle: { color: "#666", fontSize: 13, fontFamily: FONTS.primary },
  logoutBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  card: {
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingBottom: 10,
  },
  cardTitle: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 14,
    textTransform: "uppercase",
  },
  infoItem: { marginBottom: 15 },
  label: {
    color: "#444",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: FONTS.primary,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: FONTS.primary,
  },
  primaryBtn: {
    backgroundColor: COLORS.orange,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontFamily: FONTS.secondaryBold,
  },
  form: { gap: 15 },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    fontFamily: FONTS.primary,
    fontSize: 16,
  },
  inputEmpty: { borderColor: COLORS.orange, borderWidth: 1.2 },
  inputError: { borderColor: "#ff4d4d", borderWidth: 1.2 },
  errorText: {
    color: "#ff4d4d",
    fontSize: 11,
    marginTop: 5,
    marginLeft: 5,
    fontFamily: FONTS.primary,
  },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 5 },
  saveBtn: {
    flex: 2,
    backgroundColor: COLORS.orange,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontFamily: FONTS.secondaryBold,
  },
  cancelBtn: { flex: 1, padding: 15, alignItems: "center" },
  dangerZone: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 77, 77, 0.1)",
  },
  dangerTitle: {
    color: "#ff4d4d",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 12,
    textTransform: "uppercase",
    fontFamily: FONTS.secondaryBold,
  },
  dangerText: {
    color: "#666",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 15,
    fontFamily: FONTS.primary,
  },
  deleteBtn: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.3)",
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#ff4d4d",
    fontWeight: "bold",
    fontSize: 12,
    fontFamily: FONTS.secondaryBold,
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
    borderWidth: 1,
    borderColor: "#222",
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    alignItems: "center",
  },
  modalCancelText: {
    color: "#888",
    fontWeight: "bold",
    fontFamily: FONTS.primary,
  },
  modalConfirmText: { fontWeight: "bold", fontFamily: FONTS.secondaryBold },
});
