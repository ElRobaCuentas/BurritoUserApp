import React, { useEffect, useRef } from 'react'; 
import { StatusBar, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

import { StackNavigator } from './navigations/StackNavigator';
import { useUserStore } from '../store/userStore'; 
import { useThemeStore } from '../store/themeStore'; 
import BootSplash from 'react-native-bootsplash';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#00AEEF',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212',
  },
};

const App = () => {
  const appState = useRef(AppState.currentState);

  const userHydrated        = useUserStore((state: any) => state._hasHydrated);
  const themeHydrated       = useThemeStore((state: any) => state._hasHydrated);
  const isDarkMode          = useThemeStore((state: any) => state.isDarkMode);
  const loadThemeFromStorage = useThemeStore((state: any) => state.loadThemeFromStorage);

  const appIsFullyReady = userHydrated && themeHydrated;

  // ── Firebase Realtime DB: offline cuando la app va a segundo plano ────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        database().goOffline();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        database().goOnline();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // ── Watchdog de sesión ────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      const isLoggedIn = useUserStore.getState().isLoggedIn;
      if (isLoggedIn && !firebaseUser) {
        useUserStore.getState().logout();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#00AEEF' }}>
      <SafeAreaProvider>
        
        <StatusBar 
          backgroundColor={isDarkMode ? '#000' : '#FFF'} 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          animated={true}
        />
        
        {appIsFullyReady && (
          <NavigationContainer
            theme={isDarkMode ? CustomDarkTheme : CustomLightTheme}
            onReady={() => {
              requestAnimationFrame(() => BootSplash.hide({ fade: true }));
            }}
          >
            <StackNavigator />
          </NavigationContainer>
        )}

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;