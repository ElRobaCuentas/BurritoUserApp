import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useUserStore } from '../../store/userStore';

// Pantallas
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
  // Extraemos el estado de login
  const isLoggedIn = useUserStore((state: { isLoggedIn: any; }) => state.isLoggedIn);

  return (
    <Stack.Navigator
      // Si está logueado va al MainApp, si no al Login
      initialRouteName={isLoggedIn ? 'MainApp' : 'LoginScreen'} 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="MainApp" component={DrawerNavigator} />      
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
    </Stack.Navigator>
  );
};