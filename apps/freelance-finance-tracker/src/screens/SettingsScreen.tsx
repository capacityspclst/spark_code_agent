import React, { useEffect, useState } from 'react';
import { Card, List, Divider } from 'react-native-paper';
import { Screen, SettingSwitch } from '../components/ui';
import { theme } from '../theme';
import { getAppLockEnabled, setAppLockEnabled } from '../lib/settings';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Settings screen with rows according to design spec. */
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

  const goScreen = (name: string) => () => navigation.navigate(name as any);

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
      <List.Item title="Tax settings" onPress={goScreen('TaxSettings')} left={(props) => <List.Icon {...props} icon="file-document" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} accessibilityRole="button" accessibilityLabel="Tax settings" accessibilityState={{ selected: false }} />
      <List.Item title="Categories" onPress={goScreen('Categories')} left={(props) => <List.Icon {...props} icon="tag" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} accessibilityRole="button" accessibilityLabel="Categories" />
      <List.Item title="Export" onPress={goScreen('Export')} left={(props) => <List.Icon {...props} icon="export" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} accessibilityRole="button" accessibilityLabel="Export" />
      <List.Item title="Backup & restore" onPress={goScreen('Backup')} left={(props) => <List.Icon {...props} icon="backup-restore" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} accessibilityRole="button" accessibilityLabel="Backup & restore" accessibilityState={{ selected: false }} />
      <Divider />
      <List.Item title="Delete all data" titleStyle={{ color: theme.colors.error }} onPress={goScreen('DeleteAllData')} left={(props) => <List.Icon {...props} icon="delete" color={theme.colors.error} />} />
      <List.Item title="View Terms and Privacy Policy" onPress={onViewPolicy ?? (() => {})} left={(props) => <List.Icon {...props} icon="file-document-outline" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} />
    </Screen>
  );
}
