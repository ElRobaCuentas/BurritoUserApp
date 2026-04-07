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

// OJO AQUÍ: Agregué 'get' al lado de 'set'
export const useBurritoStore = create<BurritoStoreState>((set, get) => {
  let stopBurritoLocationTracking: (() => void) | undefined;
  let onlineInterval: ReturnType<typeof setTimeout> | undefined;

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
          const newTimestamp = newLocation?.timestamp || 0;

          // --- INICIO DEL FILTRO DE ADUANA ---
          const currentTimestamp = get().location?.timestamp || 0;
          
          if (newTimestamp > 0 && currentTimestamp > 0 && newTimestamp <= currentTimestamp) {
            // El dato es más viejo o igual al que ya tenemos en pantalla.
            // Lo ignoramos haciendo un return para que no actualice el estado del mapa.
            console.log("🛑 FILTRO: Dato viejo rechazado", newTimestamp);
            return; 
          }
          // --- FIN DEL FILTRO DE ADUANA ---

          set({
            location: newLocation,
            isConnecting: false,
            busSignalStatus: getSignalStatus(now - newTimestamp)
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