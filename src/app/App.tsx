import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from "react-native-bootsplash";
import { StackNavigator } from './navigations/StackNavigator';

const App = () => {

  useEffect(() => {
    // Forzamos el cierre del splash después de 3 segundos 
    // por si el NavigationContainer se queda colgado
    const timer = setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        onReady={() => { 
          console.log("Navigation is ready");
          BootSplash.hide({ fade: true }); 
        }}
      >
        <StackNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;