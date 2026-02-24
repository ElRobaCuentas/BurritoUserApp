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
        <Text style={styles.label}>Paradero UNMSM</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </View>
      
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Icon name="close-circle" size={24} color="#999" />
      </TouchableOpacity>
    </View>
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
    width: 220, 
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
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
  },
  closeBtn: { marginLeft: 10 }
});