import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { Button } from "../ui/Button";
import { PerformanceStats } from "./PerformanceStats";

const { width } = Dimensions.get("window");

export const Hero = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const handleGoToLogin = () => {
    setMenuVisible(false); // Cerrar el modal del menú
    router.push("/auth/login"); // 3. Navegar a la pantalla
  };
  return (
    <View style={styles.heroContainer}>
      <ImageBackground
        source={require("../../assets/images/Hero2.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.mainContent}>
          <Text style={styles.title}>
            Transforma tu <Text style={styles.highlight}>Cuerpo</Text>,{"\n"}
            Evoluciona tu <Text style={styles.highlight}>Vida</Text>
          </Text>

          <Text style={styles.description}>
            Únete a EvolutFit hoy y comienza un viaje diseñado a la medida de
            tus objetivos. Herramientas inteligentes para resultados duraderos.
          </Text>

          <View style={styles.buttonWrapper}>
            <Button title="Empezar Ahora" onPress={handleGoToLogin} />
          </View>
        </View>

        {/* AJUSTE AQUÍ: Eliminamos el posicionamiento absoluto que da problemas */}
        <View style={styles.statsWrapper}>
          <PerformanceStats />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: 650, // Aumentamos un poco la altura para que quepa todo sin apretar
    width: "100%",
  },
  backgroundImage: {
    flex: 1,
    // Usamos padding en lugar de posicionamiento absoluto para el contenido
    paddingHorizontal: SIZES.paddingMin,
    paddingBottom: 20,
    justifyContent: "space-between", // Empuja el contenido arriba y los stats abajo
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  mainContent: {
    zIndex: 2,
    marginTop: 100, // Bajamos el texto para que no se pegue al Header
  },
  title: {
    color: COLORS.primaryText,
    fontFamily: FONTS.secondaryBold,
    fontSize: width > 400 ? 36 : 32,
    lineHeight: 42,
    marginBottom: 55,
  },
  highlight: {
    color: COLORS.orange,
  },
  description: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
    maxWidth: "95%",
  },
  buttonWrapper: {
    alignSelf: "flex-start",
  },
  statsWrapper: {
    zIndex: 3,
    width: "100%",
    marginTop: 20, // Espacio entre el botón y los stats
  },
});
