import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Map } from '../components/Map';
import { useBurritoStore } from '../../../store/burritoLocationStore';

export const MapScreen = () => {
  const { location, actions } = useBurritoStore();

  useEffect(() => {
    actions.startTracking();
    return () => actions.stopTracking();
  }, []);
  return (
    <View style={styles.container}>
      <Map burritoLocation={location} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});