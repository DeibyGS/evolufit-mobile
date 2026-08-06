# 📱 EvolutFit - Mobile App

**EvolutFit** is the mobile application of the comprehensive workout and health management project. Built with **React Native** and **Expo (SDK 54)**, it provides a full experience to log sessions, view progress analytics, calculate your **1RM**, follow a community leaderboard, and receive workout reminders — all with **offline** support.

---

## ✨ Core Highlights

- **Expo Router (File-based):** Declarative navigation with typed routes (`typedRoutes`).
- **Offline Support:** Proactive connectivity detection with `@react-native-community/netinfo`, a status banner, and request caching (`useOfflineCache`).
- **Local Push Notifications:** Scheduled workout reminders with `expo-notifications`.
- **Progress Analytics:** Performance and muscle distribution charts with `react-native-chart-kit`.
- **Gamification:** Achievements system, 1RM calculator, and a global leaderboard (Hall of Fame).
- **Premium Dark UI:** Dark interface with linear gradients, consistent with the EvolutFit ecosystem.
- **Atomic Global State:** `zustand` for session and authentication management.

---

## 🛠️ Tech Stack

### Core

- **React Native 0.81** + **Expo SDK 54**: Cross-platform (iOS / Android / Web).
- **Expo Router 6**: File-based routing with nested layouts and protected routes.
- **TypeScript 5.9**: Strict typing with `typedRoutes` enabled.
- **Zustand**: Global state management (auth, session, user).

### Data & Networking

- **Axios**: HTTP client for the EvolutFit REST API.
- **AsyncStorage**: Local persistence of session and cached data.

### Offline & Notifications

- **@react-native-community/netinfo**: Real-time connectivity monitor.
- **expo-notifications**: Scheduled local notifications (daily reminders).
- **useOfflineCache**: Dual pattern NetInfo + try/catch for network resilience.

### UI & Visualization

- **expo-linear-gradient**: Gradients for backgrounds and surfaces.
- **react-native-chart-kit**: Progress and analytics charts.
- **react-native-reanimated**: High-performance fluid animations.
- **react-native-toast-message**: Visual feedback for user actions.

### Testing

- **jest-expo**: Test suite with `@testing-library/react-native`.
- **jest-html-reporters**: Visual test result report.

---

## 📂 Directory Architecture

```text
evolufit-mobile/
├── app/                  # Expo Router routes
│   ├── (tabs)/           # Authenticated views (Bottom Tabs)
│   │   ├── dashboard.tsx       # Summary and progress
│   │   ├── analytics.tsx       # Analytics and charts
│   │   ├── calculator.tsx      # Health metrics calculator
│   │   ├── routines.tsx        # Workout management
│   │   ├── rmCalculator.tsx    # One Rep Max calculator
│   │   ├── leaderboard.tsx     # Global Hall of Fame
│   │   ├── socialRoutines.tsx  # Community feed
│   │   ├── achievements.tsx    # Medals and achievements
│   │   ├── notifications.tsx   # Notification settings
│   │   └── profile.tsx         # Profile and security
│   ├── auth/             # Auth (login, register, forgot-password)
│   ├── _layout.tsx       # Root layout (providers and session)
│   └── index.tsx         # Splash / session redirect
├── api/                  # Axios client and endpoints
├── components/           # UI components (ui, layout, auth, sections)
│   ├── OfflineBanner.tsx # Connectivity status banner
│   └── ...
├── hooks/                # Reusable logic
│   ├── useOfflineCache.ts    # Offline caching pattern
│   └── useNotifications.ts   # Notification scheduling
├── store/                # Zustand global state
│   └── useAuthStore.ts       # Session and authentication
├── constants/            # Constants and configuration
├── data/                 # Static data (exercises, etc.)
├── __tests__/            # Tests for components, hooks, screens, and store
└── assets/               # Images, icons, and resources
```

---

