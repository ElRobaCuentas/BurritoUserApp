import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, Dimensions } from 'react-native';
import { useDrawerStore } from '../../../store/drawerStore';
import { useUserStore } from '../../../store/userStore';
import { useThemeStore } from '../../../store/themeStore'; 
import { COLORS } from '../../../shared/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export const CustomDrawer = () => {
  const { isOpen, closeDrawer } = useDrawerStore() as any;
  const { username, avatar, logout } = useUserStore();
  const { isDarkMode, toggleTheme } = useThemeStore() as any; 

  if (!isOpen) return null;

  const initial = username ? username.charAt(0).toUpperCase() : 'U';

  const theme = {
    bg: isDarkMode ? '#121212' : '#F8F9FA',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    subText: isDarkMode ? '#A0A0A0' : '#666666',
    divider: isDarkMode ? '#333333' : '#E0E0E0',
    headerGradient: isDarkMode ? ['#0F172A', '#1E293B'] : [COLORS.primary, '#00A8E8']
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeDrawer} />
      
      <View style={[styles.drawerContainer, { backgroundColor: theme.bg }]}>
        {/* HEADER CON GRADIENTE */}
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
            <Text style={styles.brandText}>Burrito UNMSM</Text>
        </LinearGradient>

        {/* AVATAR OVERLAP */}
        <View style={styles.avatarWrapper}>
            <View style={[styles.avatarContainer, { borderColor: theme.bg, backgroundColor: theme.card }]}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                    <Text style={[styles.avatarText, { color: COLORS.primary }]}>{initial}</Text>
                )}
            </View>
        </View>

        {/* INFO USUARIO - MÁS GENÉRICO */}
        <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{username || 'Usuario'}</Text>
            <Text style={[styles.userRole, { color: theme.subText }]}>Comunidad San Marquina</Text>
        </View>

        <View style={styles.content}>
          {/* TARJETA DE CONFIGURACIÓN */}
          <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
            <View style={styles.menuItemSpace}>
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Icon name="theme-light-dark" size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.menuText, { color: theme.text }]}>Modo Oscuro</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D1D1', true: COLORS.primary }}
                thumbColor="#f4f3f4"
              />
            </View>
          </View>

          {/* CERRAR SESIÓN AL FINAL DEL TODO */}
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(255,82,82,0.1)' : '#FFF5F5' }]} 
            onPress={() => { logout(); closeDrawer(); }}
          >
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,82,82,0.15)' }]}>
                <Icon name="logout-variant" size={20} color="#FF5252" />
              </View>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.subText }]}>v1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerContainer: { width: width * 0.75, height: '100%', elevation: 20 },
  header: { height: 140, padding: 20, justifyContent: 'center', alignItems: 'center' },
  brandText: { color: 'white', fontSize: 16, fontWeight: 'bold', opacity: 0.8, letterSpacing: 1 },
  
  avatarWrapper: { alignItems: 'center', marginTop: -45, marginBottom: 10 },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
  avatarText: { fontSize: 38, fontWeight: 'bold' },
  
  userInfo: { alignItems: 'center', marginBottom: 20 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userRole: { fontSize: 13, marginTop: 2, fontWeight: '500' },

  content: { paddingHorizontal: 15, flex: 1, paddingBottom: 20 },
  menuCard: { borderRadius: 15, paddingHorizontal: 15, paddingVertical: 8, elevation: 1 },
  menuItemSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,168,232,0.1)', justifyContent: 'center', alignItems: 'center' },
  menuText: { marginLeft: 12, fontSize: 15, fontWeight: '600' },

  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 12,
    marginTop: 'auto', // Esto lo empuja hasta abajo
  },
  logoutText: { marginLeft: 12, fontSize: 15, color: '#FF5252', fontWeight: 'bold' },
  footer: { paddingBottom: 20, alignItems: 'center' },
  versionText: { fontSize: 11, opacity: 0.4, fontWeight: 'bold' }
});