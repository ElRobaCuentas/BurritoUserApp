import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AvatarId = 'ingeniero' | 'salud' | 'economista' | 'humanidades';

// 🔥 EL DICCIONARIO SANMARQUINO DEFINITIVO
const SANMARCOS_NICKNAMES: Record<AvatarId, string[]> = {
  humanidades: ['Poeta Descalzo', 'Revolucionario', 'Eterno Lector', 'Filósofo Andante'],
  salud: ['Diagnóstico Dudoso', 'Guardia Eterno', 'Anestesia Social', 'Pulso Firme'],
  ingeniero: ['Maestro del AutoCAD', 'Ingeniebrio', 'Estructuralmente Estable', 'Sin Error 404'],
  economista: ['Inflacionado', 'PBI en Crecimiento', 'Riesgo País', 'Macro Mind'],
};

export interface UserState {
  uuid: string | null;
  username: string | null;
  avatar: AvatarId | null;
  nickname: string | null; 
  isLoggedIn: boolean; 
  _hasHydrated: boolean;
  login: (uuid: string, username: string, avatar: AvatarId) => void;
  logout: () => void;
  setAvatar: (avatar: AvatarId) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uuid: null,
      username: null,
      avatar: null,
      nickname: null, 
      isLoggedIn: false, // Inicia desconectado
      _hasHydrated: false,

      login: (uuid, username, avatar) => {
        const nicknames = SANMARCOS_NICKNAMES[avatar];
        const randomNick = nicknames[Math.floor(Math.random() * nicknames.length)];
        
        set({ uuid, username, avatar, nickname: randomNick, isLoggedIn: true });
      },

      logout: () => {
        set({ uuid: null, username: null, avatar: null, nickname: null, isLoggedIn: false });
      },

      setAvatar: (avatar) => {
        const nicknames = SANMARCOS_NICKNAMES[avatar];
        const randomNick = nicknames[Math.floor(Math.random() * nicknames.length)];
        
        set({ avatar, nickname: randomNick });
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'burrito-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        uuid: state.uuid, 
        username: state.username, 
        avatar: state.avatar,
        nickname: state.nickname,
        isLoggedIn: state.isLoggedIn 
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error al leer el disco duro:", error);
        }
        // Pase lo que pase, le decimos a App.tsx que ya terminamos de cargar
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);