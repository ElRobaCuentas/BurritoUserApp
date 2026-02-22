import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from "react-native-bootsplash";
import { StackNavigator } from './navigations/StackNavigator';

const App = () => {
  return (
    <NavigationContainer
      onReady={() => { BootSplash.hide({ fade: true }); }}
    >
      <StackNavigator />
    </NavigationContainer>
  );
};

export default App;