## AI Development Benchmark

EvolutFit Mobile was engineered by a human developer working with AI as a **pair programming partner**. The AI accelerated implementation — the React Native architecture, offline strategy, and engineering decisions stayed human.

### How we worked together

| Human-owned | AI implemented, always human-reviewed |
|-------------|-------------------------------------|
| Product vision & UX | React Native / Expo component generation |
| Offline-first architecture | Zustand stores, API layer, hooks |
| Data model & navigation (typedRoutes) | Refactoring, TypeScript improvements |
| Code review & final acceptance | Test scaffolding, auxiliary docs |

**Workflow:** `Idea → Spec → AI implementation → Human review → Test → Refine → Merge`

### AI Development Principles

- AI never made product decisions.
- Every implementation started from a written specification.
- Documentation was treated as executable context for AI.
- All generated code required human review.
- Architecture was preserved over implementation speed.

<details>
<summary><strong>Supporting metrics</strong></summary>
<br>

| Metric | Value |
|--------|-------|
| AI sessions | 4 logged (CC) |
| Measured development time | ~25 h |
| Primary model | Claude Sonnet 4.6 |
| Secondary | OpenCode (DeepSeek V4 Flash) |

_Measured with [ClaudeStat](https://github.com/DeibyGS/claudestat). Approximate values; part of the EvolutFit ecosystem._

</details>

---

## ⚙️ Installation & Setup

### Clone the repository

```bash
git clone https://github.com/DeibyGS/evolufit-mobile.git
cd evolufit-mobile
```

### Install dependencies

> ⚠️ **Required:** `npm install` needs `legacy-peer-deps=true`. Without it, npm hangs.

```bash
npm install
```

### Run in development

```bash
npx expo start -c --tunnel
```

| Platform | Command |
|----------|---------|
| Android  | `npm run android` |
| iOS      | `npm run ios` |
| Web      | `npm run web` |

> **Tip:** If Watchman hangs: `watchman watch-del-all && watchman shutdown-server`.

---

## 🚀 Available Scripts

| Command        | Description                                        |
|----------------|----------------------------------------------------|
| `npm start`    | Starts the Expo development server.                |
| `npm run ios`  | Builds and runs on an iOS simulator/device.        |
| `npm run android` | Builds and runs on an Android emulator/device.  |
| `npm run web`  | Starts the web version.                            |
| `npm test`     | Runs the Jest test suite (no coverage).            |

> **Note:** Frontend tests take ~80s — that's normal, not a failure.

---

## 🧪 Testing

The suite uses **jest-expo** + **@testing-library/react-native** and covers components, hooks, screens, and stores.

```bash
npm test
```

Key patterns:
- **CJS mocks:** use `vi.spyOn` in `beforeAll` (NOT `vi.mock`) on modules with load-time side effects.
- **Notifications:** `trigger: TIME_INTERVAL:1s` for immediate testing (expo-notifications ≥0.28 doesn't accept `trigger: null`).

---

## 🔌 API Integration

The app consumes the **EvolutFit Backend** REST API (deployed on Render).

- **Base URL:** `https://evolufit-backend.onrender.com/api`
- **Backend Repository:** [github.com/DeibyGS/evolufit-backend](https://github.com/DeibyGS/evolufit-backend)

Endpoints used: JWT authentication, users, workouts, RM, health, and social — all defined in `api/API.ts`.

---

## 🔗 EvolutFit Ecosystem

| Project | Description |
|---------|-------------|
| [evolufit-mobile](https://github.com/DeibyGS/evolufit-mobile) | This mobile app (React Native + Expo). |
| [evolufit-frontend](https://github.com/DeibyGS/evolufit-frontend) | Web SPA client (React 19 + Vite), deployed on Vercel. |
| [evolufit-backend](https://github.com/DeibyGS/evolufit-backend) | REST API (Node.js + Express + MongoDB), deployed on Render. |
