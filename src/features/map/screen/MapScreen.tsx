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
// import { COLORS } from '../../../shared/theme/colors'; // Definimos el primario aquí para tener todo en un archivo
import { TYPOGRAPHY } from '../../../shared/theme/typography';

// 🔥 GRADIENTES Y ANIMACIONES
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeOut } from 'react-native-reanimated';

// Define el color primario y una variante oscura sólida para el degradado profesional
const BURRITO_COLORS = {
  primary: '#00AEEF',
  darkPrimary: '#005D8C', // Azul oscuro sólido y opaco para el modo oscuro
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
    // ⏳ Mínimo 1.5 segundos de pantalla de carga obligatoria para que el gradiente se luzca
    const timer = setTimeout(() => setMinTimeReached(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 🎯 Solo termina la carga si pasó el tiempo Y tenemos ubicación real
    if (minTimeReached && location) {
      setHasInitialLoad(true);
    }
  }, [location, minTimeReached]);

  // 🎨 CONFIGURACIÓN DEL GRADIENTE PROFESIONAL OPACO (SIN TRANSPARENCIAS)
  const loadingGradient = isDarkMode 
    ? ['#121212', BURRITO_COLORS.darkPrimary] // Sólido: de oscuro a azul profundo
    : ['#FFFFFF', BURRITO_COLORS.primary];   // Sólido: de blanco a azul primario

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      {/* CAPA 0: MAPA (Carga en silencio al fondo, completamente tapado por el "muro" de carga) */}
      <View style={styles.mapWrapper}>
        <Map burritoLocation={location} isDarkMode={isDarkMode} />
      </View>

      {/* 🚀 PANTALLA DE CARGA INQUEBRANTABLE (Con Desvanecido Animado y Gradiente Sólido) */}
      {!hasInitialLoad && (
        <Animated.View 
          // El FadeOut.duration(600) hace que la pantalla se disuelva suavemente al terminar, revelando la UI
          exiting={FadeOut.duration(600)} 
          style={styles.loadingOverlay}
        >
          <LinearGradient 
            colors={loadingGradient} 
            style={styles.gradientWrapper}
          >
            {/* Contenedor del logo/texto para darle más presencia */}
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

      {/* 📱 INTERFAZ DEL MAPA (Los botones SOLO existen si la carga ya terminó. ¡Solucionamos el retraso!) */}
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
              onPress={openDrawer} 
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
  
  // 🔥 ESTILO DE CARGA INQUEBRANTABLE, SÓLIDO Y ANIMADO
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999, // Superpone a todo: Drawers, UI, y Mapa
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