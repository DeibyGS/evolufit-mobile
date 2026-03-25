import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { COLORS } from "../../constants/theme";

/**
 * Layout de la navegación por pestañas (zona autenticada).
 *
 * Expo Router crea automáticamente una tab por cada archivo dentro de
 * la carpeta `(tabs)/`. Las pantallas registradas con `href: null` siguen
 * siendo rutas válidas pero no aparecen en la barra de navegación.
 * Esto permite navegar a ellas desde otras pantallas (ej: desde el
 * dashboard al leaderboard) sin saturar el tab bar.
 *
 * Diferencia de altura entre plataformas:
 * - iOS tiene una safe area inferior (home bar) que requiere más
 *   paddingBottom para que los iconos no queden tapados.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#222",
          // iOS necesita más espacio por la home bar del notch
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: "#666",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        // Estilo común para los headers cuando se activan en pantallas hijas
        headerStyle: {
          backgroundColor: "#000",
          borderBottomWidth: 1,
          borderBottomColor: "#222",
        },
        headerTintColor: COLORS.orange,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
      }}
    >
      {/* ── PESTAÑAS VISIBLES EN EL TAB BAR ── */}

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Entrenar",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "fitness" : "fitness-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analítica",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Logros",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="socialRoutines"
        options={{
          title: "Comunidad",
          headerShown: false,
          headerTitle: "Comunidad EvolutFit 🌎",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/*
        ── PANTALLAS INTERNAS (sin pestaña visible) ──
        `href: null` registra la ruta en el router pero la excluye del
        tab bar. Se navega a ellas con router.push() desde otras pantallas.
      */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null,
          title: "Hall of Fame 🏆",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="rmCalculator"
        options={{
          href: null,
          title: "Calculadora 1RM 🔥",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          href: null,
          title: "Salud & Fitness 📊",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: "Ajustes de Perfil 👤",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: "Notificaciones 🔔",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
