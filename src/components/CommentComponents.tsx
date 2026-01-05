// src/components/CommentComponent.tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from '../theme/appStyles';

// Definir la interfaz del comentario
export interface Comment {
  id: string;
  author: string;
  comment: string;
}

interface Props {
  comment: Comment;
}

export const CommentComponent = ({ comment }: Props) => {
  return (
    <View style={styles.commentItem}>
      <Text variant="labelMedium" style={styles.commentAuthor}>
        {comment.author}
      </Text>
      <Text variant="bodyMedium" style={styles.commentText}>
        {comment.comment}
      </Text>
    </View>
  );
};