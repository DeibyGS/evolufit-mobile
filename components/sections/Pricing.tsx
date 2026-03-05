import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { PRICING_DATA, PricingPlan } from "../../data/pricingData";
import { Button } from "../ui/Button";

/**
 * SECCIÓN DE PRECIOS
 * Mapea los datos externos para renderizar las opciones de suscripción.
 */
export const Pricing = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Elige tu <Text style={{ color: COLORS.orange }}>Nivel</Text>
        </Text>
        <Text style={styles.subtitle}>
          Desbloquea tu máximo potencial con nuestros planes de entrenamiento
          profesional.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {PRICING_DATA.map((plan: PricingPlan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </View>
    </View>
  );
};

/**
 * COMPONENTE TARJETA DE PLAN
 */
const PlanCard = ({ plan }: { plan: PricingPlan }) => {
  return (
    <View style={[styles.card, plan.isPopular && styles.recommendedCard]}>
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
        </View>
      )}

      <Text style={styles.cardTitle}>{plan.title}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.currency}>€</Text>
        <Text style={styles.priceText}>{plan.price}</Text>
        <Text style={styles.duration}>/mes</Text>
      </View>

      <Text style={styles.descriptionText}>{plan.description}</Text>

      <View style={styles.featuresList}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={`Empezar ${plan.title}`}
          onPress={() => console.log(`Seleccionado: ${plan.title}`)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 28,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 35, // Espacio vertical entre cada plan
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: SIZES.radiusButton,
    padding: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    position: "relative",
    height: 500,
  },
  recommendedCard: {
    borderColor: COLORS.orange,
    backgroundColor: "rgba(255, 165, 0, 0.06)",
    borderWidth: 2,
    // Un ligero sombreado naranja para que "brille"
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularBadgeText: {
    color: "#000",
    fontFamily: FONTS.secondaryBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  cardTitle: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 20,
  },
  currency: {
    color: COLORS.orange,
    fontFamily: FONTS.secondaryBold,
    fontSize: 20,
    marginRight: 4,
  },
  priceText: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 48,
  },
  duration: {
    color: COLORS.tertiaryText,
    fontFamily: FONTS.primary,
    fontSize: 14,
    marginLeft: 4,
  },
  descriptionText: {
    color: "#999",
    fontFamily: FONTS.primary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  featuresList: {
    gap: 12,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    color: COLORS.orange,
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  featureText: {
    color: "#ccc",
    fontFamily: FONTS.primary,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: "auto",
  },
});
