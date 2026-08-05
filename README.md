# 📱 EvolutFit - Mobile App

**EvolutFit** es la aplicación móvil del proyecto de gestión integral de entrenamiento y salud. Desarrollada con **React Native** y **Expo (SDK 54)**, ofrece una experiencia completa para registrar sesiones, consultar analíticas de progreso, calcular el **1RM**, seguir un leaderboard comunitario y recibir recordatorios de entrenamiento, todo con soporte **offline**.

---

## ✨ Core Highlights

- **Expo Router (File-based):** Navegación declarativa con rutas tipadas (`typedRoutes`).
- **Soporte Offline:** Detección proactiva de conectividad con `@react-native-community/netinfo`, banner de estado y caché de peticiones (`useOfflineCache`).
- **Notificaciones Push Locales:** Recordatorios de entrenamiento programados con `expo-notifications`.
- **Analíticas de Progreso:** Gráficas de rendimiento y distribución muscular con `react-native-chart-kit`.
- **Gamificación:** Sistema de logros, calculadora de 1RM y leaderboard global (Hall of Fame).
- **UI Premium Dark:** Interfaz oscura con gradientes lineales y diseño consistente con el ecosistema EvolutFit.
- **Estado Global Atómico:** `zustand` para la gestión de sesión y autenticación.

---

## 🛠️ Stack Tecnológico

### Core

- **React Native 0.81** + **Expo SDK 54**: Plataforma cross-platform (iOS / Android / Web).
- **Expo Router 6**: Enrutado basado en el sistema de archivos, con layouts anidados y rutas protegidas.
- **TypeScript 5.9**: Tipado estricto con `typedRoutes` habilitado.
- **Zustand**: Gestión de estado global (auth, sesión, usuario).

### Datos y Networking

- **Axios**: Cliente HTTP para la API REST de EvolutFit.
- **AsyncStorage**: Persistencia local de sesión y datos cacheados.

### Offline y Notificaciones

- **@react-native-community/netinfo**: Monitor de conectividad en tiempo real.
- **expo-notifications**: Notificaciones locales programadas (recordatorios diarios).
- **useOfflineCache**: Patrón dual NetInfo + try/catch para resiliencia de red.

### UI y Visualización

- **expo-linear-gradient**: Fondos y superficies con degradados.
- **react-native-chart-kit**: Gráficas de progreso y analíticas.
- **react-native-reanimated**: Animaciones fluidas de alto rendimiento.
- **react-native-toast-message**: Feedback visual para acciones del usuario.

### Testing

- **jest-expo**: Suite de tests con `@testing-library/react-native`.
- **jest-html-reporters**: Reporte visual de resultados de tests.

---

## 📂 Arquitectura de Directorios

```text
evolufit-mobile/
├── app/                  # Rutas de Expo Router
│   ├── (tabs)/           # Vistas autenticadas (Bottom Tabs)
│   │   ├── dashboard.tsx       # Resumen y progreso
│   │   ├── analytics.tsx       # Analíticas y gráficas
│   │   ├── calculator.tsx      # Calculadora de métricas de salud
│   │   ├── routines.tsx        # Gestión de entrenamientos
│   │   ├── rmCalculator.tsx    # Calculadora de Repetición Máxima
│   │   ├── leaderboard.tsx     # Hall of Fame global
│   │   ├── socialRoutines.tsx  # Feed de comunidad
│   │   ├── achievements.tsx    # Medallas y logros
│   │   ├── notifications.tsx   # Config de notificaciones
│   │   └── profile.tsx         # Perfil y seguridad
│   ├── auth/             # Auth (login, register, forgot-password)
│   ├── _layout.tsx       # Layout raíz (proveedores y sesión)
│   └── index.tsx         # Splash / redirección de sesión
├── api/                  # Cliente Axios y endpoints
├── components/           # Componentes UI (ui, layout, auth, sections)
│   ├── OfflineBanner.tsx # Banner de estado de conectividad
│   └── ...
├── hooks/                # Lógica reutilizable
│   ├── useOfflineCache.ts    # Patrón de caché offline
│   └── useNotifications.ts   # Programación de notificaciones
├── store/                # Estado global Zustand
│   └── useAuthStore.ts       # Sesión y autenticación
├── constants/            # Constantes y configuración
├── data/                 # Datos estáticos (ejercicios, etc.)
├── __tests__/            # Tests de componentes, hooks, screens y store
└── assets/               # Imágenes, iconos y recursos
```

---

## ⚙️ Instalación y Configuración

### Clonar el repositorio

```bash
git clone https://github.com/DeibyGS/evolufit-mobile.git
cd evolufit-mobile
```

### Instalar dependencias

> ⚠️ **Requerido:** `npm install` necesita `legacy-peer-deps=true`. Sin él, npm se queda colgado.

```bash
npm install
```

### Lanzar en desarrollo

```bash
npx expo start -c --tunnel
```

| Plataforma | Comando |
|------------|---------|
| Android    | `npm run android` |
| iOS        | `npm run ios` |
| Web        | `npm run web` |

> **Tip:** Si Watchman se cuelga: `watchman watch-del-all && watchman shutdown-server`.

---

## 🚀 Scripts Disponibles

| Comando        | Descripción                                             |
|----------------|---------------------------------------------------------|
| `npm start`    | Inicia el servidor de desarrollo de Expo.               |
| `npm run ios`  | Compila y ejecuta en simulador/device iOS.              |
| `npm run android` | Compila y ejecuta en emulador/device Android.        |
| `npm run web`  | Inicia la versión web.                                  |
| `npm test`     | Ejecuta la suite de tests con Jest (sin coverage).      |

> **Nota:** Los tests frontend tardan ~80s — es normal, no es un fallo.

---

## 🧪 Testing

La suite usa **jest-expo** + **@testing-library/react-native** y cubre componentes, hooks, pantallas y stores.

```bash
npm test
```

Patrones clave:
- **CJS mocks:** usar `vi.spyOn` en `beforeAll` (NO `vi.mock`) en módulos con side effects al cargarse.
- **Notificaciones:** `trigger: TIME_INTERVAL:1s` para pruebas inmediatas (expo-notifications ≥0.28 no acepta `trigger: null`).

---

## 🔌 Integración con la API

La app consume la API REST de **EvolutFit Backend** (desplegada en Render).

- **Base URL:** `https://evolufit-backend.onrender.com/api`
- **Repositorio Backend:** [github.com/DeibyGS/evolufit-backend](https://github.com/DeibyGS/evolufit-backend)

Endpoints usados: autenticación JWT, usuarios, workouts, RM, health y social — todos definidos en `api/API.ts`.

---

## 🔗 Ecosistema EvolutFit

| Proyecto | Descripción |
|----------|-------------|
| [evolufit-mobile](https://github.com/DeibyGS/evolufit-mobile) | Esta app móvil (React Native + Expo). |
| [evolufit-frontend](https://github.com/DeibyGS/evolufit-frontend) | Cliente web SPA (React 19 + Vite), desplegado en Vercel. |
| [evolufit-backend](https://github.com/DeibyGS/evolufit-backend) | API REST (Node.js + Express + MongoDB), desplegada en Render. |
