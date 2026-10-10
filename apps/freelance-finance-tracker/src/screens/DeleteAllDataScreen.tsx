import React, { useState } from 'react';
import { Card, Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen } from '../components/ui';
import { deleteAllData } from '../lib/dataReset';
import { getStore } from '../lib/storage';
import { space, theme } from '../theme';

/** Confirm, then delete every receipt, mileage entry and setting on this device (the policy acceptance stays). */
export default function DeleteAllDataScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setBusy(true);
    try {
      await deleteAllData(getStore());
      setDone(true);
    } catch {
      setError('Something went wrong. Nothing was deleted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Delete all data">
      <Card mode="outlined" style={{ backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ gap: space(1.5), paddingVertical: space(2) }}>
          {done ? (
            <>
              <Text variant="titleMedium">All data deleted.</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>This device no longer holds any of your records.</Text>
              <PrimaryButton label="Go to dashboard" onPress={() => navigation.navigate('Dashboard')} />
            </>
          ) : (
            <>
              <Text variant="titleMedium">Delete everything on this device?</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                All receipts, photos, mileage and settings are removed. This can't be undone unless you have a backup file.
              </Text>
              <PrimaryButton label="Delete" onPress={remove} loading={busy} disabled={busy} buttonColor={theme.colors.error} />
              <PrimaryButton label="Cancel" variant="text" onPress={() => navigation.goBack()} />
              {error ? <Text variant="bodyMedium" style={{ color: theme.colors.error }}>{error}</Text> : null}
            </>
          )}
        </Card.Content>
      </Card>
    </Screen>
  );
}
