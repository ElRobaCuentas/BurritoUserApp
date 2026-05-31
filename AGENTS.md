# BurritoUserApp — AGENTS.md

## Commands

| Action | Command |
|---|---|
| Metro dev server | `npm start` |
| Run Android | `npm run android` |
| Run iOS | `npm run ios` |
| Test (Jest) | `npm test` |
| Lint (ESLint) | `npm run lint` |
| Typecheck | `npx tsc --noEmit` (no npm script) |
| Format (Prettier) | `npx prettier --write <file>` |

Prettier 2.8.8: single quotes, no parens on arrow fns, trailing commas.

## Architecture

- **Entrypoint**: `index.js` → `src/app/App.tsx`
- **Feature-first** folders under `src/features/`: `auth/`, `map/`, `admin/` — each with its own `screen/`, `components/`, `services/`
- **State**: 5 Zustand stores in `src/store/` — `userStore` (persisted via zustand/persist + AsyncStorage), `themeStore` (manual AsyncStorage), `mapStore`, `burritoLocationStore`, `drawerStore` (all ephemeral)
- **Auth gating**: declarative in `StackNavigator.tsx` — renders different screen groups based on `isLoggedIn`; no manual route guards
- **Navigation**: `@react-navigation/stack` (root) + `@react-navigation/drawer` (MapScreen + theme toggle)
- **Map rendering**: `@rnmapbox/maps` with public token from `@env`
- **Firebase**: RTDB at `burritounmsm-default-rtdb.firebaseio.com` (`/ubicacion_burrito`, `/choferes`, `/buses`, `/asignaciones`), Auth, Analytics, Crashlytics
- **Google Sign-In**: configured in `App.tsx` with `GOOGLE_WEB_CLIENT_ID` env var

## Key quirks

- **Babel plugin order**: `react-native-reanimated/plugin` must be **last** in `babel.config.js` plugins array
- **Env vars**: accessed via `import { VAR } from '@env'` (typed in `env.d.ts`). Published in `.env` (gitignored). Two vars: `MAPBOX_PUBLIC_TOKEN`, `GOOGLE_WEB_CLIENT_ID`
- **Fonts**: linked in `react-native.config.js` from `src/assets/fonts/` (Algerian, Poppins weights)
- **Bus tracking**: `burritoLocationStore.startTracking()` subscribes to Firebase RTDB `/ubicacion_burrito`. Throttles stale data >12s. Caller must pair with `stopTracking()` for cleanup
- **Hydration gating**: `App.tsx` waits for both `userStore._hasHydrated` and `themeStore._hasHydrated` before rendering `NavigationContainer`
- **Python simulator**: `simulador_burrito.py` (in repo root) writes fake GPS to RTDB for testing live bus tracking without real hardware. Requires `venv/` + `requirements.txt` (gitignored)
- **Service key**: `serviceAccountKey.json` is gitignored — do not commit
- **Dark mode**: persisted manually (not via zustand persist middleware). Follows system on first launch, then manual toggle

## Testing

- Jest preset `react-native`, single basic render test in `__tests__/App.test.tsx`
- No snapshot, integration, or E2E setup
- Firebase-dependent features require real credentials
