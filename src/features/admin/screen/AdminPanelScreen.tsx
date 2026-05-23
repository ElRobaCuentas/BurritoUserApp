import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';

export const AdminPanelScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={32} color="#1A1A1A" />
      </TouchableOpacity>
      <View style={styles.center}>
        <Icon name="shield-account" size={70} color={COLORS.primary} />
        <Text style={styles.title}>Panel de Gestión</Text>
        <Text style={styles.subtitle}>Próximamente: Administración de Buses</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F9', padding: 20 },
  backBtn: { marginTop: 40, width: 40, height: 40, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  title: { fontSize: 26, fontWeight: 'bold', marginTop: 15, color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 },
});