import React from 'react';
import { createStackNavigator} from '@react-navigation/stack';

import { useUserStore, UserState } from '../../store/userStore';

import { DrawerNavigator }        from './DrawerNavigator';
import { WelcomeScreen }          from '../../features/auth/screen/WelcomeScreen';
import { AvatarPickerScreen }     from '../../features/auth/screen/AvatarPickerScreen';
import { ForgotPasswordScreen }   from '../../features/auth/screen/ForgotPasswordScreen';
import { SignInScreen }           from '../../features/auth/screen/SignInScreen';
import { SignUpScreen }           from '../../features/auth/screen/SignUpScreen';
import { AdminPanelScreen }       from '../../features/admin/screen/AdminPanelScreen';
import { ChoferesScreen }         from '../../features/admin/screen/ChoferesScreen';
import { BusesScreen }            from '../../features/admin/screen/BusesScreen';

export type RootStackParams = {
  WelcomeScreen:        undefined;
  SignInScreen:         undefined;
  SignUpScreen:         undefined;
  ForgotPasswordScreen: undefined;
  AvatarPickerScreen:   { uid: string; displayName: string; email: string };
  MainApp:              undefined;
  AdminPanelScreen:     undefined;
  ChoferesScreen:       undefined;
  BusesScreen:          undefined;
};

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  const isLoggedIn = useUserStore((state: UserState) => state.isLoggedIn);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
          <Stack.Screen name="AdminPanelScreen" component={AdminPanelScreen} />
          <Stack.Screen name="ChoferesScreen" component={ChoferesScreen} options={{ title: 'Gestión de Conductores' }} />
          <Stack.Screen name="BusesScreen" component={BusesScreen} options={{ title: 'Gestión de Flota' }} />
        </>
      ) : ( 
        <>
          <Stack.Screen name="WelcomeScreen"       component={WelcomeScreen} />
          <Stack.Screen name="SignInScreen"        component={SignInScreen} />
          <Stack.Screen name="SignUpScreen"        component={SignUpScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen
            name="AvatarPickerScreen"
            component={AvatarPickerScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};