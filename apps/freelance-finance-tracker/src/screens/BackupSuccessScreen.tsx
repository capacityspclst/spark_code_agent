import React from 'react';
import { Card, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen } from '../components/ui';
import { space, theme } from '../theme';

/** Screen shown after a backup is successfully created. */
export default function BackupSuccessScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
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
