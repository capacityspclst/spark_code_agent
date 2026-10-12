import React, { useState } from 'react';
import { HelperText, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FormField, PrimaryButton, Screen } from '../components/ui';
import { createBackup } from '../lib/backup';
import { utf8 } from '../lib/crypto';
import { saveAndShare } from '../lib/files';
import { getStore } from '../lib/storage';
import { validateBackupPassphrase } from '../lib/validation';

export default function BackupPassphraseScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const passwordsMatch = pass1 && pass2 && pass1 === pass2;
  const passphraseError = error || (pass1 && validateBackupPassphrase(pass1)) || (!passwordsMatch && pass1 && pass2 && "Passphrases must match.");

  const canCreate = !busy && pass1 && pass2 && passwordsMatch && !validateBackupPassphrase(pass1);

  const create = async () => {
    setError('');
    setBusy(true);
    try {
      const backup = await createBackup(getStore(), pass1);
      await saveAndShare(`finance-backup-${new Date().toISOString().slice(0,10)}.backup`, utf8(backup));
      navigation.navigate('backup_success');
    } catch (e:any) {
      setError(e.message ?? 'The backup could not be created. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Create backup" subtitle="Choose a passphrase to lock the backup file.">
      <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Passphrase must be at least 12 characters.</Text>
      <FormField
        label="Backup passphrase"
        value={pass1}
        onChangeText={setPass1}
        secureTextEntry
        autoCapitalize="none"
        accessibilityLabel="Backup passphrase"
      />
      <FormField
        label="Confirm passphrase"
        value={pass2}
        onChangeText={setPass2}
        secureTextEntry
        autoCapitalize="none"
        accessibilityLabel="Confirm passphrase"
      />
      {passphraseError ? <HelperText type="error">{passphraseError}</HelperText> : null}
      <PrimaryButton label="Create backup" onPress={create} loading={busy} disabled={!canCreate} />
    </Screen>
  );
}
