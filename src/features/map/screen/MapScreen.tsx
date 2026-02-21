import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Map } from '../components/Map';
import { useBurritoStore } from '../../../store/burritoLocationStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { COLORS } from '../../../shared/theme/colors';

export const MapScreen = () => {
  // 1. TU LÓGICA DE ZUSTAND (Intacta)
  const { location, actions } = useBurritoStore();
  
  // 2. EL NAVEGADOR (Para poder abrir el menú lateral)
  const navigation = useNavigation();

  useEffect(() => {
    actions.startTracking();
    return () => actions.stopTracking();
  }, []);

  return (
    <View style={styles.container}>
      {/* Tu mapa conectado perfectamente a tu Store */}
      <Map burritoLocation={location} />

      {/* 🍔 EL MENÚ HAMBURGUESA FLOTANTE "DESNUDO" */}
      <SafeAreaView style={styles.hamburgerContainer}>
        <TouchableOpacity 
          activeOpacity={0.6} // Animación suave al tocar
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Icon 
            name="menu" 
            size={36} 
            color={COLORS.primary} 
            style={styles.iconShadow}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  hamburgerContainer: {
    position: 'absolute',
    top: 40, // Ajusta esto si choca con la barra de estado de tu celular
    left: 20,
    zIndex: 100, // Asegura que el botón flote por encima del mapa
  },
  iconShadow: {
    // Sombra sutil blanca para que el ícono resalte si pasa por encima de una zona oscura del mapa
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  }
});