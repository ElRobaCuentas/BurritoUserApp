import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParams } from '../../navigations/StackNavigator';

export const LoadingScreen = () => {
  
  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MapScreen' }],
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container} >
      <ActivityIndicator size={40} color='black' />
      <Text style={styles.text}> Conectando con el Burrito... </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    text: {
        marginTop: 10,
        fontSize: 16
    }
});