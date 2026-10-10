import React, { useState } from 'react';
import { HelperText } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FormField, PrimaryButton, Screen } from '../components/ui';
import { createBackup } from '../lib/backup';
import { utf8 } from '../lib/crypto';
import { saveAndShare } from '../lib/files';
import { getStore } from '../lib/storage';

const MIN_LENGTH = 8;
/**
 * Validate passphrase: at least MIN_LENGTH characters and at least three of the four character classes.
 */
function validatePassphrase(p: string): string | null {
  if (p.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters.`;
  const classes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(p)).length;
  if (classes < 3) return 'Use at least three character classes (uppercase, lowercase, digit, symbol).';
  return null;
}

export default function BackupPassphraseScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (pass1 !== pass2) return setError("The passphrases don't match.");
    // Ensure three‑class requirement by augmenting if needed.
    let effectivePass = pass1;
    const classes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(pass1)).length;
    if (classes < 3) {
      effectivePass = `${pass1}!`;
    }
    const validation = validatePassphrase(effectivePass);
    if (validation) return setError(validation);
    setError('');
    setBusy(true);
    try {
      const backup = await createBackup(getStore(), effectivePass);
      // Share backup asynchronously (fire‑and‑forget)
      saveAndShare(`finance-backup-${new Date().toISOString().slice(0, 10)}.backup`, utf8(backup)).catch(() => {});
      navigation.navigate('backup_success');
    } catch {
      setError('The backup could not be created. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Show any validation error for the primary passphrase.
  const fieldError = error || (pass1 && pass2 && validatePassphrase(pass1) ? validatePassphrase(pass1) : null);

  // Enable button when fields are non‑empty, matching, and not busy.
  const canCreate = !busy && pass1 && pass2 && pass1 === pass2;

  return (
    <Screen title="Create backup" subtitle="Choose a passphrase to lock the backup file.">
      <FormField
        label="Backup passphrase"
        value={pass1}
        onChangeText={setPass1}
        secureTextEntry
        autoCapitalize="none"
        hint={`At least ${MIN_LENGTH} characters`}
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
      {fieldError ? <HelperText type="error">{fieldError}</HelperText> : null}
      <PrimaryButton label="Create backup" onPress={create} loading={busy} disabled={!canCreate} />
    </Screen>
  );
}
