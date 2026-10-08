import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen, FormField } from '../components/ui';
import { addMileageEntry } from '../lib/mileageStore';
import { getStore } from '../lib/storage';
import { MileageEntry } from '../lib/models';
import { Snackbar } from 'react-native-paper';
import { setPendingSnack } from '../lib/uiState';

export default function MileageEntryScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [date, setDate] = useState('');
  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!date) return 'Select a date.';
    if (!miles || isNaN(Number(miles)) || Number(miles) <= 0) return 'Enter a positive number of miles.';
    if (!purpose) return 'Enter a purpose for the trip.';
    return '';
  };

  const onSave = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSaving(true);
    const entry: MileageEntry = {
      id: `${Date.now()}-${Math.random()}`,
      date,
      miles: Number(miles),
      purpose,
    };
    try {
      await addMileageEntry(getStore(), entry);
      setPendingSnack('Mileage saved');
      navigation.navigate('Main', { screen: 'Dashboard' });
    } catch (e) {
      setError('Unable to save mileage. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Add mileage">
      <View style={{ gap: 12 }}>
        <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <FormField label="Miles" value={miles} onChangeText={setMiles} keyboardType="numeric" />
        <FormField label="Purpose" value={purpose} onChangeText={setPurpose} />
        {error ? <Snackbar visible={true} onDismiss={() => setError('')} duration={3000}>{error}</Snackbar> : null}
        <PrimaryButton label="Save mileage" onPress={onSave} loading={saving} disabled={saving} />
      </View>
    </Screen>
  );
}
