import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native'; // Importamos el motor de UI de React Native

interface ThemeState {
  isDarkMode: boolean;
  _hasHydrated: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
  loadThemeFromStorage: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: false, 
  _hasHydrated: false, 

  toggleTheme: async () => {
    const newTheme = !get().isDarkMode;
    set({ isDarkMode: newTheme });
    Appearance.setColorScheme(newTheme ? 'dark' : 'light'); // Bloqueamos RN
    await AsyncStorage.setItem('@burrito_theme', JSON.stringify(newTheme));
  },

  setTheme: async (isDark) => {
    set({ isDarkMode: isDark });
    Appearance.setColorScheme(isDark ? 'dark' : 'light');
    await AsyncStorage.setItem('@burrito_theme', JSON.stringify(isDark));
  },

  loadThemeFromStorage: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@burrito_theme');
      if (savedTheme !== null) {
        const isDark = JSON.parse(savedTheme);
        set({ isDarkMode: isDark });
        Appearance.setColorScheme(isDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.log("Error leyendo el tema:", error);
    } finally {
      set({ _hasHydrated: true });
    }
  }
}));