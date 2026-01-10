import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { styles } from '../theme/appStyles';
import { auth } from '../configs/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

interface FormLogin {
  email: string;
  password: string;
}

interface Message {
  visible: boolean;
  text: string;
  color: string;
}

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [hiddenPassword, setHiddenPassword] = useState<boolean>(true);
  const [formLogin, setFormLogin] = useState<FormLogin>({
    email: '',
    password: '',
  });
  const [showMessage, setShowMessage] = useState<Message>({
    visible: false,
    text: '',
    color: '',
  });

  const handleInputChange = (key: string, value: string): void => {
    setFormLogin({ ...formLogin, [key]: value });
  };

  //función para iniciar sesión
    const handleSingIn = async () => {
        if (formLogin.email === "" || formLogin.password === "") {
            setShowMessage({
                visible: true,
                text: "Completa todos los campos",
                color: "#7D2715"
            });
            return;
        }
        //console.log(formLogin);
        try {
            const response = await signInWithEmailAndPassword(
                auth,
                formLogin.email,
                formLogin.password
            );
            //console.log(response);
            navigation.dispatch(CommonActions.navigate({ name: 'Juego' }));
        } catch (error) {
            console.log(error);
            setShowMessage({
                visible: true,
                text: "Usuario y/o contraseña incorrectos",
                color: "#7D2715"
            });
        }

    }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.text}>🔢 Adivina el Número</Text>
        <Text style={styles.subtitle}>Inicia sesión para jugar</Text>
      </View>

      <TextInput
        mode="outlined"
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        value={formLogin.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email" />}
        style={styles.inputStyle}
      />

      <TextInput
        mode="outlined"
        label="Contraseña"
        placeholder="••••••••"
        value={formLogin.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry={hiddenPassword}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={hiddenPassword ? 'eye-off' : 'eye'}
            onPress={() => setHiddenPassword(!hiddenPassword)}
          />
        }
        style={styles.inputStyle}
      />

      <Button
        mode="contained"
        onPress={handleSingIn}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        icon="login"
      >
        Iniciar Sesión
      </Button>

      <Text
        style={styles.textRedirect}
        onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Register' }))}
      >
        ¿No tienes cuenta? Regístrate
      </Text>

      <Snackbar
        visible={showMessage.visible}
        onDismiss={() => setShowMessage({ ...showMessage, visible: false })}
        style={[styles.snackbar, { backgroundColor: showMessage.color }]}
        duration={3000}
      >
        {showMessage.text}
      </Snackbar>
    </View>
  );
};