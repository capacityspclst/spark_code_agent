import React, { useEffect, useState } from 'react';
import { Card, List, Divider } from 'react-native-paper';
import { Screen, SettingSwitch } from '../components/ui';
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

  const navigate = (name: string) => () => navigation.navigate(name as any);

  const goCategories = navigate('Categories');

  const goMileageRate = navigate('MileageRate'); // placeholder screen name

  const goTaxSettings = navigate('TaxSettings');

  const goExport = navigate('Export');

  const goBackup = navigate('Backup');

  const goDeleteAll = navigate('DeleteAllData');

  const goAppLock = navigate('AppLock');

  const goViewPolicy = onViewPolicy ? () => onViewPolicy() : undefined;

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
      {/* Setting rows */}
      <List.Item
        title="Mileage rate"
        right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurface} />}
        onPress={goMileageRate}
        accessibilityLabel="Mileage rate"
        accessibilityRole="button"
      />
      <List.Item
        title="Tax rate"
        right={props => <List.Icon {...props} icon="chevron-right" />}
        onPress={goTaxSettings}
        accessibilityLabel="Tax rate"
        accessibilityRole="button"
      />
      <List.Item
        title="Categories"
        right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurface} />}
        onPress={goCategories}
        accessibilityLabel="Categories"
        accessibilityRole="button"
      />
      <List.Item
        title="Export"
        right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurface} />}
        onPress={goExport}
        accessibilityLabel="Export"
        accessibilityRole="button"
      />
      <List.Item
        title="Backup & restore"
        right={props => <List.Icon {...props} icon="chevron-right" />}
        onPress={goBackup}
        accessibilityLabel="Backup & restore"
      />
      <Divider style={{ marginVertical: 8 }} />
      <List.Item
        title="Delete all data"
        titleStyle={{ color: theme.colors.error }}
        right={props => <List.Icon {...props} icon="chevron-right" />}
        onPress={goDeleteAll}
        accessibilityLabel="Delete all data"
      />
      <List.Item
        title="View Terms and Privacy Policy"
        right={props => <List.Icon {...props} icon="chevron-right" />}
        onPress={goViewPolicy}
        accessibilityLabel="View Terms and Privacy Policy"
      />
    </Screen>
  );
}
