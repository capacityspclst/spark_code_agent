// src/screens/MileageFormScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, Button, Snackbar } from 'react-native-paper';
import { FormField } from '../components/ui/FormField';
import { addMileage, MileageEntry } from '../lib/records';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

export default function MileageFormScreen() {
  const navigation = useNavigation<any>();
  const [date, setDate] = useState('');
  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const handleSave = async () => {
    setSaving(true);
    const entry: MileageEntry = {
      id: uuidv4(),
      date,
      miles: parseFloat(miles),
      purpose,
    };
    await addMileage(entry);
    setSaving(false);
    setSnackbar('Mileage entry saved');
    navigation.goBack();
  };

  return (
    <Screen>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Add Mileage</Text>
      <FormField label="Date" value={date} onChangeText={setDate} />
      <FormField label="Miles" value={miles} onChangeText={setMiles} keyboardType="numeric" />
      <FormField label="Purpose" value={purpose} onChangeText={setPurpose} />
      <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} accessibilityLabel="Save mileage">
        Save mileage
      </Button>
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')}>{snackbar}</Snackbar>
    </Screen>
  );
}
