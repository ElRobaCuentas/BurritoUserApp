import React, { useRef, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polyline, AnimatedRegion, Region, MapMarker } from 'react-native-maps';
import { Image, StyleSheet, View } from 'react-native';
import { BurritoLocation } from '../types';
import { COLORS } from '../../../shared/theme/colors';
import { StopCard } from './StopCard';
import { 
  UNMSM_LOCATION, 
  RUTA_OFICIAL, 
  PARADEROS, 
  SOUTH_WEST, 
  NORTH_EAST 
} from '../constants/map_route';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  burritoLocation: BurritoLocation | null;
}

const isOutsideBounds = (region: Region) => (
  region.latitude < SOUTH_WEST.latitude ||
  region.latitude > NORTH_EAST.latitude ||
  region.longitude < SOUTH_WEST.longitude ||
  region.longitude > NORTH_EAST.longitude
);

export const Map = ({ burritoLocation }: Props) => {
  const mapRef = useRef<MapView>(null);
  const isAnimatingRef = useRef(false);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});

  const burritoPosition = useRef(
    new AnimatedRegion({
      latitude: UNMSM_LOCATION.latitude,
      longitude: UNMSM_LOCATION.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  useEffect(() => {
    if (burritoLocation) {
      burritoPosition.timing({
        latitude: burritoLocation.latitude,
        longitude: burritoLocation.longitude,
        duration: 2500,
        useNativeDriver: false,
      } as any).start();
    }
  }, [burritoLocation]);

  const handleRegionChangeComplete = (region: Region) => {
    if (isAnimatingRef.current) return;
    if (isOutsideBounds(region)) {
      isAnimatingRef.current = true;
      mapRef.current?.animateToRegion(UNMSM_LOCATION, 600);
      setTimeout(() => { isAnimatingRef.current = false; }, 700);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={UNMSM_LOCATION}
        minZoomLevel={15}
        moveOnMarkerPress={false} 
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        <Polyline
          coordinates={RUTA_OFICIAL}
          strokeColor={COLORS.primary}
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
        />

        {PARADEROS.map((p) => (
          <Marker
            key={p.id} 
            ref={(ref) => { markerRefs.current[p.id] = ref; }}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false} // ✅ Como las imágenes son locales, el mapa puede ser súper rápido
          >
            <View style={styles.iconContainer}>
              <Icon
                name="map-marker-radius"
                size={35}
                color={COLORS.primary} 
                style={styles.iconShadow}
              />
            </View>

            {/* ✅ Burbuja NATIVA. Se cierra al tocarla gracias a la referencia */}
            <Callout 
              tooltip 
              onPress={() => markerRefs.current[p.id]?.hideCallout()}
            >
              <StopCard 
                title={p.name} 
                imageSource={p.image} // Pasamos la imagen local
              />
            </Callout>
          </Marker>
        ))}

        {burritoLocation && (
          <Marker.Animated
            coordinate={burritoPosition as any}
            rotation={burritoLocation.heading || 0}
            flat anchor={{ x: 0.5, y: 0.5 }}
            zIndex={50}
          >
            <View style={styles.busContainer}>
              <Image source={require('../../../assets/bus.png')} style={styles.busImage} />
            </View>
          </Marker.Animated>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  iconContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  iconShadow: { textShadowColor: 'rgba(255, 255, 255, 0.9)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  busContainer: { width: 45, height: 45 },
  busImage: { width: '100%', height: '100%', resizeMode: 'contain' },
});