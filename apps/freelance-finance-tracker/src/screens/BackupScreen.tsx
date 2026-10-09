import React from 'react';
import { Card, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen } from '../components/ui';
import { space, theme } from '../theme';

/** Backup & restore hub: everything stays on this device unless the user saves a backup file somewhere. */
export default function BackupScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <Screen title="Backup" subtitle="Your data lives only on this device. Keep an encrypted backup somewhere safe.">
      <Card mode="outlined" style={{ backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ gap: space(1.5), paddingVertical: space(2) }}>
          <Text variant="titleMedium">Encrypted backup file</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
            One file with all your receipts and mileage, locked with a passphrase you choose.
          </Text>
          <PrimaryButton label="Create encrypted backup" onPress={() => navigation.navigate('backup_passphrase_modal')} />
          <PrimaryButton label="Restore from backup" variant="secondary" onPress={() => navigation.navigate('restore_passphrase_modal')} />
        </Card.Content>
      </Card>
      <PrimaryButton label="Delete all data" variant="text" onPress={() => navigation.navigate('DeleteAllData')} />
    </Screen>
  );
}
