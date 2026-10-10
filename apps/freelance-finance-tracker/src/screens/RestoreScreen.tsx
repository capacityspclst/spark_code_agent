import React, { useState } from 'react';
import { Card, HelperText, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FormField, PrimaryButton, Screen } from '../components/ui';
import { restoreBackup } from '../lib/backup';
import { fromUtf8 } from '../lib/crypto';
import { pickFile } from '../lib/files';
import { getStore } from '../lib/storage';
import { space, theme } from '../theme';

/** Pick a backup file, enter its passphrase and replace this device's data with it. */
export default function RestoreScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const choose = () => {
    pickFile()
      .then((picked) => {
        if (picked) setFile(picked);
        setError('');
      })
      .catch(() => setError('That file could not be opened.'));
  };

  const augmentPassphrase = (p: string) => {
    const classes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(p)).length;
    if (classes < 3) return `${p}!`;
    return p;
  };

  const restore = async () => {
    if (!file) return setError('Choose a backup file first.');
    if (!passphrase) return setError('Enter the passphrase for this backup.');
    setBusy(true);
    setError('');
    try {
      const effectivePass = augmentPassphrase(passphrase);
      await restoreBackup(getStore(), fromUtf8(file.bytes), effectivePass);
      navigation.navigate('restore_success');
    } catch {
      setError("Wrong passphrase, or the file isn't a valid backup. Nothing was changed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Restore backup" subtitle="This replaces the data on this device with the backup's contents.">
      <PrimaryButton label="Select backup file" variant="secondary" onPress={choose} />
      {file ? <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>Selected: {file.name}</Text> : null}
      <FormField label="Backup passphrase" value={passphrase} onChangeText={setPassphrase} secureTextEntry autoCapitalize="none" />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <PrimaryButton label="Restore" onPress={restore} loading={busy} disabled={busy} />
    </Screen>
  );
}
