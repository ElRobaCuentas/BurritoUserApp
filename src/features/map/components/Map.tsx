import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { BurritoLocation } from '../types';
import { COLORS } from '../../../shared/theme/colors';
import { UNMSM_LOCATION, PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useMapStore } from '../../../store/mapStore'; 

Mapbox.setAccessToken('pk.eyJ1IjoiZWxyb2JhY3VlbnRasIsImEiOiJjbWx4MDc1Y2gwanpoM2txMzd1Mzl6YjN6In0.9c9y92FLxw_MeIZaX4EdPQ'); 

// 📍 VISTA MAESTRA (Intocable)
const UNMSM_STATIC_VIEW = {
  center: [-77.0830, -12.0575], 
  zoom: 15.2 
};

const UNMSM_BOUNDS = {
  ne: [-77.0720, -12.0450], 
  sw: [-77.0980, -12.0700]  
};

export const Map = ({ burritoLocation, isDarkMode }: any) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const { isFollowing, setIsFollowing, command, setCommand } = useMapStore();
  const selectedStopData = PARADEROS.find(p => p.id === selectedStopId);

  // 1️⃣ LOGICA DE BOTONES
  useEffect(() => {
    if (command === 'center') {
      cameraRef.current?.setCamera({
        centerCoordinate: UNMSM_STATIC_VIEW.center,
        zoomLevel: UNMSM_STATIC_VIEW.zoom,
        animationDuration: 2500,
        animationMode: 'flyTo',
      });
      setIsFollowing(false);
      setCommand(null);
    } else if (command === 'follow') {
      if (burritoLocation) {
        cameraRef.current?.setCamera({
          centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude],
          zoomLevel: 17.5,
          animationDuration: 2500,
          animationMode: 'flyTo',
        });
      }
      setIsFollowing(true);
      setCommand(null);
    }
  }, [command, burritoLocation]);

  // 2️⃣ RASTREO EN TIEMPO REAL
  useEffect(() => {
    if (isFollowing && burritoLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude],
        zoomLevel: 17.5, 
        animationDuration: 1000, 
        animationMode: 'linearTo', 
      });
    }
  }, [burritoLocation, isFollowing]);

  // 3️⃣ LIBERAR CÁMARA
  const handleRegionWillChange = (e: any) => {
    if (e?.properties?.isUserInteraction && isFollowing) {
      setIsFollowing(false);
    }
  };

  // 🚀 LA MAGIA DE LA GPU: Convertimos la ubicación en datos nativos para Mapbox
  const busFeatureCollection = useMemo(() => {
    if (!burritoLocation) return null;
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'burrito-bus',
          geometry: {
            type: 'Point',
            coordinates: [burritoLocation.longitude, burritoLocation.latitude],
          },
          properties: {
            heading: burritoLocation.heading || 0, // Pasamos el ángulo al motor
          },
        },
      ],
    };
  }, [burritoLocation]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
          style={styles.map}
          // @ts-ignore
          androidRenderMode="texture" 
          surfaceView={false} 
          pixelRatio={0.8}               
          layerAntialiasingAllow={false} 
          attributionEnabled={false}     
          logoEnabled={false}            
          compassEnabled={false}
          styleURL={isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
          onPress={() => setSelectedStopId(null)}
          onRegionWillChange={handleRegionWillChange}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: UNMSM_STATIC_VIEW.center,
            zoomLevel: UNMSM_STATIC_VIEW.zoom,
          }}
          maxBounds={UNMSM_BOUNDS} 
          minZoomLevel={14.0}      
        />

        {/* 🚀 INYECCIÓN A LA GPU: Cargamos la imagen una sola vez en memoria gráfica */}
        <Mapbox.Images images={{ busIcon: require('../../../assets/bus.png') }} />

        {/* 🛣️ RUTA GEOJSON */}
        <Mapbox.ShapeSource id="routeSource" shape={RUTA_GEOJSON}>
          <Mapbox.LineLayer
            id="routeLayer"
            belowLayerID="poi-label" 
            style={{
              lineColor: COLORS.primary,
              lineWidth: 5,
              lineJoin: 'round', 
              lineCap: 'round',
              lineOpacity: 0.85,
            }}
          />
        </Mapbox.ShapeSource>

        {/* 🚌 EL BURRITO (NATIVO GPU) - SIEMPRE SOBRE LA RUTA */}
{busFeatureCollection && (
  <Mapbox.ShapeSource id="busSource" shape={busFeatureCollection as any}>
    
    {/* Resplandor (Glow) ajustado para que no se vea gigante tampoco */}
    <Mapbox.CircleLayer
      id="busGlowLayer"
      style={{
        circleRadius: 18, // ⬅️ Lo bajé de 25 a 18 para que el círculo no sea enorme
        circleColor: 'rgba(255, 69, 58, 0.2)',
        circleStrokeWidth: 1,
        circleStrokeColor: 'rgba(255, 69, 58, 0.5)',
        circlePitchAlignment: 'map',
      }}
    />

    <Mapbox.SymbolLayer
      id="busSymbolLayer"
      style={{
        iconImage: 'busIcon',
        iconSize: 0.08, // ⬅️ CAMBIA ESTO. Prueba con 0.08 o 0.07 hasta que lo veas perfecto
        iconAllowOverlap: true,
        iconIgnorePlacement: true,
        iconRotationAlignment: 'map',
        iconRotate: ['get', 'heading'], 
      }}
    />
  </Mapbox.ShapeSource>
)}

        {/* 📍 PARADEROS */}
        {PARADEROS.map((p) => (
          <Mapbox.PointAnnotation
            key={p.id}
            id={p.id}
            coordinate={[p.longitude, p.latitude]}
            onSelected={() => setSelectedStopId(p.id)}
          >
            <View style={styles.iconContainer}>
              <Icon name="map-marker-radius" size={35} color={COLORS.primary} style={styles.iconShadow} />
            </View>
          </Mapbox.PointAnnotation>
        ))}

        {/* 🛠️ CARD DE PARADERO */}
        {selectedStopData && (
          <Mapbox.MarkerView 
            coordinate={[selectedStopData.longitude, selectedStopData.latitude]}
            anchor={{ x: 0.5, y: 1.1 }} 
          >
            <StopCard title={selectedStopData.name} onClose={() => setSelectedStopId(null)} />
          </Mapbox.MarkerView>
        )}
      </Mapbox.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  iconContainer: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
  iconShadow: { textShadowColor: 'rgba(255, 255, 255, 0.9)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  // 🗑️ Borramos busGlow y busImage de los estilos porque ahora la GPU se encarga de eso
});