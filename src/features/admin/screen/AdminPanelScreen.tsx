import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../../app/navigations/StackNavigator';
import { COLORS } from '../../../shared/theme/colors';
import { TYPOGRAPHY } from '../../../shared/theme/typography';

type AdminPanelNavProp = StackNavigationProp<RootStackParams, 'AdminPanelScreen'>;

export const AdminPanelScreen = () => {
  const navigation = useNavigation<AdminPanelNavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Control</Text>
      <Text style={styles.subtitle}>Selecciona el módulo que deseas gestionar:</Text>

      <View style={styles.menuContainer}>
        {/* BOTÓN GESTIÓN DE CHOFERES */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('ChoferesScreen')}
        >
          <Text style={styles.buttonEmoji}>🚌</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Gestión de Choferes</Text>
            <Text style={styles.buttonDescription}>Registrar, activar y desactivar conductores</Text>
          </View>
        </TouchableOpacity>

        {/* Los siguientes módulos se agregarán en las próximas tareas (T08 y T09) */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontFamily: TYPOGRAPHY.primary.bold,
    fontSize: 24,
    color: COLORS.textTitle,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.primary.regular,
    fontSize: 14,
    color: '#666666', // Usamos un gris estándar porque tu tema no tiene textSecondary
    marginBottom: 30,
    marginTop: 5,
  },
  menuContainer: {
    gap: 15,
  },
  menuButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontFamily: TYPOGRAPHY.primary.semiBold,
    fontSize: 16,
    color: COLORS.textTitle,
  },
  buttonDescription: {
    fontFamily: TYPOGRAPHY.primary.regular,
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
});