import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useUserStore } from '../../../store/userStore';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  // Extraemos los datos del usuario desde Zustand
  const { username, avatar } = useUserStore();

  // Mapeamos el ID del avatar al color correspondiente (debe coincidir con LoginScreen)
  const getAvatarColor = (id: string | null) => {
    const colors: { [key: string]: string } = {
      av1: '#FFBD59',
      av2: '#FF5757',
      av3: '#8C52FF',
      av4: '#5CE1E6',
    };
    return id ? colors[id] : '#CCC';
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* SECCIÓN DE PERFIL */}
      <View style={styles.profileSection}>
        <View style={[styles.avatarCircle, { backgroundColor: getAvatarColor(avatar) }]}>
          <Text style={styles.avatarLetter}>
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{username || 'Usuario'}</Text>
        <Text style={styles.userStatus}>Sanmarquino</Text>
      </View>

      <View style={styles.divider} />

      {/* LISTA DE OPCIONES DEL MENÚ (Rutas del Drawer) */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarLetter: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userStatus: { fontSize: 12, color: '#00AEEF', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEE', marginHorizontal: 20, marginBottom: 10 },
});