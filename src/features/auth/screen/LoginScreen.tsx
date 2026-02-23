import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  Extrapolate 
} from 'react-native-reanimated';
import { useUserStore } from '../../../store/userStore';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../../app/navigations/StackNavigator';

const { height } = Dimensions.get('window');

const AVATARES = [
  { id: 'av1', color: '#FFBD59' }, // Amarillo
  { id: 'av2', color: '#FF5757' }, // Rojo
  { id: 'av3', color: '#8C52FF' }, // Morado
  { id: 'av4', color: '#5CE1E6' }, // Celeste
];

export const LoginScreen = () => {

  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();  

    
  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const setProfile = useUserStore((state) => state.setProfile);

  const transition = useSharedValue(0);

  const selectAvatar = (id: string) => {
    setSelectedId(id);
    setStep(2);
    transition.value = withSpring(1, { damping: 12 });
  };

  const handleFinish = () => {
  if (name.trim().length > 2 && selectedId) {
    // 1. Guardamos
    setProfile(name.trim(), selectedId);

    // 2. Esperamos un pestañeo para que el Store se asiente
    setTimeout(() => {
      navigation.replace('MainApp');
    }, 150); 
  }
};

  return (
    <LinearGradient colors={['#00AEEF', '#FFFFFF']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>
          {step === 1 ? 'Elige tu avatar' : '¿Cómo te llamas?'}
        </Text>
      </View>

      <View style={styles.centerContainer}>
        {AVATARES.map((item) => {
          const selectAvatar = (id: string) => {
  console.log("AVATAR SELECCIONADO:", id); // <--- DEBE DECIR av1, av2...
  setSelectedId(id);
  setStep(2);
  transition.value = withSpring(1, { damping: 12 });
};
          const animatedStyle = useAnimatedStyle(() => {
            if (selectedId) {
              return {
                transform: [
                  { translateY: interpolate(transition.value, [0, 1], [0, -height * 0.25]) },
                  { scale: interpolate(transition.value, [0, 1], [1, 1.8]) },
                ],
              };
            }
            return {
              opacity: interpolate(transition.value, [0, 0.5], [1, 0], Extrapolate.CLAMP),
              transform: [{ scale: interpolate(transition.value, [0, 0.5], [1, 0]) }],
            };
          });

          return (
            <TouchableOpacity
              key={item.id}
              disabled={step === 2}
              onPress={() => selectAvatar(item.id)}
              style={styles.avatarTouch}
            >
              <Animated.View style={[styles.circle, { backgroundColor: item.color }, animatedStyle]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {step === 2 && (
        <Animated.View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre aquí..."
            placeholderTextColor="#999"
            onChangeText={setName}
            autoFocus
          />
          <TouchableOpacity style={styles.btnStart} onPress={handleFinish}>
            <Text style={styles.btnText}>¡LISTO!</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginTop: 80, alignItems: 'center' },
  mainTitle: { fontSize: 30, fontWeight: '900', color: '#FFF' },
  centerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    gap: 30
  },
  avatarTouch: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  circle: { width: 90, height: 90, borderRadius: 45, elevation: 10 },
  inputContainer: { position: 'absolute', bottom: height * 0.2, width: '100%', alignItems: 'center', paddingHorizontal: 40 },
  input: { width: '100%', backgroundColor: '#F0F0F0', borderRadius: 15, padding: 18, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  btnStart: { backgroundColor: '#00AEEF', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 }
});