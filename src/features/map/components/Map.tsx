import React, { useEffect, useRef, useMemo, useState } from 'react';
import { StyleSheet, View, Easing as RNEasing, Animated as RNAnimated, TouchableOpacity } from 'react-native'; 
import Mapbox from '@rnmapbox/maps';
import { COLORS } from '../../../shared/theme/colors';
import { PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useMapStore } from '../../../store/mapStore'; 
import { useBurritoStore } from '../../../store/burritoLocationStore'; 
import Reanimated, { FadeInDown, FadeOutDown, Easing, cancelAnimation } from 'react-native-reanimated';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import analytics from '@react-native-firebase/analytics'; // ← NUEVO

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

Mapbox.setAccessToken('pk.eyJ1IjoiZWxyb2JhY3VlbnRhcyIsImEiOiJjbWx4MDc1Y2gwanpoM2txMzd1Mzl6YjN6In0.9c9y92FLxw_MeIZaX4EdPQ'); 

const UNMSM_STATIC_VIEW = { center: [-77.0830, -12.0575] as [number, number], zoom: 15.1 };

const UNMSM_BOUNDS = { 
  ne: [-77.0600, -12.0300] as [number, number], 
  sw: [-77.1100, -12.0850] as [number, number]  
};

const STOP_COLORS = {
  light: { bg: '#E65100', border: '#FFFFFF', icon: '#FFFFFF' },
  dark: { bg: '#FFB74D', border: '#1A1A1A', icon: '#1A1A1A' }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const snapToRoute = (lat: number, lng: number) => {
  let minDistance = Infinity;
  let closestPoint = [lng, lat]; 
  RUTA_GEOJSON.geometry.coordinates.forEach((coord: number[]) => {
    const dist = calculateDistance(lat, lng, coord[1], coord[0]);
    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = coord; 
    }
  });
  return closestPoint; 
};

type RadarStatus = 'active' | 'stationary' | 'offline';

