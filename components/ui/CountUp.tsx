import React, { useEffect, useState } from "react";
import { Text } from "react-native";

/** Props del componente CountUp */
interface CountUpProps {
  /** Valor numérico final al que debe llegar la animación */
  end: number;
  /** Estilos de texto (fuente, tamaño, color) pasados desde el componente padre */
  style?: any;
}

/**
 * Componente de animación numérica que cuenta progresivamente desde 0 hasta `end`.
 *
 * Algoritmo:
 * - La animación dura 2000 ms a ~60 fps (un frame cada 16 ms).
 * - Se calcula el incremento por frame: `end / totalFrames`.
 * - `setInterval` actualiza el contador cada 16 ms; cuando alcanza `end`, limpia el intervalo.
 * - `Math.floor` evita mostrar decimales intermedios durante la animación.
 *
 * El `useEffect` depende de `end`: si el valor cambia (ej: al recargar datos),
 * la animación se reinicia desde 0 automáticamente.
 *
 * Caso borde: si `end` es 0 o negativo, el contador muestra 0 directamente.
 */
export const CountUp = ({ end, style }: CountUpProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // duración total de la animación en ms
    const frameRate = 16;  // intervalo entre frames (~60fps)
    const totalFrames = duration / frameRate;
    const increment = end / totalFrames; // cuánto sumar por frame para llegar a `end` en exactamente 2s

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, frameRate);

    // Limpiamos el intervalo si el componente se desmonta antes de terminar la animación
    return () => clearInterval(timer);
  }, [end]);

  return <Text style={style}>{count}</Text>;
};
