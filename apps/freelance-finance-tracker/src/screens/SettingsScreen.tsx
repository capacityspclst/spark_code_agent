import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { PrimaryButton, Screen, SettingSwitch } from '../components/ui';
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
    const parent = navigation.getParent?.();
    if (parent) {
      // Navigate on the parent stack (Export, AppLock, TaxSettings are defined there)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      (parent as any).navigate(screen as any);
    } else {
      // Fallback: navigate on the current navigator
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      (navigation as any).navigate(screen as any);
    }
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
