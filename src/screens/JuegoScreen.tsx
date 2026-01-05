import React, { useState, useEffect } from 'react';
import { View, Pressable, Alert, FlatList, Text as RNText } from 'react-native';
import { styles } from '../theme/appStyles';
import {
  IconButton,
  Text,
  Portal,
  Modal,
  Button,
  Divider,
  TextInput,
  FAB,
} from 'react-native-paper';

import { auth, dbRealtime } from '../configs/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { NewCommentComponent } from '../components/NewCommentComponents'; // ← Sin "s" al final (ajusta si tu archivo tiene "s")
import { Comment, CommentComponent } from '../components/CommentComponents'; // ← Asegúrate del nombre exacto
import { onValue, ref } from 'firebase/database';

export const JuegoScreen: React.FC = () => {
  // Estados del juego
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<string>(
    '¡Adivina un número entre 1 y 100!'
  );
  const [attempts, setAttempts] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Estados de comentarios
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showModalComment, setShowModalComment] = useState(false);

  // Estados del perfil
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userAuth, setUserAuth] = useState<any>(null);

  // Cargar comentarios solo cuando se abre el modal
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

  // Inicializar juego y usuario
  useEffect(() => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(randomNum);
    console.log('Número secreto:', randomNum);

    const currentUser = auth.currentUser;
    setUserAuth(currentUser);
    if (currentUser) {
      setUserName(
        currentUser.displayName ||
        currentUser.email?.split('@')[0] ||
        'Usuario'
      );
    }
  }, []);

  // === Lógica del juego ===
  const handleInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setGuess(value);
    }
  };

  const handleSubmit = () => {
    const guessNum = parseInt(guess, 10);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      Alert.alert('Entrada inválida', 'Ingresa un número entre 1 y 100.');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === targetNumber) {
      setMessage(
        `🎉 ¡Correcto! Era ${targetNumber}.\nLo lograste en ${newAttempts} intentos.`
      );
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

  // === Actualizar perfil ===
  const handleUpdateName = async () => {
    if (!userAuth || !userName.trim()) {
      Alert.alert('⚠️ Error', 'El nombre no puede estar vacío.');
      return;
    }

    try {
      await updateProfile(userAuth, { displayName: userName.trim() });
      Alert.alert('✅ Éxito', 'Nombre actualizado correctamente.');
      setShowModal(false);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('❌ Error', error.message || 'No se pudo actualizar el nombre.');
    }
  };

  return (
    <>
      {/* Contenido principal */}
      <View style={styles.container}>
        <View style={styles.headerProfile}>
          <IconButton
            icon="account-cog"
            size={40}
            mode="contained"
            onPress={() => setShowModal(true)}
          />
          <View>
            <Text variant="titleMedium">Hola, {userName} 👋</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>🔢 Adivina el Número</Text>
          <Text style={styles.attempts}>Intentos: {attempts}</Text>
          <Text style={styles.message}>{message}</Text>

          {!gameOver ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={guess}
                onChangeText={handleInputChange}
                placeholder="1-100"
                keyboardType="numeric"
                maxLength={3}
              />
              <Pressable style={styles.guessButton} onPress={handleSubmit}>
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

      {/* FABs flotantes */}
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

      {/* Modal de perfil */}
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
          <Divider bold />
          <Text variant="bodyMedium" style={styles.emailText}>
            Email: {userAuth?.email || 'No disponible'}
          </Text>
          <TextInput
            label="Nombre"
            value={userName}
            onChangeText={setUserName}
            style={styles.inputModal}
            mode="outlined"
            placeholder="Tu nombre"
          />
          <Button
            mode="contained"
            onPress={handleUpdateName}
            style={styles.saveButton}
            contentStyle={{ paddingVertical: 6 }}
          >
            Guardar Nombre
          </Button>
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
      <NewCommentComponent
        visible={showModalComment}
        hideModal={() => setShowModalComment(false)}
      />
    </>
  );
};