import { create } from 'zustand';

interface MapState {
  isFollowing: boolean;
  setIsFollowing: (val: boolean) => void;
  command: 'center' | 'follow' | null;
  setCommand: (cmd: 'center' | 'follow' | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  isFollowing: false, 
  setIsFollowing: (val) => set({ isFollowing: val }),
  command: null,
  setCommand: (cmd) => set({ command: cmd }),
}));