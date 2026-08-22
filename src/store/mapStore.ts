import { create } from 'zustand';

interface MapState {
  command: 'center' | null;
  setCommand: (cmd: 'center' | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  command: null,
  setCommand: (cmd) => set({ command: cmd }),
}));