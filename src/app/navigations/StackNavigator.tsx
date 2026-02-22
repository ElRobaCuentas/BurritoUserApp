import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useUserStore } from '../../store/userStore';

// Pantallas
import { HomeScreen } from '../../features/home/screen/HomeScreen';
import { MapScreen } from '../../features/map/screen/MapScreen';
import { LoadingScreen } from '../screen/LoadingScreen';

// 1. Definimos los parámetros de las rutas
export type RootStackParams = {
  HomeScreen: undefined;
  MainApp: undefined;
  LoadingScreen: undefined;
};

// 2. ¡AQUÍ ESTÁ LA SOLUCIÓN! Inicializamos el objeto Stack
const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  // Leemos el estado global del usuario
  const hasProfile = useUserStore((state) => state.hasProfile);

  return (
    <Stack.Navigator
      // Si ya tiene perfil, lo mandamos al mapa, si no, a la bienvenida
      initialRouteName={hasProfile ? 'MainApp' : 'HomeScreen'}
      screenOptions={{ headerShown: false }}
    >
      {/* Si no tiene perfil, solo mostramos HomeScreen. 
          Esto evita que un usuario curioso "vuelva atrás" al login 
          una vez que ya está en el mapa.
      */}
      {!hasProfile ? (
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      ) : (
        <>
          <Stack.Screen name="MainApp" component={MapScreen} />
          <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};