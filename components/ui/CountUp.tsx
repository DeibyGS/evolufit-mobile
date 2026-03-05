import React, { useEffect, useState } from "react";
import { Text } from "react-native";

interface CountUpProps {
  end: number;
  style?: any; // Para pasarle los estilos de fuente
}

export const CountUp = ({ end, style }: CountUpProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 segundos
    const frameRate = 16; // aprox 60fps
    const totalFrames = duration / frameRate;
    const increment = end / totalFrames;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [end]);

  return <Text style={style}>{count}</Text>;
};
