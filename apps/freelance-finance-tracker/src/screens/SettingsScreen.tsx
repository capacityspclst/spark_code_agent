import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { PrimaryButton, Screen, SettingSwitch } from '../components/ui';
import { getStore } from '../lib/storage';
import { theme } from '../theme';

const LOCK_KEY = 'settings.appLock';

/** Example settings screen: a stored on/off setting (off by default) and a link to the policy. */
export default function SettingsScreen({ onViewPolicy }: { onViewPolicy: () => void }) {
  const [lock, setLock] = useState(false);
  useEffect(() => {
    getStore().get<boolean>(LOCK_KEY).then((v) => setLock(v ?? false));
  }, []);
  const toggle = async (value: boolean) => {
    setLock(value);
    await getStore().set(LOCK_KEY, value);
  };
  return (
    <Screen title="Settings">
      <Card mode="outlined" style={{ backgroundColor: theme.colors.surface }}>
        <SettingSwitch label="App lock" description="Ask for Face ID or fingerprint when the app opens" value={lock} onChange={toggle} />
      </Card>
      <PrimaryButton label="View Terms and Privacy Policy" variant="secondary" onPress={onViewPolicy} />
    </Screen>
  );
}
