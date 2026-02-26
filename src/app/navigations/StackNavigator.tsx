import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
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
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <Stack.Navigator
      initialRouteName={isLoggedIn ? 'MainApp' : 'LoginScreen'} 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
     <Stack.Screen name="MainApp" component={DrawerNavigator} />      
     <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
      
    </Stack.Navigator>
  );
};