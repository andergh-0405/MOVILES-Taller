import React, { useState, useEffect } from 'react';
import { View, Pressable, Alert, FlatList, Text as RNText } from 'react-native';
import { styles } from '../theme/appStyles';
import { IconButton, Text, Portal, Modal, Button, Divider, TextInput, FAB, Avatar } from 'react-native-paper';
import { auth, dbRealtime, storage } from '../configs/firebaseConfig';
import { signOut, updateProfile } from 'firebase/auth';
import { NewCommentComponent } from '../components/NewCommentComponents';
import { Comment, CommentComponent } from '../components/CommentComponents';
import { onValue, ref } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { ref as refStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CommonActions, useNavigation } from '@react-navigation/native';

export const JuegoScreen = () => {

  // Interfaz de usuario local
  interface User {
    name: string;
    photo: string;
  }

  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('¡Adivina un número entre 1 y 100!');
  const [attempts, setAttempts] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userAuth, setUserAuth] = useState<any>(null);
  const [user, setUser] = useState<User>({
    name: "",
    photo: ""
  });


  useEffect(() => {
    // Iniciar juego
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(randomNum);
    console.log('Número secreto:', randomNum);

    // Cargar usuario actual
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserAuth(currentUser);
      // Sincronizamos el estado local con los datos de Firebase
      setUser({
        name: currentUser.displayName || "",
        photo: currentUser.photoURL || ""
      });
    }
  }, []);
  //hook useNavigation para la navegación entre pantallas
  const navigation = useNavigation();

  //función para cargar comentarios
  useEffect(() => {
    if (showAllComments) {
      const dbRef = ref(dbRealtime, 'comments');
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setComments([]);
          return;
        }
        const list: Comment[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setComments(list);
      });
      return () => unsubscribe();
    }
  }, [showAllComments]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setUser({ ...user, photo: result.assets[0].uri });
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso', 'Se requiere permiso para acceder a la cámara');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setUser({ ...user, photo: result.assets[0].uri });
    }
  }

  // Función para subir imagen a Firebase Storage
  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileRef = refStorage(storage, `avatar/${userAuth?.uid}`);
      await uploadBytes(fileRef, blob);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      throw error;
    }
  }

  const handleInputChangeUser = (key: string, value: string) => {
    setUser({ ...user, [key]: value });
  }

  //función para actualizar los datos del usuario autenticado
  const handleUpdateUser = async () => {
    let photoURL = userAuth?.photoURL;

    if (user.photo && user.photo !== userAuth?.photoURL) {
      photoURL = await uploadImage(user.photo);

    }

    await updateProfile(userAuth!, {
      displayName: user.name,
      photoURL: photoURL
    })
    setShowModal(false);
    Alert.alert('Perfil', 'Perfil actualizado correctamente');
  }

  //funcion para cerrar sesión
  const handleSignOut = async () => {
    await signOut(auth);
    //Resetear todos los screens de navegacion
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
    setShowModal(false);
  }

  const handleGameInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setGuess(value);
    }
  };

  const handleGameSubmit = () => {
    const guessNum = parseInt(guess, 10);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      Alert.alert('Entrada inválida', 'Ingresa un número entre 1 y 100.');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === targetNumber) {
      setMessage(`🎉 ¡Correcto! Era ${targetNumber}.\nLo lograste en ${newAttempts} intentos.`);
      setGameOver(true);
    } else if (guessNum < targetNumber) {
      setMessage('🔽 Demasiado bajo\n¡Intenta un número más alto!');
    } else {
      setMessage('🔼 Demasiado alto\n¡Intenta un número más bajo!');
    }
    setGuess('');
  };

  const handleRestart = () => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(randomNum);
    setGuess('');
    setMessage('¡Adivina un número entre 1 y 100!');
    setAttempts(0);
    setGameOver(false);
    console.log('Número secreto:', randomNum);
  };

  return (
    <>

      <View style={styles.container}>
        <View style={styles.headerHome}>

          {userAuth?.photoURL ? (
            <Avatar.Image size={60} source={{ uri: userAuth.photoURL }} />
          ) : (
            <Avatar.Text size={60} label="AR" />
          )}

          <View>
            <Text variant='bodySmall'>Bienvenido</Text>
            <Text variant="labelLarge">{userAuth?.displayName || "Usuario"} </Text>
          </View>
          <View style={styles.icon}>
            <IconButton
              icon="account-cog"
              size={40}
              mode="contained"
              onPress={() => setShowModal(true)}
            />
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>🔢 Adivina el Número</Text>
            <Text style={styles.attempts}>Intentos: {attempts}</Text>
            <Text style={styles.message}>{message}</Text>

            {!gameOver ? (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={guess}
                  onChangeText={handleGameInputChange}
                  placeholder="1-100"
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Pressable style={styles.guessButton} onPress={handleGameSubmit}>
                  <Text style={styles.buttonText}>Adivinar</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.restartButton} onPress={handleRestart}>
                <Text style={styles.buttonText}>Jugar de nuevo</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Portal>
          <Modal
            visible={showModal}
            onDismiss={() => setShowModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.headerModal}>
              <Text variant="headlineMedium">Mi Perfil</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowModal(false)}
              />
            </View>
            <Divider bold={true} />

            <View style={styles.containerImage}>
              {/* Avatar Modal */}
              {user.photo ? (
                <Avatar.Image size={100} source={{ uri: user.photo }} />
              ) : (
                <Avatar.Icon size={100} icon="account" />
              )}

              <View style={styles.containerIcons}>
                <IconButton
                  icon="image-album"
                  mode='contained'
                  size={25}
                  onPress={pickImage}
                />
                <IconButton
                  icon="camera"
                  mode='contained'
                  size={25}
                  onPress={takePhoto}
                />
              </View>
              <Text>Cambiar foto de Perfil</Text>
            </View>

            <TextInput
              label="Nombre"
              mode="outlined"
              value={user.name}
              onChangeText={(value) => handleInputChangeUser("name", value)}
              style={styles.inputModal}
              placeholder="Tu nombre"
            />

            <TextInput
              mode='outlined'
              label="Correo Electrónico"
              value={userAuth?.email || ""}
              disabled
            />
            <Button
              mode="contained"
              onPress={handleUpdateUser}
              style={styles.saveButton}
              contentStyle={{ paddingVertical: 6 }}
            >
              Actualizar Perfil
            </Button>
            <View style={styles.iconSingOut}>
              <IconButton icon="logout"
                mode='contained'
                size={30}
                onPress={handleSignOut}

              />
            </View>
          </Modal>
        </Portal>


        <Portal>
          <Modal
            visible={showAllComments}
            onDismiss={() => setShowAllComments(false)}
            contentContainerStyle={styles.modalComments}
          >
            <View style={styles.headerModal}>
              <Text variant="headlineMedium">💬 Comentarios</Text>
              <IconButton icon="close" onPress={() => setShowAllComments(false)} />
            </View>
            <Divider bold />

            <FlatList
              data={comments}
              renderItem={({ item }) => <CommentComponent comment={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          </Modal>
        </Portal>
      </View >

      {/* FABs */}
      <FAB
        icon="comment-eye"
        style={styles.fab}
        onPress={() => setShowAllComments(true)}
      />
      <FAB
        icon="comment-edit"
        style={styles.fab2}
        onPress={() => setShowModalComment(true)}
      />
      <NewCommentComponent
        visible={showModalComment}
        hideModal={() => setShowModalComment(false)}
      />
    </>
  );
};