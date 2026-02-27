import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  Platform,
  Text,
  ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBurritoStore } from '../../../store/burritoLocationStore';
import { useThemeStore } from '../../../store/themeStore';
import { useMapStore } from '../../../store/mapStore'; 
import { useDrawerStore } from '../../../store/drawerStore'; 
import { Map } from '../components/Map';
import { FAB } from '../components/FAB';
import { CustomDrawer } from '../components/CustomDrawer'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TYPOGRAPHY } from '../../../shared/theme/typography';
// 🔥 IMPORTAMOS LA LIBRERÍA DE HÁPTICA
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeOut } from 'react-native-reanimated';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const BURRITO_COLORS = {
  primary: '#00AEEF',
  darkPrimary: '#005D8C', 
};

export const MapScreen = () => {
  const { location, actions } = useBurritoStore(); 
  const { isDarkMode } = useThemeStore();
  const { isFollowing, setCommand } = useMapStore(); 
  const { openDrawer } = useDrawerStore();
  
  const insets = useSafeAreaInsets();

  const [minTimeReached, setMinTimeReached] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    actions.startTracking();
    const timer = setTimeout(() => setMinTimeReached(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeReached && location) {
      setHasInitialLoad(true);
    }
  }, [location, minTimeReached]);

  const loadingGradient = isDarkMode 
    ? ['#121212', BURRITO_COLORS.darkPrimary] 
    : ['#FFFFFF', BURRITO_COLORS.primary];  

  // 🔥 LÓGICA DE DOBLE VIBRACIÓN SUAVE PARA EL MENÚ
  const handleOpenDrawerWithHaptic = () => {
    ReactNativeHapticFeedback.trigger("soft", hapticOptions);
    setTimeout(() => {
      ReactNativeHapticFeedback.trigger("soft", hapticOptions);
    }, 120); // Retraso de 120ms para simular el doble tick
    openDrawer();
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      <View style={styles.mapWrapper}>
        <Map burritoLocation={location} isDarkMode={isDarkMode} />
      </View>

      {!hasInitialLoad && (
        <Animated.View 
          exiting={FadeOut.duration(600)} 
          style={styles.loadingOverlay}
        >
          <LinearGradient 
            colors={loadingGradient} 
            style={styles.gradientWrapper}
          >
            <View style={styles.loaderContent}>
              <ActivityIndicator size="large" color={BURRITO_COLORS.primary} style={{ marginBottom: 20 }} />
              <Text style={[styles.loadingText, { color: isDarkMode ? '#FFFFFF' : '#FFFF' }]}>
                Esperando al burrito...
              </Text>
              <Text style={[styles.subLoadingText, { color: isDarkMode ? '#A0A0A0' : '#666666' }]}>
                Sincronizando ubicación
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {hasInitialLoad && (
        <View style={styles.uiLayer} pointerEvents="box-none">
          <View 
            style={[
              styles.topBar, 
              { paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top + 5 }
            ]} 
            pointerEvents="box-none"
          >
            <TouchableOpacity 
              onPress={handleOpenDrawerWithHaptic} // 🔥 Usamos la nueva función con vibración
              activeOpacity={0.8} 
              style={styles.hamburgerButton}
            >
              <Icon name="menu" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: insets.bottom }} pointerEvents="box-none">
            <FAB 
              isFollowingBus={isFollowing} 
              onFollowBus={() => setCommand('follow')} 
              onCenterMap={() => setCommand('center')} 
            />
          </View>
        </View>
      )}

      <View style={styles.drawerWrapper} pointerEvents="box-none">
        <CustomDrawer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999, 
  },
  gradientWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.primary.bold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  subLoadingText: {
    fontFamily: TYPOGRAPHY.primary.regular,
    fontSize: 12,
    marginTop: 5,
    letterSpacing: 0.3,
  },
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