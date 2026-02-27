import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Platform, Keyboard, TouchableWithoutFeedback, 
  KeyboardAvoidingView, Image, Alert, useWindowDimensions, ScrollView 
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
import { TYPOGRAPHY } from '../../../shared/theme/typography';
import DeviceInfo from 'react-native-device-info';
import database from '@react-native-firebase/database';

const AVATARES = [
  { id: 'economista', label: 'ECONOMIA', url: require('../../../assets/ECONOMISTA.png'), color: '#FFBD59' }, 
  { id: 'ingeniero', label: 'INGENIERIA', url: require('../../../assets/INGENIERO.png'), color: '#FF5757' },    
  { id: 'salud', label: 'SALUD', url: require('../../../assets/SALUD.png'), color: '#8C52FF' },   
  { id: 'humanidades', label: 'HUMANIDADES', url: require('../../../assets/HUMANIDADES.png'), color: '#5CE1E6' }, 
];

export const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();  
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // 🔥 SOLUCIÓN: Ya no extraemos setUsername ni setUid, solo usamos nuestra súper función 'login'
  const { login } = useUserStore();

  const sheetY = useSharedValue(screenHeight);
  const backdropOpacity = useSharedValue(0);
  const breathing = useSharedValue(1); 

  // --- CÁLCULOS RESPONSIVOS ---
  const horizontalPadding = 20;
  const gap = 20;
  const avatarWrapperWidth = (screenWidth - (horizontalPadding * 2) - gap) / 2;
  const circleSize = avatarWrapperWidth * 0.85;

  useEffect(() => {
    breathing.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000 }), 
        withTiming(1, { duration: 2000 })
      ),
      -1, true 
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
    sheetY.value = withTiming(screenHeight, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setSelectedId)(null);
      }
    });
  }, []);

  const handleFinish = useCallback(async () => {
    if (name.trim().length > 2 && selectedId) {
      try {
        Keyboard.dismiss();
        const uniqueId = await DeviceInfo.getUniqueId();
        
        await database().ref(`/usuarios/${uniqueId}`).set({
          nombre: name.trim(),
          avatar: selectedId,
          dispositivo: await DeviceInfo.getModel(),
          ultimaConexion: new Date().toISOString()
        });

        backdropOpacity.value = withTiming(0, { duration: 250 });
        sheetY.value = withTiming(screenHeight, { duration: 250 });

        setTimeout(() => {
          // 🔥 SOLUCIÓN: Enviamos todo de un solo golpe. El Store se encarga del resto (y de asignar el apodo)
          login(uniqueId, name.trim(), selectedId as AvatarId);
          navigation.replace('MainApp');
        }, 300); 

      } catch (error) {
        Alert.alert("Error", "No pudimos conectar con la base de datos.");
      }
    }
  }, [name, selectedId, navigation, login, screenHeight]);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathing.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#00AEEF', '#FFFFFF']} style={styles.backgroundLayer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[
              styles.mainTitle, 
              screenWidth < 380 && { fontSize: 32, lineHeight: 38 }
            ]}>
              ELIGE TU AVATAR
            </Text>
          </View>

          <View style={[styles.avatarGrid, { gap: gap }]}>
            {AVATARES.map((item) => (
              <Animated.View key={item.id} style={[{ width: avatarWrapperWidth }, breathingStyle]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openSheet(item.id)}
                  style={styles.avatarButton}
                >
                  <View style={[
                    styles.circle, 
                    { 
                      width: circleSize, 
                      height: circleSize, 
                      borderRadius: circleSize / 2,
                      backgroundColor: item.color + '25' 
                    }
                  ]}>
                    <Image source={item.url} style={styles.imageAvatar} />
                  </View>
                  <Text style={styles.avatarLabel}>{item.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* BACKDROP Y BOTTOM SHEET */}
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents={selectedId ? 'auto' : 'none'}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.bottomSheet, sheetStyle]}>
          {selectedAvatar && (
            <Animated.View entering={FadeIn} style={styles.heroAvatarContainer}>
               <View style={[styles.heroCircle, { backgroundColor: selectedAvatar.color + '40' }]}>
                  <Image source={selectedAvatar.url} style={styles.imageHero} />
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
  backgroundLayer: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 20, 
    justifyContent: 'center',
    paddingVertical: 50 
  },
  header: { marginBottom: 40, alignItems: 'center' },
  mainTitle: { 
    fontSize: 42, 
    fontFamily: TYPOGRAPHY.primary.bold, 
    color: '#FFF', 
    textAlign: 'center',
    letterSpacing: -1.5,
    lineHeight: 50,
  },
  avatarGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  avatarButton: { alignItems: 'center' },
  circle: { 
    borderWidth: 4, 
    borderColor: 'rgba(255,255,255,0.7)', 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  imageAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarLabel: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.primary.semiBold,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 10 },
  bottomSheet: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', 
    borderTopLeftRadius: 45, borderTopRightRadius: 45, paddingHorizontal: 30, 
    paddingBottom: 40, alignItems: 'center', zIndex: 20,
  },
  heroAvatarContainer: {
    position: 'absolute', top: -75, alignSelf: 'center', padding: 8, 
    backgroundColor: '#FFF', borderRadius: 80, elevation: 25, zIndex: 30
  },
  heroCircle: { width: 130, height: 130, borderRadius: 65, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imageHero: { width: '100%', height: '100%', resizeMode: 'cover' },
  sheetHandle: { width: 50, height: 5, backgroundColor: '#E0E0E0', borderRadius: 10, marginTop: 15, marginBottom: 50 },
  sheetTitle: { fontSize: 24, fontFamily: TYPOGRAPHY.primary.bold, color: '#1A1A1A', marginBottom: 20 },
  input: { 
    width: '100%', backgroundColor: '#F8F9FA', borderRadius: 20, 
    padding: 18, fontSize: 18, fontFamily: TYPOGRAPHY.primary.medium,
    color: '#333', textAlign: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: '#F0F0F0' 
  },
  btnStart: { backgroundColor: '#00AEEF', width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center', elevation: 4 },
  btnDisabled: { backgroundColor: '#D0D0D0' },
  btnText: { color: '#FFF', fontFamily: TYPOGRAPHY.primary.bold, fontSize: 18, letterSpacing: 1.5 },
});