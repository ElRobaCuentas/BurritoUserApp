import React, { useEffect, useState, useRef } from 'react'; 
import { View, StyleSheet, StatusBar, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import database from '@react-native-firebase/database';

import { StackNavigator } from './navigations/StackNavigator';
import { useUserStore } from '../store/userStore'; 
import { useThemeStore } from '../store/themeStore'; 
import { AnimatedSplash } from './screen/AnimatedSplash';

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