import { create } from 'zustand';
import { BurritoLocation } from '../features/map/types';
import { MapService } from '../features/map/services/map_service';
import { calculateDistance } from '../features/map/utils/geo';
import {
  createMovementMemory,
  evaluateMovementEvidence,
  nextMovementStatus,
  MovementMemory,
} from '../features/map/utils/movement';

export const CONNECTION_TIMEOUT_MS = 10000;

// C4.6: la DriverApp publica cada 8s como máximo gracias al heartbeat
// (T4.1); el peor caso teórico del setInterval es ~16s. 30s cubren esa
// ventana con margen: pasada esa edad sin actualización, el servicio
// realmente se cortó (red, app cerrada, bus apagado) y el bus debe dejar
// de mostrarse (se trata como offline aunque isActive siga en true). No es
// detección de red: solo depende de la antigüedad del timestamp, sea cual
// sea la causa del corte.
export const BUS_STALE_AFTER_MS = 30000;

// C4.6: desplazamiento mínimo (metros) entre dos publicaciones consecutivas
// para considerar que el bus se mueve (estrategia A, histórica).
// Ya NO decide el estado en vivo: se conserva únicamente para comparación
// offline A vs C, tests y simulación.
// RC: 15m estaba sobrecalibrado para la cadencia real de ~1s (bus a 47 km/h
// produce 11-13m por pareja, bajo 15m). 8m separa jitter quieto (<5m) de
// movimiento real de bus (>10m por pareja).
export const MOVEMENT_THRESHOLD_M = 8;

// C4.6 EXPERIMENTAL: la decisión en vivo usa la estrategia C (distancia + Δt +
// speed condicional + memoria de estado) definida en features/map/utils/movement.ts.
// Los parámetros de ese módulo son CALIBRACIÓN PENDIENTE, no valores definitivos.

// Diagnóstico temporal para la prueba de campo. Cuando está activo, cada
// actualización de estado registra por qué se decidió MOVIMIENTO/PARADERO.
// Se elimina al terminar la evaluación: no es logging de producción.
export const CALIB_LOG_ENABLED = false;

// C4.6: heurística de fallback para el primer snapshot de un bus (aún no
// hay desplazamiento previo): con edad menor a esta se asume moving, si no
// stopped.
export const MOVING_FALLBACK_AFTER_MS = 12000;

export type BusMovementStatus = 'moving' | 'stopped' | 'offline';

// C4.6: un bus está offline si no está activo o si su timestamp superó el
// umbral de expiración. Independiente del movimiento.
export const isBusOffline = (timestampAge: number, isActive: boolean): boolean =>
  !isActive || timestampAge >= BUS_STALE_AFTER_MS;

// C4.6: un bus se mueve si el desplazamiento entre publicaciones superó el
// umbral. Independiente de la edad del timestamp.
export const isBusMoving = (displacementMeters: number): boolean =>
  displacementMeters > MOVEMENT_THRESHOLD_M;

export interface MovementContext {
  timestampAge: number;
  isActive: boolean;
  displacementMeters: number | undefined;
}

// C4.6: orquestador de la estrategia A (histórica). Compone los predicados
// isBusOffline/isBusMoving: offline si expiración, moving si desplazamiento >
// umbral, stopped si no. Solo cuando aún no hay desplazamiento previo (primer
// snapshot, displacementMeters === undefined) cae a la heurística de edad.
// NO se usa en la decisión en vivo de la estrategia C (ver computeLiveStatus).
export const getMovementStatus = ({
  timestampAge,
  isActive,
  displacementMeters,
}: MovementContext): BusMovementStatus => {
  if (isBusOffline(timestampAge, isActive)) return 'offline';

  if (displacementMeters === undefined) {
    return timestampAge < MOVING_FALLBACK_AFTER_MS ? 'moving' : 'stopped';
  }

  return isBusMoving(displacementMeters) ? 'moving' : 'stopped';
};

// C4.6 EXPERIMENTAL — estrategia C. Decide el estado en vivo a partir de:
// distancia + Δt + speed condicional + memoria de estado. La expiración
// (offline) se mantiene independiente: la estrategia C solo decide entre
// 'moving' y 'stopped' cuando existen datos utilizables.
export interface LiveMovementInput {
  timestampAge: number;
  isActive: boolean;
  prevMemory: MovementMemory | undefined;
  dist: number;
  dtMs: number;
  speedMps: number;
}

export const computeLiveStatus = ({
  timestampAge,
  isActive,
  prevMemory,
  dist,
  dtMs,
  speedMps,
}: LiveMovementInput): { status: BusMovementStatus; memory: MovementMemory } => {
  if (isBusOffline(timestampAge, isActive)) {
    return { status: 'offline', memory: prevMemory ?? createMovementMemory('stopped') };
  }

  const initialStatus =
    timestampAge < MOVING_FALLBACK_AFTER_MS ? 'moving' : 'stopped';

  // Primer snapshot de un bus: aún no hay pareja previa (dist y dtMs forzados
  // a 0), así que NO se evalúa evidencia ni se acumula weakCount. La memoria
  // arranca limpia y la primera pareja real es la que decide.
  if (!prevMemory) {
    const memory = createMovementMemory(initialStatus);
    return { status: memory.status, memory };
  }

  const memory = nextMovementStatus(
    prevMemory,
    evaluateMovementEvidence({ dist, dtMs, speedMps }),
  );

  return { status: memory.status, memory };
};

interface BurritoStoreState {
  locations: Record<string, BurritoLocation>;
  isConnecting: boolean;
  connectionError: boolean;
  busMovementStates: Record<string, BusMovementStatus>;
  movementDisplacements: Record<string, number | undefined>;
  movementMemory: Record<string, MovementMemory>;

