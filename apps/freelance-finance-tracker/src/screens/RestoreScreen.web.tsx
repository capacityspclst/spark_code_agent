import React, { useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton, FormField } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { restoreBackup } from '../lib/backup';
import { getStore } from '../lib/storage';
import { theme } from '../theme';

/** Web implementation of RestoreScreen using a button that triggers a hidden file input. */
export default function RestoreScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const [backupBlob, setBackupBlob] = useState<string>('');
  const [passphrase, setPassphrase] = useState<string>('');

  const pickFile = () => {
    // Create hidden file input and trigger click.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.style.display = 'none';
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
    document.body.appendChild(input);
    input.click();
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
        <button
          type="button"
          onClick={pickFile}
          style={{
            padding: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            borderRadius: theme.roundness,
            color: theme.colors.onSurface,
            backgroundColor: theme.colors.surface,
            cursor: 'pointer',
          }}
        >
          Select backup file
        </button>
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
