import React, { useEffect } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  useColorScheme,
  Image,
  ImageBackground,
} from 'react-native';
import { MapScreen } from '../../features/map/screen/MapScreen';
import { COLORS } from '../../shared/theme/colors';
import { useThemeStore } from '../../store/themeStore';
import { useUserStore, AvatarId } from '../../store/userStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const Drawer = createDrawerNavigator();

// 3️⃣ MAPEO DE TUS IMÁGENES (IGUAL QUE EN LOGIN)
const AVATAR_IMAGES: Record<AvatarId, any> = {
  economista: require('../../assets/ECONOMISTA.png'),
  humanidades: require('../../assets/HUMANIDADES.png'),
  ingeniero: require('../../assets/INGENIERO.png'),
  salud: require('../../assets/SALUD.png'),
};

const CustomDrawerContent = (props: any) => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { username, avatar, logout } = useUserStore();

  const textColor = isDarkMode ? '#FFF' : '#1A1A1A';
  const iconColor = isDarkMode ? COLORS.primary : '#555555';
  // Fondo semi-transparente para efecto cristal más oscuro en modo noche
  const drawerBg = isDarkMode ? 'rgba(20, 20, 20, 0.97)' : 'rgba(255, 255, 255, 0.95)';
  const cardBg = isDarkMode ? '#252525' : '#FFFFFF';

  // Seleccionamos la imagen correcta, o 'ingeniero' por defecto si falla algo
  const selectedAvatarImage = (avatar && AVATAR_IMAGES[avatar]) 
  ? AVATAR_IMAGES[avatar] 
  : AVATAR_IMAGES.ingeniero;

  return (
    // USAREMOS EL FONDO DE ODONTO QUE TENÍAS, CON BLUR
    <ImageBackground
  source={require('../../assets/odonto.jpg')}
  style={{ flex: 1 }}
  blurRadius={5} 
>
      <LinearGradient
        colors={[drawerBg, drawerBg]}
        style={{ flex: 1 }}
      >
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ paddingTop: 0 }}>
          
          {/* HEADER CON TU AVATAR */}
          <View style={styles.drawerHeader}>
            <View style={[styles.avatarContainer, { borderColor: isDarkMode ? '#FFF' : COLORS.primary }]}>
              <Image source={selectedAvatarImage} style={styles.avatarImage} />
            </View>
            <Text style={[styles.userName, { color: textColor }]}>
              {username || 'Sanmarquino'}
            </Text>
            <View style={styles.statusBadge}>
              <Icon name="badge-account-horizontal" size={14} color="#FFF" />
              <Text style={styles.userStatusText}>
                {avatar ? avatar.toUpperCase() : 'ESTUDIANTE'} UNMSM
              </Text>
            </View>
          </View>

          {/* CARDS DEL MENÚ */}
          <View style={[styles.cardSection, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Navegación</Text>
            <DrawerItemList {...props} />
          </View>

          <View style={[styles.cardSection, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Preferencias</Text>
            <View style={styles.themeRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={isDarkMode ? "weather-night" : "weather-sunny"} size={24} color={iconColor} />
                <Text style={[styles.themeText, { color: textColor }]}>
                  Modo {isDarkMode ? 'Oscuro' : 'Claro'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </View>
        </DrawerContentScrollView>

        <View style={[styles.logoutContainer, { borderTopColor: isDarkMode ? '#333' : '#F0F0F0' }]}>
          <DrawerItem
            icon={({ size }) => (
              <Icon name="power" color="#FF453A" size={size + 2} />
            )}
            label="Cerrar Sesión"
            labelStyle={{ color: '#FF453A', fontWeight: '800', fontSize: 16 }}
            onPress={() => logout()}
            style={{ borderRadius: 15, backgroundColor: isDarkMode ? '#301010' : '#FFF5F5' }}
          />
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export const DrawerNavigator = () => {
  const systemColorScheme = useColorScheme();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 310, backgroundColor: 'transparent' },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.7)',
        unmountOnBlur: false,
        detachInactiveScreens: false,
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: '#666',
        drawerItemStyle: { borderRadius: 15, paddingLeft: 10, marginVertical: 5 },
        drawerLabelStyle: { fontWeight: '700', marginLeft: -10, fontSize: 15 },
        drawerActiveBackgroundColor: COLORS.primary + '15', // Color primario muy clarito al seleccionar
      } as any}>
      <Drawer.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          title: 'Mapa del Campus',
          drawerIcon: ({ color, focused }) => (
            <Icon name={focused ? "map" : "map-outline"} size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 30, paddingTop: 60, alignItems: 'center',
  },
  avatarContainer: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
    overflow: 'hidden',
  },
  avatarImage: { width: '90%', height: '90%', resizeMode: 'contain' },
  userName: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5, marginBottom: 5 },
  statusBadge: {
    flexDirection: 'row', backgroundColor: COLORS.primary,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    alignItems: 'center', marginTop: 5,
  },
  userStatusText: { color: '#FFF', fontSize: 11, fontWeight: '800', marginLeft: 8, letterSpacing: 1 },
  cardSection: {
    marginHorizontal: 15, marginBottom: 20, borderRadius: 25,
    paddingVertical: 15, paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  sectionTitle: {
    marginLeft: 20, marginBottom: 15, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', opacity: 0.6, letterSpacing: 1,
  },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 5,
  },
  themeText: { fontSize: 16, marginLeft: 15, fontWeight: '700' },
  logoutContainer: { padding: 20, borderTopWidth: 1 },
});