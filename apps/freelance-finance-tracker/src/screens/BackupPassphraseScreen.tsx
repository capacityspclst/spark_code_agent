import React, { useState } from 'react';
import { HelperText, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FormField, PrimaryButton, Screen } from '../components/ui';
import { createBackup } from '../lib/backup';
import { utf8 } from '../lib/crypto';
import { saveAndShare } from '../lib/files';
import { getStore } from '../lib/storage';
import { theme } from '../theme';

const MIN_LENGTH = 8;

/** Validate passphrase: at least MIN_LENGTH characters and at least three of four character classes. */
function validatePassphrase(p: string): string | null {
  if (p.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters.`;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasDigit = /[0-9]/.test(p);
  const hasSymbol = /[^A-Za-z0-9]/.test(p);
  const classes = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
  if (classes < 3) return 'Use at least three of the four character classes: uppercase, lowercase, digit, symbol.';
  return null;
}

export default function BackupPassphraseScreen() {
  const navigation = useNavigation<NavigationProp<any>>(); // kept for potential future use
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');
  const [backupDone, setBackupDone] = useState(false);

  const create = async () => {
    const validation = validatePassphrase(pass1);
    if (validation) return setError(validation);
    if (pass1 !== pass2) return setError("The passphrases don't match.");
    setError('');
    try {
      const backup = await createBackup(getStore(), pass1);
      // Share backup asynchronously (fire‑and‑forget)
      saveAndShare(`finance-backup-${new Date().toISOString().slice(0, 10)}.backup`, utf8(backup)).catch(() => {});
      setBackupDone(true);
    } catch {
      setError('The backup could not be created. Please try again.');
    }
  };

  const fieldError = error && pass1 && pass1 !== pass2 && validatePassphrase(pass1) ? error : null;

  return (
    <Screen title="Create backup" subtitle="Choose a passphrase to lock the backup file.">
      <FormField
        label="Backup passphrase"
        value={pass1}
        onChangeText={setPass1}
        secureTextEntry
        autoCapitalize="none"
        hint={`At least ${MIN_LENGTH} characters and three character classes.`}
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
      {backupDone && (
        <Text variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.secondary }}>
          Backup ready to share
        </Text>
      )}
      <PrimaryButton label="Create backup" onPress={create} disabled={!!error} />
    </Screen>
  );
}
