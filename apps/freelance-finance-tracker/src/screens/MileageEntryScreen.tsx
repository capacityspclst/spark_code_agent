import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TextInput } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FormField, PrimaryButton, Screen } from '../components/ui';
import { calculateMileageDeduction } from '../lib/mileage';
import { addMileageEntry } from '../lib/mileageStore';
import { MileageEntry } from '../lib/models';
import { DEFAULT_MILEAGE_RATE, getMileageRate } from '../lib/settings';
import { getStore } from '../lib/storage';
import { setPendingSnack } from '../lib/uiState';
import { space, theme } from '../theme';
import { validateMileageMiles } from '../lib/validation';

const today = () => new Date().toISOString().slice(0, 10);
const money = (n: number) => `$${n.toFixed(2)}`;
const perMile = (n: number) => `$${n.toFixed(3).replace(/0$/, '')}`;

/** Log one business trip. Errors show under their field when Save is pressed; the deduction updates as you type. */
export default function MileageEntryScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [date, setDate] = useState(today());
  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rate, setRate] = useState(DEFAULT_MILEAGE_RATE);
  const [errors, setErrors] = useState<{ date?: string; miles?: string; purpose?: string; save?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMileageRate(getStore()).then(setRate).catch(() => {});
  }, []);

  const milesNumber = Number(miles);
  const deduction = miles && !isNaN(milesNumber) && milesNumber > 0 ? calculateMileageDeduction(milesNumber, rate) : 0;

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) e.date = 'Use the format YYYY-MM-DD.';
    const milesErr = validateMileageMiles(miles);
    if (milesErr) e.miles = milesErr;
    if (!purpose.trim()) e.purpose = 'Say what the trip was for.';
    return e;
  };

  const onSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const entry: MileageEntry = { id: `${Date.now()}-${Math.random()}`, date, miles: milesNumber, purpose: purpose.trim() };
    try {
      await addMileageEntry(getStore(), entry);
      setPendingSnack('Mileage saved');
      navigation.navigate('Main', { screen: 'Dashboard' });
    } catch {
      setErrors({ save: "The trip couldn't be saved. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen subtitle="Log a business trip. Keep a record of every trip for your tax year.">
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.form}>
          <FormField label="Date" value={date} onChangeText={setDate} error={errors.date} hint="YYYY-MM-DD" autoComplete="off" />
          <FormField label="Miles" value={miles} onChangeText={setMiles} error={errors.miles} keyboardType="decimal-pad"
            right={<TextInput.Affix text="mi" />} />
          <FormField label="Purpose" value={purpose} onChangeText={setPurpose} error={errors.purpose} hint="e.g. Client site visit" />
        </Card.Content>
      </Card>
      <Card mode="outlined" style={[styles.card, styles.preview]}>
        <Card.Content style={styles.previewContent}>
          <View style={styles.previewText}>
            <Text variant="labelLarge" style={styles.muted}>Deduction for this trip</Text>
            <Text variant="bodySmall" style={styles.muted}>At {perMile(rate)} per mile (change it in Settings)</Text>
          </View>
          <Text variant="headlineSmall" style={styles.amount}>{money(deduction)}</Text>
        </Card.Content>
      </Card>
      {errors.save ? <Text variant="bodyMedium" style={styles.error}>{errors.save}</Text> : null}
      <PrimaryButton label="Save mileage" onPress={onSave} loading={saving} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface },
  form: { gap: space(2), paddingVertical: space(2) },
  preview: { backgroundColor: theme.colors.primaryContainer },
  previewContent: { flexDirection: 'row', alignItems: 'center', gap: space(2), paddingVertical: space(1.5) },
  previewText: { flex: 1, gap: space(0.5) },
  muted: { color: theme.colors.onPrimaryContainer },
  amount: { fontWeight: '700', color: theme.colors.onPrimaryContainer },
  error: { color: theme.colors.error },
});
