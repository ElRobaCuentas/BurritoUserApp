import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useBurritoStore } from '../../../store/burritoLocationStore';
import { useThemeStore } from '../../../store/themeStore';
import { useMapStore } from '../../../store/mapStore'; 
import { useDrawerStore } from '../../../store/drawerStore'; 
import { Map } from '../components/Map';
import { FAB } from '../components/FAB';
import { CustomDrawer } from '../components/CustomDrawer'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';

// Animaciones para el Velo
import Animated, { FadeOut, FadeIn, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient'; 
import LottieView from 'lottie-react-native'; 

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const MapScreen = () => {
  const { location, isBusOnline, actions } = useBurritoStore();
  const { isDarkMode } = useThemeStore();
  const { isFollowing, setCommand } = useMapStore(); 
  const { openDrawer } = useDrawerStore();
  const [minTimeReached, setMinTimeReached] = useState(false);

  // Animación del texto
  const opacityText = useSharedValue(0.6);
  useEffect(() => {
    opacityText.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.6, { duration: 800 })), 
      -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacityText.value }));

  useEffect(() => {
    actions.startTracking();
    const timer = setTimeout(() => setMinTimeReached(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // REGLA: Mostrar velo si no hay bus online O si no pasó el tiempo mínimo
  const showLoading = !minTimeReached || !isBusOnline;

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <Map burritoLocation={location} isDarkMode={isDarkMode} />
      </View>

      <View style={styles.uiLayer} pointerEvents="box-none">
        <SafeAreaView style={styles.hamburgerContainer}>
          <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
            <Icon name="menu" size={36} color={COLORS.primary} style={styles.iconShadow} />
          </TouchableOpacity>
        </SafeAreaView>
        <FAB isFollowingBus={isFollowing} onFollowBus={() => setCommand('follow')} onCenterMap={() => setCommand('center')} />
      </View>

      <View style={styles.drawerWrapper} pointerEvents="box-none">
        <CustomDrawer />
      </View>

      {/* 🚢 EL VELO SUPREMO: Tapa hamburguesa y botones */}
      {showLoading && (
        <Animated.View exiting={FadeOut.duration(800)} style={styles.overAllVelo}>
          <LinearGradient colors={['#00AEEF', '#FFFFFF']} style={styles.loadingOverlay}>
            <LottieView 
              source={{ uri: 'https://assets1.lottiefiles.com/packages/lf20_698wixtv.json' }} 
              autoPlay loop style={styles.lottieLoader} 
            />
            <Animated.Text style={[styles.loadingText, pulseStyle]}>Esperando al Burrito...</Animated.Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapWrapper: { flex: 1, zIndex: 1 },
  uiLayer: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  drawerWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  hamburgerContainer: { position: 'absolute', top: 40, left: 20 },
  iconShadow: { textShadowColor: 'rgba(255, 255, 255, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  overAllVelo: {
    position: 'absolute',
    top: -100, left: -100,
    width: SCREEN_WIDTH + 200, height: SCREEN_HEIGHT + 200,
    zIndex: 9999, elevation: 100,
  },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lottieLoader: { width: 250, height: 250 },
  loadingText: { marginTop: 20, fontSize: 22, color: '#FFF', fontWeight: '900' }
});