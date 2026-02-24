import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useBurritoStore } from '../../../store/burritoLocationStore';
import { useThemeStore } from '../../../store/themeStore';
import { useMapStore } from '../../../store/mapStore'; 
import { useDrawerStore } from '../../../store/drawerStore'; 
import { Map } from '../components/Map';
import { FAB } from '../components/FAB';
import { CustomDrawer } from '../components/CustomDrawer'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';

import Animated, { FadeOut, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient'; 
import LottieView from 'lottie-react-native'; 
import { TYPOGRAPHY } from '../../../shared/theme/typography';

export const MapScreen = () => {
  const { location, isBusOnline, actions } = useBurritoStore();
  const { isDarkMode } = useThemeStore();
  const { isFollowing, setCommand } = useMapStore(); 
  const { openDrawer } = useDrawerStore();
  
  const [minTimeReached, setMinTimeReached] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    actions.startTracking();
    const timer = setTimeout(() => setMinTimeReached(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // REGLA: Velo desaparece permanentemente en cuanto detecta al bus 1 vez
  useEffect(() => {
    if (isBusOnline && minTimeReached) {
      setHasInitialLoad(true);
    }
  }, [isBusOnline, minTimeReached]);

  const showLoading = !hasInitialLoad;

  const opacityText = useSharedValue(0.6);
  useEffect(() => {
    opacityText.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.6, { duration: 800 })), 
      -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacityText.value }));

  return (
    <View style={styles.container}>
      <View style={[styles.mapWrapper, StyleSheet.absoluteFillObject]}>
        <Map burritoLocation={location} isDarkMode={isDarkMode} />
      </View>

      <View style={styles.uiLayer} pointerEvents="box-none">
        <SafeAreaView style={styles.hamburgerContainer}>
          {/* 🍔 BOTÓN DE MENÚ (Estilo FAB Blanco Circular) */}
          <TouchableOpacity onPress={openDrawer} activeOpacity={0.8} style={styles.hamburgerButton}>
            <Icon name="menu" size={28} color={COLORS.shadow} />
          </TouchableOpacity>
        </SafeAreaView>

        <FAB isFollowingBus={isFollowing} onFollowBus={() => setCommand('follow')} onCenterMap={() => setCommand('center')} />
      </View>

      <View style={styles.drawerWrapper} pointerEvents="box-none">
        <CustomDrawer />
      </View>

      {showLoading && (
        <Animated.View exiting={FadeOut.duration(800)} style={styles.overAllVelo} pointerEvents="none">
          <LinearGradient colors={['#00AEEF', '#FFFFFF']} style={styles.loadingOverlay}>
            <LottieView source={{ uri: 'https://assets1.lottiefiles.com/packages/lf20_698wixtv.json' }} autoPlay loop style={styles.lottieLoader} />
            <Animated.Text style={[styles.loadingText, pulseStyle]}>Esperando al Burrito...</Animated.Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, mapWrapper: { zIndex: 1 }, uiLayer: { ...StyleSheet.absoluteFillObject, zIndex: 10 }, drawerWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  hamburgerContainer: { position: 'absolute', top: 40, left: 20 },
  hamburgerButton: {
    backgroundColor: 'white', width: 45, height: 45, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5,
  },
  overAllVelo: { ...StyleSheet.absoluteFillObject, zIndex: 9999, elevation: 100 }, loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' }, lottieLoader: { width: 250, height: 250 },
  loadingText: { marginTop: 20, fontSize: 22, color: '#FFF', fontFamily: TYPOGRAPHY.primary.bold, letterSpacing: -0.5 }
});