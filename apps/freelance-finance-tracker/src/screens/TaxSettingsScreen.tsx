import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { PrimaryButton, Screen, FormField, SettingsRow } from '../components/ui';
import { getMileageRate, getTaxRate, setMileageRate, setTaxRate, DEFAULT_MILEAGE_RATE, DEFAULT_TAX_RATE } from '../lib/settings';
import { Snackbar } from 'react-native-paper';
import { setPendingSnack } from '../lib/uiState';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function TaxSettingsScreen() {
  const [mileageRate, setMileageRateState] = useState<string>('');
  const [taxRate, setTaxRateState] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const mr = await getMileageRate();
      const tr = await getTaxRate();
      setMileageRateState(mr.toString());
      setTaxRateState(tr.toString());
    })();
  }, []);

  const validate = () => {
    const mr = Number(mileageRate);
    const tr = Number(taxRate);
    if (isNaN(mr) || mr <= 0) return 'Enter a positive number for mileage rate.';
    if (isNaN(tr) || tr < 0) return 'Enter a non‑negative number for tax rate.';
    return '';
  };

  const canSave = !saving && validate() === '';

  const onSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSaving(true);
    try {
      await setMileageRate(Number(mileageRate));
      await setTaxRate(Number(taxRate));
      setPendingSnack('Settings saved');
    } catch (e) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <Screen title="Tax settings">
      <View style={{ gap: 12 }}>
        <FormField label="Mileage rate ($/mile)" value={mileageRate} onChangeText={setMileageRateState} placeholder={DEFAULT_MILEAGE_RATE.toString()} keyboardType="numeric" />
        <FormField label="Tax rate (%)" value={taxRate} onChangeText={setTaxRateState} placeholder={DEFAULT_TAX_RATE.toString()} keyboardType="numeric" />
        {error ? <Snackbar visible={true} onDismiss={() => setError('')} duration={3000}>{error}</Snackbar> : null}
        <SettingsRow label="Back" testID="tax-settings-back" onPress={() => navigation.goBack()} showChevron={false} />
        <PrimaryButton label="Save" onPress={onSave} loading={saving} disabled={!canSave} />
      </View>
    </Screen>
  );
}
