import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../shared/theme/colors';

interface FABProps {
  isFollowingBus: boolean;
  onFollowBus: () => void;
  onCenterMap: () => void;
  // ✅ NUEVO: cuando el bus está inactivo, el botón de seguimiento se deshabilita.
  // No tiene sentido permitir "seguir" un bus que no existe en el mapa.
  isBusActive: boolean;
}

export const FAB = ({ isFollowingBus, onFollowBus, onCenterMap, isBusActive }: FABProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Platform.OS === 'android' ? insets.bottom + 20 : insets.bottom + 10
        }
      ]}
    >
      {/* Botón de Centrado Panorámico — siempre activo */}
      <TouchableOpacity
        style={styles.button}
        onPress={onCenterMap}
        activeOpacity={0.8}
      >
        <Icon name="map-outline" size={24} color="#1A1A1A" />
      </TouchableOpacity>

      {/* Botón de Seguimiento al Burrito — deshabilitado si el bus está inactivo */}
      <TouchableOpacity
        style={[
          styles.button,
          isFollowingBus && isBusActive && styles.buttonActive,
          !isBusActive && styles.buttonDisabled,
        ]}
        onPress={isBusActive ? onFollowBus : undefined}
        activeOpacity={isBusActive ? 0.8 : 1}
      >
        <Icon
          name={isFollowingBus && isBusActive ? "crosshairs-gps" : "crosshairs"}
          size={24}
          color={isFollowingBus && isBusActive ? "#FFFFFF" : !isBusActive ? "#BBBBBB" : "#1A1A1A"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 12,
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    elevation: 12,
  },
  // ✅ Estado visual cuando el bus está descansando
  buttonDisabled: {
    backgroundColor: '#F0F0F0',
    elevation: 2,
  },
});