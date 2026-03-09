import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { COLORS } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#222",
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
        // Estilo común para los headers cuando se activan
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

      {/* RAMPAS DE NAVEGACIÓN OCULTAS EN EL TAB BAR */}
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
    </Tabs>
  );
}
