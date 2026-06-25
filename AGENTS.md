# BurritoUserApp — AGENTS.md

## 1. Propósito

Este archivo está dirigido **exclusivamente a asistentes de IA** (OpenCode,
Gemini CLI, Claude Code, Cursor, etc.).

NO es un README. README.md explica qué hace el proyecto y cómo usarlo.
AGENTS.md explica **cómo debe trabajar una IA** dentro de este proyecto sin
romper su arquitectura.

### Filosofía

La prioridad de cualquier modificación es preservar la estabilidad del
sistema y mantener consistencia entre código y documentación.

Ante la duda:
- Modificar menos.
- Preguntar antes de asumir.
- Mantener la arquitectura existente.
- Evitar refactors innecesarios.

Lee este documento completo antes de modificar cualquier archivo.

---

## 2. Flujo obligatorio de trabajo

1. **Entender la tarea** — Identifica qué funcionalidad toca (auth, mapa,
   tracking, admin, tema, feedback).
2. **Identificar archivos afectados** — Usa la tabla de sección 7 para
   mapear el cambio a los documentos que debes actualizar.
3. **Leer la documentación relacionada** — Antes de modificar, lee los
   docs que aplican (ver referencias al final).
4. **Modificar únicamente lo necesario** — No hagas refactors ni
   expansion de alcance no solicitados.
5. **Sincronizar documentación** — Si el cambio impacta >1 documento,
   todos deben quedar actualizados antes de cerrar la tarea.
6. **Ejecutar verificaciones** — Corre el checklist de sección 8.
7. **Entregar resultado** — Confirma que compila, tests pasan, y la
   documentación está consistente.

---

## 3. Comandos

| Acción | Comando |
|--------|---------|
| Iniciar Metro | `npm start` |
| Android | `npm run android` |
| iOS | `npm run ios` |
| Tests | `npm test` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |
| Formatear | `npx prettier --write <file>` |

Prettier 2.8.8: `singleQuote: true`, `arrowParens: 'avoid'`,
`trailingComma: 'all'`.

No existe npm script para typecheck. Ejecuta `npx tsc --noEmit`
manualmente.

---

## 4. Arquitectura mínima necesaria

Solo lo imprescindible. Para el flujo completo, lee ARCHITECTURE.md.

### Entry point

`index.js` → `src/app/App.tsx`

Si modificas el montaje global (splash, hidratación, Google Sign-In),
lee ARCHITECTURE.md sección 4.

### Auth gating

Declarativo en `StackNavigator.tsx`: renderiza grupos de pantallas según
`isLoggedIn`. No hay route guards manuales.

Si modificas navegación, lee ARCHITECTURE.md sección 4.

### Estado global

5 stores en `src/store/` (Zustand). Los listeners de Firebase viven
dentro de los stores, no en componentes React.

| Store | Persistencia |
|-------|-------------|
| `userStore` | Zustand persist + AsyncStorage |
| `themeStore` | AsyncStorage manual |
| `mapStore` | Efímera |
| `burritoLocationStore` | Efímera (aquí vive el listener de tracking) |
| `drawerStore` | Efímera |

App.tsx espera `userStore._hasHydrated && themeStore._hasHydrated`
antes de renderizar `NavigationContainer`.

Si modificas stores o hidratación, lee ARCHITECTURE.md sección 4.

### Firebase RTDB (paths que la app toca)

Paths resumidos. Payloads completos en FIREBASE_SCHEMA.md.

| Uso | Paths |
|-----|-------|
| Tracking (lectura) | `/ubicacion_buses` |
| Feedback (escritura) | `/comentarios` |
| Usuarios (lectura/escritura) | `/usuarios/{uid}` |

Si modificas paths de RTDB, lee FIREBASE_SCHEMA.md completo y
ARCHITECTURE.md sección 5.

---

## 5. Reglas críticas

Cada regla sigue el formato: **qué no hacer**, **por qué**, **qué hacer**.

Ordenadas por prioridad de severidad.

### 5.1 Persistencia Firebase

- **No reactives** `database().setPersistenceEnabled(true)`.
- Acumula ubicaciones durante micro-cortes de red y las reenvía en ráfaga
  al reconectar, haciendo que el bus "viaje en el tiempo" (ADR-003).
- La ubicación en tiempo real es efímera. Sin persistencia, cada pulso
  fallido se descarta y el siguiente (3s) refleja la posición real.

### 5.2 Listeners de Firebase

- **No conectes** listeners de RTDB directamente a componentes React.
- Causa re-renders masivos en Mapbox. El canvas nativo no puede seguir el
  ritmo, provocando tirones y caída de FPS.
- Usa `burritoLocationStore.startTracking()` que canaliza los deltas por
  Zustand. Map.tsx usa selectores estrictos.

### 5.3 Secondary Auth

