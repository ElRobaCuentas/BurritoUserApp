import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Hook de seguridad
import { COLORS } from '../../../shared/theme/colors';

interface FABProps {
  isFollowingBus: boolean;
  onFollowBus: () => void;
  onCenterMap: () => void;
}

export const FAB = ({ isFollowingBus, onFollowBus, onCenterMap }: FABProps) => {
  const insets = useSafeAreaInsets(); // Detectamos el borde inferior real

  return (
    <View 
      style={[
        styles.container, 
        { 
          // Posición dinámica: Borde seguro + 20px de margen
          bottom: Platform.OS === 'android' ? insets.bottom + 20 : insets.bottom + 10 
        }
      ]}
    >
      
      {/* Botón de Centrado Panorámico */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={onCenterMap} 
        activeOpacity={0.8}
      >
        <Icon name="map-outline" size={24} color="#1A1A1A" />
      </TouchableOpacity>

      {/* Botón de Seguimiento al Burrito */}
      <TouchableOpacity 
        style={[styles.button, isFollowingBus && styles.buttonActive]} 
        onPress={onFollowBus} 
        activeOpacity={0.8}
      >
        <Icon 
          name={isFollowingBus ? "crosshairs-gps" : "crosshairs"} 
          size={24} 
          color={isFollowingBus ? "#FFFFFF" : "#1A1A1A"} 
        />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20, // Se mantiene a la derecha
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    width: 52, // Un poquito más grande para mejor 'tappability'
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8, // Sombra más marcada para que resalte sobre el mapa
    marginBottom: 12, 
  },
  buttonActive: {
    backgroundColor: COLORS.primary, 
    elevation: 12, // Efecto de estar 'más arriba' cuando está activo
  }
});