import React, { useEffect, useRef, useMemo, useState } from 'react';
import { StyleSheet, View, Easing, Animated as RNAnimated, TouchableOpacity } from 'react-native'; 
import Mapbox from '@rnmapbox/maps';
import { COLORS } from '../../../shared/theme/colors';
import { PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useMapStore } from '../../../store/mapStore'; 
import Reanimated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

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

  // 🔥 BANDERA DE CONTROL: Para evitar el deslizamiento inicial desde el estadio
  const [isFirstBusLoad, setIsFirstBusLoad] = useState(true);

  // === LÓGICA DEL BURRITO MEJORADA ===
  const latAnim = useRef(new RNAnimated.Value(UNMSM_STATIC_VIEW.center[1])).current;
  const lngAnim = useRef(new RNAnimated.Value(UNMSM_STATIC_VIEW.center[0])).current;
  
  // Iniciamos en null para que no aparezca el bus "fantasma" en el estadio al cargar
  const [currentPos, setCurrentPos] = useState<number[] | null>(null);
  const [currentHeading, setCurrentHeading] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedStopId) {
      timer = setTimeout(() => setSelectedStopId(null), 4000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [selectedStopId]);

  useEffect(() => {
    if (burritoLocation) {
      const snappedCoords = snapToRoute(burritoLocation.latitude, burritoLocation.longitude);
      
      if (isFirstBusLoad) {
        // 🚀 SALTO INSTANTÁNEO: La primera vez va directo a la posición real de Firebase
        latAnim.setValue(snappedCoords[1]);
        lngAnim.setValue(snappedCoords[0]);
        setCurrentPos(snappedCoords);
        setCurrentHeading((burritoLocation.heading || 0) - 90);
        setIsFirstBusLoad(false); // Desactivamos para que las siguientes sí sean animadas
      } else {
        // 🐢 MOVIMIENTO SUAVE: Animación de 3 segundos para las siguientes actualizaciones
        RNAnimated.parallel([
          RNAnimated.timing(latAnim, { toValue: snappedCoords[1], duration: 3000, easing: Easing.linear, useNativeDriver: false }),
          RNAnimated.timing(lngAnim, { toValue: snappedCoords[0], duration: 3000, easing: Easing.linear, useNativeDriver: false }),
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
    if (!currentPos) return null; // No dibujamos nada si no hay posición real
    return {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: currentPos }
    };
  }, [currentPos]);

  // === ARRANQUE DEL MAPA ===
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

  // === COMANDOS DE CÁMARA ===
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

        {/* BUS: Solo se muestra si busShape existe (evita el estadio al inicio) */}
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
        
        {PARADEROS.map(p => (
          <Mapbox.MarkerView 
            key={p.id} 
            id={p.id} 
            coordinate={[p.longitude, p.latitude]} 
          >
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setSelectedStopId(p.id)}
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
      </Mapbox.MapView>

      {selectedStop && (
        <Reanimated.View 
          key={selectedStop.id} 
          entering={FadeInDown.springify().damping(15)} 
          exiting={FadeOutDown} 
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