- **No crees** cuentas de conductor con la instancia principal de Auth.
- El admin perdería su sesión al autenticarse como el nuevo conductor.
- Usa `AdminService.createChofer()` que maneja la instancia secundaria
  automáticamente.

### 5.4 Ciclo de tracking

- **No modifiques** el flujo `startTracking → listener RTDB → dedup →
  store` sin actualizar ARCHITECTURE.md sección 5.
- Es el corazón del sistema. Cualquier cambio afecta cómo la UserApp
  recibe ubicaciones.
- Trabaja dentro de `MapService.subscribeToBusLocation()` y
  `burritoLocationStore`.

### 5.5 Sincronización documental obligatoria

- **Si un cambio impacta cualquier documento del ecosistema, todos deben quedar
  sincronizados antes de cerrar la tarea.**
- Ejemplo: cambiar un path de RTDB toca FIREBASE_SCHEMA.md (payloads),
  ARCHITECTURE.md (flujo de datos), y potencialmente este AGENTS.md.
- Usa la tabla de sección 7 para saber qué actualizar.

### 5.6 No expandir alcance

- **Si la tarea pide arreglar un bug, no hagas refactors, no actualices
  dependencias, no renombres variables, no limpies código.**
- "Ya que estaba..." es la causa principal de regresiones en proyectos
  mantenidos por IA.
- Resuelve exactamente lo solicitado y nada más.

### 5.7 Estado duplicado

- **No crees** `useState` local para datos que ya existen en un store.
- Dos fuentes de verdad llevan a inconsistencias.
- Usa selectores de Zustand. Si necesitas estado derivado, usa `useMemo`
  o selectores.

### 5.8 Paths de RTDB

- **No cambies** un path de RTDB sin actualizar FIREBASE_SCHEMA.md.
- FIREBASE_SCHEMA.md es la fuente de verdad. Si el path cambia y el
  documento no, el próximo desarrollador escribirá en nodos inexistentes.

### 5.9 Librerías externas

- **No introduzcas** librerías nuevas sin justificarlas en DECISIONS.md.
- Cada dependencia nueva aumenta el bundle y el riesgo de incompatibilidad
  con RN 0.83.1 + Firebase 23.8.x.
- Evalúa si puedes resolverlo con lo existente. Si es necesario, crea un
  nuevo ADR en DECISIONS.md.

### 5.10 Comentarios de advertencia

- **No elimines** comentarios con `//!`, `NO TOCAR` o `CAMBIO QUIRÚRGICO`.
- Son señales de peligro sobre código frágil (error handler silenciado en
  admin_service.ts, snapToRoute comentado en Map.tsx).
- Si entiendes completamente el contexto y la advertencia ya no aplica,
  verifica antes de eliminar.

### 5.11 Tareas futuras

- **No implementes** funcionalidades marcadas como pendientes en ROADMAP.md
  a menos que la tarea lo exija.
- ROADMAP.md define el orden de fases. Implementar fuera de secuencia
  rompe dependencias y crea deuda técnica.

### 5.12 Incertidumbre

- **Si no puedes determinar con certeza la intención del cambio, detente
  y pide aclaración. No asumas.**
- Asumir incorrectamente produce cambios que parecen lógicos pero son
  erróneos en el contexto del proyecto.

### 5.13 Variables de entorno

- **No hardcodees** tokens en el código.
- `MAPBOX_PUBLIC_TOKEN` y `GOOGLE_WEB_CLIENT_ID` están en `.env`
  (gitignored). Se acceden vía `import { VAR } from '@env'`.
- Si necesitas una nueva variable, agrégala a `.env`, `env.d.ts` y
  README.md.

### 5.14 Compatibilidad Android

- **No asumas que una dependencia funciona igual en Android e iOS.** Las dependencias como `react-native-haptic-feedback` tienen
  comportamiento distinto por plataforma. Usa `Platform.OS` donde sea
  necesario. No introduzcas dependencias solo-Android.

### 5.15 Babel plugin order

- `react-native-reanimated/plugin` debe ser el **último** en el array de
  `plugins` de `babel.config.js`. Si agregas un plugin, ponlo antes.

### 5.16 Nunca contradigas un documento existente

- Si encuentras una aparente contradicción entre dos
documentos, detén la modificación y resuelve primero la
inconsistencia documental antes de continuar.

---

## 6. Convenciones del proyecto

| Ámbito | Regla |
|--------|-------|
| UI strings | Español |
| Código (variables, funciones, tipos) | Inglés |
| Variables | camelCase |
| Componentes | PascalCase |
| Stores | camelCase + Store (`useXStore`) |
| Servicios | PascalCase + Service (`XService`) |
| Comentarios en código | Español |
| Documentación (.md) | Español |
| Estilos | `StyleSheet.create` al final del archivo |
| Commits | Conventional Commits |
| TypeScript | strict mode (`strict: true`) |

