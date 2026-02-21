import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../shared/theme/colors';
import { MapScreen } from '../../features/map/screen/MapScreen';

// Pantalla "Dummy" temporal para el perfil
const DummyProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Pantalla de Perfil</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Escondemos el header nativo
        tabBarActiveTintColor: COLORS.primary, // Color cuando está seleccionado
        tabBarInactiveTintColor: '#A0A0A0', // Gris cuando no está seleccionado
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          height: 60,
          paddingBottom: 5,
        },
      }}
    >
      <Tab.Screen 
        name="MapTab" 
        component={MapScreen} 
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, size }) => <Icon name="map" size={size + 2} color={color} />
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={DummyProfileScreen} 
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Icon name="account" size={size + 2} color={color} />
        }} 
      />
    </Tab.Navigator>
  );
};