import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Dimensions, Platform, Keyboard, TouchableWithoutFeedback, 
  KeyboardAvoidingView, Image 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  useSharedValue, useAnimatedStyle, withSpring, withTiming, 
  FadeIn, runOnJS, withRepeat, withSequence 
} from 'react-native-reanimated';
import { useUserStore, AvatarId } from '../../../store/userStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../../app/navigations/StackNavigator';

const { height } = Dimensions.get('window');

// 🎭 CONFIGURACIÓN DE TUS AVATARES DE IMAGEN (AÑADIMOS "label")
const AVATARES = [
  { id: 'economista', label: 'Economia', url: require('../../../assets/ECONOMISTA.png'), color: '#FFBD59' }, 
  { id: 'ingeniero', label: 'Ingenieria', url: require('../../../assets/INGENIERO.png'), color: '#FF5757' },    
  { id: 'salud', label: 'Salud', url: require('../../../assets/SALUD.png'), color: '#8C52FF' },   
  { id: 'humanidades', label: 'Humanidades', url: require('../../../assets/HUMANIDADES.png'), color: '#5CE1E6' }, 
];

export const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  const { setUsername, setAvatar, login } = useUserStore();

  const sheetY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);
  const breathing = useSharedValue(1); 

  useEffect(() => {
    breathing.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1, 
      true 
    );
  }, []);

  const selectedAvatar = useMemo(() => 
    AVATARES.find(a => a.id === selectedId), [selectedId]
  );

  const openSheet = useCallback((id: string) => {
    setSelectedId(id);
    backdropOpacity.value = withTiming(1, { duration: 300 });
    sheetY.value = withSpring(0, { damping: 20, stiffness: 120 });
  }, []);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    backdropOpacity.value = withTiming(0, { duration: 300 });
    sheetY.value = withTiming(height, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setSelectedId)(null);
      }
    });
  }, []);

  const handleFinish = useCallback(() => {
    if (name.trim().length > 2 && selectedId) {
      Keyboard.dismiss();
      
      backdropOpacity.value = withTiming(0, { duration: 250 });
      sheetY.value = withTiming(height, { duration: 250 });

      setTimeout(() => {
        setUsername(name.trim());
        setAvatar(selectedId as AvatarId);
        login();
        navigation.replace('MainApp');
      }, 300); 
    }
  }, [name, selectedId, navigation, setUsername, setAvatar, login]);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathing.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#00AEEF', '#FFFFFF']} style={styles.backgroundLayer}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Elige tu avatar</Text>
        </View>

        <View style={styles.avatarGrid}>
          {AVATARES.map((item) => (
            <Animated.View key={item.id} style={[styles.circleWrapper, breathingStyle]}>
              {/* ✅ El TouchableOpacity ahora envuelve al círculo Y al texto */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openSheet(item.id)}
                style={{ alignItems: 'center' }}
              >
                <View style={[styles.circle, { backgroundColor: item.color + '20' }]}>
                  <Image 
                    source={item.url} 
                    style={styles.imageAvatar} 
                  />
                </View>
                {/* ✅ Aquí está el nuevo título debajo de la imagen */}
                <Text style={styles.avatarLabel}>{item.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </LinearGradient>

      {/* BACKDROP */}
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents={selectedId ? 'auto' : 'none'}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* BOTTOM SHEET */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.bottomSheet, sheetStyle]}>
          {selectedAvatar && (
            <Animated.View entering={FadeIn} style={styles.heroAvatarContainer}>
               <View style={[styles.heroCircle, { backgroundColor: selectedAvatar.color + '40' }]}>
                  <Image 
                    source={selectedAvatar.url} 
                    style={styles.imageHero} 
                  />
               </View>
            </Animated.View>
          )}

          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>¿Cómo te llamas?</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Tu nombre aquí..."
            placeholderTextColor="#999"
            onChangeText={setName}
            value={name}
            maxLength={15}
            returnKeyType="done"
            onSubmitEditing={handleFinish}
          />
          
          <TouchableOpacity 
            style={[styles.btnStart, name.trim().length <= 2 && styles.btnDisabled]} 
            onPress={handleFinish}
            disabled={name.trim().length <= 2}
          >
            <Text style={styles.btnText}>¡LISTO!</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00AEEF' },
  backgroundLayer: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 80, alignItems: 'center' },
  mainTitle: { fontSize: 34, fontWeight: '900', color: '#FFF' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 30, marginTop: 60 },
  
  // ✅ CORRECCIÓN: Le quitamos la altura fija al wrapper para que el texto no se corte
  circleWrapper: { width: 110, alignItems: 'center' }, 
  
  circle: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imageAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  // ✅ ESTILO NUEVO PARA LOS TÍTULOS DE LAS FACULTADES
  avatarLabel: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)', // Una sombra suave para que resalte
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10 },
  bottomSheet: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', 
    borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, 
    paddingBottom: 40, alignItems: 'center', zIndex: 20,
  },
  heroAvatarContainer: {
    position: 'absolute', top: -60, alignSelf: 'center', padding: 8, 
    backgroundColor: '#FFF', borderRadius: 70, elevation: 15, zIndex: 30
  },
  heroCircle: { width: 110, height: 110, borderRadius: 55, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imageHero: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  sheetHandle: { width: 40, height: 5, backgroundColor: '#EEE', borderRadius: 3, marginTop: 10, marginBottom: 60 },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 20 },
  input: { 
    width: '100%', backgroundColor: '#F8F8F8', borderRadius: 20, padding: 18, 
    fontSize: 20, fontWeight: '600', color: '#333', textAlign: 'center', 
    marginBottom: 20, borderWidth: 1, borderColor: '#EEE' 
  },
  btnStart: { backgroundColor: '#00AEEF', width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#CCC' },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
});