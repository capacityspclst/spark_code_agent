import React, { useState } from 'react';
import { Card, HelperText, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FormField, PrimaryButton, Screen } from '../components/ui';
import { createBackup } from '../lib/backup';
import { utf8 } from '../lib/crypto';
import { saveAndShare } from '../lib/files';
import { getStore } from '../lib/storage';
import { space, theme } from '../theme';

const MIN_LENGTH = 8;

/** Choose a passphrase, create the encrypted backup and hand it to the share sheet (a download on the web). */
export default function BackupPassphraseScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const create = async () => {
    if (pass1.length < MIN_LENGTH) return setError(`Use at least ${MIN_LENGTH} characters.`);
    if (pass1 !== pass2) return setError("The passphrases don't match.");
    setError('');
    setBusy(true);
    try {
      const backup = await createBackup(getStore(), pass1);
      const date = new Date().toISOString().slice(0, 10);
      await saveAndShare(`finance-backup-${date}.backup`, utf8(backup));
      setDone(true);
    } catch {
      setError('The backup could not be created. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen title="Backup">
        <Card mode="outlined" style={{ backgroundColor: theme.colors.surface }}>
          <Card.Content style={{ gap: space(1.5), paddingVertical: space(2) }}>
            <Text variant="titleMedium">Backup ready to share</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
              Keep the file and your passphrase somewhere safe. Without the passphrase the backup can't be opened.
            </Text>
            <PrimaryButton label="Restore from backup" variant="secondary" onPress={() => navigation.navigate('restore_passphrase_modal')} />
          </Card.Content>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Create backup" subtitle="Choose a passphrase to lock the backup file.">
      <FormField label="Backup passphrase" value={pass1} onChangeText={setPass1} secureTextEntry autoCapitalize="none" hint={`At least ${MIN_LENGTH} characters.`} />
      <FormField label="Confirm passphrase" value={pass2} onChangeText={setPass2} secureTextEntry autoCapitalize="none" />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <PrimaryButton label="Create backup" onPress={create} loading={busy} disabled={busy} />
    </Screen>
  );
}
