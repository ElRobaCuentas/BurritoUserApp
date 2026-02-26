import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// 🔥 IMPORTAMOS LOS TEMAS DE REACT NAVIGATION
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import { BrandingSplash } from './screen/BrandingSplash';
import { StackNavigator } from './navigations/StackNavigator';
import { useUserStore } from '../store/userStore'; 
import { useThemeStore } from '../store/themeStore'; 

const App = () => {
  const [isReady, setIsReady] = useState(false);
  
  const userHydrated = useUserStore((state) => state._hasHydrated);
  
  // Extraemos lo necesario del nuevo themeStore manual
  const themeHydrated = useThemeStore((state) => state._hasHydrated);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const loadThemeFromStorage = useThemeStore((state) => state.loadThemeFromStorage);

  useEffect(() => {
    // 1. OBLIGAMOS A LA APP A LEER EL DISCO DURO INMEDIATAMENTE
    loadThemeFromStorage();

    const init = async () => {
      try {
        console.log("Intentando ocultar Bootsplash...");
        setTimeout(async () => {
          await BootSplash.hide({ fade: true });
          console.log("Bootsplash ocultado con éxito");
        }, 500);
      } catch (e) {
        console.warn("Error ocultando el splash:", e);
        BootSplash.hide(); 
      }
    };
    init();
  }, []);

  const appIsFullyReady = isReady && userHydrated && themeHydrated;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {!appIsFullyReady ? (
          <BrandingSplash onFinish={() => setIsReady(true)} />
        ) : (
          /* 🔥 EL ESCUDO DEFINITIVO: 
             Si no le pasamos el "theme", tu Honor asume el mando y lo pone oscuro.
             Al pasárselo así, bloqueamos al sistema operativo. */
          <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
            <StackNavigator />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;