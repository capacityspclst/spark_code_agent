import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-paper';
import { PrimaryButton, Screen, SettingSwitch } from '../components/ui';
import { theme } from '../theme';
import { getAppLockEnabled, setAppLockEnabled } from '../lib/settings';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getStore } from '../lib/storage';
import { verifyLedger } from '../lib/ledgerVerification';
import VerificationStatus from '../components/ui/VerificationStatus';

/** Settings screen with links to sub‑screens and actions. */
export default function SettingsScreen({ onViewPolicy }: { onViewPolicy?: () => void }) {
  const navigation = useNavigation<NavigationProp<any>>();
  const [lock, setLock] = useState(false);
  const [ledgerInfo, setLedgerInfo] = useState<{ ok: boolean; entries: any[] } | null>(null);

  useEffect(() => {
    (async () => {
      const v = await getAppLockEnabled();
      setLock(v);
      const verification = await verifyLedger(getStore());
      setLedgerInfo({ ok: verification.ok, entries: verification.entries });
    })();
  }, []);

  const toggleLock = async (value: boolean) => {
    setLock(value);
    await setAppLockEnabled(value);
  };

  const deleteAllData = () => {
    navigation.navigate('DeleteAllData' as any);
  };

  const goCategories = () => {
    navigation.navigate('Categories' as any);
  };

  const goVerifyExport = () => {
    navigation.navigate('VerifyExport' as any);
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
      {ledgerInfo && (
        <VerificationStatus ok={ledgerInfo.ok} entryCount={ledgerInfo.entries.length} />
      )}
      <PrimaryButton label="App lock" variant="secondary" onPress={() => navigation.navigate('AppLock')} />
      <PrimaryButton label="Tax settings" variant="secondary" onPress={() => navigation.navigate('TaxSettings')} />
      <PrimaryButton label="Categories" variant="secondary" onPress={goCategories} />
      <PrimaryButton label="Export" variant="secondary" onPress={() => navigation.navigate('Export')} />
      <PrimaryButton label="Backup & restore" variant="secondary" onPress={() => navigation.navigate('Backup')} />
      <PrimaryButton label="Verify export" variant="secondary" onPress={goVerifyExport} />
      <PrimaryButton label="Delete all data" variant="secondary" onPress={deleteAllData} />
      <PrimaryButton label="View Terms and Privacy Policy" variant="secondary" onPress={onViewPolicy ?? (() => {})} />
    </Screen>
  );
}
