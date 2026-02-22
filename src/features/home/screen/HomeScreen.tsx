import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { useUserStore } from '../../../store/userStore';

const AVATARES = [
  { id: 'bus', img: require('../../../assets/bus.png') },
  { id: 'logo', img: require('../../../assets/logo.png') },
  // Agrega más si tienes: { id: 'odonto', img: require('../../../assets/odonto.jpg') }
];

export const HomeScreen = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('bus');
  const setProfile = useUserStore((state) => state.setProfile);

  const handleStart = () => {
    if (name.trim().length < 3) return alert('Pon un nombre de al menos 3 letras');
    setProfile(name, selectedAvatar);
    // Automáticamente el StackNavigator detectará el cambio y te mandará al Mapa
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Hola, Sanmarquino!</Text>
      <Text style={styles.subtitle}>Elige tu avatar y nombre para continuar</Text>

      <View style={styles.avatarGrid}>
        {AVATARES.map((item) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => setSelectedAvatar(item.id)}
            style={[styles.avatarWrapper, selectedAvatar === item.id && styles.selected]}>
            <Image source={item.img} style={styles.avatarImg} />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tu nombre o apodo"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>COMENZAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 30, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#003366', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  avatarGrid: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 30 },
  avatarWrapper: { padding: 5, borderRadius: 50, borderWidth: 3, borderColor: 'transparent' },
  selected: { borderColor: '#003366' },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 15, fontSize: 18, marginBottom: 20, color: '#333' },
  button: { backgroundColor: '#003366', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
