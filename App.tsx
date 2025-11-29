import React from 'react'
import { Provider, Text } from 'react-native-paper'
import { RegisterScreen } from './src/screens/RegisterScreen'
import { LoginScreen } from './src/screens/LoginScreen'
import { NavigationContainer } from '@react-navigation/native'
import { StackNavigator } from './src/navigations/StackNavigation'


const App = () => {
  return (
    <NavigationContainer>
      <Provider>
        <StackNavigator />
      </Provider>
    </NavigationContainer>

  )
}
export default App
