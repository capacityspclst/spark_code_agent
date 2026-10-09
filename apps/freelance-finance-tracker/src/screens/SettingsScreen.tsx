import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { PrimaryButton, Screen, SettingSwitch } from '../components/ui';
import { getStore } from '../lib/storage';
import { theme } from '../theme';
import { getAppLockEnabled } from '../lib/settings';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Settings screen with links to sub‑screens. */
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
    // Navigate in the parent stack if possible.
    navigation.getParent?.()?.navigate(screen as any);
  };

  return (
    <Screen title="Settings">
      <Card mode="outlined" style={{ backgroundColor: theme.colors.surface, marginBottom: 12 }}>
        <SettingSwitch
          label="App lock"
          description="Require biometric authentication on launch"
          value={lock}
          onChange={setLock}
        />
      </Card>
      <PrimaryButton label="App lock" variant="secondary" onPress={() => goTo('AppLock')} />
      <PrimaryButton label="Tax settings" variant="secondary" onPress={() => goTo('TaxSettings')} />
      <PrimaryButton label="Export" variant="secondary" onPress={() => goTo('Export')} />
      <PrimaryButton label="View Terms and Privacy Policy" variant="secondary" onPress={onViewPolicy} />
    </Screen>
  );
}