  actions: {
    startTracking: () => void;
    stopTracking: () => void;
  }
}

export const useBurritoStore = create<BurritoStoreState>((set) => {
  let stopBusLocationsTracking: (() => void) | undefined;
  let onlineInterval: ReturnType<typeof setTimeout> | undefined;
  let connectTimeout: ReturnType<typeof setTimeout> | undefined;

  return {
    locations: {},
    isConnecting: false,
    connectionError: false,
    busMovementStates: {},
    movementDisplacements: {},
    movementMemory: {},

    actions: {
      startTracking: () => {
        if (stopBusLocationsTracking) stopBusLocationsTracking();
        if (onlineInterval) clearInterval(onlineInterval);
        if (connectTimeout) clearTimeout(connectTimeout);

        set({ isConnecting: true, connectionError: false, locations: {}, busMovementStates: {}, movementDisplacements: {}, movementMemory: {} });

        stopBusLocationsTracking = MapService.subscribeToBusLocations((newLocations) => {
          if (connectTimeout) clearTimeout(connectTimeout);

          const now = Date.now();

          set((state) => {
            const mergedLocations = { ...state.locations };
            const mergedStates = { ...state.busMovementStates };
            const mergedDisplacements = { ...state.movementDisplacements };
            const mergedMemory = { ...state.movementMemory };

            Object.entries(newLocations).forEach(([placa, loc]) => {
              const newTs = loc.timestamp || 0;
              const prevTs = state.locations[placa]?.timestamp || 0;

              // FILTRO DE ADUANA: solo actualiza si el timestamp es más nuevo
              if (newTs > 0 && prevTs > 0 && newTs <= prevTs) return;

              const prevLoc = state.locations[placa];
              // C4.6: desplazamiento entre la posición previa aceptada y la
              // nueva. undefined en el primer snapshot (no hay posición previa).
              const displacementMeters = prevLoc
                ? calculateDistance(prevLoc.latitude, prevLoc.longitude, loc.latitude, loc.longitude)
                : undefined;
              const dtMs = prevTs > 0 ? newTs - prevTs : 0;
              const prevMemory = state.movementMemory[placa];

              // C4.6 EXPERIMENTAL: decisión en vivo por estrategia C.
              // MOVEMENT_THRESHOLD_M (estrategia A) NO participa aquí.
              const live = computeLiveStatus({
                timestampAge: now - newTs,
                isActive: loc.isActive !== false,
                prevMemory,
                dist: displacementMeters ?? 0,
                dtMs,
                speedMps: loc.speed ?? 0,
              });

              const previousStatus = prevMemory?.status;
              const transition =
                prevMemory && prevMemory.status !== live.status ? 'CHANGE' : 'NONE';

              // Diagnóstico temporal (prueba de campo). Se elimina tras evaluar.
              if (CALIB_LOG_ENABLED) {
                const vCalc = dtMs > 0 ? (displacementMeters ?? 0) / (dtMs / 1000) : 0;
                console.log(
                  `[C4.6] ${JSON.stringify({
                    placa,
                    dist: Math.round((displacementMeters ?? 0) * 100) / 100,
                    dtMs,
                    vCalc: Math.round(vCalc * 100) / 100,
                    speed: loc.speed ?? 0,
                    evidence: evaluateMovementEvidence({
                      dist: displacementMeters ?? 0,
                      dtMs,
                      speedMps: loc.speed ?? 0,
                    }),
                    previousStatus: previousStatus ?? 'first',
                    status: live.status,
                    transition,
                    weakCount: live.memory.weakCount,
                  })}`,
                );
              }

              mergedLocations[placa] = loc;
              mergedDisplacements[placa] = displacementMeters;
              mergedMemory[placa] = live.memory;
              mergedStates[placa] = live.status;
            });

            return {
              locations: mergedLocations,
              isConnecting: false,
              connectionError: false,
              busMovementStates: mergedStates,
              movementDisplacements: mergedDisplacements,
              movementMemory: mergedMemory,
            };
          });
        }, () => {
          if (connectTimeout) clearTimeout(connectTimeout);
          set({ isConnecting: false, connectionError: true });
        });

        // Si el listener no entrega ningún snapshot ni error en CONNECTION_TIMEOUT_MS,
        // se marca el estado degradado en vez de quedarse cargando indefinidamente.
        connectTimeout = setTimeout(() => {
          set({ isConnecting: false, connectionError: true });
        }, CONNECTION_TIMEOUT_MS);

        // Revisa cada 2 segundos el estado de todas las placas. Solo refleja la
        // expiración (offline): la memoria de movimiento NO avanza aquí porque
        // no hay snapshot nuevo; solo lo hace en el listener con datos reales.
        onlineInterval = setInterval(() => {
          set((state) => {
            const now = Date.now();
            const newStates: Record<string, BusMovementStatus> = {};
            Object.entries(state.locations).forEach(([placa, loc]) => {
              const ts = loc.timestamp || 0;
              const memory = state.movementMemory[placa];
              if (isBusOffline(now - ts, loc.isActive !== false)) {
                newStates[placa] = 'offline';
              } else {
                newStates[placa] = memory?.status ?? 'stopped';
              }
            });
            return { busMovementStates: newStates };
          });
        }, 2000);
      },

      stopTracking: () => {
        if (stopBusLocationsTracking) {
          stopBusLocationsTracking();
          stopBusLocationsTracking = undefined;
        }
        if (onlineInterval) {
          clearInterval(onlineInterval);
          onlineInterval = undefined;
        }
        if (connectTimeout) {
          clearTimeout(connectTimeout);
          connectTimeout = undefined;
        }
        set({ locations: {}, isConnecting: false, connectionError: false, busMovementStates: {}, movementDisplacements: {}, movementMemory: {} });
      }
    }
  };
});