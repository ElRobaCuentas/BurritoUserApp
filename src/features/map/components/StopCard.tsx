import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';

interface Props {
  title: string;
  onClose: () => void;
}

export const StopCard = ({ title, onClose }: Props) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.content}>
        <Text style={styles.label}>Paradero</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Icon name="close-circle" size={22} color="#999" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: 180, // Tamaño compacto flotante
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10, // Separación del marcador
  },
  content: { flex: 1 },
  label: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: { marginLeft: 8 }
});