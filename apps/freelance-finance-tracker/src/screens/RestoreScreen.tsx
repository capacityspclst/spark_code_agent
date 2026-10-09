import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { restoreBackup } from '../lib/backup';

export default function RestoreScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const [fileUri, setFileUri] = useState<string>(''); // placeholder, UI flow will trigger upload
  const [passphrase, setPassphrase] = useState<string>('');

  const onRestore = async () => {
    if (!fileUri || !passphrase) {
      setSnack('Enter passphrase.');
      return;
    }
    try {
      setLoading(true);
      await restoreBackup(fileUri, passphrase);
      setSnack('Data restored successfully.');
    } catch (e) {
      setSnack('Invalid passphrase or corrupted backup file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Restore backup">
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        {/* The UI flow will provide file upload UI; we just placeholder */}
        {loading && <ActivityIndicator accessibilityLabel="Restoring data" />}
        <Text>{/* Placeholder for file selector */}</Text>
        <PrimaryButton label="Restore" variant="primary" onPress={onRestore} disabled={loading} />
        <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
          {snack}
        </Snackbar>
      </View>
    </Screen>
  );
}
