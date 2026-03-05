export interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  content: string;
  date: string;
}

export const REVIEWS_DATA: Review[] = [
  {
    id: 1,
    name: "Marcos Rodríguez",
    role: "Powerlifter",
    rating: 5,
    content:
      "EvolutFit transformó completamente mi rutina de entrenamiento. El seguimiento de la sobrecarga progresiva me ayudó a mantener la consistencia y finalmente superar mis estancamientos.",
    date: "2025-11-12",
  },
  {
    id: 2,
    name: "Elena Smith",
    role: "Entusiasta del Fitness",
    rating: 4,
    content:
      "Los planes de entrenamiento personalizados son increíbles. Me siento más fuerte y segura cada semana. Solo desearía que hubiera más tutoriales de estiramiento.",
    date: "2025-12-05",
  },
  {
    id: 3,
    name: "Javier Ortíz",
    role: "Culturista",
    rating: 5,
    content:
      "¡Excelente aplicación! Las analíticas y gráficos me ayudaron a visualizar mi progreso como nunca antes. Registrar mi 1RM nunca había sido tan fácil.",
    date: "2026-01-10",
  },
  {
    id: 4,
    name: "Sarah Connor",
    role: "Atleta de Crossfit",
    rating: 5,
    content:
      "He probado muchas plataformas de fitness pero ninguna se compara con esta. Estructura clara, interfaz excelente y resultados reales. ¡Perdí 6kg en 3 meses!",
    date: "2025-10-20",
  },
  {
    id: 5,
    name: "David Miller",
    role: "Entrenador Personal",
    rating: 4,
    content:
      "Las herramientas de seguimiento son geniales y realmente me motivan a seguir mejorando. Me encantaría una función para comparar el progreso con amigos.",
    date: "2025-09-15",
  },
  {
    id: 6,
    name: "Laura García",
    role: "Yoga y Pilates",
    rating: 5,
    content:
      "Me encanta lo intuitivo que es todo. Añadir pesos, repeticiones y series toma segundos. Mi fuerza general ha mejorado notablemente.",
    date: "2026-01-02",
  },
  {
    id: 7,
    name: "Roberto Gómez",
    role: "Atleta Híbrido",
    rating: 5,
    content:
      "¡Plataforma increíble! Los entrenadores realmente saben cómo estructurar los entrenamientos y mantenerte motivado. La mejor decisión fitness que he tomado.",
    date: "2025-11-28",
  },
];
