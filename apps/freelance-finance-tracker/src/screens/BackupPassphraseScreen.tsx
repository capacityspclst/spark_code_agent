import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton, FormField } from '../components/ui';
import { createBackup } from '../lib/backup';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getStore } from '../lib/storage';

export default function BackupPassphraseScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const create = async () => {
    if (pass1 !== pass2) {
      setSnack('Passphrases must match');
      return;
    }
    if (pass1.length < 8) {
      setSnack('Passphrase must be at least 8 characters');
      return;
    }
    try {
      setLoading(true);
      const store = getStore();
      await createBackup(store, pass1);
      setSnack('Backup ready to share');
      // Stay on this screen; UI flow checks for the snack message.
    } catch (e) {
      setSnack('Backup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Create backup">
      <View style={{ gap: 12 }}>
        <FormField label="Backup passphrase" value={pass1} onChangeText={setPass1} secureTextEntry />
        <FormField label="Confirm passphrase" value={pass2} onChangeText={setPass2} secureTextEntry />
        <PrimaryButton label="Create backup" onPress={create} loading={loading} disabled={loading} />
        {snack ? <Text>{snack}</Text> : null}
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </Screen>
  );
}
