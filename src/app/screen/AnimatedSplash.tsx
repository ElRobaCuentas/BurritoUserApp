import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  FadeInRight, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  runOnJS, 
  Easing
} from 'react-native-reanimated';
import BootSplash from 'react-native-bootsplash';

const WORD = ["U", "R", "R", "I", "T", "O"];
const FONT_NAME = 'algerian'; 

export const AnimatedSplash = ({ onFinish }: { onFinish: () => void }) => {
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    BootSplash.hide({ fade: false });

    // 🔥 TIEMPOS PSICOLÓGICOS PERFECTOS
    // Esperamos 1.4 segundos exactos (0.6s escribiendo + 0.8s estático para lectura)
    containerScale.value = withDelay(
      1400,
      withSequence(
        // Anticipación breve (250ms)
        withTiming(0.85, { duration: 250, easing: Easing.out(Easing.ease) }), 
        // Explosión de zoom in hacia el usuario (500ms)
        withTiming(30, { duration: 500, easing: Easing.in(Easing.poly(4)) }) 
      )
    );

    // Desvanecimiento sincronizado con la explosión
    containerOpacity.value = withDelay(
      1700, // Comienza a desaparecer cuando ya está volando hacia la cámara
      withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: containerScale.value }],
      opacity: containerOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.row, animatedContainerStyle]}>
        
        <Animated.Text style={styles.letterB}>B</Animated.Text>
        
        {WORD.map((char, index) => (
          <Animated.Text
            key={index}
            // Entran rapidito (80ms entre letras) para no aburrir
            entering={FadeInRight.delay(100 + index * 80)
              .duration(400)
              .springify()
              .damping(14)} 
            style={styles.letter}
          >
            {char}
          </Animated.Text>
        ))}

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
  row: {
    flexDirection: 'row',
    alignItems: 'baseline', 
  },
  letterB: {
    fontSize: 70,
    fontFamily: FONT_NAME,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.15)', 
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  letter: {
    fontSize: 60,
    fontFamily: FONT_NAME,
    color: '#FFFFFF',
    marginLeft: 2,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});