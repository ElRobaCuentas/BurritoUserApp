import React, { useEffect, useRef, useMemo, useState } from 'react';
import { StyleSheet, View, Easing, Animated as RNAnimated } from 'react-native'; 
import Mapbox from '@rnmapbox/maps';
import { COLORS } from '../../../shared/theme/colors';
import { PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useMapStore } from '../../../store/mapStore'; 
import Reanimated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

Mapbox.setAccessToken('pk.eyJ1IjoiZWxyb2JhY3VlbnRhcyIsImEiOiJjbWx4MDc1Y2gwanpoM2txMzd1Mzl6YjN6In0.9c9y92FLxw_MeIZaX4EdPQ'); 

const UNMSM_STATIC_VIEW = { center: [-77.0830, -12.0575] as [number, number], zoom: 15.2 };
const UNMSM_BOUNDS = { ne: [-77.0720, -12.0450] as [number, number], sw: [-77.0980, -12.0700] as [number, number] };
const STOP_MARKER_COLOR = '#FF9800'; 

// 🧠 MATEMÁTICA: Fórmula de Haversine para distancias reales
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// 🧲 MATEMÁTICA: Algoritmo "Snap to Route" (InDrive/Uber Style)
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

  const latAnim = useRef(new RNAnimated.Value(burritoLocation?.latitude || UNMSM_STATIC_VIEW.center[1])).current;
  const lngAnim = useRef(new RNAnimated.Value(burritoLocation?.longitude || UNMSM_STATIC_VIEW.center[0])).current;
  const [currentPos, setCurrentPos] = useState<number[]>([
    burritoLocation?.longitude || UNMSM_STATIC_VIEW.center[0],
    burritoLocation?.latitude || UNMSM_STATIC_VIEW.center[1]
  ]);
  const [currentHeading, setCurrentHeading] = useState<number>(0);

  // ✨ RESTAURADO: Lógica para ocultar el StopCard después de 4 segundos
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedStopId) {
      timer = setTimeout(() => setSelectedStopId(null), 4000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [selectedStopId]);

  // 🚀 MOTOR DE DESLIZAMIENTO CON MAP MATCHING (Alineado a tus 3 SEGUNDOS)
  useEffect(() => {
    if (burritoLocation) {
      // 1. Limpiamos la señal (Pegamos el GPS sucio a la línea azul exacta)
      const snappedCoords = snapToRoute(burritoLocation.latitude, burritoLocation.longitude);
      const cleanLng = snappedCoords[0];
      const cleanLat = snappedCoords[1];

      // 2. Animamos durante 3000ms
      RNAnimated.parallel([
        RNAnimated.timing(latAnim, { toValue: cleanLat, duration: 3000, easing: Easing.linear, useNativeDriver: false }),
        RNAnimated.timing(lngAnim, { toValue: cleanLng, duration: 3000, easing: Easing.linear, useNativeDriver: false }),
      ]).start();

      setCurrentHeading((burritoLocation.heading || 0) - 90);
    }
  }, [burritoLocation]);

  useEffect(() => {
    const listenerId = lngAnim.addListener(() => {
      // @ts-ignore
      setCurrentPos([lngAnim._value, latAnim._value]);
    });
    return () => lngAnim.removeListener(listenerId);
  }, []);

  const busShape = useMemo(() => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: currentPos }
  }), [currentPos]);

  useEffect(() => {
    if (command === 'center') {
      cameraRef.current?.setCamera({ centerCoordinate: UNMSM_STATIC_VIEW.center, zoomLevel: UNMSM_STATIC_VIEW.zoom, animationDuration: 2000, animationMode: 'flyTo' });
      setIsFollowing(false); setCommand(null);
    } else if (command === 'follow' && burritoLocation) {
      cameraRef.current?.setCamera({ centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude], zoomLevel: 17.5, animationDuration: 2000, animationMode: 'flyTo' });
      setIsFollowing(true); setCommand(null);
    }
  }, [command, burritoLocation]);

  useEffect(() => {
    if (isFollowing && burritoLocation) {
      cameraRef.current?.setCamera({ centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude], zoomLevel: 17.5, animationDuration: 3000, animationMode: 'linearTo' }); 
    }
  }, [burritoLocation, isFollowing]);

  const selectedStop = useMemo(() => PARADEROS.find(p => p.id === selectedStopId), [selectedStopId]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map} scaleBarEnabled={false} attributionEnabled={false} logoEnabled={false}
        styleURL={isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
        onRegionWillChange={(e) => { if (e.properties.isUserInteraction) setIsFollowing(false); }}
        onPress={() => setSelectedStopId(null)}
      >
        <Mapbox.Camera ref={cameraRef} defaultSettings={{ centerCoordinate: UNMSM_STATIC_VIEW.center, zoomLevel: UNMSM_STATIC_VIEW.zoom }} maxBounds={UNMSM_BOUNDS} />
        <Mapbox.Images images={{ busIcon: require('../../../assets/bus.png') }} />
        
        <Mapbox.ShapeSource id="route" shape={RUTA_GEOJSON}>
          <Mapbox.LineLayer id="routeLine" style={{ lineColor: COLORS.primary, lineWidth: 5, lineOpacity: 0.8 }} />
        </Mapbox.ShapeSource>
        
        {/* 🚌 BUS: Perfectamente adherido a la línea */}
        <Mapbox.ShapeSource id="busSource" shape={busShape as any}>
          <Mapbox.SymbolLayer 
            id="busLayer" 
            style={{ iconImage: 'busIcon', iconSize: 0.08, iconRotate: currentHeading, iconRotationAlignment: 'map', iconAllowOverlap: true, iconIgnorePlacement: true }} 
          />
        </Mapbox.ShapeSource>
        
        {PARADEROS.map(p => (
          <Mapbox.PointAnnotation key={p.id} id={p.id} coordinate={[p.longitude, p.latitude]} onSelected={() => setSelectedStopId(p.id)}>
            <View style={styles.markerHitbox}><Icon name="map-marker-radius" size={32} color={STOP_MARKER_COLOR} /></View>
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* Tarjeta del paradero con animación */}
      {selectedStop && (
        <Reanimated.View entering={FadeInDown.springify().damping(15)} exiting={FadeOutDown} style={styles.cardWrapper} pointerEvents="box-none">
          <StopCard title={selectedStop.name || 'Paradero'} onClose={() => setSelectedStopId(null)} />
        </Reanimated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  map: { flex: 1 }, 
  markerHitbox: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center' }, 
  cardWrapper: { position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 100, elevation: 10 }
});