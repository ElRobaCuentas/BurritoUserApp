import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';
import { TYPOGRAPHY } from '../../../shared/theme/typography';

interface Props {
  title: string;
  onClose: () => void;
}

export const StopCard = ({ title, onClose }: Props) => {
  return (
    // ✨ CAMBIO 1: Toda la tarjeta ahora es el botón táctil principal
    <TouchableOpacity 
      activeOpacity={0.85} 
      onPress={onClose} 
      style={styles.cardContainer}
    >
      <View style={styles.content}>
        <Text style={styles.label}>Paradero UNMSM</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </View>
      
      {/* ✨ CAMBIO 2: La 'X' ya no es TouchableOpacity para evitar conflicto de doble toque, ahora es visual */}
      <View style={styles.closeBtn}>
        <Icon name="close-circle" size={24} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // ✨ CAMBIO 3: Reducimos el ancho para un look más "píldora" profesional
    width: 180, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  content: { flex: 1 },
  label: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.primary.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.primary.semiBold,
    color: '#2C3E50',
    letterSpacing: -0.3,
  },
  closeBtn: { 
    marginLeft: 10,
    opacity: 0.8 // Le bajamos un poco la opacidad para que el título resalte más
  }
});