export const Map = ({ burritoLocation, isDarkMode }: any) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const { isFollowing, setIsFollowing, command, setCommand } = useMapStore();
  const busSignalStatus = useBurritoStore((state) => state.busSignalStatus);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [boundsActive, setBoundsActive] = useState(false);
  const [isFirstBusLoad, setIsFirstBusLoad] = useState(true);

  const [radarStatus, setRadarStatus] = useState<RadarStatus>('active');

  const latAnim = useRef(new RNAnimated.Value(UNMSM_STATIC_VIEW.center[1])).current;
  const lngAnim = useRef(new RNAnimated.Value(UNMSM_STATIC_VIEW.center[0])).current;
  
  const [currentPos, setCurrentPos] = useState<number[] | null>(null);
  const [currentHeading, setCurrentHeading] = useState<number>(0);

  const [radarRadius, setRadarRadius] = useState(0);
  const [radarOpacity, setRadarOpacity] = useState(0.85);
  const radarAnimValue = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    return () => {
      radarAnimValue.stopAnimation();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedStopId) {
      timer = setTimeout(() => setSelectedStopId(null), 5000); 
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [selectedStopId]);

  useEffect(() => {
    radarAnimValue.stopAnimation();
    radarAnimValue.setValue(0);

    let duration = 1200; 
    if (radarStatus === 'stationary') duration = 2500; 
    if (radarStatus === 'offline') duration = 4000; 

    const loop = RNAnimated.loop(
      RNAnimated.timing(radarAnimValue, {
        toValue: 1,
        duration: duration,
        easing: RNEasing.out(RNEasing.ease),
        useNativeDriver: false, 
      })
    );

    loop.start();

    const listenerId = radarAnimValue.addListener(({ value }) => {
      setRadarRadius(value * 60);
      setRadarOpacity(0.85 * (1 - value));
    });

    return () => {
      loop.stop();
      radarAnimValue.removeListener(listenerId);
    };
  }, [radarStatus]);

  useEffect(() => {
    if (!burritoLocation) return;

    if (burritoLocation.isActive === false || busSignalStatus === 'lost') {
      setRadarStatus('offline');
    } else if (burritoLocation.speed !== undefined && burritoLocation.speed < 2) {
      setRadarStatus('stationary');
    } else {
      setRadarStatus('active');
    }
  }, [burritoLocation, busSignalStatus]);

  useEffect(() => {
    if (burritoLocation) {
      if (burritoLocation.isActive === false) return; 

      const snappedCoords = snapToRoute(burritoLocation.latitude, burritoLocation.longitude);
      
      if (isFirstBusLoad) {
        latAnim.setValue(snappedCoords[1]);
        lngAnim.setValue(snappedCoords[0]);
        setCurrentPos(snappedCoords);
        setCurrentHeading((burritoLocation.heading || 0) - 90);
        setIsFirstBusLoad(false); 
      } else {
        RNAnimated.parallel([
          RNAnimated.timing(latAnim, { toValue: snappedCoords[1], duration: 3000, easing: RNEasing.linear, useNativeDriver: false }),
          RNAnimated.timing(lngAnim, { toValue: snappedCoords[0], duration: 3000, easing: RNEasing.linear, useNativeDriver: false }),
        ]).start();
        setCurrentHeading((burritoLocation.heading || 0) - 90);
      }
    }
  }, [burritoLocation]);

  useEffect(() => {
    const listenerId = lngAnim.addListener(() => {
      // @ts-ignore
      setCurrentPos([lngAnim._value, latAnim._value]);
    });
    return () => lngAnim.removeListener(listenerId);
  }, []);

  const busShape = useMemo(() => {
    if (!currentPos) return null; 
    return {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: currentPos }
    };
  }, [currentPos]);

  useEffect(() => {
    if (isMapReady) {
      cameraRef.current?.setCamera({
        centerCoordinate: UNMSM_STATIC_VIEW.center,
        zoomLevel: UNMSM_STATIC_VIEW.zoom,
        animationDuration: 0, 
      });
      setTimeout(() => { setBoundsActive(true); }, 800);
    }
  }, [isMapReady]);

  useEffect(() => {
    if (command === 'center') {
      cameraRef.current?.setCamera({ 
        centerCoordinate: UNMSM_STATIC_VIEW.center, 
        zoomLevel: UNMSM_STATIC_VIEW.zoom, 
        animationDuration: 2000, 
        animationMode: 'flyTo' 
      });
      setIsFollowing(false); 
      setCommand(null);
    } else if (command === 'follow' && currentPos) {
      cameraRef.current?.setCamera({ 
        centerCoordinate: currentPos as [number, number],
        zoomLevel: 17.5, 
        animationDuration: 2000, 
        animationMode: 'flyTo' 
      });
      setIsFollowing(true); 
      setCommand(null);
    }
  }, [command, currentPos]);

  useEffect(() => {
    if (isFollowing && currentPos && burritoLocation?.isActive !== false) {
      cameraRef.current?.setCamera({ 
        centerCoordinate: currentPos as [number, number],
        zoomLevel: 17.5, 
        animationDuration: 3000, 
        animationMode: 'linearTo' 
      }); 
    }
  }, [currentPos, isFollowing]);

  const selectedStop = useMemo(() => PARADEROS.find(p => p.id === selectedStopId), [selectedStopId]);
  const currentStopTheme = isDarkMode ? STOP_COLORS.dark : STOP_COLORS.light;

  let radarBorderColor = COLORS.primary;
  let radarBgColor = 'rgba(0, 174, 239, 0.35)';
  if (radarStatus === 'stationary') {
    radarBorderColor = '#FF9800';
    radarBgColor = 'rgba(255, 152, 0, 0.35)';
  } else if (radarStatus === 'offline') {
    radarBorderColor = '#F44336';
    radarBgColor = 'rgba(244, 67, 54, 0.35)';
  }

  const showBusOnMap = burritoLocation && burritoLocation.isActive !== false;

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map} 
        scaleBarEnabled={false} 
        attributionEnabled={false} 
        logoEnabled={false}
        styleURL={isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        onRegionWillChange={(e) => { if (e.properties.isUserInteraction) setIsFollowing(false); }}
        onPress={() => setSelectedStopId(null)}
      >
        <Mapbox.Camera 
          ref={cameraRef} 
          defaultSettings={{ 
            centerCoordinate: UNMSM_STATIC_VIEW.center, 
            zoomLevel: UNMSM_STATIC_VIEW.zoom 
          }} 
          maxBounds={boundsActive ? UNMSM_BOUNDS : undefined} 
        />
        
        <Mapbox.Images images={{ busIcon: require('../../../assets/bus.png') }} />
        
        <Mapbox.ShapeSource id="routeSource" shape={RUTA_GEOJSON}>
          <Mapbox.LineLayer 
            id="routeLine" 
            style={{ lineColor: COLORS.primary, lineWidth: 5, lineOpacity: 0.85 }} 
          />
        </Mapbox.ShapeSource>

        {showBusOnMap && currentPos && (
          <Mapbox.ShapeSource id="radarSource" shape={busShape as any}>
            <Mapbox.CircleLayer
              id="radarRingInner"
              style={{
                circleRadius: radarRadius,
                circleOpacity: radarOpacity,
                circleColor: radarBgColor,
                circleStrokeWidth: 4,
                circleStrokeColor: radarBorderColor,
                circleStrokeOpacity: radarOpacity,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {PARADEROS.map(p => (
          <Mapbox.MarkerView 
            key={p.id} 
            id={p.id} 
            coordinate={[p.longitude, p.latitude]} 
            allowOverlap={true}
          >
            <TouchableOpacity 
              activeOpacity={0.6}
              onPress={() => {
                ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
                analytics().logEvent('paradero_tocado', { nombre: p.name }); // ← NUEVO
                setSelectedStopId(prev => prev === p.id ? null : p.id);
              }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} 
              style={[
                styles.markerContainer,
                { 
                  backgroundColor: currentStopTheme.bg,
                  borderColor: currentStopTheme.border
                }
              ]}
            >
              <Icon name="bus-stop" size={14} color={currentStopTheme.icon} />
            </TouchableOpacity>
          </Mapbox.MarkerView>
        ))}

        {showBusOnMap && busShape && (
          <Mapbox.ShapeSource id="busSource" shape={busShape as any}>
            <Mapbox.SymbolLayer 
              id="busLayer" 
              style={{ 
                iconImage: 'busIcon', 
                iconSize: 0.08, 
                iconRotate: currentHeading, 
                iconRotationAlignment: 'map', 
                iconAllowOverlap: true, 
                iconIgnorePlacement: true 
              }} 
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>

      {selectedStop && (
        <Reanimated.View 
          key={selectedStop.id} 
          entering={FadeInDown.springify().stiffness(400).damping(25).mass(0.5)} 
          exiting={FadeOutDown.duration(150).easing(Easing.in(Easing.ease))} 
          style={styles.cardWrapper} 
          pointerEvents="box-none"
        >
          <StopCard title={selectedStop.name || 'Paradero'} onClose={() => setSelectedStopId(null)} />
        </Reanimated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  map: { flex: 1 }, 
  markerContainer: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 2,
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  }, 
  cardWrapper: { position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 100, elevation: 10 }
});