import { create } from 'zustand';

// 1️⃣ DEFINIMOS LOS NUEVOS IDs BASADOS EN TUS IMÁGENES (EN MINÚSCULAS)
export type AvatarId = 'economista' | 'humanidades' | 'ingeniero' | 'salud';

interface UserState {
  username: string | null;
  avatar: AvatarId | null; // Usamos el nuevo tipo
  isLoggedIn: boolean;
  setUsername: (name: string) => void;
  setAvatar: (avatarId: AvatarId) => void;
  login: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: null,
  avatar: null,
  isLoggedIn: false,
  setUsername: (name) => set({ username: name }),
  setAvatar: (avatarId) => set({ avatar: avatarId }),
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ 
    username: null, 
    avatar: null, 
    isLoggedIn: false 
  }),
}));