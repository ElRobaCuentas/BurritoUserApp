import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  Switch, Dimensions, TouchableWithoutFeedback 
} from 'react-native';
import { useDrawerStore } from '../../../store/drawerStore';
import { useUserStore, AvatarId } from '../../../store/userStore';
import { useThemeStore } from '../../../store/themeStore'; 
import { COLORS } from '../../../shared/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeIn,
  FadeOut,
  Layout // Para animar el crecimiento de la tarjeta
} from 'react-native-reanimated';
import { TYPOGRAPHY } from '../../../shared/theme/typography';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.72;

const AVATAR_IMAGES: Record<AvatarId, any> = {
  economista: require('../../../assets/ECONOMISTA.png'),
  humanidades: require('../../../assets/HUMANIDADES.png'),
  ingeniero: require('../../../assets/INGENIERO.png'),
  salud: require('../../../assets/SALUD.png'),
};

const AVATAR_LIST: { id: AvatarId; label: string }[] = [
  { id: 'ingeniero', label: 'Ing.' },
  { id: 'salud', label: 'Salud' },
  { id: 'economista', label: 'Econ.' },
  { id: 'humanidades', label: 'Hum.' },
];

export const CustomDrawer = () => {
  const { isOpen, closeDrawer } = useDrawerStore() as any;
  const { username, avatar, setAvatar, logout } = useUserStore();
  const { isDarkMode, toggleTheme } = useThemeStore() as any; 

  // Estado para controlar la expansión del selector
  const [isExpanding, setIsExpanding] = useState(false);

  const translateX = useSharedValue(-DRAWER_WIDTH - 50); 
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 150, overshootClamping: true });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH - 50, { damping: 20, stiffness: 150 });
      backdropOpacity.value = withTiming(0, { duration: 300 });
      setIsExpanding(false); // Cerramos el acordeón si se cierra el drawer
    }
  }, [isOpen]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: translateX.value <= -DRAWER_WIDTH ? 0 : 1,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const theme = {
    bg: isDarkMode ? '#121212' : '#F4F7F9',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subText: isDarkMode ? '#A0A0A0' : '#666666',
    headerGradient: isDarkMode ? ['#0F172A', '#1E293B'] : [COLORS.primary, '#00AEEF']
  };

  // 🔥 LÓGICA SENIOR: Filtrar el avatar actual para mostrar solo los 3 disponibles
  const availableAvatars = AVATAR_LIST.filter(item => item.id !== avatar);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle, { display: isOpen ? 'flex' : 'none' }]} />
      </TouchableWithoutFeedback>
      
      <Animated.View style={[styles.drawerContainer, { backgroundColor: theme.bg }, animatedDrawerStyle]}>
        
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
            <Text style={styles.brandText}>BURRITO UNMSM</Text>
        </LinearGradient>

        <View style={styles.avatarWrapper}>
            <View style={[styles.avatarContainer, { borderColor: theme.bg, backgroundColor: theme.card }]}>
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
          {/* TARJETA CONFIGURABLE (MODO OSCURO + CAMBIAR AVATAR) */}
          <Animated.View 
            layout={Layout.springify()} // 🪄 Magia: anima el crecimiento automáticamente
            style={[styles.menuCard, { backgroundColor: theme.card }]}
          >
            {/* ITEM MODO OSCURO */}
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

            <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]} />

            {/* ITEM CAMBIAR AVATAR */}
            <TouchableOpacity 
              style={styles.menuItemSpace} 
              onPress={() => setIsExpanding(!isExpanding)}
            >
              <View style={styles.row}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                  <Icon name="account-edit-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.menuText, { color: theme.text }]}>Cambiar Avatar</Text>
              </View>
              <Icon 
                name={isExpanding ? "chevron-up" : "chevron-down"} 
                size={22} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>

            {/* SECCIÓN EXPANDIBLE (LOS 3 AVATARES RESTANTES) */}
            {isExpanding && (
              <Animated.View 
                entering={FadeIn.duration(300)} 
                exiting={FadeOut.duration(200)}
                style={styles.avatarSelectionRow}
              >
                {availableAvatars.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.avatarOption}
                    onPress={() => {
                      setAvatar(item.id);
                      setIsExpanding(false);
                    }}
                  >
                    <View style={styles.smallAvatarCircle}>
                      <Image source={AVATAR_IMAGES[item.id]} style={styles.smallAvatarImg} />
                    </View>
                    <Text style={[styles.smallAvatarLabel, { color: theme.subText }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </Animated.View>

          {/* BOTÓN CERRAR SESIÓN */}
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
    width: DRAWER_WIDTH, height: '100%', elevation: 25, 
    borderTopRightRadius: 25, borderBottomRightRadius: 25, 
    overflow: 'hidden', position: 'absolute', left: 0, top: 0, bottom: 0,
  },
  header: { height: 160, paddingTop: 40, alignItems: 'center' },
brandText: { 
    color: 'white', 
    fontSize: 14, 
    fontFamily: TYPOGRAPHY.primary.bold, // 👈 Marca fuerte
    opacity: 0.9, 
    letterSpacing: 2 
  },  avatarWrapper: { alignItems: 'center', marginTop: -50, marginBottom: 10 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center', elevation: 10,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },
  userInfo: { alignItems: 'center', marginBottom: 25, paddingHorizontal: 10 },
userName: { 
    fontSize: 22, 
    fontFamily: TYPOGRAPHY.primary.bold, // 👈 Nombre destacado
    textAlign: 'center',
    color: '#1A1A1A' 
  },  facultyBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
facultyText: { 
    fontSize: 11, 
    marginLeft: 5, 
    fontFamily: TYPOGRAPHY.primary.bold, // 👈 Badge de facultad
    letterSpacing: 0.5 
  },  content: { paddingHorizontal: 15, flex: 1, paddingBottom: 20 },
  
  menuCard: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 5, elevation: 2, overflow: 'hidden' },
  divider: { height: 1, width: '100%', opacity: 0.5 },
  menuItemSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
menuText: { 
    marginLeft: 12, 
    fontSize: 15, 
    fontFamily: TYPOGRAPHY.primary.semiBold // 👈 Items de menú
  },
  // Estilos de la expansión
  avatarSelectionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 15, 
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  avatarOption: { alignItems: 'center', width: '30%' },
  smallAvatarCircle: { 
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F0F0', 
    overflow: 'hidden', borderWidth: 1, borderColor: '#DDD' 
  },
  smallAvatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
smallAvatarLabel: { 
    fontSize: 10, 
    fontFamily: TYPOGRAPHY.primary.bold, // 👈 Etiquetas de cambio de avatar
    marginTop: 5 
  },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, marginTop: 'auto' },
logoutText: { 
    marginLeft: 12, 
    fontSize: 15, 
    color: '#FF5252', 
    fontFamily: TYPOGRAPHY.primary.bold // 👈 Botón de peligro
  },  footer: { paddingBottom: 15, alignItems: 'center' },
versionText: { 
    fontSize: 10, 
    opacity: 0.5, 
    fontFamily: TYPOGRAPHY.primary.bold // 👈 Footer
  }});