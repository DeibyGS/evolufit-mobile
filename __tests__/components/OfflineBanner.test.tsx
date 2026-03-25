/**
 * Tests para OfflineBanner
 *
 * Componente simple: renderiza null cuando no es visible,
 * y muestra un texto de aviso cuando visible=true.
 */
import { render, screen } from "@testing-library/react-native";
import React from "react";
import OfflineBanner from "../../components/OfflineBanner";

describe("OfflineBanner", () => {
  it("no renderiza nada cuando visible es false", () => {
    const { toJSON } = render(<OfflineBanner visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it("renderiza el banner con texto de aviso cuando visible es true", () => {
    render(<OfflineBanner visible={true} />);
    expect(
      screen.getByText("📵 Sin conexión — mostrando datos guardados"),
    ).toBeTruthy();
  });
});
