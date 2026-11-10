import React, { useEffect, useState } from 'react';
import { SettingsRow, SettingsSection, Separator, Screen } from '../components/ui';
import { theme } from '../theme';
import { getAppLockEnabled, setAppLockEnabled } from '../lib/settings';
import { useNavigation, NavigationProp } from '@react-navigation/native';

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

  return (
    <Screen title="Settings">
      <SettingsSection>
        <SettingsRow
          label="App lock"
          testID="settings-row-app-lock"
          showSwitch={true}
          switchValue={lock}
          onSwitchChange={toggleLock}
          showChevron={false}
        />
        <SettingsRow
          label="Mileage rate"
          testID="settings-row-mileage-rate"
          onPress={() => navigation.navigate('Mileage' as any)}
          showChevron={true}
        />
        <SettingsRow
          label="Tax rate"
          testID="settings-row-tax-rate"
          onPress={() => navigation.navigate('TaxSettings' as any)}
          showChevron={true}
        />
        <SettingsRow
          label="Export"
          testID="settings-row-export"
          onPress={() => navigation.navigate('Export' as any)}
          showChevron={true}
        />
        <SettingsRow
          label="Backup & restore"
          testID="settings-row-backup"
          onPress={() => navigation.navigate('Backup' as any)}
          showChevron={true}
        />
        <SettingsRow
          label="Categories"
          testID="settings-row-categories"
          onPress={() => navigation.navigate('Categories' as any)}
          showChevron={true}
        />
        <SettingsRow
          label="View Terms and Privacy Policy"
          testID="settings-row-terms"
          onPress={onViewPolicy ?? (() => {})}
          showChevron={true}
        />
      </SettingsSection>
      <Separator />
      <SettingsRow
        label="Delete all data"
        testID="settings-row-delete-all-data"
        onPress={() => navigation.navigate('DeleteAllData' as any)}
        error={true}
        showChevron={false}
      />
    </Screen>
  );
}
