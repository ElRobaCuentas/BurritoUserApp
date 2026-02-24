import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useDrawerStore } from '../../../store/drawerStore';
import { useUserStore, AvatarId } from '../../../store/userStore';
import { useThemeStore } from '../../../store/themeStore'; 
import { COLORS } from '../../../shared/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
// ✅ Importamos lo necesario para la animación
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.72;

const AVATAR_IMAGES: Record<AvatarId, any> = {
  economista: require('../../../assets/ECONOMISTA.png'),
  humanidades: require('../../../assets/HUMANIDADES.png'),
  ingeniero: require('../../../assets/INGENIERO.png'),
  salud: require('../../../assets/SALUD.png'),
};

export const CustomDrawer = () => {
  const { isOpen, closeDrawer } = useDrawerStore() as any;
  const { username, avatar, logout } = useUserStore();
  const { isDarkMode, toggleTheme } = useThemeStore() as any; 

  // 1️⃣ VALORES ANIMADOS
  const translateX = useSharedValue(-DRAWER_WIDTH - 50); 
  const backdropOpacity = useSharedValue(0);

  // 2️⃣ ESCUCHA EL CAMBIO DE ISOPEN
  useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { 
        damping: 20, 
        stiffness: 150, 
        overshootClamping: true 
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // 2️⃣ Al cerrar, lo mandamos un poco más lejos del borde
      translateX.value = withSpring(-DRAWER_WIDTH - 50, { 
        damping: 20, 
        stiffness: 150 
      });
      backdropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  // 3️⃣ ESTILOS ANIMADOS
  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    // 3️⃣ Si el drawer está cerrado, bajamos la opacidad a 0 para que el motor gráfico no lo renderice
    opacity: translateX.value <= -DRAWER_WIDTH ? 0 : 1,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    // Evita que el backdrop bloquee toques cuando está invisible
    display: backdropOpacity.value === 0 && !isOpen ? 'none' : 'flex',
  }));

  const theme = {
    bg: isDarkMode ? '#121212' : '#F4F7F9',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subText: isDarkMode ? '#A0A0A0' : '#666666',
    headerGradient: isDarkMode ? ['#0F172A', '#1E293B'] : [COLORS.primary, '#00AEEF']
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      
      {/* FONDO OSCURO ANIMADO */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
      </TouchableWithoutFeedback>
      
      {/* CONTENEDOR DEL DRAWER ANIMADO */}
     <Animated.View 
        style={[
          styles.drawerContainer, 
          { backgroundColor: theme.bg }, 
          animatedDrawerStyle
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
            <Text style={styles.brandText}>BURRITO UNMSM</Text>
        </LinearGradient>

        <View style={styles.avatarWrapper}>
            <View style={[
              styles.avatarContainer, 
              { borderColor: theme.bg, backgroundColor: theme.card }
            ]}>
                {avatar && AVATAR_IMAGES[avatar] ? (
                    <Image source={AVATAR_IMAGES[avatar]} style={styles.avatarImage} />
                ) : (
                    <Icon name="account" size={50} color={COLORS.primary} />
                )}
            </View>
        </View>

        <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{username || 'Sanmarquino'}</Text>
            <View style={[styles.facultyBadge, { backgroundColor: COLORS.primary + '20' }]}>
              <Icon name="school-outline" size={14} color={COLORS.primary} />
              <Text style={[styles.facultyText, { color: COLORS.primary }]}>
                {avatar ? avatar.toUpperCase() : 'ESTUDIANTE'}
              </Text>
            </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
            <View style={styles.menuItemSpace}>
              <View style={styles.row}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                  <Icon name={isDarkMode ? "weather-night" : "weather-sunny"} size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.menuText, { color: theme.text }]}>Modo Oscuro</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D1D1', true: COLORS.primary }}
                thumbColor={isDarkMode ? COLORS.primary : "#f4f3f4"}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(255,82,82,0.05)' : '#FFF5F5' }]} 
            onPress={() => { logout(); closeDrawer(); }}
          >
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,82,82,0.1)' }]}>
                <Icon name="logout-variant" size={20} color="#FF5252" />
              </View>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.subText }]}>v.1.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerContainer: { 
    width: DRAWER_WIDTH, 
    height: '100%', 
    elevation: 25,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    position: 'absolute',
    left: 0, 
    top: 0,
    bottom: 0,
  },
  header: { height: 160, paddingTop: 40, alignItems: 'center' },
  brandText: { color: 'white', fontSize: 14, fontWeight: '900', opacity: 0.9, letterSpacing: 2 },
  avatarWrapper: { alignItems: 'center', marginTop: -50, marginBottom: 10 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center', elevation: 10,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },
  userInfo: { alignItems: 'center', marginBottom: 25, paddingHorizontal: 10 },
  userName: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  facultyBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
  facultyText: { fontSize: 11, marginLeft: 5, fontWeight: '900', letterSpacing: 0.5 },
  content: { paddingHorizontal: 15, flex: 1, paddingBottom: 20 },
  menuCard: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 5, elevation: 2 },
  menuItemSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { marginLeft: 12, fontSize: 15, fontWeight: '700' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, marginTop: 'auto' },
  logoutText: { marginLeft: 12, fontSize: 15, color: '#FF5252', fontWeight: '900' },
  footer: { paddingBottom: 15, alignItems: 'center' },
  versionText: { fontSize: 10, opacity: 0.5, fontWeight: '900' }
});