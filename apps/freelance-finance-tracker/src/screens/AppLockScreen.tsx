import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { PrimaryButton, Screen, SettingSwitch } from '../components/ui';
import { getAppLockEnabled, setAppLockEnabled } from '../lib/settings';
import { getStore } from '../lib/storage';

export default function AppLockScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<string>('');

  useEffect(() => {
    (async () => {
      const cur = await getAppLockEnabled();
      setEnabled(cur);
      setLoading(false);
    })();
  }, []);

  const toggle = async (value: boolean) => {
    setEnabled(value);
    await setAppLockEnabled(value);
    setSnack(value ? 'App lock enabled' : 'App lock disabled');
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }

  return (
    <Screen title="App lock">
      <View style={{ gap: 12 }}>
        <SettingSwitch label="Require biometric authentication on launch" value={enabled} onChange={toggle} />
        <PrimaryButton label="Back" variant="secondary" onPress={() => { /* navigation handled by header back */ }} />
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </Screen>
  );
}
