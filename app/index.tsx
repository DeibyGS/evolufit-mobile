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

/**
 * Pantalla de inicio / landing page de la aplicación.
 *
 * Es la primera ruta que carga Expo Router (`/`). Actúa como una
 * página de marketing con secciones scrollables: Hero, Servicios,
 * Precios, Comunidad (reseñas) y Contacto.
 *
 * Patrón de scroll programático:
 * Se usa un ref del ScrollView junto con un mapa de posiciones Y
 * (`sectionsY`) para permitir que el Header navegue a cualquier
 * sección al pulsar su menú, sin dependencias externas de estado.
 *
 * Por qué `useRef` y no `useState` para `sectionsY`:
 * - Las posiciones no necesitan disparar un re-render al actualizarse.
 * - `useRef` evita renders innecesarios al capturar `onLayout`.
 */
export default function Index() {
  const scrollRef = useRef<ScrollView>(null);

  // Mapa { nombreSeccion: posiciónY } poblado por los eventos onLayout
  const sectionsY = useRef<{ [key: string]: number }>({});

  /**
   * Desplaza el ScrollView hasta la sección indicada.
   * Si la sección aún no ha sido medida (onLayout no disparado),
   * scrollea al inicio (y = 0) como valor seguro por defecto.
   *
   * @param sectionName - Clave del mapa sectionsY (ej: "servicios")
   */
  const scrollToSection = (sectionName: string) => {
    const yOffset = sectionsY.current[sectionName] || 0;
    scrollRef.current?.scrollTo({
      y: yOffset,
      animated: true,
    });
  };

  /**
   * Registra la posición Y de una sección al montarse en pantalla.
   * Se pasa como callback a cada `onLayout` de las secciones.
   *
   * @param sectionName - Identificador de la sección
   * @param y           - Posición vertical relativa al ScrollView
   */
  const handleLayout = (sectionName: string, y: number) => {
    sectionsY.current[sectionName] = y;
  };

  return (
    <View style={styles.container}>
      {/* El Header recibe la función de scroll para manejar la navegación interna */}
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
          {/* Cada sección se envuelve en un View para capturar su posición Y con onLayout */}
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
