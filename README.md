# BurritoUserApp

Aplicación móvil para los estudiantes de la Universidad Nacional Mayor de San Marcos (UNMSM). Consume las coordenadas GPS de los buses universitarios ("Burritos") en tiempo real y las muestra en un mapa.

Es una app de solo lectura en cuanto al tracking: no genera coordenadas ni cierra recorridos. Escucha Firebase y dibuja.

## Stack Principal

- **React Native CLI** (no Expo).
- **TypeScript** (tipado estricto).
- **Firebase Realtime Database (RTDB) & Auth** (base de datos en tiempo real y autenticación).
- **Zustand** (manejo de estado global).
- **Mapbox (`@rnmapbox/maps`)** (renderizado del mapa).
- **React Navigation** (navegación nativa).

## Cómo funciona el Realtime

1. **El Listener:** La app se conecta a Firebase RTDB (nodo `/ubicacion_burrito`). Firebase envía coordenadas nuevas varias veces por segundo.
2. **El Amortiguador (Zustand):** El listener escribe los datos en `burritoLocationStore.ts`. No conectes Firebase directamente a un componente de React, o el mapa se re-renderizará completo en cada latido del GPS.
3. **El Render:** `Map.tsx` lee las coordenadas desde Zustand. React Native Animated interpola la posición del bus durante 2 segundos, actualizando el marcador en Mapbox progresivamente.

## Estructura del Código

```
src/
├── app/          # Punto de entrada (App.tsx) y enrutadores (Stack/Drawer).
├── features/     # Código organizado por dominio:
│   ├── admin/    # CRUD de buses, choferes, asignaciones.
│   ├── auth/     # Login, registro, recuperar contraseña, avatar.
│   └── map/      # Mapa, paraderos, UI flotante.
├── shared/       # Configuración de Firebase, colores, tipografía.
└── store/        # Stores de Zustand (5 stores).
```

## Requisitos y Configuración

Asume un entorno configurado para React Native CLI (Node, Android Studio, Xcode).

```bash
npm install
```

**Credenciales:** El repositorio incluye `google-services.json` para Android. Para iOS, agrega `GoogleService-Info.plist` via Xcode. Crea un archivo `.env` en la raíz con las variables definidas en `env.d.ts`:

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

## Documentación

Revisar `AGENTS.md` en la raíz del proyecto para comandos, convenciones y detalles de implementación.
