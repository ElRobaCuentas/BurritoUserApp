import { create } from 'zustand';
import { BurritoLocation } from '../features/map/types';
import { MapService } from '../features/map/services/map_service';

// NUEVA SEMÁNTICA: 
// < 12000ms  → 'moving'  → Dato fresco, bus avanzando
// > 12000ms  → 'stopped' → Silencio del GPS por estar quieto en paradero
// isActive: false → 'offline' → Conductor finalizó el recorrido
export type BusMovementStatus = 'moving' | 'stopped' | 'offline';

const getMovementStatus = (timestampAge: number, isActive: boolean): BusMovementStatus => {
  if (!isActive) return 'offline';
  if (timestampAge < 12000) return 'moving';
  return 'stopped';
};

interface BurritoStoreState {
  location: BurritoLocation | null;
  isConnecting: boolean;
  busMovementStatus: BusMovementStatus;

  actions: {
    startTracking: () => void;
    stopTracking: () => void;
  }
}

export const useBurritoStore = create<BurritoStoreState>((set, get) => {
  let stopBurritoLocationTracking: (() => void) | undefined;
  let onlineInterval: ReturnType<typeof setTimeout> | undefined;

  return {
    location: null,
    isConnecting: false,
    busMovementStatus: 'offline',

    actions: {
      startTracking: () => {
        if (stopBurritoLocationTracking) stopBurritoLocationTracking();
        if (onlineInterval) clearInterval(onlineInterval);

        set({ isConnecting: true, location: null, busMovementStatus: 'offline' });

        stopBurritoLocationTracking = MapService.subscribeToBusLocation((newLocation) => {
          const now = Date.now();
          const newTimestamp = newLocation?.timestamp || 0;
          const isActive = newLocation?.isActive !== false;

          // --- FILTRO DE ADUANA ---
          const currentTimestamp = get().location?.timestamp || 0;
          if (newTimestamp > 0 && currentTimestamp > 0 && newTimestamp <= currentTimestamp) {
            return; 
          }

          set({
            location: newLocation,
            isConnecting: false,
            busMovementStatus: getMovementStatus(now - newTimestamp, isActive)
          });
        });

        // Revisa cada 2 segundos el estado
        onlineInterval = setInterval(() => {
          set((state) => {
            if (!state.location) return { busMovementStatus: 'offline' };
            const now = Date.now();
            const busTime = state.location?.timestamp || 0;
            const isActive = state.location?.isActive !== false;
            return { busMovementStatus: getMovementStatus(now - busTime, isActive) };
          });
        }, 2000);
      },

      stopTracking: () => {
        if (stopBurritoLocationTracking) {
          stopBurritoLocationTracking();
          stopBurritoLocationTracking = undefined;
        }
        if (onlineInterval) {
          clearInterval(onlineInterval);
          onlineInterval = undefined;
        }
        set({ location: null, isConnecting: false, busMovementStatus: 'offline' });
      }
    }
  };
});