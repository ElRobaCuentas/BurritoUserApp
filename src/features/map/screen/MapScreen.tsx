import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useBurritoStore } from '../../../store/burritoLocationStore';
import { useThemeStore } from '../../../store/themeStore';
import { useMapStore } from '../../../store/mapStore'; 
import { useDrawerStore } from '../../../store/drawerStore'; // 👈 Nuestro nuevo store
import { Map } from '../components/Map';
import { FAB } from '../components/FAB';
import { CustomDrawer } from '../components/CustomDrawer'; // 👈 Nuestro menú personalizado
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';
import Mapbox from '@rnmapbox/maps';

export const MapScreen = () => {
  const { location, actions } = useBurritoStore();
  const { isDarkMode } = useThemeStore();
  const { isFollowing, setCommand } = useMapStore(); 
  const { openDrawer } = useDrawerStore();

  useEffect(() => {
    actions.startTracking();
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. EL MAPA: Le damos el zIndex más bajo */}
      <View style={styles.mapWrapper}>
        <Map burritoLocation={location} isDarkMode={isDarkMode} />
      </View>

      {/* 2. CAPA UI: Botones y FAB */}
      <View style={styles.uiLayer} pointerEvents="box-none">
        <SafeAreaView style={styles.hamburgerContainer}>
          <TouchableOpacity 
            onPress={openDrawer}
            activeOpacity={0.7} // Mejora la respuesta al toque
          >
            <Icon name="menu" size={36} color={COLORS.primary} style={styles.iconShadow} />
          </TouchableOpacity>
        </SafeAreaView>

        <FAB 
          isFollowingBus={isFollowing} 
          onFollowBus={() => setCommand('follow')}
          onCenterMap={() => setCommand('center')}
        />
      </View>

      {/* 3. DRAWER: Z-Index altísimo para forzar que flote sobre la textura */}
      <View style={styles.drawerWrapper} pointerEvents="box-none">
        <CustomDrawer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' // Fondo negro evita el destello blanco
  },
  mapWrapper: {
    flex: 1,
    zIndex: 1, // Capa base
  },
  uiLayer: { 
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, // Capa media
  },
  drawerWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999, // Capa superior absoluta
  },
  hamburgerContainer: { 
    position: 'absolute', 
    top: 40, 
    left: 20 
  },
  iconShadow: { 
    textShadowColor: 'rgba(255, 255, 255, 0.9)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 4 
  }
});