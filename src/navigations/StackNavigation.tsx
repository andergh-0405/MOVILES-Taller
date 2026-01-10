import { createStackNavigator, Header } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { JuegoScreen } from '../screens/JuegoScreen';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from '@firebase/auth';
import { auth } from '../configs/firebaseConfig';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import { View } from 'react-native';
import { styles } from '../theme/appStyles';

const Stack = createStackNavigator();

export const StackNavigator = () => {

    //hook state verificar si esta autenticado}
    const [isAuth, setisAuth] = useState<boolean>(false)

    //hook state para controlar el estado de carga
    const [isLoading, setisLoading] = useState<boolean>(true)

    ///hook useEffect para verificar el estado de autenticacion
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                //console.log(user);
                setisAuth(true);
            }
            setisLoading(false);

        })
    }, [])//si esta vacio se ejecuta una vez

    return (
        <>
            {
                isLoading ? (
                    <View style={styles.containerActivity}>
                        <ActivityIndicator size={30} />
                    </View>
                )
                    : (
                        <Stack.Navigator initialRouteName={isAuth ? 'Juego' : 'Login'}>
                            <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
                            <Stack.Screen name="Register" options={{ headerShown: false }} component={RegisterScreen} />
                            <Stack.Screen name="Juego" options={{ headerShown: false }} component={JuegoScreen} />
                        </Stack.Navigator>
                    )
            }
        </>
    );
}