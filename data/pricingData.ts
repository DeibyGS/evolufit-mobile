export interface PricingPlan {
  id: number;
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

export const PRICING_DATA: PricingPlan[] = [
  {
    id: 1,
    title: "Básico",
    price: "19",
    description: "Ideal para empezar tu camino fitness con guía profesional.",
    features: ["Rutinas básicas", "Seguimiento de peso", "Acceso a comunidad"],
    isPopular: false,
  },
  {
    id: 2,
    title: "Pro Evolut",
    price: "39",
    description: "Nuestro plan más completo para una transformación total.",
    features: [
      "Todo lo del Básico",
      "Dietas personalizadas",
      "Soporte 24/7",
      "Gráficos Pro",
    ],
    isPopular: true,
  },
  {
    id: 3,
    title: "Elite",
    price: "59",
    description: "Entrenamiento de alto rendimiento con coach dedicado.",
    features: ["Todo lo Pro", "Coach personal", "Análisis biométrico"],
    isPopular: false,
  },
];
