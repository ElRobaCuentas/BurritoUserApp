import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  username: string | null;
  avatar: string | null;
  hasProfile: boolean;
  setProfile: (name: string, avatar: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      avatar: null,
      hasProfile: false,
      setProfile: (username, avatar) => set({ username, avatar, hasProfile: true }),
      logout: () => set({ username: null, avatar: null, hasProfile: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);