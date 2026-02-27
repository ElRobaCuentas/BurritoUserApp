import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export const StopCardSkeleton = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const shimmerValue = useSharedValue(-1);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1, // Infinito
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [-1, 1], [-width, width]);
    return { transform: [{ translateX }] };
  });

  const theme = {
    bg: isDarkMode ? '#2A2A2A' : '#E1E9EE',
    shimmer: isDarkMode 
      ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'] 
      : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
      {/* Barra de Título */}
      <View style={[styles.bar, { backgroundColor: theme.bg, width: '70%' }]} />
      
      {/* Barra de Subtítulo/Info */}
      <View style={[styles.bar, { backgroundColor: theme.bg, width: '40%', height: 12, marginTop: 10 }]} />

      {/* El Brillo que se mueve */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={theme.shimmer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 90,
    justifyContent: 'center',
  },
  bar: {
    height: 18,
    borderRadius: 4,
  }
});