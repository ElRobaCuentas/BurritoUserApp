import React, { useRef } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

// Coordenadas de la UNMSM 
const UNMSM_LOCATION = {
  latitude: -12.0560, 
  longitude: -77.0844,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

export const Map = () => {

  const mapRef = useRef<MapView>(null);

  return (
    <>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={false} 
        initialRegion={UNMSM_LOCATION}
      >
         { /* Futuro icono del bus */ }

      </MapView>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});