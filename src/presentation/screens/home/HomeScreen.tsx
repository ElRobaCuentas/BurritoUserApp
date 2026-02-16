import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParams } from '../../navigations/StackNavigator';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MyCustomHeader } from '../../components/header/MyCustomHeader';

export const HomeScreen = () => {
  
    const navigation = useNavigation<NavigationProp<RootStackParams>>();
    
    return (
        <View style={styles.container}>
            <MyCustomHeader title='Home'/>
            <View style={styles.body}> 
                <Pressable
                    onPress={ () => navigation.navigate('LoadingScreen') }
                    style={styles.button}
                > 
                    <Text style={styles.buttonText}> VER UBICACIÓN </Text>  
                </Pressable>
            </View>
        </View>
  )
}

const styles = StyleSheet.create({
    container: { flex: 1},
    body:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    welcomeText: {
        fontSize: 20,
        marginBottom: 30,
        color: '#333'
    },
    button: { 
        backgroundColor: 'black',
        paddingHorizontal: 30,
        paddingVertical: 15, 
        borderRadius: 10,
    },
    buttonText: { 
        color: 'white', 
        fontSize: 18,
        fontWeight: 'bold'
    }
});