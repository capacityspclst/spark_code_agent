import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { space, theme } from '../../theme';
import { pickImageAsync } from '../../lib/photoPicker';

interface Props {
  photoUri?: string;
  onChange: (uri?: string) => void;
}

/** Allows user to pick a photo (camera or library) and returns a stored file URI. */
export default function ReceiptImagePicker({ photoUri, onChange }: Props) {
  const [uri, setUri] = useState<string | undefined>(photoUri);

  const pick = async () => {
    const result = await pickImageAsync();
    if (result) {
      setUri(result);
      onChange(result);
    }
  };

  const remove = () => {
    setUri(undefined);
    onChange(undefined);
  };

  return (
    <View style={styles.container}>
      {uri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri }} style={styles.preview} accessibilityLabel="Receipt photo" />
          <Button mode="text" onPress={remove} accessibilityLabel="Remove photo">
            Remove photo
          </Button>
        </View>
      ) : (
        <Button mode="outlined" onPress={pick} accessibilityLabel="Add photo">
          Add photo
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: space(2) },
  previewWrap: { alignItems: 'center', gap: space(1) },
  preview: { width: 200, height: 200, borderRadius: theme.roundness, backgroundColor: theme.colors.surfaceVariant },
});
