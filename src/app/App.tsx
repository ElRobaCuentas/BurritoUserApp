// src/app/App.tsx
import React, { useEffect, useState, useRef } from 'react'; 
import { View, StyleSheet, StatusBar, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth'; // 🔥 NUEVO: Importamos auth para el Watchdog

//inicialización de Google Sign-In
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { StackNavigator } from './navigations/StackNavigator';
import { useUserStore } from '../store/userStore'; 
import { useThemeStore } from '../store/themeStore'; 
import { AnimatedSplash } from './screen/AnimatedSplash';

// Configuración global de Google Sign-In con tu Web Client ID (tipo 3)
GoogleSignin.configure({
  webClientId: '677410027288-l5heitld12behdgnqf69rgkav0c6kbvc.apps.googleusercontent.com',
  offlineAccess: true,
});

const App = () => {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  
  const appState = useRef(AppState.currentState);

  const userHydrated = useUserStore((state: any) => state._hasHydrated);
  const themeHydrated = useThemeStore((state: any) => state._hasHydrated);
  const isDarkMode = useThemeStore((state: any) => state.isDarkMode);
  const loadThemeFromStorage = useThemeStore((state: any) => state.loadThemeFromStorage);

  const appIsFullyReady = userHydrated && themeHydrated;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        database().goOffline();
      } 
      else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        database().goOnline();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // ── 🔥 NUEVO: FIREBASE WATCHDOG (Guillotina Instantánea) ──
  // No bloquea el AnimatedSplash. Se ejecuta silenciosamente.
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      // Usamos .getState() para no causar re-renders innecesarios en App.tsx
      const isLoggedIn = useUserStore.getState().isLoggedIn;
      
      // Si Zustand dice "estoy dentro", pero Firebase dice "token inválido/borrado"
      if (isLoggedIn && !firebaseUser) {
        console.log("Watchdog: Token de Firebase ausente. Limpiando estado...");
        useUserStore.getState().logout();
      }
    });

    return () => unsubscribe(); // El listener solo se crea 1 vez ✅
  }, []);
  // ─────────────────────────────────────────────────────────

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#00AEEF' }}>
      <SafeAreaProvider>
        
        <StatusBar 
          backgroundColor={showAnimatedSplash ? '#00AEEF' : (isDarkMode ? '#000' : '#FFF')} 
          barStyle={showAnimatedSplash ? 'light-content' : (isDarkMode ? 'light-content' : 'dark-content')}
          animated={true}
        />
        
        {appIsFullyReady && (
          <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
            <StackNavigator />
          </NavigationContainer>
        )}

        {showAnimatedSplash && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
            <AnimatedSplash onFinish={() => setShowAnimatedSplash(false)} />
          </View>
        )}

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;