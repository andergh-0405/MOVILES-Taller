import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Button, Snackbar, Text, TextInput } from 'react-native-paper'
import { styles } from '../theme/appStyles'
import { signInWithEmailAndPassword } from 'firebase/auth/cordova';
import { auth } from '../configs/firebaseConfig';
import { RegisterScreen } from './RegisterScreen';
import { CommonActions, useNavigation } from '@react-navigation/native';
//interface de login
interface FormLogin {
    email: string;
    password: string;
}
//intwerface apara mensajes dinamicos
interface Message {
    visible: boolean;
    text: string;
    color: string;
}





export const LoginScreen = () => {

    //hook usenavigation para la navegacion entre pantalla
    const navigation = useNavigation();

    //hoook useState para el estado de la contraseña
    const [hiddenPassword, sethiddenPassword] = useState<boolean>(true)

    //hooks useState para el formulario
    const [formLogin, setfromLogin] = useState<FormLogin>({
        email: "",
        password: ""
    });

    //metodo para actualizar el estado del formulario
    const handleInputChange = (key: string, value: string): void => {
        setfromLogin({ ...formLogin, [key]: value });
    }

    //hook para el snackbar de mensajes
    const [showMessage, setshowMessage] = useState<Message>({
        visible: false,
        text: "",
        color: ""
    });

    const handleSingIn = async () => {
        //validar que los campos no esten vacios
        if (formLogin.email === "" || formLogin.password === "") {
            setshowMessage({
                visible: true,
                text: "Completar los campos",
                color: "#b73f3fff"
            });
            return;

        }
        //console.log(formRegister);
        try {
            const response = await signInWithEmailAndPassword(
                auth,
                formLogin.email,
                formLogin.password

            );
            setshowMessage({
                visible: true,
                text: "Inicio exitoso",
                color: "#077538ff",
            });
            //limpiar el formulario
            setfromLogin({
                email: "",
                password: ""
            });

        } catch (error) {
            console.log(error);
            setshowMessage({
                visible: true,
                text: "Correo o contraseña incorrecta",
                color: "#d3e944ff"
            });
        }

    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Iniciar Sesion</Text>
            <TextInput
                mode="outlined"
                label="CORREO ELECTRÓNICO"
                placeholder="Ingresa tu correo"
                style={styles.inputStyle}
                onChangeText={(value) => handleInputChange("email", value)}
                value={formLogin.email}
                right={<TextInput.Icon icon="email"/>}
            />
            <TextInput
                mode="outlined"
                label="CONTRASEÑA"
                placeholder="Ingresa tu contraseña"
                secureTextEntry
                style={styles.inputStyle}
                onChangeText={(value) => handleInputChange("password", value)}
                value={formLogin.password}
                right={<TextInput.Icon icon="eye"/>}

            />
            <Button style={styles.button}
                icon="login"
                mode="contained"
                onPress={handleSingIn}>

                INICIAR
            </Button>


            <Text style={styles.textRedirect}
                onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Register' }))}
            >No tienes una cuenta? Registrate ahora</Text>


            <Snackbar
                style={{ backgroundColor: showMessage.color }}
                visible={showMessage.visible}
                onDismiss={() => setshowMessage({ ...showMessage, visible: false })}
            >
                {showMessage.text}
            </Snackbar>

        </View>
    )
}
