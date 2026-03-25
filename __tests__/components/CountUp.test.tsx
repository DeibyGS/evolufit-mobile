/**
 * Tests para CountUp
 *
 * Componente de animación numérica: cuenta de 0 hasta `end` en 2000ms.
 * Usa fake timers para controlar el tiempo de forma síncrona en tests.
 */
import { act, render, screen } from "@testing-library/react-native";
import React from "react";
import { CountUp } from "../../components/ui/CountUp";

describe("CountUp", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("empieza mostrando 0 antes de que comience la animación", () => {
    render(<CountUp end={100} />);
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("llega al valor final tras ejecutar todos los timers", () => {
    render(<CountUp end={50} />);
    act(() => { jest.runAllTimers(); });
    expect(screen.getByText("50")).toBeTruthy();
  });

  it("muestra 0 directamente si end es 0", () => {
    render(<CountUp end={0} />);
    expect(screen.getByText("0")).toBeTruthy();
  });
});
