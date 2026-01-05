import React, { useState } from 'react';
import { Button, Divider, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { styles } from '../theme/appStyles';
import { Alert, View } from 'react-native';
import { push, ref, set } from 'firebase/database';
import { auth } from '../configs/firebaseConfig'; 
import { dbRealtime } from '../configs/firebaseConfig';

// Props del modal
interface Props {
  visible: boolean;
  hideModal: () => void;
}

// Formulario del comentario
interface FormComment {
  comment: string;
}

export const NewCommentComponent = ({ visible, hideModal }: Props) => {
  const [formComment, setFormComment] = useState<FormComment>({
    comment: "",
  });

  const handleInputChange = (value: string) => {
    setFormComment({ comment: value });
  };

  const handleSaveComment = async () => {
    if (formComment.comment.trim() === "") {
      Alert.alert("Error", "El comentario no puede estar vacío");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "No hay usuario autenticado");
      return;
    }

    try {
      const dbRef = ref(dbRealtime, "comments");
      await set(push(dbRef), {
        email: currentUser.email,
        comment: formComment.comment.trim(),
      });

      setFormComment({ comment: "" });
      hideModal();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo guardar el comentario");
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
        <View style={styles.headerModal}>
          <Text variant="headlineMedium">Danos tu opinion...</Text>
          <View style={styles.icon}>
            <IconButton icon="close-circle" size={25} onPress={hideModal} />
          </View>
        </View>
        <Divider bold={true} />
        <TextInput
          placeholder="Escribe tu comentario"
          mode="outlined"
          multiline
          numberOfLines={10}
          value={formComment.comment}
          onChangeText={handleInputChange}
          style={styles.inputMessage}
        />
        <Button mode="contained" onPress={handleSaveComment} style={{ marginTop: 15 }}>
          Publicar
        </Button>
      </Modal>
    </Portal>
  );
};