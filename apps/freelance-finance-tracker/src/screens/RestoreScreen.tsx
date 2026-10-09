import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton, FormField } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { restoreBackup } from '../lib/backup';
import { getStore } from '../lib/storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function RestoreScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const [backupBlob, setBackupBlob] = useState<string>(''); // content of selected backup
  const [passphrase, setPassphrase] = useState<string>('');

  const pickFile = async () => {
    if (Platform.OS === 'web') {
      // Create hidden file input programmatically and trigger click.
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      document.body.appendChild(input);
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          try {
            const text = await file.text();
            setBackupBlob(text);
            setSnack('');
          } catch {
            setSnack('Failed to read file');
          }
        }
        document.body.removeChild(input);
      };
      input.click();
      return;
    }
    // Native platforms use expo-document-picker.
    try {
      const result: any = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.type === 'success' && result.uri) {
        const content = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        setBackupBlob(content);
        setSnack('');
      }
    } catch {
      setSnack('Failed to pick file');
    }
  };

  const onRestore = async () => {
    if (!backupBlob || !passphrase) {
      setSnack('Enter passphrase.');
      return;
    }
    try {
      setLoading(true);
      const store = getStore();
      await restoreBackup(store, backupBlob, passphrase);
      setSnack('Data restored successfully.');
    } catch {
      setSnack('Invalid passphrase or corrupted backup file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Restore backup">
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        <PrimaryButton label="Select backup file" variant="secondary" onPress={pickFile} disabled={loading} />
        <FormField label="Backup passphrase" value={passphrase} onChangeText={setPassphrase} secureTextEntry />
        {loading && <ActivityIndicator accessibilityLabel="Restoring data" />}
        <PrimaryButton label="Restore" variant="primary" onPress={onRestore} disabled={loading} />
        <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2000}>
          {snack}
        </Snackbar>
      </View>
    </Screen>
  );
}
