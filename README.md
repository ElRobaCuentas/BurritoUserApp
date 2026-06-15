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
Android. Para iOS, agregar `GoogleService-Info.plist` via Xcode.

Crear un archivo `.env` en la raíz con:
```
MAPBOX_PUBLIC_TOKEN=<tu_token>
GOOGLE_WEB_CLIENT_ID=<tu_client_id>
```

**iOS** (solo macOS):
```bash
cd ios && pod install && cd ..
```

**Ejecutar:**
```bash
npm run android
npm run ios
```

## Scripts

| Acción | Comando |
|--------|---------|
| Metro dev server | `npm start` |
| Android | `npm run android` |
| iOS | `npm run ios` |
| Tests | `npm test` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |

## Estructura del Código

```
src/
├── app/          # Entry point (App.tsx), splash, navegación
├── features/
│   ├── auth/     # Login, registro, recuperar contraseña, avatar
│   ├── map/      # Mapa, paraderos, UI flotante, tracking
│   └── admin/    # CRUD de choferes, buses, asignaciones
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
- **Panel administrativo:** CRUD completo de choferes, buses y
  asignaciones. Acceso restringido a usuarios con rol `admin`.
- **Feedback:** modal de calificación y comentarios desde el menú
  lateral. Los datos se almacenan en `/comentarios`.
- **Splash animado:** animación de inicio con Lottie + hydration gating
  (espera a que los stores de sesión y tema se restauren antes de
  renderizar la navegación).

## Cómo funciona el Realtime

1. **El Listener:** La app se conecta a Firebase RTDB (nodo
   `/ubicacion_burrito`) mediante un listener continuo. Firebase empuja
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
- Panel admin con creación y cancelación de asignaciones.
- Dark mode funcional.
- Soporte multi-bus pendiente (actualmente muestra un solo bus).

## Limitaciones conocidas

Actualmente la aplicación está diseñada para visualizar una única unidad en tiempo real.
La arquitectura multi-bus se encuentra planificada para futuras versiones.


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
| `ReviewNotes.md` | Notas de revisión futura para mantenimiento de documentación. |
| `BUGS_RESUELTOS/` | Historial de bugs resueltos durante el desarrollo. |
