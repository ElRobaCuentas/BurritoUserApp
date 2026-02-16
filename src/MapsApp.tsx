import { NavigationContainer } from '@react-navigation/native'
import { StackNavigator } from './presentation/navigations/StackNavigator'
export const MapsApp = () => {
  return (
    <NavigationContainer>
        <StackNavigator />
    </NavigationContainer>
  )
}