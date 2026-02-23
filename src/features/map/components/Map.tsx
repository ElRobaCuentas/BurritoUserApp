import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { BurritoLocation } from '../types';
import { COLORS } from '../../../shared/theme/colors';
import { UNMSM_LOCATION, PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useMapStore } from '../../../store/mapStore'; 

Mapbox.setAccessToken('pk.eyJ1IjoiZWxyb2JhY3VlbnRasIsImEiOiJjbWx4MDc1Y2gwanpoM2txMzd1Mzl6YjN6In0.9c9y92FLxw_MeIZaX4EdPQ'); 

// 📍 VISTA MAESTRA (Basada en tu captura image_e186a6.png)
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

  // 📡 Leemos el Store (isFollowing ahora inicia en FALSE por defecto)
  const { isFollowing, setIsFollowing, command, setCommand } = useMapStore();
  const selectedStopData = PARADEROS.find(p => p.id === selectedStopId);

  // 1️⃣ LOGICA DE BOTONES (Manual)
  useEffect(() => {
    if (command === 'center') {
      // Regresa a tu "Vista Maestra" estática
      cameraRef.current?.setCamera({
        centerCoordinate: UNMSM_STATIC_VIEW.center,
        zoomLevel: UNMSM_STATIC_VIEW.zoom,
        animationDuration: 2500,
        animationMode: 'flyTo',
      });
      setIsFollowing(false);
      setCommand(null);
    } else if (command === 'follow') {
      // ✅ AHORA EL ZOOM SE HACE AQUÍ, BAJO DEMANDA
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

  // 2️⃣ RASTREO EN TIEMPO REAL (Solo si isFollowing es true)
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

  // 3️⃣ LIBERAR CÁMARA AL TOCAR
  const handleRegionWillChange = (e: any) => {
    if (e?.properties?.isUserInteraction && isFollowing) {
      setIsFollowing(false);
    }
  };

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
            // 🚀 INICIO ESTÁTICO: Exactamente como tu imagen
            centerCoordinate: UNMSM_STATIC_VIEW.center,
            zoomLevel: UNMSM_STATIC_VIEW.zoom,
          }}
          maxBounds={UNMSM_BOUNDS} 
          minZoomLevel={14.0}      
        />

        {/* 🛣️ RUTA (Debajo de todo) */}
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

        {/* 🚌 EL BURRITO (Encima de la ruta siempre) */}
        {burritoLocation && (
          <Mapbox.PointAnnotation 
            key="burrito-bus" 
            id="burrito-bus" 
            coordinate={[burritoLocation.longitude, burritoLocation.latitude]}
          >
            <View style={{ transform: [{ rotate: `${burritoLocation.heading || 0}deg` }] }}>
              <View style={styles.busGlow}>
                <Image source={require('../../../assets/bus.png')} style={styles.busImage} />
              </View>
            </View>
          </Mapbox.PointAnnotation>
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
  busGlow: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255, 69, 58, 0.2)', 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 69, 58, 0.5)',
  },
  busImage: { width: 35, height: 35, resizeMode: 'contain' }
});