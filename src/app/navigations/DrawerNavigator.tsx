import React, { useEffect } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Switch, useColorScheme, TouchableOpacity } from 'react-native'; 
import { MapScreen } from '../../features/map/screen/MapScreen';
import { COLORS } from '../../shared/theme/colors';
import { useThemeStore } from '../../store/themeStore';
import { useUserStore } from '../../store/userStore'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { username, avatar, logout } = useUserStore();

  const getAvatarColor = (id: string | null) => {
    const avatarColors: { [key: string]: string } = {
      av1: '#FFBD59', // Amarillo
      av2: '#FF5757', // Rojo
      av3: '#8C52FF', // Morado
      av4: '#5CE1E6', // Celeste
    };
    return (id && avatarColors[id]) ? avatarColors[id] : '#E0E0E0';
  };

  const bgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1A1A1A';
  const subTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const dividerColor = isDarkMode ? '#333333' : '#F0F0F0';
  const iconColor = isDarkMode ? COLORS.primary : '#555555';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }} style={{ backgroundColor: bgColor }}>
      <View style={styles.drawerHeader}>
        <View style={[styles.coverPhoto, { backgroundColor: COLORS.primary }]} />
        
        <View style={styles.userInfoSection}>
          {/* Avatar con Color Dinámico, Sombra y Letra Inicial */}
          <View style={[
            styles.avatar, 
            { 
              backgroundColor: getAvatarColor(avatar), 
              borderColor: bgColor,
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}>
            <Text style={styles.avatarLetter}>
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.userName, { color: textColor }]}>
                {username || 'Usuario'}
            </Text>
            
            {/* Badge de Estudiante Sanmarquino */}
            <View style={styles.statusBadge}>
              <Icon name="school" size={14} color="#FFF" />
              <Text style={styles.userStatusText}>ESTUDIANTE UNMSM</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Lista de Navegación del Drawer */}
      <View style={{ paddingHorizontal: 10 }}>
        <DrawerItemList {...props} />
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* Sección de Configuración y Tema */}
      <View style={styles.themeSection}>
        <View style={styles.themeRow}>
          <Icon name="weather-night" size={24} color={iconColor} />
          <Text style={[styles.themeText, { color: textColor }]}>Modo Oscuro</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: '#555555', true: COLORS.primary }}
          thumbColor={'#FFFFFF'}
        />
      </View>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={() => logout()}
      >
        <Icon name="logout" size={22} color="#FF5757" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
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
      detachInactiveScreens={false} 
      screenOptions={{
    headerShown: true, 
    headerTitle: 'Burrito UNMSM',
    headerTransparent: true,
    headerTintColor: COLORS.primary,
    drawerStyle: { width: 280 },
    // 🚨 CONFIGURACIÓN CRÍTICA
    drawerType: 'front', 
    overlayColor: 'rgba(0,0,0,0.5)', 
    detachInactiveScreens: false,
  } as any}
    >
      <Drawer.Screen 
        name="MapScreen" 
        component={MapScreen} 
        options={{ 
            unmountOnBlur: false, 
            title: 'Mapa de Rutas',
drawerIcon: ({color}: {color: string}) => <Icon name="map-marker-radius" size={22} color={color} />        } as any} 
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: { marginBottom: 20 },
  coverPhoto: { height: 140, opacity: 0.8 },
  userInfoSection: { paddingHorizontal: 20, marginTop: -45 },
  avatar: { 
    width: 85, 
    height: 85, 
    borderRadius: 45, 
    borderWidth: 4, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarLetter: { 
    color: '#FFF', 
    fontSize: 38, 
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowRadius: 3
  },
  userName: { fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  userStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.8
  },
  divider: { height: 1, marginVertical: 10, marginHorizontal: 20 },
  themeSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15 
  },
  themeRow: { flexDirection: 'row', alignItems: 'center' },
  themeText: { fontSize: 16, marginLeft: 15, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 10,
  },
  logoutText: {
    color: '#FF5757',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  }
});