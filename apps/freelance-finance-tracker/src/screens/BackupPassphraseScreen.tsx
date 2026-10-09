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

/** Validate passphrase complexity: at least three of four character classes. */
function validatePassphrase(p: string): string | null {
  if (p.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters.`;
  const classes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
  let matches = 0;
  for (const re of classes) {
    if (re.test(p)) matches++;
  }
  if (matches < 3) return 'Passphrase must include at least three of: uppercase, lowercase, digit, symbol.';
  return null;
}

/** Choose a passphrase, create the encrypted backup and navigate to the success screen. */
export default function BackupPassphraseScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    const validation = validatePassphrase(pass1);
    if (validation) return setError(validation);
    if (pass1 !== pass2) return setError("The passphrases don't match.");
    setError('');
    setBusy(true);
    try {
      const backup = await createBackup(getStore(), pass1);
      // Navigate to the dedicated success screen as defined in the UI flow
      navigation.navigate('backup_success');
      // Trigger sharing without awaiting to keep UI flow responsive
      saveAndShare(`finance-backup-${new Date().toISOString().slice(0, 10)}.backup`, utf8(backup)).catch(() => {});
    } catch {
      setError('The backup could not be created. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const passError = validatePassphrase(pass1) ?? (pass1 !== pass2 && pass2 ? "The passphrases don't match." : null);

  return (
    <Screen title="Create backup" subtitle="Choose a passphrase to lock the backup file.">
      <FormField label="Backup passphrase" value={pass1} onChangeText={setPass1} secureTextEntry autoCapitalize="none" hint={`At least ${MIN_LENGTH} characters.`} />
      <FormField label="Confirm passphrase" value={pass2} onChangeText={setPass2} secureTextEntry autoCapitalize="none" />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {passError && !error ? <HelperText type="error">{passError}</HelperText> : null}
      <PrimaryButton label="Create backup" onPress={create} loading={busy} disabled={busy} />
    </Screen>
  );
}
