import React, { useState, useEffect } from 'react';
import { HelperText, Snackbar } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FormField, PrimaryButton, Screen } from '../components/ui';
import { createBackup } from '../lib/backup';
import { utf8 } from '../lib/crypto';
import { saveAndShare } from '../lib/files';
import { getStore } from '../lib/storage';
import { theme, space } from '../theme';

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
  const navigation = useNavigation<NavigationProp<any>>();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');
  const [backupDone, setBackupDone] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  const create = async () => {
    const validation = validatePassphrase(pass1);
    if (validation) return setError(validation);
    if (pass1 !== pass2) return setError("The passphrases don't match.");
    setError('');
    try {
      const backup = await createBackup(getStore(), pass1);
      // Share the backup file asynchronously
      saveAndShare(`finance-backup-${new Date().toISOString().slice(0, 10)}.backup`, utf8(backup)).catch(() => {});
      // Show confirmation
      setBackupDone(true);
      setSnackVisible(true);
    } catch {
      setError('The backup could not be created. Please try again.');
    }
  };

  // Navigate to success screen after showing snackbar (immediately after render)
  useEffect(() => {
    if (backupDone) {
      navigation.navigate('backup_success');
    }
  }, [backupDone, navigation]);

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
      <PrimaryButton label="Create backup" onPress={create} disabled={!!error} />
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        action={{ label: 'Close', onPress: () => setSnackVisible(false) }}
        accessibilityLabel="Backup ready to share"
      >
        Backup ready to share
      </Snackbar>
    </Screen>
  );
}
