import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { CountUp } from "../ui/CountUp";

export const PerformanceStats = () => {
  return (
    <View style={styles.container}>
      <StatCard value={12} suffix="+" label="Años" />
      <StatCard value={10} suffix="+" label="Coachs" />
      <StatCard value={786} suffix="+" label="Miembros" />
      <StatCard value={95} suffix="%" label="Éxito" />
    </View>
  );
};

const StatCard = ({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.numberRow}>
        <CountUp end={value} style={styles.valueText} />
        <Text style={styles.suffixText}>{suffix}</Text>
      </View>
      <Text style={styles.labelText}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Fuerza a que se peguen a los bordes
    width: "100%",
    // Eliminamos paddingVertical para que no choque con el Hero
  },
  card: {
    // Usamos 48% para que entren dos y quede un 4% de aire en medio
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: SIZES.radiusButton,
    paddingVertical: 15,
    marginBottom: 10, // Espacio entre la fila de arriba y la de abajo
    alignItems: "center",
    justifyContent: "center",
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  valueText: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 22,
    lineHeight: 26,
  },
  suffixText: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 16,
    marginLeft: 2,
  },
  labelText: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 9,
    marginTop: 2,
    textAlign: "center",
  },
});
