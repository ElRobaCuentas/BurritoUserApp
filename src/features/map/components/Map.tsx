import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { BurritoLocation } from '../types';
import { COLORS } from '../../../shared/theme/colors';
import { UNMSM_LOCATION, PARADEROS, RUTA_GEOJSON } from '../constants/map_route';
import { FAB } from './FAB';
import { StopCard } from './StopCard'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

Mapbox.setAccessToken('pk.eyJ1IjoiZWxyb2JhY3VlbnRhcyIsImEiOiJjbWx4MDc1Y2gwanpoM2txMzd1Mzl6YjN6In0.9c9y92FLxw_MeIZaX4EdPQ'); 

interface Props {
  burritoLocation: BurritoLocation | null;
  isDarkMode: boolean;
}

export const Map = ({ burritoLocation, isDarkMode }: Props) => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const selectedStopData = PARADEROS.find(p => p.id === selectedStopId);

  useEffect(() => {
    if (burritoLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [burritoLocation.longitude, burritoLocation.latitude],
        zoomLevel: 16, 
        animationDuration: 2000,
      });
    }
  }, [burritoLocation]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
  style={styles.map}
  // 🚨 ESTO ES LO QUE HACE QUE EL DRAWER SE VEA. NO LO QUITES.
  // @ts-ignore
  androidRenderMode="texture" 
  surfaceView={false} 
  
  // 🚀 ESTO AYUDA A QUE TU EMULADOR NO SE PONGA BLANCO
  layerAntialiasingAllow={false} // Desactivar esto quita carga a la GPU del emulador
  
  logoEnabled={false}
  attributionEnabled={false}
  styleURL={isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
  onPress={() => setSelectedStopId(null)}
>
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [UNMSM_LOCATION.longitude, UNMSM_LOCATION.latitude],
            zoomLevel: 16,
          }}
        />

        {/* 🛣️ RUTA GEOJSON */}
        <Mapbox.ShapeSource id="routeSource" shape={RUTA_GEOJSON}>
          <Mapbox.LineLayer
            id="routeLayer"
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

        {/* 🛠️ TARJETA FLOTANTE DE PARADERO */}
        {selectedStopData && (
          <Mapbox.MarkerView 
            coordinate={[selectedStopData.longitude, selectedStopData.latitude]}
            anchor={{ x: 0.5, y: 1.1 }} 
          >
            <StopCard 
              title={selectedStopData.name} 
              onClose={() => setSelectedStopId(null)} 
            />
          </Mapbox.MarkerView>
        )}

        {/* 🚌 EL BURRITO */}
        {burritoLocation && (
          <Mapbox.MarkerView coordinate={[burritoLocation.longitude, burritoLocation.latitude]}>
            <View style={{ transform: [{ rotate: `${burritoLocation.heading || 0}deg` }] }}>
              <View style={styles.busGlow}>
                <Image source={require('../../../assets/bus.png')} style={styles.busImage} />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}
      </Mapbox.MapView>

      <FAB 
        isFollowingBus={true}
        onFollowBus={() => {}}
        onCenterMap={() => {
            cameraRef.current?.setCamera({
                centerCoordinate: [UNMSM_LOCATION.longitude, UNMSM_LOCATION.latitude],
                zoomLevel: 16,
                animationDuration: 1000
            });
        }}
      />
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