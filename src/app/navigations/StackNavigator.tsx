import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import { useUserStore, UserState } from '../../store/userStore';

import { LoginScreen } from '../../features/auth/screen/LoginScreen'; 
import { DrawerNavigator } from './DrawerNavigator';
import { LoadingScreen } from '../screen/LoadingScreen';

export type RootStackParams = {
  LoginScreen: undefined;
  MainApp: undefined;
  LoadingScreen: undefined;
};

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  const isLoggedIn = useUserStore((state: UserState) => state.isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      ) : (
        <>
          <Stack.Screen 
            name="LoginScreen" 
            component={LoginScreen} 
            options={{
              // 🔥 SOLUCIÓN 1: Eliminamos el "pop" (arrastre) y ponemos un Fade (desvanecimiento)
              // Esto hace que el mapa simplemente desaparezca suavemente hacia el Login, sin tirones.
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
            }}
          />
          <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};