import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  runOnJS, 
  Easing,
  FadeIn
} from 'react-native-reanimated';
import BootSplash from 'react-native-bootsplash';

export const AnimatedSplash = ({ onFinish }: { onFinish: () => void }) => {
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    BootSplash.hide({ fade: false });
    
    containerScale.value = withDelay(
      1500,
      withSequence(
        withTiming(0.85, { duration: 250, easing: Easing.out(Easing.ease) }), 
        withTiming(30, { duration: 500, easing: Easing.in(Easing.poly(4)) }) 
      )
    );

    containerOpacity.value = withDelay(
      1800,
      withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* 1. LOGO PRINCIPAL */}
      <Animated.View style={[styles.centerWrapper, animatedContainerStyle]}>
        <Image 
          source={require('../../../assets/logo_app.png')} 
          style={styles.logoApp}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(500)} style={styles.whatsappFooter}>
        <Text style={styles.fromText}>from</Text>
        
        <View style={styles.metaRow}>
          <Image 
            source={require('../../../assets/logo_marca.png')} 
            style={styles.metaLogo}
            resizeMode="contain"
          />
          <Text style={styles.metaText}>SYTHOR</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00AEEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoApp: {
    width: 220,
    height: 220,
  },
  whatsappFooter: {
    position: 'absolute',
    bottom: 40,
    width: '100%', 
    alignItems: 'center', 
  },
  fromText: {
  color: '#E2E8F0',
  fontSize: 14,
  marginBottom: 4,
  textAlign: 'center',
  width: '100%',
},
  metaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
  metaLogo: {
    width: 26,
    height: 26,
    marginRight: 6,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold', 
    letterSpacing: 6,
  },
});