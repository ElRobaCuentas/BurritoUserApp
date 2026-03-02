import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';

import { StackNavigator } from './navigations/StackNavigator';
import { useUserStore } from '../store/userStore'; 
import { useThemeStore } from '../store/themeStore'; 
import { AnimatedSplash } from './screen/AnimatedSplash';

const App = () => {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  
  const userHydrated = useUserStore((state: any) => state._hasHydrated);
  const themeHydrated = useThemeStore((state: any) => state._hasHydrated);
  const isDarkMode = useThemeStore((state: any) => state.isDarkMode);
  const loadThemeFromStorage = useThemeStore((state: any) => state.loadThemeFromStorage);

  const appIsFullyReady = userHydrated && themeHydrated;

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  if (!appIsFullyReady) {
    return null; 
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#00AEEF' }}>
      <SafeAreaProvider>
        
        {/* 🔥 PRO TWEAK: Hacemos que la barra superior se fusione con la app */}
        <StatusBar 
          backgroundColor={showAnimatedSplash ? '#00AEEF' : (isDarkMode ? '#000' : '#FFF')} 
          barStyle={showAnimatedSplash ? 'light-content' : (isDarkMode ? 'light-content' : 'dark-content')}
          animated={true}
        />
        
        <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
          <StackNavigator />
        </NavigationContainer>

        {/* EL TELÓN ANIMADO */}
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