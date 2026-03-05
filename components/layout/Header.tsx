import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// ✅ Importamos solo el hook, eliminamos el componente SafeAreaView
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS, SIZES } from "../../constants/theme";
import { Button } from "../ui/Button";

interface HeaderProps {
  onNavigate?: (section: string) => void;
}

export const Header = ({ onNavigate }: HeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Obtenemos los márgenes del notch y bottom bar
  const [menuVisible, setMenuVisible] = useState(false);

  const handlePress = (section: string) => {
    setMenuVisible(false);
    if (onNavigate) {
      setTimeout(() => onNavigate(section), 300);
    }
  };

  const handleGoToLogin = () => {
    setMenuVisible(false);
    router.push("/auth/login");
  };

  return (
    // Header principal con margen dinámico para el Notch
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <Text style={styles.logoText}>
            Evolut<Text style={{ color: COLORS.orange }}>Fit</Text>
          </Text>
          <Image
            source={require("../../assets/images/diagrama.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMenuVisible(true)}
        >
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hamburgerButton, SHADOWS.orange]}
          >
            <View style={styles.hamburgerLines}>
              <View style={styles.line} />
              <View style={styles.line} />
              <View style={styles.line} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        {/* Cambiamos SafeAreaView por una View normal con padding dinámico */}
        <View
          style={[
            styles.modalOverlay,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.modalContainer}>
            {/* BOTÓN CERRAR - Ahora usa el margen de seguridad inyectado arriba */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            <View style={styles.mainNavContent}>
              <View style={styles.navLinks}>
                <TouchableOpacity onPress={() => handlePress("inicio")}>
                  <Text style={styles.navItem}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePress("servicios")}>
                  <Text style={styles.navItem}>Servicios</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePress("precios")}>
                  <Text style={styles.navItem}>Precios</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePress("comunidad")}>
                  <Text style={styles.navItem}>Comunidad</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePress("contacto")}>
                  <Text style={styles.navItem}>Contacto</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footerBtn}>
                <Button title="Empezar Ahora" onPress={handleGoToLogin} />
              </View>
            </View>

            {/* BRANDING FINAL */}
            <View style={styles.modalFooterBranding}>
              <Text style={styles.footerLogoText}>
                Evolut<Text style={{ color: COLORS.orange }}>Fit</Text>
              </Text>
              <Image
                source={require("../../assets/images/diagrama.png")}
                style={styles.footerLogoImg}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.paddingMin,
    height: 70,
  },
  brandContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: {
    fontFamily: FONTS.secondaryBold,
    fontSize: 24,
    color: "#fff",
    letterSpacing: 1,
  },
  logoImg: { height: 30, width: 30 },
  hamburgerButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerLines: { width: 20, height: 14, justifyContent: "space-between" },
  line: { width: "100%", height: 2, backgroundColor: "#000", borderRadius: 2 },

  // ESTILOS MODAL MEJORADOS
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginRight: 10,
    padding: 10,
  },
  closeIcon: {
    color: COLORS.orange,
    fontSize: 35,
    fontFamily: FONTS.secondaryBold,
  },
  mainNavContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navLinks: { gap: 25, alignItems: "center", marginBottom: 40 },
  navItem: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 26,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  footerBtn: { width: "80%" },

  modalFooterBranding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20, // Ajustado para verse bien con el insets.bottom
    gap: 10,
    opacity: 0.6,
  },
  footerLogoText: {
    fontFamily: FONTS.secondaryBold,
    fontSize: 20,
    color: "#fff",
  },
  footerLogoImg: { height: 25, width: 25 },
});
