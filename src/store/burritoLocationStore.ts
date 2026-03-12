import { create } from 'zustand';
import { BurritoLocation } from '../features/map/types';
import { MapService } from '../features/map/services/map_service';

// < 7000ms  → 'stable' → dato fresco, bus enviando con normalidad
// 7000-10000ms → 'weak' → 2-3 ciclos sin dato nuevo, algo falla
// > 10000ms → 'lost'   → 3+ ciclos perdidos, conexión cortada
export type BusSignalStatus = 'stable' | 'weak' | 'lost';

const getSignalStatus = (timestampAge: number): BusSignalStatus => {
  if (timestampAge < 7000)  return 'stable';
  if (timestampAge < 10000) return 'weak';
  return 'lost';
};

interface BurritoStoreState {
  location: BurritoLocation | null;
  isConnecting: boolean;
  busSignalStatus: BusSignalStatus;

  actions: {
    startTracking: () => void;
    stopTracking: () => void;
  }
}

export const useBurritoStore = create<BurritoStoreState>((set) => {
  let stopBurritoLocationTracking: (() => void) | undefined;
  let onlineInterval: NodeJS.Timeout | undefined;

  return {
    location: null,
    isConnecting: false,
    busSignalStatus: 'lost',

    actions: {
      startTracking: () => {
        if (stopBurritoLocationTracking) {
          stopBurritoLocationTracking();
        }
        if (onlineInterval) {
          clearInterval(onlineInterval);
        }

        set({ isConnecting: true, location: null, busSignalStatus: 'lost' });

        stopBurritoLocationTracking = MapService.subscribeToBusLocation((newLocation) => {
          const now = Date.now();
          const busTime = newLocation?.timestamp || 0;

          set({
            location: newLocation,
            isConnecting: false,
            busSignalStatus: getSignalStatus(now - busTime)
          });
        });

        // Revisa cada 2 segundos si el timestamp sigue siendo fresco.
        // Sin este intervalo el status quedaría en 'stable' para siempre
        // aunque el bus dejara de enviar datos.
        onlineInterval = setInterval(() => {
          set((state) => {
            if (!state.location) return { busSignalStatus: 'lost' };
            const now = Date.now();
            const busTime = state.location?.timestamp || 0;
            return { busSignalStatus: getSignalStatus(now - busTime) };
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
        set({ location: null, isConnecting: false, busSignalStatus: 'lost' });
      }
    }
  };
});