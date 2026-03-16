import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import database from '@react-native-firebase/database';
import analytics from '@react-native-firebase/analytics'; // ← NUEVO

import { RootStackParams }   from '../../../app/navigations/StackNavigator';
import { firebaseDatabase, firebaseAuth } from '../../../shared/config/firebase';
import { useUserStore, AvatarId } from '../../../store/userStore';
import { COLORS }     from '../../../shared/theme/colors';
import { TYPOGRAPHY } from '../../../shared/theme/typography';

type NavProp = StackNavigationProp<RootStackParams, 'SignInScreen'>;

export const SignInScreen = () => {
  const navigation = useNavigation<NavProp>();
  const insets     = useSafeAreaInsets();
  const { login }  = useUserStore();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoad,  setGoogleLoad]  = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Por favor completa email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(email.trim(), password);
      const uid    = result.user.uid;

      const snapshot = await firebaseDatabase.ref(`/usuarios/${uid}`).once('value');
      const data     = snapshot.val();

      if (!data) {
        Alert.alert('Error', 'No se encontraron datos de usuario. Regístrate primero.');
        await firebaseAuth.signOut();
        return;
      }

      // Actualizamos última conexión
      await firebaseDatabase.ref(`/usuarios/${uid}`).update({
        ultimaConexion: database.ServerValue.TIMESTAMP,
      });
      
      await analytics().logEvent('sesion_email'); // ← NUEVO
      login(uid, data.nombre, data.avatar as AvatarId, data.email);

    } catch (error: any) {
      const msg = mapFirebaseError(error.code);
      Alert.alert('Error al ingresar', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
  setGoogleLoad(true);
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const idToken  = userInfo.data?.idToken;

    if (!idToken) throw new Error('No se obtuvo el token de Google.');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const result           = await firebaseAuth.signInWithCredential(googleCredential);
    const uid              = result.user.uid;

    const snapshot = await firebaseDatabase.ref(`/usuarios/${uid}`).once('value');
    const data     = snapshot.val();

    if (data?.avatar) {
      await firebaseDatabase.ref(`/usuarios/${uid}`).update({
        ultimaConexion: database.ServerValue.TIMESTAMP,
      });
      await analytics().logEvent('sesion_google');
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
      Alert.alert('Error con Google', 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    }
  } finally {
    setGoogleLoad(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}
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
          <Text style={styles.title}>¡Bienvenido!{'\n'}Un gusto verte{'\n'}otra vez :)</Text>
        </Animated.View>

        {/* CAMPOS */}
        <Animated.View 
          // entering={FadeInDown.delay(200).springify().damping(25)} 
          style={styles.form}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="correo electrónico"
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
              placeholder="contraseña"
              placeholderTextColor="#AAAAAA"
              secureTextEntry={!showPass}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPass(p => !p)}
            >
              <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotWrapper}
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
          >
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnLogin, loading && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.btnLoginText}>Iniciar Sesión</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.8}
            onPress={handleGoogleLogin}
            disabled={googleLoad}
          >
          <Image
            source={require('../../../assets/google_logo.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
          </TouchableOpacity>
        </Animated.View>

        {/* FOOTER LINK */}
        <Animated.View 
          // entering={FadeInDown.delay(350).springify().damping(25)} 
          style={styles.footerRow}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.replace('SignUpScreen')}>
            <Text style={styles.footerLink}>Regístrate</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Mapeo de errores Firebase ────────────────────────────────────────────────
const mapFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':      return 'No existe una cuenta con ese correo.';
    case 'auth/wrong-password':      return 'Contraseña incorrecta.';
    case 'auth/invalid-email':       return 'El formato del correo no es válido.';
    case 'auth/too-many-requests':   return 'Demasiados intentos. Espera un momento.';
    case 'auth/invalid-credential':  return 'Correo o contraseña incorrectos.';
    default:                         return 'Ocurrió un error. Inténtalo de nuevo.';
  }
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#FFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },

  backBtn: { width: 40, height: 40, justifyContent: 'center' },

  titleWrapper: { marginTop: 16, marginBottom: 32 },
  title: {
    fontSize: 32,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: '#1A1A1A',
    lineHeight: 40,
  },

  form: { gap: 14 },

  inputWrapper: {
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    fontFamily: TYPOGRAPHY.primary.regular,
    color: '#1A1A1A',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },

  forgotWrapper: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.primary.medium,
    color: '#888',
  },

  btnLogin: {
    backgroundColor: '#00AEEF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    elevation: 3,
  },
  btnDisabled: { opacity: 0.6 },
  btnLoginText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: TYPOGRAPHY.primary.semiBold,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
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

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.primary.regular,
    color: '#888',
  },
  footerLink: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.primary.semiBold,
    color: COLORS.primary,
  },
});