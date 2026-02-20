import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { COLORS } from '../../../shared/theme/colors';

interface StopCardProps {
  title: string;
  imageSource: ImageSourcePropType;
}

export const StopCard = ({ title, imageSource }: StopCardProps) => {
  return (
    <View style={styles.bubbleContainer}>
      <View style={styles.card}>
        <View style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </View>

        {/* 🚨 EL HACK: Envolvemos la imagen en un componente Text */}
        <Text style={styles.imageWrapper}>
          <Image 
            source={imageSource} 
            style={styles.image} 
            resizeMode="cover"
          />
        </Text>
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  // 🔥 Es crucial usar tamaños fijos (píxeles), NO porcentajes
  bubbleContainer: { alignItems: 'center', width: 160 },
  card: {
    width: 160, // Tamaño fijo
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: 160,
    height: 80,
    lineHeight: 80, // Evita que el Text colapse la imagen
  },
  image: {
    width: 160, 
    height: 80, 
  },
  info: { padding: 8, alignItems: 'center', width: 160 },
  title: { fontSize: 12, fontWeight: '900', color: COLORS.primary, textAlign: 'center' },
  closeButton: {
    position: 'absolute', top: 5, right: 5, backgroundColor: '#FF0000',
    width: 20, height: 20, borderRadius: 10, justifyContent: 'center',
    alignItems: 'center', zIndex: 99,
  },
  closeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  arrow: {
    width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10,
    borderTopWidth: 12, borderLeftColor: 'transparent',
    borderRightColor: 'transparent', borderTopColor: COLORS.primary,
    marginTop: -2
  },
});