import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  FadeInDown, FadeInUp, FadeIn,
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import database from '@react-native-firebase/database';

import { RootStackParams }                from '../../../app/navigations/StackNavigator';
import { firebaseDatabase }               from '../../../shared/config/firebase';
import { useUserStore, AvatarId }         from '../../../store/userStore';
import { COLORS }                         from '../../../shared/theme/colors';
import { TYPOGRAPHY }                     from '../../../shared/theme/typography';

type NavProp  = StackNavigationProp<RootStackParams, 'AvatarPickerScreen'>;
type RoutePropType = RouteProp<RootStackParams, 'AvatarPickerScreen'>;

const AVATARES = [
  { id: 'ingeniero',   label: 'INGENIERIA',           url: require('../../../assets/INGENIERO.png'),  color: '#FF5757' },
  { id: 'economista',  label: 'CIENCIAS ECONÓMICAS',  url: require('../../../assets/ECONOMISTA.png'), color: '#FFBD59' },
  { id: 'salud',       label: 'CIENCIAS DE LA SALUD', url: require('../../../assets/SALUD.png'),      color: '#8C52FF' },
  { id: 'humanidades', label: 'HUMANIDADES',           url: require('../../../assets/HUMANIDADES.png'),color: '#5CE1E6' },
];

export const AvatarPickerScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RoutePropType>();
  const insets     = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { login }  = useUserStore();

  // Params del flujo Google
  const { uid, displayName, email } = route.params;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);

  // ── Animaciones ──
  const sheetY          = useSharedValue(screenHeight);
  const backdropOpacity = useSharedValue(0);
  const breathing       = useSharedValue(1);

  // Grid sizes
  const horizontalPadding = 24;
  const gap                = 16;
  const avatarWrapperWidth = (screenWidth - horizontalPadding * 2 - gap) / 2;
  const circleSize         = avatarWrapperWidth * 0.78;

  useEffect(() => {
    breathing.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000 }),
        withTiming(1,    { duration: 2000 }),
      ),
      -1, true,
    );
  }, []);

  const selectedAvatar = useMemo(() =>
    AVATARES.find(a => a.id === selectedId), [selectedId]);

  const openSheet = useCallback((id: string) => {
    setSelectedId(id);
    backdropOpacity.value = withTiming(1, { duration: 300 });
    sheetY.value          = withSpring(0, { damping: 20, stiffness: 120 });
  }, []);

  const closeSheet = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 300 });
    sheetY.value = withTiming(screenHeight, { duration: 300 }, (finished) => {
      if (finished) runOnJS(setSelectedId)(null);
    });
  }, [screenHeight]);

  const breathingStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathing.value }] }));
  const backdropStyle  = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle     = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

  const handleConfirm = async (avatarId: string) => {
    setLoading(true);
    try {
      await firebaseDatabase.ref(`/usuarios/${uid}`).set({
        nombre:         displayName,
        avatar:         avatarId,
        email:          email,
        ultimaConexion: database.ServerValue.TIMESTAMP,
      });

      login(uid, displayName, avatarId as AvatarId, email);

      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetY.value          = withTiming(screenHeight, { duration: 200 });
    } catch {
      Alert.alert('Error', 'No se pudo guardar tu perfil. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.container, { paddingTop: insets.top + 24 }]}>

        {/* ENCABEZADO */}
        <Animated.View entering={FadeInUp.delay(100).springify().damping(25)} style={styles.header}>
          <Text style={styles.step}>ÚLTIMO PASO</Text>
          <Text style={styles.title}>Elige tu facultad</Text>
          <Text style={styles.subtitle}>
            Hola <Text style={styles.nameHighlight}>{displayName}</Text>,{'\n'}
            ¿a qué facultad perteneces?
          </Text>
        </Animated.View>

        {/* GRID DE AVATARES */}
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(25)}
          style={[styles.avatarGrid, { gap }]}
        >
          {AVATARES.map((item) => (
            <Animated.View
              key={item.id}
              style={[{ width: avatarWrapperWidth }, breathingStyle]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openSheet(item.id)}
                style={[
                  styles.avatarButton,
                  selectedId === item.id && { borderColor: item.color, borderWidth: 2.5 },
                ]}
              >
                <View style={[
                  styles.circle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    backgroundColor: item.color + '22',
                  },
                  selectedId === item.id && { backgroundColor: item.color + '40' },
                ]}>
                  <Image source={item.url} style={styles.imageAvatar} />
                </View>
                <Text style={[
                  styles.avatarLabel,
                  selectedId === item.id && { color: item.color, fontFamily: TYPOGRAPHY.primary.bold },
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* ── BACKDROP ── */}
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={selectedId ? 'auto' : 'none'}
      >
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* ── BOTTOM SHEET ── */}
      <Animated.View style={[styles.bottomSheet, sheetStyle]}>
        {selectedAvatar && (
          <Animated.View entering={FadeIn} style={styles.heroAvatarContainer}>
            <View style={[styles.heroCircle, { backgroundColor: selectedAvatar.color + '40' }]}>
              <Image source={selectedAvatar.url} style={styles.imageHero} />
            </View>
          </Animated.View>
        )}
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{selectedAvatar?.label ?? ''}</Text>
        <Text style={styles.sheetSubtitle}>¿Esta es tu facultad?</Text>

        <TouchableOpacity
          style={[styles.btnConfirm, loading && styles.btnDisabled]}
          onPress={() => selectedId && handleConfirm(selectedId)}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.btnConfirmText}>¡Listo, vamos!</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancel} onPress={closeSheet} disabled={loading}>
          <Text style={styles.btnCancelText}>Cambiar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 24 },

  header:   { marginBottom: 32 },
  step: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.primary.regular,
    color: '#888',
    lineHeight: 22,
  },
  nameHighlight: {
    fontFamily: TYPOGRAPHY.primary.semiBold,
    color: COLORS.primary,
  },

  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  avatarButton: {
    alignItems: 'center',
    borderRadius: 18,
    padding: 8,
    marginBottom: 8,
  },
  circle:      { justifyContent: 'center', alignItems: 'center' },
  imageAvatar: { width: '75%', height: '75%', resizeMode: 'contain' },
  avatarLabel: {
    marginTop: 8,
    fontSize: 10,
    fontFamily: TYPOGRAPHY.primary.semiBold,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 10,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, marginBottom: 20 },
  heroAvatarContainer: { alignItems: 'center', marginBottom: 8 },
  heroCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHero:     { width: '85%', height: '85%', resizeMode: 'contain' },
  sheetTitle:    { fontSize: 18, fontFamily: TYPOGRAPHY.primary.bold, color: '#1A1A1A', marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, fontFamily: TYPOGRAPHY.primary.regular, color: '#888', marginBottom: 24 },
  btnConfirm: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  btnDisabled:     { opacity: 0.6 },
  btnConfirmText:  { color: '#FFF', fontSize: 16, fontFamily: TYPOGRAPHY.primary.semiBold },
  btnCancel: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  btnCancelText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.primary.medium,
    color: '#999',
  },
});