/**
 * Tests para el hook useOfflineCache
 *
 * Estrategia:
 * - Mockeamos NetInfo y AsyncStorage para aislar el hook de dependencias nativas.
 * - Usamos `renderHook` de @testing-library/react-native para montar el hook
 *   en un entorno controlado.
 * - `act` asegura que React procesa todos los efectos y actualizaciones de estado
 *   antes de hacer las aserciones.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useOfflineCache } from "../hooks/useOfflineCache";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock de AsyncStorage: usamos el mock oficial de la librería
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock de NetInfo: capturamos el listener para poder dispararlo manualmente
let netInfoListener: ((state: { isConnected: boolean | null }) => void) | null =
  null;

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn((cb) => {
    netInfoListener = cb;
    // Retorna la función de cleanup (unsubscribe)
    return jest.fn();
  }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CACHE_KEY = "test:data";
const MOCK_DATA = { workouts: [{ id: 1, name: "Press banca" }] };

/** Simula un fetch que resuelve con MOCK_DATA */
const successFetch = jest.fn().mockResolvedValue(MOCK_DATA);

/** Simula un error de red (sin `response`, con `message: "Network Error"`) */
const networkErrorFetch = jest.fn().mockRejectedValue({
  message: "Network Error",
  response: undefined,
});

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(async () => {
  jest.clearAllMocks();
  netInfoListener = null;
  // Limpiamos AsyncStorage entre tests para evitar datos residuales
  await AsyncStorage.clear();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useOfflineCache", () => {
  /**
   * Test 1: API OK → guarda en AsyncStorage, isOffline = false
   *
   * Cuando el fetch tiene éxito, el hook debe:
   * - Devolver los datos frescos
   * - Persistirlos en AsyncStorage con el cacheKey dado
   * - Mantener isOffline en false
   */
  it("cuando la API responde OK → guarda en cache y isOffline = false", async () => {
    const { result } = renderHook(() =>
      useOfflineCache(CACHE_KEY, successFetch),
    );

    // Esperamos a que loading pase a false (el fetch terminó)
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Los datos deben coincidir con lo que devolvió el fetch
    expect(result.current.data).toEqual(MOCK_DATA);
    expect(result.current.isOffline).toBe(false);

    // Verificamos que se persistió en AsyncStorage
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    expect(stored).toBe(JSON.stringify(MOCK_DATA));
  });

  /**
   * Test 2: Error de red → carga desde cache, isOffline = true
   *
   * Cuando el fetch falla con un error de red:
   * - El hook debe detectarlo (sin `response`, message === "Network Error")
   * - Debe leer el valor previo de AsyncStorage
   * - Debe devolver esos datos y poner isOffline = true
   */
  it("cuando hay error de red → carga desde cache y isOffline = true", async () => {
    // Pre-cargamos datos en AsyncStorage para simular una sesión anterior
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(MOCK_DATA));

    const { result } = renderHook(() =>
      useOfflineCache(CACHE_KEY, networkErrorFetch),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Debe devolver los datos cacheados
    expect(result.current.data).toEqual(MOCK_DATA);
    // Y marcar el estado como offline
    expect(result.current.isOffline).toBe(true);
  });

  /**
   * Test 3: NetInfo detecta offline ANTES del fetch → isOffline = true inmediatamente
   *
   * El listener de NetInfo se suscribe al montar el hook.
   * La primera emisión se ignora (isFirstNetInfoEmit = true).
   * La segunda emisión con isConnected = false debe poner isOffline = true sin fetch.
   */
  it("cuando NetInfo detecta offline → isOffline = true sin esperar al fetch", async () => {
    // fetch que tarda mucho (no queremos que complete durante este test)
    const slowFetch = jest.fn(() => new Promise(() => {}));

    const { result } = renderHook(() => useOfflineCache(CACHE_KEY, slowFetch));

    // Esperamos a que el listener esté registrado
    await waitFor(() => expect(netInfoListener).not.toBeNull());

    // Primera emisión: la ignora el hook (isFirstNetInfoEmit = true)
    act(() => {
      netInfoListener!({ isConnected: true });
    });

    // Segunda emisión: ahora sí la procesa → isConnected = false
    act(() => {
      netInfoListener!({ isConnected: false });
    });

    // isOffline debe ser true inmediatamente
    expect(result.current.isOffline).toBe(true);
  });

  /**
   * Test 4: NetInfo reconecta → isOffline = false y refetch disparado
   *
   * Cuando la conectividad se restaura (isConnected = true en la segunda emisión),
   * el hook debe:
   * - Poner isOffline = false
   * - Disparar load() de nuevo para refrescar los datos
   */
  it("cuando NetInfo reconecta → isOffline = false y refetch disparado", async () => {
    const { result } = renderHook(() =>
      useOfflineCache(CACHE_KEY, successFetch),
    );

    // Esperamos a que el primer load() complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // El fetch fue llamado 1 vez en el montaje
    expect(successFetch).toHaveBeenCalledTimes(1);

    // Simulamos: primero offline, luego reconexión
    // (primera emisión siempre se ignora, así que necesitamos emitir 3 veces)
    act(() => {
      // Emisión 1 → ignorada por isFirstNetInfoEmit
      netInfoListener!({ isConnected: true });
    });
    act(() => {
      // Emisión 2 → offline
      netInfoListener!({ isConnected: false });
    });

    // Confirmamos que está offline
    expect(result.current.isOffline).toBe(true);

    // Emisión 3 → reconexión
    await act(async () => {
      netInfoListener!({ isConnected: true });
    });

    // Ahora isOffline debe ser false
    expect(result.current.isOffline).toBe(false);

    // Y se debe haber disparado un segundo fetch (refetch automático)
    await waitFor(() => expect(successFetch).toHaveBeenCalledTimes(2));
  });

  /**
   * Test 5: No hay doble load() en el montaje (isFirstNetInfoEmit funciona)
   *
   * Al montar el hook:
   * - El useEffect de montaje llama load() una vez
   * - El listener de NetInfo se suscribe y su primera emisión se IGNORA
   * → El fetch solo debe haberse llamado UNA vez
   */
  it("no hay doble load() en el montaje — isFirstNetInfoEmit evita la duplicación", async () => {
    const { result } = renderHook(() =>
      useOfflineCache(CACHE_KEY, successFetch),
    );

    // Esperamos a que el hook esté estable
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Solo debe haberse llamado exactamente UNA vez (no dos)
    expect(successFetch).toHaveBeenCalledTimes(1);
  });
});
