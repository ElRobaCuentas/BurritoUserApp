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

interface UserState {
  uuid: string | null;
  username: string | null;
  avatar: AvatarId | null;
  nickname: string | null; 
  isLoggedIn: boolean; // 🔥 RESTAURAMOS LA BANDERA DE AUTENTICACIÓN
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

      // Al loguearse, le asignamos su apodo aleatorio Y le damos el pase VIP
      login: (uuid, username, avatar) => {
        const nicknames = SANMARCOS_NICKNAMES[avatar];
        const randomNick = nicknames[Math.floor(Math.random() * nicknames.length)];
        
        // 🔥 isLoggedIn: true es lo que evita que te vuelva a pedir los datos
        set({ uuid, username, avatar, nickname: randomNick, isLoggedIn: true });
      },

      // Borramos todo al salir
      logout: () => set({ uuid: null, username: null, avatar: null, nickname: null, isLoggedIn: false }),

      // Si cambia de avatar en la app, lo volvemos a bautizar
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
      // 🔥 Guardamos TODO en la memoria, incluyendo que ya está logueado
      partialize: (state) => ({ 
        uuid: state.uuid, 
        username: state.username, 
        avatar: state.avatar,
        nickname: state.nickname,
        isLoggedIn: state.isLoggedIn // ¡ESTO FALTABA!
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);