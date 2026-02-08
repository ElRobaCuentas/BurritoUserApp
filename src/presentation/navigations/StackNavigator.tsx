import { createStackNavigator } from '@react-navigation/stack';
import { LoadingScreen } from '../screens/loading/LoadingScreen';
import { PermissionsScreen } from '../screens/permissions/PermissionsScreen';
import { MapScreen } from '../screens/maps/MapScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
export type RootStackParams = {
    LoadingScreen: undefined;
    PermissionsScreen: undefined;
    MapScreen: undefined;
    HomeScreen: undefined;
}


const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () =>  {
  return (
    <Stack.Navigator
        initialRouteName='HomeScreen'
        screenOptions={{
            headerShown: false,
            cardStyle: {
                backgroundColor: 'white'
            }
        }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="PermissionsScreen" component={PermissionsScreen} />
    </Stack.Navigator>
  );
}