import { create } from 'zustand';
import { BurritoLocation } from '../features/map/types';
import { MapService } from '../features/map/services/map_service';

export type BusMovementStatus = 'moving' | 'stopped' | 'offline';

const getMovementStatus = (timestampAge: number, isActive: boolean): BusMovementStatus => {
  if (!isActive) return 'offline';
  if (timestampAge < 12000) return 'moving';
  return 'stopped';
};

interface BurritoStoreState {
  locations: Record<string, BurritoLocation>;
  isConnecting: boolean;
  busMovementStates: Record<string, BusMovementStatus>;

  actions: {
    startTracking: () => void;
    stopTracking: () => void;
  }
}

export const useBurritoStore = create<BurritoStoreState>((set, get) => {
  let stopBusLocationsTracking: (() => void) | undefined;
  let onlineInterval: ReturnType<typeof setTimeout> | undefined;

  return {
    locations: {},
    isConnecting: false,
    busMovementStates: {},

    actions: {
      startTracking: () => {
        if (stopBusLocationsTracking) stopBusLocationsTracking();
        if (onlineInterval) clearInterval(onlineInterval);

        set({ isConnecting: true, locations: {}, busMovementStates: {} });

        stopBusLocationsTracking = MapService.subscribeToBusLocations((newLocations) => {
          const now = Date.now();

          set((state) => {
            const mergedLocations = { ...state.locations };
            const mergedStates = { ...state.busMovementStates };

            Object.entries(newLocations).forEach(([placa, loc]) => {
              const newTs = loc.timestamp || 0;
              const prevTs = state.locations[placa]?.timestamp || 0;

              // FILTRO DE ADUANA: solo actualiza si el timestamp es más nuevo
              if (newTs > 0 && prevTs > 0 && newTs <= prevTs) return;

              mergedLocations[placa] = loc;
              mergedStates[placa] = getMovementStatus(now - newTs, loc.isActive !== false);
            });

            return {
              locations: mergedLocations,
              isConnecting: false,
              busMovementStates: mergedStates,
            };
          });
        });

        // Revisa cada 2 segundos el estado de todas las placas
        onlineInterval = setInterval(() => {
          set((state) => {
            const now = Date.now();
            const newStates: Record<string, BusMovementStatus> = {};
            Object.entries(state.locations).forEach(([placa, loc]) => {
              const ts = loc.timestamp || 0;
              newStates[placa] = getMovementStatus(now - ts, loc.isActive !== false);
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
        set({ locations: {}, isConnecting: false, busMovementStates: {} });
      }
    }
  };
});