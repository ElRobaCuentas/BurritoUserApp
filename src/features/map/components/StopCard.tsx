import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { COLORS } from '../../../shared/theme/colors';

interface StopCardProps {
  title: string;
  imageSource: ImageSourcePropType; // ✅ Ahora recibe el require local
}

export const StopCard = ({ title, imageSource }: StopCardProps) => {
  return (
    <View style={styles.bubbleContainer}>
      <View style={styles.card}>
        <View style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </View>

        {/* ✅ Imagen instantánea, sin hacks ni onLoad */}
        <Image 
          source={imageSource} 
          style={styles.image} 
          resizeMode="cover"
        />
        
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
  bubbleContainer: { alignItems: 'center', width: 160 },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 80,
    backgroundColor: '#e0e0e0',
  },
  info: { padding: 8, alignItems: 'center', width: '100%' },
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