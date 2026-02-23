import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native'; // 👈 Switch añadido
import { useDrawerStore } from '../../../store/drawerStore';
import { useUserStore } from '../../../store/userStore';
import { useThemeStore } from '../../../store/themeStore'; 
import { COLORS } from '../../../shared/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export const CustomDrawer = () => {
  const { isOpen, closeDrawer } = useDrawerStore() as any;
  const { username, avatar, logout } = useUserStore();
  
  // 🛠️ Sacamos isDarkMode y la acción para cambiarlo
  const { isDarkMode, toggleTheme } = useThemeStore() as any; 

  if (!isOpen) return null;

  const initial = username ? username.charAt(0).toUpperCase() : 'U';

  const theme = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    divider: isDarkMode ? '#2C2C2C' : '#F0F0F0',
    headerGradient: isDarkMode ? ['#1f2937', '#111827'] : [COLORS.primary, '#007BB5']
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeDrawer} />
      
      <View style={[styles.drawerContainer, { backgroundColor: theme.bg }]}>
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <View style={styles.avatarContainer}>
            {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{initial}</Text>}
          </View>
          <Text style={styles.userName}>{username || 'Pepe'}</Text>
          <Text style={styles.userRole}>Estudiante UNMSM</Text>
        </LinearGradient>

        <View style={styles.content}>
          
          {/* 🌙 AQUÍ ESTÁ LA MALDITA PALANCA QUE ME OLVIDÉ */}
          <View style={styles.menuItemSpace}>
            <View style={styles.row}>
              <Icon name="theme-light-dark" size={24} color={COLORS.primary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Modo Oscuro</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme} // 👈 Esta es la acción que cambia todo
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="account-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>Mi Perfil</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => { logout(); closeDrawer(); }}
          >
            <Icon name="logout" size={24} color="#FF5252" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerContainer: { width: 280, height: '100%', elevation: 16 },
  header: { padding: 30, paddingTop: 60, alignItems: 'center' },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', marginBottom: 10, overflow: 'hidden'
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: 'white', fontSize: 35, fontWeight: 'bold' },
  userName: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  userRole: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  content: { padding: 20, flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuItemSpace: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', // Separa el texto del switch
    paddingVertical: 15 
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  menuText: { marginLeft: 15, fontSize: 16, fontWeight: '500' },
  divider: { height: 1, marginVertical: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto', paddingBottom: 25 },
  logoutText: { marginLeft: 15, fontSize: 16, color: '#FF5252', fontWeight: 'bold' },
});