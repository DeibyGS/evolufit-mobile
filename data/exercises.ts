/**
 * TIPADO DE DATOS - EVOLUTFIT
 */
export interface Exercise {
  id: string;
  name: string;
  group: MuscleGroup;
}

// Usamos un Type para asegurar que solo se usen estos grupos en toda la App
export type MuscleGroup =
  | "Pecho"
  | "Espalda"
  | "Deltoides"
  | "Bíceps"
  | "Tríceps"
  | "Cuádriceps"
  | "Isquiotibiales"
  | "Abdomen"
  | "Glúteo";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Pecho",
  "Espalda",
  "Deltoides",
  "Bíceps",
  "Tríceps",
  "Cuádriceps",
  "Isquiotibiales",
  "Abdomen",
  "Glúteo",
];

export const EXERCISES_DB: Exercise[] = [
  // --- PECHO ---
  { id: "p1", name: "Press de Banca Plano con barra", group: "Pecho" },
  { id: "p2", name: "Press de Banca Plano con  mancuernas", group: "Pecho" },
  { id: "p3", name: "Press Inclinado con Mancuernas", group: "Pecho" },
  { id: "p4", name: "Press Inclinado con Maquina Smith", group: "Pecho" },
  { id: "p5", name: "Aperturas en Peck Deck", group: "Pecho" },
  { id: "p6", name: "Aperturas con mancuernas", group: "Pecho" },
  { id: "p7", name: "Cruces en Polea Alta", group: "Pecho" },
  { id: "p8", name: "Press Declinado con Barra", group: "Pecho" },
  { id: "p9", name: "Fondos en Paralelas (Pecho)", group: "Pecho" },
  { id: "p10", name: "Flexiones de Brazos", group: "Pecho" },
  { id: "p11", name: "Press de Banca en Máquina", group: "Pecho" },
  { id: "p12", name: "Cruces en Polea Baja", group: "Pecho" },

  // --- ESPALDA ---
  { id: "e1", name: "Dominadas", group: "Espalda" },
  { id: "e2", name: "Dominadas Lastradas", group: "Espalda" },
  { id: "e3", name: "Jalón al Pecho", group: "Espalda" },
  { id: "e4", name: "Remo con Barra", group: "Espalda" },
  { id: "e5", name: "Remo en Polea Baja", group: "Espalda" },
  { id: "e6", name: "Remo con Mancuerna a una Mano", group: "Espalda" },
  { id: "e7", name: "Pull-over en Polea Alta", group: "Espalda" },
  { id: "e8", name: "Remo en maquina", group: "Espalda" },
  { id: "e9", name: "Hiperextensiones", group: "Espalda" },
  { id: "e10", name: "Remo unilateral en maquina", group: "Espalda" },
  { id: "e11", name: "Face Pull", group: "Espalda" },

  // --- DELTOIDES (Hombro) ---
  { id: "h1", name: "Press Militar con Barra", group: "Deltoides" },
  { id: "h2", name: "Elevaciones Laterales con Mancuerna", group: "Deltoides" },
  { id: "h3", name: "Press Arnold", group: "Deltoides" },
  { id: "h4", name: "Face Pull en Polea", group: "Deltoides" },
  {
    id: "h5",
    name: "Pájaros (Deltoide Posterior) con mancuernas",
    group: "Deltoides",
  },
  { id: "h6", name: "Elevaciones Frontales con Disco", group: "Deltoides" },
  { id: "h7", name: "Remo al Cuello en Polea", group: "Deltoides" },
  { id: "h8", name: "Press de Hombro en Máquina", group: "Deltoides" },
  { id: "h9", name: "Elevaciones Laterales en Polea", group: "Deltoides" },
  { id: "h10", name: "Press Militar con Mancuernas", group: "Deltoides" },
  { id: "h11", name: "Elevaciones Posteriores en Polea", group: "Deltoides" },
  { id: "h12", name: "Remo al Cuello con Barra", group: "Deltoides" },
  {
    id: "h13",
    name: "Elevaciones Frontales con Mancuerna",
    group: "Deltoides",
  },
  { id: "h14", name: "Pájaros en Peck Deck", group: "Deltoides" },
  {
    id: "h15",
    name: "Press de Hombro con Mancuernas en Banco Inclinado",
    group: "Deltoides",
  },
  {
    id: "h16",
    name: "Elevaciones Laterales con Mancuerna en Banco Inclinado",
    group: "Deltoides",
  },
  { id: "h17", name: "Remo al Cuello con Mancuerna", group: "Deltoides" },
  {
    id: "h18",
    name: "Elevaciones Frontales con Mancuerna",
    group: "Deltoides",
  },
  { id: "h19", name: "Press de Hombro en Máquina Smith", group: "Deltoides" },
  {
    id: "h20",
    name: "Elevaciones Laterales con Mancuerna en Banco Plano",
    group: "Deltoides",
  },
  {
    id: "h21",
    name: "Elevaciones Frontales con Mancuerna a una Mano",
    group: "Deltoides",
  },
  {
    id: "h22",
    name: "Pájaros con Mancuerna en Banco Inclinado",
    group: "Deltoides",
  },

  // --- BÍCEPS ---
  { id: "b1", name: "Curl con Barra Z", group: "Bíceps" },
  { id: "b2", name: "Curl Alterno con Mancuernas", group: "Bíceps" },
  { id: "b3", name: "Curl Martillo", group: "Bíceps" },
  { id: "b4", name: "Curl en Banco Predicador", group: "Bíceps" },
  { id: "b5", name: "Curl Concentrado", group: "Bíceps" },
  { id: "b6", name: "Curl en Polea Baja", group: "Bíceps" },
  { id: "b7", name: "Curl tipo Spider", group: "Bíceps" },
  { id: "b8", name: "Curl con Barra Recta", group: "Bíceps" },
  { id: "b9", name: "Curl con Mancuerna en Banco Inclinado", group: "Bíceps" },
  { id: "b10", name: "Curl en Polea Alta con Cuerda", group: "Bíceps" },
  { id: "b11", name: "Curl de Bíceps en Máquina", group: "Bíceps" },
  { id: "b12", name: "Curl Alterno con Supinación", group: "Bíceps" },
  { id: "b13", name: "Curl Concentrado con Mancuerna", group: "Bíceps" },

  // --- TRÍCEPS ---
  { id: "t1", name: "Extensiones en Polea Alta con Cuerda", group: "Tríceps" },
  { id: "t2", name: "Press Francés con Barra Z", group: "Tríceps" },
  { id: "t3", name: "Fondos entre Bancos", group: "Tríceps" },
  { id: "t4", name: "Copa a una Mano con Mancuerna", group: "Tríceps" },
  { id: "t5", name: "Copa a dos Manos con Mancuerna", group: "Tríceps" },
  { id: "t6", name: "Patada de Tríceps en Polea", group: "Tríceps" },
  { id: "t7", name: "Press de Banca Agarre Cerrado", group: "Tríceps" },
  { id: "t8", name: "Extensiones tras nuca con cuerda", group: "Tríceps" },
  { id: "t9", name: "Flexiones Diamante", group: "Tríceps" },
  { id: "t10", name: "Press Francés con Mancuerna", group: "Tríceps" },
  { id: "t11", name: "Fondos en Maquina", group: "Tríceps" },
  { id: "t12", name: "Extensiones en Polea Alta con Barra", group: "Tríceps" },
  { id: "t13", name: "Extensiones en Polea Unilateral", group: "Tríceps" },

  // --- CUÁDRICEPS ---
  { id: "c1", name: "Sentadilla Libre con Barra", group: "Cuádriceps" },
  { id: "c2", name: "Prensa de Piernas 45°", group: "Cuádriceps" },
  { id: "c3", name: "Extensiones de Cuádriceps", group: "Cuádriceps" },
  { id: "c4", name: "Zancadas con Mancuernas", group: "Cuádriceps" },
  { id: "c5", name: "Sentadilla Hack", group: "Cuádriceps" },
  { id: "c6", name: "Sentadilla Búlgara", group: "Cuádriceps" },
  { id: "c7", name: "Sentadilla Frontal", group: "Cuádriceps" },
  { id: "c8", name: "Sentadilla en Máquina Smith", group: "Cuádriceps" },
  { id: "c9", name: "Prensa de Piernas Horizontal", group: "Cuádriceps" },
  { id: "c10", name: "Sentadilla con Mancuernas", group: "Cuádriceps" },
  { id: "c11", name: "Sentadilla Sissy", group: "Cuádriceps" },
  { id: "c12", name: "Zancadas en Máquina Smith", group: "Cuádriceps" },
  { id: "c13", name: "Sentadilla con Sumo", group: "Cuádriceps" },

  // --- ISQUIOTIBIALES ---
  { id: "i1", name: "Peso Muerto Rumano", group: "Isquiotibiales" },
  { id: "i2", name: "Curl Femoral Tumbado", group: "Isquiotibiales" },
  { id: "i3", name: "Curl Femoral Sentado", group: "Isquiotibiales" },
  { id: "i4", name: "Buenos Días con Barra", group: "Isquiotibiales" },
  { id: "i5", name: "Curl Femoral de Pie", group: "Isquiotibiales" },
  { id: "i6", name: "Puente de Glúteo / Isquio", group: "Isquiotibiales" },
  {
    id: "i7",
    name: "Peso Muerto con Piernas Rígidas",
    group: "Isquiotibiales",
  },
  { id: "i8", name: "Hip Thrust", group: "Isquiotibiales" },

  // --- ABDOMEN ---
  { id: "a1", name: "Crunch Abdominal en Máquina", group: "Abdomen" },
  { id: "a2", name: "Elevación de Piernas Colgado", group: "Abdomen" },
  { id: "a3", name: "Plancha Abdominal", group: "Abdomen" },
  { id: "a4", name: "Rueda Abdominal", group: "Abdomen" },
  { id: "a5", name: "Twist Ruso con Disco", group: "Abdomen" },
  { id: "a6", name: "Woodchopper en Polea", group: "Abdomen" },
  { id: "a7", name: "Crunch con Cable (Polea)", group: "Abdomen" },
  { id: "a8", name: "Bicicleta Abdominal", group: "Abdomen" },

  // --- GLÚTEO ---
  { id: "g1", name: "Hip Thrust con Barra", group: "Glúteo" },
  { id: "g2", name: "Kicks de Glúteo en Polea", group: "Glúteo" },
  { id: "g3", name: "Abducción de Cadera en Máquina", group: "Glúteo" },
  { id: "g4", name: "Clamshells con Banda", group: "Glúteo" },
  { id: "g5", name: "Step Up en Cajón", group: "Glúteo" },
  { id: "g6", name: "Puente de Glúteo Unilateral", group: "Glúteo" },
  { id: "g7", name: "Frog Pumps", group: "Glúteo" },
  { id: "g8", name: "Peso Muerto Sumo con Mancuerna", group: "Glúteo" },
];
