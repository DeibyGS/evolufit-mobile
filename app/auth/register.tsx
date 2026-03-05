import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { COLORS, FONTS } from "../../constants/theme";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/Hero.png")}
          style={styles.background}
          imageStyle={{ opacity: 0.15 }} // Bajamos un poco la opacidad como en el Login
        >
          {/* BOTÓN VOLVER */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.orange} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* FORMULARIO DE REGISTRO */}
            <RegisterForm />

            {/* BRANDING FINAL (Al final del scroll) */}
            <View style={styles.footerBranding}>
              <Text style={styles.footerLogoText}>
                Evolut<Text style={{ color: COLORS.orange }}>Fit</Text>
              </Text>
              <Image
                source={require("../../assets/images/diagrama.png")}
                style={styles.footerLogoImg}
                resizeMode="contain"
              />
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 55,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.3)",
  },
  // ESTILOS DEL BRANDING INFERIOR
  footerBranding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40, // Espacio después del formulario
    gap: 10,
    opacity: 0.5,
  },
  footerLogoText: {
    fontFamily: FONTS.secondaryBold,
    fontSize: 20,
    color: "#fff",
  },
  footerLogoImg: {
    height: 25,
    width: 25,
  },
});
