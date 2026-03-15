import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import { useUserStore, UserState } from '../../store/userStore';

import { DrawerNavigator } from './DrawerNavigator';
import { LoadingScreen }   from '../screen/LoadingScreen';
import { WelcomeScreen } from '../../features/auth/screen/WelcomeScreen';
import { AvatarPickerScreen } from '../../features/auth/screen/AvatarPickerScreen';
import { ForgotPasswordScreen } from '../../features/auth/screen/ForgotPasswordScreen';
import { SignInScreen } from '../../features/auth/screen/SignInScreen';
import { SignUpScreen } from '../../features/auth/screen/SignUpScreen';


export type RootStackParams = {
  // Auth
  WelcomeScreen:       undefined;
  SignInScreen:        undefined;
  SignUpScreen:        undefined;
  ForgotPasswordScreen: undefined;
  AvatarPickerScreen:  { uid: string; displayName: string; email: string };
  // App
  MainApp:             undefined;
  LoadingScreen:       undefined;
};

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  const isLoggedIn = useUserStore((state: UserState) => state.isLoggedIn);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
      }}
    >
      {isLoggedIn ? (
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      ) : (
        <>
          <Stack.Screen name="WelcomeScreen"        component={WelcomeScreen} />
          <Stack.Screen name="SignInScreen"          component={SignInScreen} />
          <Stack.Screen name="SignUpScreen"          component={SignUpScreen} />
          <Stack.Screen name="ForgotPasswordScreen"  component={ForgotPasswordScreen} />
          <Stack.Screen
            name="AvatarPickerScreen"
            component={AvatarPickerScreen}
            options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }}
          />
        </>
      )}

      {/* LoadingScreen disponible siempre por si se necesita */}
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
    </Stack.Navigator>
  );
};