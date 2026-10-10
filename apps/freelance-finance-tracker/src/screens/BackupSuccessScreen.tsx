import React, { useEffect, useState } from 'react';
import { Card, Text, Snackbar } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen } from '../components/ui';
import { theme, space } from '../theme';

/** Screen shown after a backup is successfully created. Displays a Snackbar with confirmation and a visible text for the flow. */
export default function BackupSuccessScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [snackVisible, setSnackVisible] = useState(false);

  useEffect(() => {
    // Show snackbar when screen appears
    setSnackVisible(true);
    const timer = setTimeout(() => setSnackVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen title="Backup">
      <Card mode="outlined" style={{ backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ gap: space(1.5), paddingVertical: space(2) }}>
          <Text variant="titleMedium">Backup ready to share</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
            Keep the file and your passphrase somewhere safe. Without the passphrase the backup can't be opened.
          </Text>
          <PrimaryButton
            label="Restore from backup"
            variant="secondary"
            onPress={() => navigation.navigate('restore_passphrase_modal')}
          />
        </Card.Content>
      </Card>
      {/* Visible confirmation text for UI flow */}
      <Text variant="bodyMedium" style={{ marginTop: space(1), color: theme.colors.onSurface }}>
        Backup ready to share
      </Text>
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
