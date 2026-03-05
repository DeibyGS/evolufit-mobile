import React, { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { ContactSection } from "../components/sections/ContactSection";
import { Hero } from "../components/sections/Hero";
import { Pricing } from "../components/sections/Pricing";
import { ReviewsSection } from "../components/sections/ReviewsSection";
import { ServiceSection } from "../components/sections/ServiceSection";
import { COLORS } from "../constants/theme";

export default function Index() {
  const scrollRef = useRef<ScrollView>(null);

  // Guardaremos las posiciones Y de cada sección
  const sectionsY = useRef<{ [key: string]: number }>({});

  const scrollToSection = (sectionName: string) => {
    const yOffset = sectionsY.current[sectionName] || 0;
    scrollRef.current?.scrollTo({
      y: yOffset,
      animated: true,
    });
  };

  const handleLayout = (sectionName: string, y: number) => {
    sectionsY.current[sectionName] = y;
  };

  return (
    <View style={styles.container}>
      {/* Pasamos la función de scroll al Header */}
      <Header onNavigate={scrollToSection} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Usamos onLayout para capturar la posición de cada sección */}
          <View
            onLayout={(e) => handleLayout("inicio", e.nativeEvent.layout.y)}
          >
            <Hero />
          </View>

          <View
            onLayout={(e) => handleLayout("servicios", e.nativeEvent.layout.y)}
          >
            <ServiceSection />
          </View>

          <View
            onLayout={(e) => handleLayout("precios", e.nativeEvent.layout.y)}
          >
            <Pricing />
          </View>

          <View
            onLayout={(e) => handleLayout("comunidad", e.nativeEvent.layout.y)}
          >
            <ReviewsSection />
          </View>

          <View
            onLayout={(e) => handleLayout("contacto", e.nativeEvent.layout.y)}
          >
            <ContactSection />
          </View>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBg },
  scrollContainer: { flexGrow: 1, gap: 40 },
});
