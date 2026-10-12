import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { PrimaryButton, Screen, SettingSwitch } from '../components/ui';
import { theme } from '../theme';
import { getAppLockEnabled, setAppLockEnabled } from '../lib/settings';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getStore } from '../lib/storage';

/** Settings screen with links to sub‑screens and actions. */
export default function SettingsScreen({ onViewPolicy }: { onViewPolicy?: () => void }) {
  const navigation = useNavigation<NavigationProp<any>>();
  const [lock, setLock] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await getAppLockEnabled();
      setLock(v);
    })();
  }, []);

  const toggleLock = async (value: boolean) => {
    setLock(value);
    await setAppLockEnabled(value);
  };

  const deleteAllData = () => {
    navigation.navigate('DeleteAllData' as any);
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
      <PrimaryButton label="App lock" variant="secondary" onPress={() => navigation.navigate('AppLock')} />
      <PrimaryButton label="Tax settings" variant="secondary" onPress={() => navigation.navigate('TaxSettings')} />
      <PrimaryButton label="Export" variant="secondary" onPress={() => navigation.navigate('Export')} />
      <PrimaryButton label="Backup & restore" variant="secondary" onPress={() => navigation.navigate('Backup')} />
      <PrimaryButton label="Delete all data" variant="secondary" onPress={deleteAllData} />
      <PrimaryButton label="View Terms and Privacy Policy" variant="secondary" onPress={onViewPolicy ?? (() => {})} />
    </Screen>
  );
}
