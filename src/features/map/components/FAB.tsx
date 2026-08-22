import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FABProps {
  onCenterMap: () => void;
}

export const FAB = ({ onCenterMap }: FABProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Platform.OS === 'android' ? insets.bottom + 52 : insets.bottom + 42
        }
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onCenterMap}
        activeOpacity={0.8}
      >
        <Icon name="map-outline" size={24} color="#1A1A1A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
});