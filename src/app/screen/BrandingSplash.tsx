import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';
import BootSplash from "react-native-bootsplash";
import { TYPOGRAPHY } from '../../shared/theme/typography';

const { width } = Dimensions.get('window');

export const BrandingSplash = ({ onFinish }: { onFinish: () => void }) => {
  const scale = useSharedValue(1); 
  const opacity = useSharedValue(1);

  useEffect(() => {
    // 1. OCULTAMOS EL NATIVO AL INSTANTE (Sin fade para que no se vea doble)
    BootSplash.hide({ fade: false });

    // 2. Animación de "salida" suave para entrar al mapa
    const timer = setTimeout(() => {
        scale.value = withTiming(1.2, { duration: 600, easing: Easing.out(Easing.quad) });
        opacity.value = withTiming(0, { duration: 600 });
        setTimeout(onFinish, 600);
    }, 2000); // Se queda 2 segundos y se va

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image 
          source={require('./logo.png')} // Usando la ruta local que acordamos
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      <Animated.View style={[styles.footer, { opacity: opacity.value }]}>
        <Text style={styles.unmsmText}>Universidad Nacional Mayor de San Marcos</Text>
        <Text style={styles.appVersion}>La Decana de América</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: width * 0.6, height: width * 0.6 },
  logo: { width: '100%', height: '100%' },
  footer: { position: 'absolute', bottom: 50, alignItems: 'center' },
  unmsmText: { fontFamily: TYPOGRAPHY.primary.bold, fontSize: 12, color: '#003366' },
  appVersion: { fontFamily: TYPOGRAPHY.primary.regular, fontSize: 10, color: '#666' }
});