/**
 * Tests para useAuthStore (Zustand)
 *
 * Prueba las 4 acciones del store de autenticación:
 * login, logout, updateUser, y el estado inicial.
 *
 * Se usa useAuthStore.setState({}) SIN el flag `true` para resetear
 * solo los datos entre tests, conservando las funciones del store
 * (login, logout, updateUser). Con `true` se borrarían las funciones.
 */

// AsyncStorage: requerido porque zustand/persist lo usa internamente
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { useAuthStore } from "../../store/useAuthStore";

const mockUser = {
  _id: "user-1",
  name: "Deiby",
  lastname: "Gorrin",
  email: "deiby@evolufit.com",
  role: "user",
};

// Reseteamos solo los datos entre tests — sin `true` para no borrar las funciones
beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuth: false });
});

describe("useAuthStore", () => {
  it("estado inicial: sin usuario, sin token, isAuth false", () => {
    const { user, token, isAuth } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isAuth).toBe(false);
  });

  it("login guarda usuario y token, y activa isAuth", () => {
    useAuthStore.getState().login(mockUser, "jwt-test-token");

    const { user, token, isAuth } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(token).toBe("jwt-test-token");
    expect(isAuth).toBe(true);
  });

  it("logout limpia usuario, token e isAuth", () => {
    useAuthStore.getState().login(mockUser, "jwt-test-token");
    useAuthStore.getState().logout();

    const { user, token, isAuth } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isAuth).toBe(false);
  });

  it("updateUser actualiza campos parciales sin perder los demás", () => {
    useAuthStore.getState().login(mockUser, "jwt-test-token");
    useAuthStore.getState().updateUser({ name: "Diego" });

    const { user } = useAuthStore.getState();
    expect(user?.name).toBe("Diego");
    // Los demás campos no deben cambiar
    expect(user?.email).toBe(mockUser.email);
    expect(user?.lastname).toBe(mockUser.lastname);
  });

  it("updateUser no hace nada si no hay usuario activo (sesión expirada)", () => {
    // Sin login previo, user es null
    useAuthStore.getState().updateUser({ name: "Ghost" });
    expect(useAuthStore.getState().user).toBeNull();
  });
});
