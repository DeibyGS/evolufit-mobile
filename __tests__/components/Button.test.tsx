/**
 * Tests para Button
 *
 * Componente UI reutilizable con animación de pulso.
 * Verifica que renderiza el título y llama a onPress correctamente.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Button } from "../../components/ui/Button";

describe("Button", () => {
  it("renderiza el título correctamente", () => {
    // textTransform: 'uppercase' es solo visual — el texto real queda en minúsculas
    render(<Button title="Entrar" onPress={() => {}} />);
    expect(screen.getByText("Entrar")).toBeTruthy();
  });

  it("llama a onPress cuando se pulsa el botón", () => {
    const onPress = jest.fn();
    render(<Button title="Guardar" onPress={onPress} />);
    fireEvent.press(screen.getByText("Guardar"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
