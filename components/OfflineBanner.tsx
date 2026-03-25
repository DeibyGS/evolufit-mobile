import { StyleSheet, Text, View } from "react-native";

/** Props del componente OfflineBanner */
interface OfflineBannerProps {
  /** Controla si el banner es visible. Lo gestiona el componente padre mediante NetInfo. */
  visible: boolean;
}

/**
 * Banner inline que aparece en la parte superior de una pantalla cuando
 * el dispositivo no tiene conexión a internet.
 *
 * No gestiona su propia visibilidad — el componente padre es responsable
 * de detectar el estado de red (via NetInfo) y pasar el prop `visible`.
 *
 * Renderiza `null` cuando no está visible para no ocupar espacio en el layout.
 */
export default function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📵 Sin conexión — mostrando datos guardados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#2a2a2a",
    borderLeftWidth: 3,
    borderLeftColor: "#FFA500",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
  },
  text: {
    color: "#FFA500",
    fontSize: 12,
    fontWeight: "600",
  },
});
