import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { PrimaryButton, Screen, SettingSwitch } from '../components/ui';
import { theme } from '../theme';
import { getAppLockEnabled, setAppLockEnabled } from '../lib/settings';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import { getStore } from '../lib/storage';

/** Settings screen with links to sub‑screens and actions. */
export default function SettingsScreen({ onViewPolicy }: { onViewPolicy: () => void }) {
  const navigation = useNavigation<NavigationProp<any>>();
  const [lock, setLock] = useState(false);

  useEffect(() => {
    // Load current app lock setting.
    (async () => {
      const v = await getAppLockEnabled();
      setLock(v);
    })();
  }, []);

  const goTo = (screen: string) => {
    const parent = navigation.getParent?.();
    if (parent) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      (parent as any).navigate(screen as any);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      (navigation as any).navigate(screen as any);
    }
  };

  const toggleLock = async (value: boolean) => {
    setLock(value);
    await setAppLockEnabled(value);
  };

  const deleteAllData = async () => {
    Alert.alert(
      'Delete all data?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const store = getStore();
            await store.clearAll();
          },
        },
      ],
    );
  };

  return (
    <Screen title="Settings">
      <Card mode="outlined" style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}>
        <SettingSwitch
          label="App lock"
          description="Require biometric authentication on launch"
          value={lock}
          onChange={toggleLock}
        />
      </Card>
      <PrimaryButton label="App lock" variant="secondary" onPress={() => goTo('AppLock')} />
      <PrimaryButton label="Tax settings" variant="secondary" onPress={() => goTo('TaxSettings')} />
      <PrimaryButton label="Export" variant="secondary" onPress={() => goTo('Export')} />
      <PrimaryButton label="Backup & restore" variant="secondary" onPress={() => goTo('Backup')} />
      <PrimaryButton label="Delete all data" variant="secondary" onPress={deleteAllData} />
      <PrimaryButton label="View Terms and Privacy Policy" variant="secondary" onPress={onViewPolicy} />
    </Screen>
  );
}
