import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";

const { width } = Dimensions.get("window");

export const ServiceSection = () => {
  return (
    <View style={styles.container}>
      {/* HEADER DE LA SECCIÓN */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>
          Por Qué <Text style={styles.highlight}>Elegirnos</Text>
        </Text>
        <Text style={styles.mainDescription}>
          Combinamos tecnología de vanguardia con metodologías probadas para que
          cada gota de sudor cuente.
        </Text>
      </View>

      {/* LISTA DE SERVICIOS (EQUIVALENTE AL GRID) */}
      <View style={styles.gridItems}>
        <ServiceItem
          image={require("../../assets/images/Group21.png")}
          title="Entrenamiento Personalizado"
          description="Diseña y sigue rutinas adaptadas a tus metas. Desde fuerza pura hasta resistencia."
        />
        <ServiceItem
          image={require("../../assets/images/Group22.png")}
          title="Sobrecarga Progresiva"
          description="Registra cada levantamiento y analiza tu evolución con métricas precisas."
        />
        <ServiceItem
          image={require("../../assets/images/Group23.png")}
          title="Historial de Logros"
          description="Tu progreso no se pierde. Mantén un diario detallado de cada victoria en tu camino."
        />
        <ServiceItem
          image={require("../../assets/images/Group24.png")}
          title="Reportes Visuales"
          description="Toma decisiones inteligentes basadas en datos reales. Gráficos de rendimiento."
        />
      </View>
    </View>
  );
};

// Sub-componente para la tarjeta de servicio
const ServiceItem = ({
  image,
  title,
  description,
}: {
  image: any;
  title: string;
  description: string;
}) => (
  <View style={styles.serviceItem}>
    <View style={styles.iconBox}>
      <Image source={image} style={styles.icon} resizeMode="contain" />
    </View>
    <Text style={styles.itemTitle}>{title}</Text>
    <Text style={styles.itemDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: "#0a0a0a",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  mainTitle: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 28,
    textAlign: "center",
  },
  highlight: {
    color: COLORS.orange,
  },
  mainDescription: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    maxWidth: "90%",
  },
  gridItems: {
    gap: 20, // Espacio vertical entre tarjetas
  },
  serviceItem: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: SIZES.radiusButton,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  iconBox: {
    width: 70,
    height: 70,
    backgroundColor: "rgba(255, 165, 0, 0.05)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.1)",
  },
  icon: {
    height: 35,
    width: 35,
  },
  itemTitle: {
    color: COLORS.orange, // Aplicamos el color de marca directamente
    fontFamily: FONTS.secondaryBold,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  itemDescription: {
    color: "#999",
    fontFamily: FONTS.primary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
