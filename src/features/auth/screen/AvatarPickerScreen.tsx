import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import database from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParams }        from '../../../app/navigations/StackNavigator';
import { firebaseDatabase }       from '../../../shared/config/firebase';
import { useUserStore, AvatarId } from '../../../store/userStore';
import { COLORS }                 from '../../../shared/theme/colors';
import { TYPOGRAPHY }             from '../../../shared/theme/typography';

type NavProp       = StackNavigationProp<RootStackParams, 'AvatarPickerScreen'>;
type RoutePropType = RouteProp<RootStackParams, 'AvatarPickerScreen'>;

const AVATARES = [
  { id: 'ingeniero',   label: 'INGENIERÍA',           url: require('../../../assets/INGENIERO.png'),  color: '#FF5757' },
  { id: 'economista',  label: 'CIENCIAS ECONÓMICAS',  url: require('../../../assets/ECONOMISTA.png'), color: '#FFBD59' },
  { id: 'salud',       label: 'CIENCIAS DE LA SALUD', url: require('../../../assets/SALUD.png'),      color: '#8C52FF' },
  { id: 'humanidades', label: 'HUMANIDADES',           url: require('../../../assets/HUMANIDADES.png'),color: '#5CE1E6' },
];

export const AvatarPickerScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RoutePropType>();
  const insets     = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { login }  = useUserStore();

  const { uid, displayName, email } = route.params;

  // ── Estado ────────────────────────────────────────────────────────────────
  // Pre-rellenado con el nombre de Google, el usuario puede cambiarlo
  const [username,   setUsername]   = useState(displayName ?? '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);

  // ── Breathing animation (igual que SignUpScreen) ──────────────────────────
  const breathing = useSharedValue(1);
  useEffect(() => {
    breathing.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000 }),
        withTiming(1,    { duration: 2000 }),
      ),
      -1, true,
    );
  }, []);
  const breathingStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathing.value }] }));

  // ── Tamaños del grid (igual que SignUpScreen) ─────────────────────────────
  const horizontalPadding = 24;
  const gap                = 16;
  const avatarWrapperWidth = (screenWidth - horizontalPadding * 2 - gap) / 2;
  const circleSize         = avatarWrapperWidth * 0.78;

  // ── Confirmar ─────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (username.trim().length < 3) {
      Alert.alert('Nombre muy corto', 'Mínimo 3 caracteres.');
      return;
    }
    if (!selectedId) {
      Alert.alert('Sin facultad', 'Elige tu facultad primero.');
      return;
    }

    setLoading(true);
    try {
      await firebaseDatabase.ref(`/usuarios/${uid}`).set({
        nombre:         username.trim(),
        avatar:         selectedId,
        email:          email,
        rol:            'estudiante',
        ultimaConexion: database.ServerValue.TIMESTAMP,
      });

      login(uid, username.trim(), selectedId as AvatarId, email);
    } catch {
      Alert.alert('Error', 'No se pudo guardar tu perfil. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* TÍTULO */}
          <Animated.View
            entering={FadeInUp.delay(100).springify().damping(25)}
            style={styles.titleWrapper}
          >
            <Text style={styles.step}>ÚLTIMO PASO</Text>
            <Text style={styles.title}>Personaliza{'\n'}tu perfil</Text>
          </Animated.View>

          {/* CAMPO DE NOMBRE */}
          <Animated.View
            entering={FadeInDown.delay(150).springify().damping(25)}
            style={styles.form}
          >
            <Text style={styles.fieldLabel}>¿CÓMO QUIERES QUE TE LLAMEMOS?</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                placeholderTextColor="#AAAAAA"
                autoCapitalize="words"
                value={username}
                onChangeText={setUsername}
                maxLength={20}
              />
            </View>
            <Text style={styles.fieldHint}>
              Puedes cambiarlo o dejarlo como está. Máx. 20 caracteres.
            </Text>
          </Animated.View>

          {/* GRID DE AVATARES */}
          <Animated.View
            entering={FadeInDown.delay(250).springify().damping(25)}
            style={styles.avatarSection}
          >
            <Text style={styles.avatarSectionTitle}>ELIGE TU FACULTAD</Text>
            <View style={[styles.avatarGrid, { gap }]}>
              {AVATARES.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <Animated.View
                    key={item.id}
                    style={[{ width: avatarWrapperWidth }, breathingStyle]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedId(item.id)}
                      style={[
                        styles.avatarButton,
                        isSelected && { borderColor: item.color, borderWidth: 2.5 },
                      ]}
                    >
                      <View style={[
                        styles.circle,
                        {
                          width: circleSize,
                          height: circleSize,
                          borderRadius: circleSize / 2,
                          backgroundColor: isSelected ? item.color + '40' : item.color + '22',
                          overflow: 'hidden',
                        },
                      ]}>
                        <Image
                          source={item.url}
                          style={{ width: circleSize, height: circleSize, borderRadius: circleSize / 2 }}
                          resizeMode="cover"
                        />
                      </View>

                      <Text style={[
                        styles.avatarLabel,
                        isSelected && { color: item.color, fontFamily: TYPOGRAPHY.primary.bold },
                      ]}>
                        {item.label}
                      </Text>

                      {isSelected && (
                        <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
                          <Icon name="check" size={10} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* BOTÓN */}
          <Animated.View
            entering={FadeInDown.delay(350).springify().damping(25)}
            style={styles.actionsWrapper}
          >
            <TouchableOpacity
              style={[styles.btnConfirm, loading && styles.btnDisabled]}
              activeOpacity={0.85}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnConfirmText}>¡Listo, vamos!</Text>
              }
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#FFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },

  titleWrapper: { marginTop: 16, marginBottom: 28 },
  step: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: '#1A1A1A',
    lineHeight: 40,
  },

  form:         { marginBottom: 28 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: '#1A1A1A',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  inputWrapper: { backgroundColor: '#F4F4F4', borderRadius: 14, marginBottom: 8 },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    fontFamily: TYPOGRAPHY.primary.regular,
    color: '#1A1A1A',
  },
  fieldHint: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.primary.regular,
    color: '#AAAAAA',
  },

  avatarSection: { marginBottom: 8 },
  avatarSectionTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: '#1A1A1A',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  avatarGrid:   { flexDirection: 'row', flexWrap: 'wrap' },
  avatarButton: {
    alignItems: 'center',
    borderRadius: 18,
    padding: 8,
    marginBottom: 8,
  },
  circle: { justifyContent: 'center', alignItems: 'center' },
  avatarLabel: {
    marginTop: 8,
    fontSize: 10,
    fontFamily: TYPOGRAPHY.primary.semiBold,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionsWrapper: { marginTop: 16 },
  btnConfirm: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  btnDisabled:    { opacity: 0.6 },
  btnConfirmText: { color: '#FFF', fontSize: 16, fontFamily: TYPOGRAPHY.primary.semiBold },
});