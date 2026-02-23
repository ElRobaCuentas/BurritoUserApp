import { create } from 'zustand';
import { BurritoLocation } from '../features/map/types';
import { MapService } from '../features/map/services/map_service';

interface BurritoStoreState {
  location: BurritoLocation | null;
  isConnecting: boolean;
  isBusOnline: boolean; 
    
  actions: {
    startTracking: () => void;
    stopTracking: () => void;
  }
}

export const useBurritoStore = create<BurritoStoreState>((set) => {
  let stopBurritoLocationTracking: (() => void) | undefined;
  let onlineInterval: NodeJS.Timeout;

  return {
    location: null,
    isConnecting: false,
    isBusOnline: false,

    actions: {
      startTracking: () => {
        if (stopBurritoLocationTracking) return;

        // 1. Reset total
        set({ isConnecting: true, location: null, isBusOnline: false });

        stopBurritoLocationTracking = MapService.subscribeToBusLocation((newLocation) => {
          const now = Date.now();
          const busTime = newLocation?.timestamp || 0;
          
          // 🛡️ FILTRO DE FRESCURA INMEDIATO:
          // Si el dato que llega de Firebase tiene más de 7 segundos, lo ignoramos para el "Online"
          const isFresh = (now - busTime) < 7000;

          set({ 
            location: newLocation,
            isConnecting: false,
            isBusOnline: isFresh // Solo se pone online si el dato es reciente
          });
        });

        // 2. Mantenemos el intervalo para detectar cuando el script se apague después
        onlineInterval = setInterval(() => {
          set((state) => {
            if (!state.location) return { isBusOnline: false };
            const now = Date.now();
            const busTime = state.location?.timestamp || 0;
            const isOnline = (now - busTime) < 7000; 
            return { isBusOnline: isOnline };
          });
        }, 2000);
      },

      stopTracking: () => {
        if (stopBurritoLocationTracking) {
          stopBurritoLocationTracking();
          stopBurritoLocationTracking = undefined;
        }
        if (onlineInterval) clearInterval(onlineInterval);
        set({ location: null, isConnecting: false, isBusOnline: false });
      }
    }
  };
});