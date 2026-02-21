import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../../features/home/screen/HomeScreen';
import { LoadingScreen } from '../screen/LoadingScreen';
import { DrawerNavigator } from './DrawerNavigator';

export type RootStackParams = {
    LoadingScreen: undefined;
    HomeScreen: undefined;
    MainApp: undefined; // 👈 Nuevo nombre para la app principal
}

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () =>  {
  return (
    <Stack.Navigator
        initialRouteName='HomeScreen'
        screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'white' }
        }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
      <Stack.Screen name="MainApp" component={DrawerNavigator} /> 
    </Stack.Navigator>
  );
}