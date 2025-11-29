import React, { useState } from 'react'
import { Alert, TouchableOpacity, View } from 'react-native'
import { Button, Snackbar, Text, TextInput } from 'react-native-paper'
import { styles } from '../theme/appStyles'
import { auth } from '../configs/firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from 'firebase/auth/cordova';


//interface de registrro
interface FormRegister {
    email: string;
    password: string;
}
//intwerface apara mensajes dinamicos
interface Message {
    visible: boolean;
    text: string;
    color: string;
}


export const RegisterScreen = ({ navigation }: any) => {

    //hooks useState para el formulario
    const [formRegister, setformRegister] = useState<FormRegister>({
        email: "",
        password: ""
    });

    //hook para el snackbar de mensajes
    const [showMessage, setshowMessage] = useState<Message>({
        visible: false,
        text: "",
        color: ""
    });


    //metodo para actualizar el estado del formulario
    const handleInputChange = (key: string, value: string): void => {
        setformRegister({ ...formRegister, [key]: value });
    }

    //funcion para registrar usuario
    const handleRegister = async () => {
        //validar que los campos no esten vacios
        if (formRegister.email === "" || formRegister.password === "") {
            setshowMessage({
                visible: true,
                text: "Completar los campos",
                color: "#b73f3fff"
            });
            return;

        }
        //console.log(formRegister);
        try {
            const response = await createUserWithEmailAndPassword(
                auth,
                formRegister.email,
                formRegister.password

            );
            setshowMessage({
                visible: true,
                text: "Registro exitoso",
                color: "#077538ff",
            });
            //limpiar el formulario
            setformRegister({
                email: "",
                password: ""
            });

        } catch (error) {
            console.log(error);
        }

    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>REGISTRATE</Text>
            <TextInput
                mode="outlined"
                label="CORREO ELECTRÓNICO"
                placeholder="Ingresa tu correo"
                style={styles.inputStyle}
                onChangeText={(value) => handleInputChange("email", value)}
                value={formRegister.email}
            />
            <TextInput
                mode="outlined"
                label="CONTRASEÑA"
                placeholder="Ingresa tu contraseña"
                secureTextEntry
                style={styles.inputStyle}
                onChangeText={(value) => handleInputChange("password", value)}
                value={formRegister.password}


            />
            <Button style={styles.button}
                icon="login"
                mode="contained"
                onPress={handleRegister}>

                INICIAR
            </Button>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.textRedirect}>Si tienes una cuenta, Inicia sesion</Text>
            </TouchableOpacity>
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
