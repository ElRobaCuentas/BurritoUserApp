import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  Platform 
} from 'react-native';
// Hook esencial para el diseño extraordinario
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBurritoStore } from '../../../store/burritoLocationStore';
import { useThemeStore } from '../../../store/themeStore';
import { useMapStore } from '../../../store/mapStore'; 
import { useDrawerStore } from '../../../store/drawerStore'; 
import { Map } from '../components/Map';
import { FAB } from '../components/FAB';
import { CustomDrawer } from '../components/CustomDrawer'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';

export const MapScreen = () => {
  const { location, isBusOnline, actions } = useBurritoStore();
  const { isDarkMode } = useThemeStore();
  const { isFollowing, setCommand } = useMapStore(); 
  const { openDrawer } = useDrawerStore();
  
  // Extraemos los márgenes de seguridad dinámicos
  const insets = useSafeAreaInsets();

  const [minTimeReached, setMinTimeReached] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    actions.startTracking();
    const timer = setTimeout(() => setMinTimeReached(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isBusOnline && minTimeReached) {
      setHasInitialLoad(true);
    }
  }, [isBusOnline, minTimeReached]);

  return (
    <View style={styles.container}>
      {/* Status Bar transparente para que el mapa sea 'full screen' */}
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      {/* CAPA 0: MAPA (Fondo total) */}
      <View style={styles.mapWrapper}>
        <Map burritoLocation={location} isDarkMode={isDarkMode} />
      </View>

      {/* CAPA 1: INTERFAZ (Botones y Menú) */}
      <View style={styles.uiLayer} pointerEvents="box-none">
        
        {/* CONTENEDOR SUPERIOR: Usa insets.top para evitar el notch */}
        <View 
          style={[
            styles.topBar, 
            { 
              // En Android sumamos el alto del status bar + 10px de aire
              // En iOS insets.top ya incluye el notch
              paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top + 5 
            }
          ]} 
          pointerEvents="box-none"
        >
          <TouchableOpacity 
            onPress={openDrawer} 
            activeOpacity={0.8} 
            style={styles.hamburgerButton}
          >
            <Icon name="menu" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* CONTENEDOR INFERIOR: Le pasamos el margen inferior al FAB si fuera necesario */}
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: insets.bottom }} pointerEvents="box-none">
          <FAB 
            isFollowingBus={isFollowing} 
            onFollowBus={() => setCommand('follow')} 
            onCenterMap={() => setCommand('center')} 
          />
        </View>
      </View>

      {/* DRAWER */}
      <View style={styles.drawerWrapper} pointerEvents="box-none">
        <CustomDrawer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  uiLayer: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  drawerWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  topBar: { 
    paddingHorizontal: 20, 
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  hamburgerButton: {
    backgroundColor: 'white', 
    width: 54, 
    height: 54, 
    borderRadius: 27, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 6,
  }
});