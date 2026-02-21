import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { BottomTabNavigator } from './BottomTabNavigator';
import { COLORS } from '../../shared/theme/colors';

const Drawer = createDrawerNavigator();

// 🦴 EL ESQUELETO DEL MENÚ LATERAL
const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        {/* Foto de Portada (Cover) */}
        <View style={styles.coverPhoto} />
        
        {/* Info del Usuario */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatar} />
          <Text style={styles.userName}>Juan Pérez</Text>
          <Text style={styles.userEmail}>juan.perez@unmsm.edu.pe</Text>
        </View>
      </View>

      {/* Aquí irían las futuras opciones (Historial, Configuración, etc.) */}
    </DrawerContentScrollView>
  );
};

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // El botón hamburguesa lo haremos nosotros a mano
        drawerStyle: { width: 280 }, // Ancho profesional
      }}
    >
      {/* El Drawer envuelve a los Tabs */}
      <Drawer.Screen name="MainTabs" component={BottomTabNavigator} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: { marginBottom: 20 },
  coverPhoto: { 
    height: 140, 
    backgroundColor: COLORS.primary, // Temporal hasta que haya imagen
    opacity: 0.8 
  },
  userInfoSection: { 
    paddingHorizontal: 20, 
    marginTop: -40 // Esto hace que el avatar "muerda" la portada
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#E0E0E0', 
    borderWidth: 3, 
    borderColor: '#FFFFFF',
    elevation: 5,
  },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10 },
  userEmail: { fontSize: 14, color: '#666666' },
});