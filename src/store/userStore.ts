import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AvatarId = 'economista' | 'humanidades' | 'ingeniero' | 'salud';

interface UserState {
  uid: string | null; // <-- NUEVO: El DNI del celular
  username: string | null;
  avatar: AvatarId | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean; 
  setHasHydrated: (state: boolean) => void;
  setUid: (uid: string) => void; // <-- NUEVO
  setUsername: (name: string) => void;
  setAvatar: (avatarId: AvatarId) => void;
  login: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uid: null,
      username: null,
      avatar: null,
      isLoggedIn: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUid: (uid) => set({ uid }), // <-- Guardamos el UUID
      setUsername: (name) => set({ username: name }),
      setAvatar: (avatarId) => set({ avatar: avatarId }),
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ 
        uid: null,
        username: null, 
        avatar: null, 
        isLoggedIn: false 
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);