---

## 7. Actualización de documentación

| Si cambias... | Actualiza... |
|---------------|-------------|
| Un path de RTDB | `docs/FIREBASE_SCHEMA.md` |
| El flujo de datos | `docs/ARCHITECTURE.md` |
| Una decisión arquitectónica | `docs/DECISIONS.md` |
| Un bug identificado | `docs/TROUBLESHOOTING.md` |
| Un bug corregido | `docs/BUGS_RESUELTOS/` |
| Una limitación del sistema | `docs/PROJECT_CONTEXT.md` |
| Las prioridades o fases | `docs/ROADMAP.md` |
| Una regla de trabajo para IA | `AGENTS.md` |
| Una nota de revisión futura | `docs/ReviewNotes.md` |
| El setup o comandos | `README.md` |

---

## 8. Checklist pre-entrega

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] `npm test` pasa.
- [ ] No quedaron `TODO` sin resolver (a menos que la tarea lo exija).
- [ ] No quedaron `console.log` temporales.
- [ ] No hay tokens/variables hardcodeadas.
- [ ] Los stores se usaron para datos compartidos (no `useState` local
      duplicado).
- [ ] Documentación sincronizada (si cambió >1 área, todos los docs
      afectados están actualizados).
- [ ] ReviewNotes actualizadas si una nota futura quedó resuelta.
- [ ] Si se agregaron/quitaron dependencias, DECISIONS.md actualizado.

---

## 9. Filosofía de Blindaje Lógico (SYTHOR)

### Propósito

Los archivos de prueba unitaria en `__tests__/` no son "código secundario".
Son **blindajes lógicos** que protegen las funciones matemáticas y de estado
del ecosistema contra regresiones silenciosas.

### Caso de estudio: Regresión de Haversine

En octubre de 2026, una actualización de `react-native` (o un refactor de
dependencias matemáticas) podría alterar la precisión de la fórmula de
Haversine. Sin tests, el error sería invisible:

- El bus está en la Puerta Principal de la UNMSM (-12.0575, -77.0830).
- La app calcula distancia a la Biblioteca Central (-12.0585, -77.0820).
- **Sin test:** una regresión podría devolver 4km en vez de 120m. El bus
  aparece "saltando" en el mapa. No hay error de compilación, no hay crash.
  El bug pasa a producción silenciosamente.
- **Con test:** `calculateDistance.test.ts` falla al instante porque
  `expect(result).toBeGreaterThan(100)` detecta el valor anómalo.

### Regla: No eliminar tests unitarios

- **Nunca borres** `__tests__/calculateDistance.test.ts`,
  `__tests__/getMovementStatus.test.ts` o
  `__tests__/burritoLocationStore.test.ts`.
- Son la única barrera contra regresiones matemáticas en el pipeline.
- Si un refactor cambia la firma de `calculateDistance` o `getMovementStatus`,
  los tests deben actualizarse, no eliminarse.
- Si una dependencia nativa deja de ser compatible, se mockea en el test,
  no se elimina el test.

### Regla: Mock, no silencies

Cuando una función pura necesita aislarse de módulos nativos (Firebase,
Mapbox, Reanimated), se extrae a un archivo utilitario (ej. `geo.ts`,
`trackingUtils.ts`) y se prueba sin mock. Si el módulo nativo es inevitable,
se usa `jest.mock()` en el test, no se elimina la cobertura.

### Regla: Datos de simulación como documentación viva

Los casos de prueba en las tablas parametrizadas (`test.each`) son
documentación ejecutable. Definen los límites del sistema:

| Test | Qué protege |
|------|-------------|
| `calculateDistance(0,0,0,1) ≈ 111km` | Fórmula del ecuador |
| `getMovementStatus(12000, true) === 'stopped'` | Umbral de 12 segundos |
| Filtro de aduana rechaza timestamp ≤ previo | Consistencia multi-bus |

Cada uno de estos tests es un **contrato** entre el código y el
comportamiento esperado. Si el contrato se rompe, el test falla.

---

## Referencias

| Si necesitas... | Lee... |
|----------------|--------|
| Propósito del sistema | `docs/PROJECT_CONTEXT.md` |
| Flujo de datos detallado | `docs/ARCHITECTURE.md` |
| Estructura de RTDB | `docs/FIREBASE_SCHEMA.md` |
| Próximas fases | `docs/ROADMAP.md` |
| Bugs conocidos | `docs/TROUBLESHOOTING.md` |
| Decisiones arquitectónicas | `docs/DECISIONS.md` |
| Revisión futura | `docs/ReviewNotes.md` |
| Historial de bugs resueltos | `docs/BUGS_RESUELTOS/` |
| Setup del proyecto | `README.md` |

Recomendación: Si debes modificar documentación, consulta primero
ReviewNotes.md para verificar si existe alguna nota
pendiente relacionada.