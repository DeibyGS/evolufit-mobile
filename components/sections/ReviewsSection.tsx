import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { REVIEWS_DATA, Review } from "../../data/reviewsData";

const { width } = Dimensions.get("window");

// CONFIGURACIÓN DE MEDIDAS
const CARD_WIDTH = width * 0.8;
const GAP = 20;
// Espacio lateral para que la card quede centrada (Mitad del espacio sobrante)
const SIDE_SPACER = (width - CARD_WIDTH) / 2;
const INTERVAL_TIME = 4000;

export const ReviewsSection = () => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // EFECTO DE AUTOPLAY
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;

      if (nextIndex >= REVIEWS_DATA.length) {
        nextIndex = 0;
      }

      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, INTERVAL_TIME);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Lo que nuestra <Text style={{ color: COLORS.orange }}>Comunidad</Text>{" "}
          dice
        </Text>
        <Text style={styles.subtitle}>
          Resultados reales de miembros de la familia EvolutFit.
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={REVIEWS_DATA}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        // --- LÓGICA DE CENTRADO ---
        snapToInterval={CARD_WIDTH + GAP}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: SIDE_SPACER, // Relleno inicial y final
        }}
        // --- GESTIÓN DE ÍNDICE ---
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / (CARD_WIDTH + GAP),
          );
          setCurrentIndex(newIndex);
        }}
        renderItem={({ item }) => <ReviewCard review={item} />}
      />

      {/* INDICADORES (DOTS) */}
      <View style={styles.dotsContainer}>
        {REVIEWS_DATA.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * SUB-COMPONENTE: TARJETA DE RESEÑA
 */
const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <View style={styles.card}>
      <View style={styles.starsContainer}>
        <Text style={styles.starsText}>
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </Text>
      </View>

      <Text style={styles.reviewText} numberOfLines={6}>
        <Text style={styles.quoteMark}>“ </Text>
        {review.content}
        <Text style={styles.quoteMark}> ”</Text>
      </Text>

      <View style={styles.authorInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.authorName}>{review.name}</Text>
          <Text style={styles.authorRole}>{review.role}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
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
  card: {
    width: CARD_WIDTH,
    marginRight: GAP,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: SIZES.radiusButton,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderBottomWidth: 4,
    borderBottomColor: "rgba(255, 165, 0, 0.3)",
    justifyContent: "space-between",
    minHeight: 300,
  },
  starsContainer: {
    marginBottom: 15,
  },
  starsText: {
    color: COLORS.orange,
    fontSize: 18,
    letterSpacing: 2,
  },
  reviewText: {
    color: "#eee",
    fontFamily: FONTS.primary,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
  },
  quoteMark: {
    color: COLORS.orange,
    fontSize: 24,
    fontFamily: FONTS.secondaryBold,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#000",
    fontFamily: FONTS.secondaryBold,
    fontSize: 18,
  },
  authorName: {
    color: "#fff",
    fontFamily: FONTS.secondaryBold,
    fontSize: 16,
  },
  authorRole: {
    color: "#999",
    fontFamily: FONTS.primary,
    fontSize: 12,
    textTransform: "uppercase",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  activeDot: {
    backgroundColor: COLORS.orange,
    width: 20,
  },
});
