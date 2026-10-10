import React from 'react';
import { Card, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen } from '../components/ui';
import { space, theme } from '../theme';

/** Screen shown after a successful restore. */
export default function RestoreSuccessScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <Screen title="Restore backup">
      <Card mode="outlined" style={{ backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ gap: space(1.5), paddingVertical: space(2) }}>
          <Text variant="titleMedium">Data restored successfully.</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
            Your receipts and mileage from the backup are back on this device.
          </Text>
          <PrimaryButton label="Delete all data" variant="text" onPress={() => navigation.navigate('DeleteAllData')} />
        </Card.Content>
      </Card>
    </Screen>
  );
}
