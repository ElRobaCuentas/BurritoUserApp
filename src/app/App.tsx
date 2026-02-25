import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash'; // <-- 1. Importamos Bootsplash
import { BrandingSplash } from './screen/BrandingSplash';
import { StackNavigator } from './navigations/StackNavigator';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  // 2. Usamos useEffect para ocultar el splash nativo ni bien React Native esté listo
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Intentando ocultar Bootsplash...");
        // Le damos un pequeño respiro de 500ms para que JS se asiente
        setTimeout(async () => {
          await BootSplash.hide({ fade: true });
          console.log("Bootsplash ocultado con éxito");
        }, 500);
      } catch (e) {
        console.warn("Error ocultando el splash:", e);
        // Si falla, intentamos ocultarlo sin animaciones
        BootSplash.hide(); 
      }
    };
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {!isReady ? (
          <BrandingSplash onFinish={() => setIsReady(true)} />
        ) : (
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;