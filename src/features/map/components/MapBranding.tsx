import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../../shared/theme/colors';
import { TYPOGRAPHY } from '../../../shared/theme/typography';
import { useBurritoStore } from '../../../store/burritoLocationStore';

interface MapBrandingProps {
  isDarkMode: boolean;
}

export const MapBranding = ({ isDarkMode }: MapBrandingProps) => {
  const insets = useSafeAreaInsets();
  const isBusOnline = useBurritoStore((state) => state.isBusOnline);

  const gradientColors = isDarkMode 
    ? ['rgba(30, 30, 30, 0.95)', COLORS.primary + '10']
    : ['#FFFFFF', COLORS.primary + '30'];

  return (
    <Animated.View 
      entering={FadeInUp.delay(1000).springify()} 
      style={[
        styles.container, 
        { top: Platform.OS === 'android' ? insets.top + 15 : insets.top + 10 } 
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pill}
      >
        <Text style={[
            styles.brandText, 
            { color: COLORS.primary }
          ]}
        >
          B
        </Text>
        
        <View 
          style={[
            styles.statusDot, 
            { backgroundColor: isBusOnline ? '#4CAF50' : '#FF5252' }
          ]} 
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20, 
    zIndex: 10, 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 6 }
    })
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.15)',
  },
  brandText: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.primary.bold,
    marginRight: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  }
});