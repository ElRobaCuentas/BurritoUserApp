import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useUserStore } from '../../store/userStore';

// Pantallas
import { LoginScreen } from '../../features/auth/screen/LoginScreen'; 
import { DrawerNavigator } from './DrawerNavigator';
import { LoadingScreen } from '../screen/LoadingScreen';

// Definición de las rutas del Stack
export type RootStackParams = {
  LoginScreen: undefined;
  MainApp: undefined;
  LoadingScreen: undefined;
};

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Pequeño delay para que Zustand cargue los datos del storage
    const timeout = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  // Mientras el Store se prepara, mostramos una pantalla blanca de seguridad
  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <Stack.Navigator
      // 🛠️ MODO DESARROLLO: 
      // Forzamos 'LoginScreen' para que puedas pulir el diseño.
      // Cuando termines, cámbialo a: {hasProfile ? 'MainApp' : 'LoginScreen'}
      initialRouteName={isLoggedIn ? 'MainApp' : 'LoginScreen'} 
      screenOptions={{ headerShown: false }}
    >
      {/* IMPORTANTE: Ponemos las pantallas fuera de condicionales 
          mientras pules el diseño para que el Navigator siempre las encuentre.
      */}
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
     <Stack.Screen name="MainApp" component={DrawerNavigator} />      
     <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
      
    </Stack.Navigator>
  );
};