import React, { useRef } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { BurritoLocation } from '../types';

const UNMSM_LOCATION = {
  latitude: -12.0560,
  longitude: -77.0844,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const NORTH_EAST = { latitude: -12.0520, longitude: -77.0770 };
const SOUTH_WEST = { latitude: -12.0630, longitude: -77.0900 };

interface Props {
  burritoLocation: BurritoLocation | null;
}

export const Map = ({ burritoLocation }: Props) => {
  const mapRef = useRef<MapView>(null);

  const handleMapReady = () => {
    mapRef.current?.setMapBoundaries(NORTH_EAST, SOUTH_WEST);
  };

  console.log('mapa visto')
  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      showsUserLocation={false}
      initialRegion={UNMSM_LOCATION}
      minZoomLevel={15}
      onMapReady={handleMapReady}
    >
      {burritoLocation && (
          <Marker
          coordinate={{
            latitude: burritoLocation.latitude,
            longitude: burritoLocation.longitude,
          }}
          rotation={burritoLocation.heading}
          title="Burrito"
          />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});