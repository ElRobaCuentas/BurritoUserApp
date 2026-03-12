import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../../shared/theme/colors';
import { TYPOGRAPHY } from '../../../shared/theme/typography';
import { useBurritoStore } from '../../../store/burritoLocationStore';

interface MapBrandingProps {
  isDarkMode: boolean;
}

// Config de los 3 estados del badge de abajo.
// El pill (B + punto) no cambia por dentro, sigue igual que siempre.
const SIGNAL_CONFIG = {
  stable: { label: 'EN SERVICIO', bgColor: '#4CAF50' },
  weak:   { label: 'SEÑAL DÉBIL', bgColor: '#FF9800' },
  lost:   { label: 'SIN SEÑAL',   bgColor: '#FF5252' },
};

export const MapBranding = ({ isDarkMode }: MapBrandingProps) => {
  const insets = useSafeAreaInsets();
  const busSignalStatus = useBurritoStore((state) => state.busSignalStatus);
  const location = useBurritoStore((state) => state.location);

  // Si el conductor apagó el bus, el badge muestra "SIN SEÑAL" rojo.
  // El mensaje "BURRITO DESCANSANDO" vive en MapScreen, no aquí.
  const isBusOff = location?.isActive === false;
  const config = isBusOff ? SIGNAL_CONFIG.lost : SIGNAL_CONFIG[busSignalStatus];

  const gradientColors = isDarkMode
    ? ['rgba(30, 30, 30, 0.95)', COLORS.primary + '10']
    : ['#FFFFFF', COLORS.primary + '30'];

  // El punto verde/rojo del pill sigue su lógica original
  const dotColor = (busSignalStatus === 'stable' || busSignalStatus === 'weak') && !isBusOff
    ? '#4CAF50'
    : '#FF5252';

  return (
    <Animated.View
      entering={FadeInUp.delay(1000).springify()}
      style={[
        styles.container,
        { top: Platform.OS === 'android' ? insets.top + 15 : insets.top + 10 }
      ]}
    >
      {/* ── PILL ORIGINAL (B + punto) ── sin cambios internos ── */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pill}
      >
        <Text style={[styles.brandText, { color: COLORS.primary }]}>
          B
        </Text>
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
      </LinearGradient>

      {/* ── BADGE DE ESTADO: flota DEBAJO del pill, mismo ancho ── */}
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Text style={styles.statusLabel}>{config.label}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 6 }
    })
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.15)',
  },
  brandText: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.primary.bold,
    marginRight: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  // Badge debajo del pill, se estira al mismo ancho automáticamente
  statusBadge: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 7,
    fontFamily: TYPOGRAPHY.primary.bold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});