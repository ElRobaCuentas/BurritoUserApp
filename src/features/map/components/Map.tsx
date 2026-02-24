import React, { useEffect, useRef, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native'; 
import Mapbox from '@rnmapbox/maps';
import { COLORS } from '../../../shared/theme/colors';
import { PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useMapStore } from '../../../store/mapStore'; 
// ✅ Importamos animaciones para la tarjeta
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

Mapbox.setAccessToken('pk.eyJ1IjoiZWxyb2JhY3VlbnRhcyIsImEiOiJjbWx4MDc1Y2gwanpoM2txMzd1Mzl6YjN6In0.9c9y92FLxw_MeIZaX4EdPQ'); 

const UNMSM_STATIC_VIEW = { center: [-77.0830, -12.0575] as [number, number], zoom: 15.2 };
const UNMSM_BOUNDS = { ne: [-77.0720, -12.0450] as [number, number], sw: [-77.0980, -12.0700] as [number, number] };

export const Map = ({ burritoLocation, isDarkMode }: any) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const { isFollowing, setIsFollowing, command, setCommand } = useMapStore();

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
      cameraRef.current?.setCamera({ centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude], zoomLevel: 17.5, animationDuration: 1000, animationMode: 'linearTo' });
    }
  }, [burritoLocation, isFollowing]);

  const busFeature = useMemo(() => {
    if (!burritoLocation) return null;
    return { type: 'FeatureCollection', features: [{ type: 'Feature', id: 'bus', geometry: { type: 'Point', coordinates: [burritoLocation.longitude, burritoLocation.latitude] }, properties: { heading: burritoLocation.heading || 0 } }] };
  }, [burritoLocation]);

  // ✅ Buscamos los datos completos del paradero seleccionado
  const selectedStop = useMemo(() => {
    return PARADEROS.find(p => p.id === selectedStopId);
  }, [selectedStopId]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        scaleBarEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        styleURL={isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
        onRegionWillChange={(e) => { if (e.properties.isUserInteraction) setIsFollowing(false); }}
        // ✅ Si tocan el mapa (fuera de un marcador), cerramos la tarjeta
        onPress={() => setSelectedStopId(null)}
      >
        <Mapbox.Camera ref={cameraRef} defaultSettings={{ centerCoordinate: UNMSM_STATIC_VIEW.center, zoomLevel: UNMSM_STATIC_VIEW.zoom }} maxBounds={UNMSM_BOUNDS} />
        <Mapbox.Images images={{ busIcon: require('../../../assets/bus.png') }} />
        
        <Mapbox.ShapeSource id="route" shape={RUTA_GEOJSON}>
          <Mapbox.LineLayer id="routeLine" style={{ lineColor: COLORS.primary, lineWidth: 5, lineOpacity: 0.8 }} />
        </Mapbox.ShapeSource>
        
        {busFeature && (
          <Mapbox.ShapeSource id="busSource" shape={busFeature as any}>
            <Mapbox.SymbolLayer id="busLayer" style={{ iconImage: 'busIcon', iconSize: 0.08, iconRotate: ['get', 'heading'], iconRotationAlignment: 'map', iconAllowOverlap: true }} />
          </Mapbox.ShapeSource>
        )}
        
        {PARADEROS.map(p => (
          <Mapbox.PointAnnotation 
            key={p.id} 
            id={p.id} 
            coordinate={[p.longitude, p.latitude]} 
            onSelected={() => setSelectedStopId(p.id)}
          >
            {/* ✅ Envolver el ícono en un View asegura que los toques en Android se detecten perfecto */}
            <View style={styles.markerHitbox}>
              <Icon name="map-marker-radius" size={32} color={COLORS.primary} />
            </View>
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* ✅ LA TARJETA FLOTANTE RENDERIZADA AQUÍ */}
      {selectedStop && (
        <Animated.View 
          entering={FadeInDown.springify().damping(15)} 
          exiting={FadeOutDown}
          style={styles.cardWrapper}
          pointerEvents="box-none"
        >
          <StopCard 
            title={selectedStop.name || 'Paradero UNMSM'} // Asumo que en PARADEROS tienes "name", si no, ajústalo.
            onClose={() => setSelectedStopId(null)} 
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: { flex: 1 },
  map: { flex: 1 },
  markerHitbox: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center' },
  cardWrapper: {
    position: 'absolute',
    bottom: 40, // Flotará en la parte inferior de la pantalla
    alignSelf: 'center',
    zIndex: 100,
    elevation: 10,
  }
});