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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import database from '@react-native-firebase/database';

import { RootStackParams }                from '../../../app/navigations/StackNavigator';
import { firebaseDatabase, firebaseAuth } from '../../../shared/config/firebase';
import { useUserStore, AvatarId }         from '../../../store/userStore';
import { COLORS }                         from '../../../shared/theme/colors';
import { TYPOGRAPHY }                     from '../../../shared/theme/typography';

type NavProp = StackNavigationProp<RootStackParams, 'SignUpScreen'>;

const AVATARES = [
  { id: 'ingeniero',   label: 'INGENIERÍA',           url: require('../../../assets/INGENIERO.png'),  color: '#FF5757' },
  { id: 'economista',  label: 'CIENCIAS ECONÓMICAS',  url: require('../../../assets/ECONOMISTA.png'), color: '#FFBD59' },
  { id: 'salud',       label: 'CIENCIAS DE LA SALUD', url: require('../../../assets/SALUD.png'),      color: '#8C52FF' },
  { id: 'humanidades', label: 'HUMANIDADES',           url: require('../../../assets/HUMANIDADES.png'),color: '#5CE1E6' },
];

export const SignUpScreen = () => {
  const navigation = useNavigation<NavProp>();
  const insets     = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { login }  = useUserStore();

  const [username,   setUsername]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null); // avatar confirmado
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);

  // Breathing animation
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

  // Tamaños dinámicos del grid
  const horizontalPadding = 24;
  const gap                = 16;
  const avatarWrapperWidth = (screenWidth - horizontalPadding * 2 - gap) / 2;
  const circleSize         = avatarWrapperWidth * 0.78;

  // ─── REGISTRO EMAIL / PASSWORD ────────────────────────────────────────────
  const handleRegister = async () => {
    if (username.trim().length < 3) { Alert.alert('Nombre muy corto', 'Mínimo 3 caracteres.'); return; }
    if (!email.trim())              { Alert.alert('Campo vacío', 'Ingresa tu correo.'); return; }
    if (password.length < 6)        { Alert.alert('Contraseña débil', 'Mínimo 6 caracteres.'); return; }
    if (!selectedId)                { Alert.alert('Sin avatar', 'Elige tu facultad primero.'); return; }

    setLoading(true);
    try {
      const result = await firebaseAuth.createUserWithEmailAndPassword(email.trim(), password);
      const uid    = result.user.uid;

      await firebaseDatabase.ref(`/usuarios/${uid}`).set({
        nombre:         username.trim(),
        avatar:         selectedId,
        email:          email.trim(),
        ultimaConexion: database.ServerValue.TIMESTAMP,
      });

      login(uid, username.trim(), selectedId as AvatarId, email.trim());
    } catch (error: any) {
      Alert.alert('Error al registrarse', mapFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTRO CON GOOGLE ──────────────────────────────────────────────────
  const handleGoogleRegister = async () => {
  setGoogleLoad(true);
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const idToken  = userInfo.data?.idToken;
    if (!idToken) throw new Error('No se obtuvo el token.');

    const googleCred = auth.GoogleAuthProvider.credential(idToken);
    const result     = await firebaseAuth.signInWithCredential(googleCred);
    const uid        = result.user.uid;

    const snapshot = await firebaseDatabase.ref(`/usuarios/${uid}`).once('value');
    const data     = snapshot.val();

    if (data?.avatar) {
      await firebaseDatabase.ref(`/usuarios/${uid}`).update({
        ultimaConexion: database.ServerValue.TIMESTAMP,
      });
      login(uid, data.nombre, data.avatar as AvatarId, data.email ?? result.user.email ?? '');
    } else {
      navigation.navigate('AvatarPickerScreen', {
        uid,
        displayName: result.user.displayName ?? 'Sanmarquino',
        email:       result.user.email ?? '',
      });
    }
  } catch (error: any) {
    if (error.code !== 'SIGN_IN_CANCELLED') {
      Alert.alert('Error con Google', 'No se pudo completar el registro.');
    }
  } finally {
    setGoogleLoad(false);
  }
};

  // ─── RENDER ──────────────────────────────────────────────────────────────
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
          {/* BACK */}
          <Animated.View 
            // entering={FadeInUp.duration(300)}
            >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={28} color="#1A1A1A" />
            </TouchableOpacity>
          </Animated.View>

          {/* TÍTULO */}
          <Animated.View 
            // entering={FadeInUp.delay(100).springify().damping(25)} 
            style={styles.titleWrapper}>
            <Text style={styles.title}>¡Hola!{'\n'}Regístrate para{'\n'}empezar</Text>
          </Animated.View>

          {/* CAMPOS */}
          <Animated.View 
            // entering={FadeInDown.delay(200).springify().damping(25)} 
            style={styles.form}>
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
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Contraseña"
                placeholderTextColor="#AAAAAA"
                secureTextEntry={!showPass}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
                <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* AVATAR SECTION */}
          <Animated.View 
            // entering={FadeInDown.delay(300).springify().damping(25)} 
            style={styles.avatarSection}>
            <Text style={styles.avatarSectionTitle}>ELIGE TU AVATAR</Text>
            <View style={[styles.avatarGrid, { gap }]}>
              {AVATARES.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <Animated.View key={item.id} style={[{ width: avatarWrapperWidth }, breathingStyle]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      // ← CAMBIO CLAVE: toca avatar = selecciona directo, sin BottomSheet
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
                        },
                      ]}>
                        <Image
                          source={item.url}
                          style={[
                            styles.imageAvatar,
                            { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
                          ]}
                          resizeMode="cover"
                        />
                      </View>

                      <Text style={[
                        styles.avatarLabel,
                        isSelected && { color: item.color, fontFamily: TYPOGRAPHY.primary.bold },
                      ]}>
                        {item.label}
                      </Text>

                      {/* Checkmark cuando está seleccionado */}
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

          {/* ACCIONES */}
          <Animated.View 
            // entering={FadeInDown.delay(400).springify().damping(25)} 
            style={styles.actionsWrapper}>
            <TouchableOpacity
              style={[styles.btnRegister, loading && styles.btnDisabled]}
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnRegisterText}>Registrarse</Text>
              }
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O regístrate con</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.8}
              onPress={handleGoogleRegister}
              disabled={googleLoad}
            >
            <Image
              source={require('../../../assets/google_logo.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
              
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.replace('SignInScreen')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Mapeo de errores ─────────────────────────────────────────────────────────
const mapFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use': return 'Ya existe una cuenta con ese correo.';
    case 'auth/invalid-email':        return 'El formato del correo no es válido.';
    case 'auth/weak-password':        return 'La contraseña es muy débil. Mínimo 6 caracteres.';
    default:                          return 'Ocurrió un error. Inténtalo de nuevo.';
  }
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#FFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },

  backBtn: { width: 40, height: 40, justifyContent: 'center' },

  titleWrapper: { marginTop: 16, marginBottom: 28 },
  title: {
    fontSize: 32,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: '#1A1A1A',
    lineHeight: 40,
  },

  form:         { gap: 14 },
  inputWrapper: { backgroundColor: '#F4F4F4', borderRadius: 14 },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    fontFamily: TYPOGRAPHY.primary.regular,
    color: '#1A1A1A',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 6,
  },

  avatarSection:      { marginTop: 28 },
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
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageAvatar: {
    // width, height y borderRadius se aplican inline con circleSize
  },
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

  actionsWrapper: { marginTop: 24, gap: 14 },
  btnRegister: {
    backgroundColor: '#00AEEF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  btnDisabled:     { opacity: 0.6 },
  btnRegisterText: { color: '#FFF', fontSize: 16, fontFamily: TYPOGRAPHY.primary.semiBold },

  dividerRow:  { flexDirection: 'row', alignItems: 'center' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.primary.regular,
    color: '#999',
  },

  googleBtn: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    elevation: 2,
  },

  footerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 13, fontFamily: TYPOGRAPHY.primary.regular, color: '#888' },
  footerLink: { fontSize: 13, fontFamily: TYPOGRAPHY.primary.semiBold, color: COLORS.primary },
});