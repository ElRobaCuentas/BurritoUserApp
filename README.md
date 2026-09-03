# BurritoUserApp


## Introducción

Aplicación móvil para los estudiantes de la Universidad Nacional Mayor
de San Marcos (UNMSM). Consume las coordenadas GPS de los buses
universitarios en tiempo real y las muestra en un mapa.

Es una app de **solo lectura** en cuanto al tracking: no genera
coordenadas ni cierra recorridos. Escucha Firebase y dibuja.


## Requisitos

Android mínimo
Node
JDK
React Native CLI
Mapbox Token
Firebase

## Stack Principal

| Capa | Tecnología |
|------|-----------|
| Framework | React Native 0.83.1 (CLI, no Expo) |
| Lenguaje | TypeScript (tipado estricto) |
| Estado global | Zustand 5.x |
| Base de datos | Firebase Realtime Database + Auth (23.8.x) |
| Mapas | Mapbox (`@rnmapbox/maps` 10.2.x) |
| Navegación | React Navigation (Stack + Drawer) |
| Auth adicional | Google Sign-In, react-native-dotenv |

## Setup

```bash
npm install
```

**Credenciales:** El repositorio incluye `google-services.json` para
Android.

> **iOS no está implementado en ninguna versión actual.** La app es
> Android-only por ahora. La estructura iOS existe en el template de
> React Native CLI, pero no está configurada ni soportada. El soporte
> iOS está planificado para futuras versiones.

Crear un archivo `.env` en la raíz con:
```
MAPBOX_PUBLIC_TOKEN=<tu_token>
GOOGLE_WEB_CLIENT_ID=<tu_client_id>
```

**Ejecutar (Android):**
```bash
npm run android
```

## Scripts

| Acción | Comando |
|--------|---------|
| Metro dev server | `npm start` |
| Android | `npm run android` |
| Tests | `npm test` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |

## Estructura del Código

```
src/
├── app/          # Entry point (App.tsx), splash, navegación
├── features/
│   ├── auth/     # Login, registro, recuperar contraseña, avatar
│   └── map/      # Mapa, paraderos, UI flotante, tracking
├── shared/       # Config Firebase, colores, tipografía
└── store/        # 5 stores de Zustand
```

## Funcionalidades

- **Autenticación dual:** email/contraseña y Google Sign-In. Sesión
  persistente con AsyncStorage + Zustand persist.
- **Mapa en vivo:** renderizado con Mapbox, ruta circular del campus,
  10 paraderos marcados, el bus con indicador de heading y radar de
  posición.
- **Dark mode:** tema oscuro/claro con persistencia manual, accesible
  desde el menú lateral.
- **Feedback:** modal de calificación y comentarios desde el menú
  lateral. Los datos se almacenan en `/comentarios`.
- **Splash animado:** splash con react-native-bootsplash + hydration gating
  (espera a que los stores de sesión y tema se restauren antes de
  renderizar la navegación).

> Nota: la gestión de conductores, buses y asignaciones **no** vive en
> esta app. Se realiza desde el módulo admin de la DriverApp o desde
> AdminWeb.

## Cómo funciona el Realtime

1. **El Listener:** La app se conecta a Firebase RTDB (nodo
   `/ubicacion_buses`) mediante un listener continuo. Firebase empuja
   los cambios en milisegundos.

2. **El Amortiguador (Zustand):** El listener escribe los datos en
   `burritoLocationStore.ts`. Nunca conectes Firebase directamente a un
   componente de React — el mapa se re-renderizaría completo en cada
   latido del GPS.

3. **El Render:** `Map.tsx` lee las coordenadas desde Zustand. Mapbox
   interpola la posición del marcador suavemente sobre el canvas nativo.

## Estado de Implementación

- Listener de ubicación en tiempo real funcional.
- Autenticación completa (email y Google).
- Dark mode funcional.
- Render de un solo bus. El **backend multi-bus está operativo**
  (`/ubicacion_buses` es `Record<string, BurritoLocation>`), pero el
  frontend aún renderiza una sola unidad. La arquitectura multi-bus
  está planificada como Post-MVP.

## Limitaciones conocidas

- **Un solo bus visible:** el frontend muestra una única unidad en tiempo
  real. El backend multi-bus ya está operativo; el render multi-marcador
  (ShapeSource + SymbolLayer por cada bus activo) está planificado en el
  backlog Post-MVP.
- **iOS no implementado:** la app es Android-only en esta versión. El
  soporte iOS está planificado para futuras versiones.


## Documentación Relacionada

| Documento | Propósito |
|-----------|-----------|
| `PROJECT_CONTEXT.md` | Visión general del ecosistema. |
| `ARCHITECTURE.md` | Flujo de datos, componentes y ciclo de vida. |
| `FIREBASE_SCHEMA.md` | Estructura de nodos y payloads de la RTDB. |
| `AGENTS.md` | Comandos, convenciones y detalles para asistentes IA. |
| `ROADMAP.md` | Fases, prioridades y tareas pendientes del proyecto. |
| `TROUBLESHOOTING.md` | Guía operativa para diagnosticar problemas conocidos. |
| `DECISIONS.md` | Decisiones de arquitectura (ADR) del ecosistema. |
| `BUGS_RESUELTOS/` | Historial de bugs resueltos durante el desarrollo. |
