import React, { useEffect, useRef, useMemo, useState } from 'react';
// 🔥 CAMBIO 1: Renombramos Easing a RNEasing para las animaciones del Burrito
import { StyleSheet, View, Easing as RNEasing, Animated as RNAnimated, TouchableOpacity } from 'react-native'; 
import Mapbox from '@rnmapbox/maps';
import { COLORS } from '../../../shared/theme/colors';
import { PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useMapStore } from '../../../store/mapStore'; 
// 🔥 CAMBIO 2: Importamos el Easing de Reanimated para la tarjeta
import Reanimated, { FadeInDown, FadeOutDown, Easing } from 'react-native-reanimated';

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

export const Map = ({ burritoLocation, isDarkMode }: any) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const { isFollowing, setIsFollowing, command, setCommand } = useMapStore();
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [boundsActive, setBoundsActive] = useState(false);
  const [isFirstBusLoad, setIsFirstBusLoad] = useState(true);

  const latAnim = useRef(new RNAnimated.Value(UNMSM_STATIC_VIEW.center[1])).current;
  const lngAnim = useRef(new RNAnimated.Value(UNMSM_STATIC_VIEW.center[0])).current;
  
  const [currentPos, setCurrentPos] = useState<number[] | null>(null);
  const [currentHeading, setCurrentHeading] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedStopId) {
      timer = setTimeout(() => setSelectedStopId(null), 5000); 
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [selectedStopId]);

  useEffect(() => {
    if (burritoLocation) {
      const snappedCoords = snapToRoute(burritoLocation.latitude, burritoLocation.longitude);
      
      if (isFirstBusLoad) {
        latAnim.setValue(snappedCoords[1]);
        lngAnim.setValue(snappedCoords[0]);
        setCurrentPos(snappedCoords);
        setCurrentHeading((burritoLocation.heading || 0) - 90);
        setIsFirstBusLoad(false); 
      } else {
        RNAnimated.parallel([
          // 🔥 CAMBIO 3: Usamos RNEasing para el movimiento del bus
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

      setTimeout(() => {
        setBoundsActive(true);
      }, 800);
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
    } else if (command === 'follow' && burritoLocation) {
      cameraRef.current?.setCamera({ 
        centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude], 
        zoomLevel: 17.5, 
        animationDuration: 2000, 
        animationMode: 'flyTo' 
      });
      setIsFollowing(true); 
      setCommand(null);
    }
  }, [command, burritoLocation]);

  useEffect(() => {
    if (isFollowing && burritoLocation) {
      cameraRef.current?.setCamera({ 
        centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude], 
        zoomLevel: 17.5, 
        animationDuration: 3000, 
        animationMode: 'linearTo' 
      }); 
    }
  }, [burritoLocation, isFollowing]);

  const selectedStop = useMemo(() => PARADEROS.find(p => p.id === selectedStopId), [selectedStopId]);
  const currentStopTheme = isDarkMode ? STOP_COLORS.dark : STOP_COLORS.light;

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

        {PARADEROS.map(p => (
          <Mapbox.MarkerView 
            key={p.id} 
            id={p.id} 
            coordinate={[p.longitude, p.latitude]} 
          >
            <TouchableOpacity 
              activeOpacity={0.6}
              onPress={() => setSelectedStopId(prev => prev === p.id ? null : p.id)}
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

        {busShape && (
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

      {/* TARJETA DE PARADERO */}
      {selectedStop && (
        <Reanimated.View 
          key={selectedStop.id} 
          entering={FadeInDown.springify().stiffness(400).damping(25).mass(0.5)} 
          // 🔥 CAMBIO 4: Ahora usa el Easing de Reanimated
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