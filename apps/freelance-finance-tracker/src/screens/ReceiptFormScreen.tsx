// src/screens/ReceiptFormScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, Button, Snackbar } from 'react-native-paper';
import { FormField } from '../components/ui/FormField';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { addReceipt, Receipt } from '../lib/records';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

export default function ReceiptFormScreen() {
  const navigation = useNavigation<any>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!photoUri) return;
    setSaving(true);
    const receipt: Receipt = {
      id: uuidv4(),
      amount: parseFloat(amount),
      date,
      category,
      type,
      notes,
      photoUri,
    };
    await addReceipt(receipt);
    setSaving(false);
    setSnackbar('Receipt saved');
    navigation.navigate('Dashboard');
  };

  return (
    <Screen>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Add Receipt</Text>
      <Button mode="outlined" onPress={pickImage} accessibilityLabel="Choose from library">
        Choose from library
      </Button>
      {photoUri && <Text>{photoUri}</Text>}
      <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <FormField label="Date" value={date} onChangeText={setDate} />
      {Platform.OS === 'web' ? (
        <View>
          <label htmlFor="category-select" style={{ marginTop: 8, marginBottom: 4 }}>Category</label>
          <select
            id="category-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Category"
            style={{ marginBottom: 8, padding: 8, width: '100%' }}
          >
            <option value="">Select a category</option>
            <option value="Office">Office</option>
            <option value="Travel">Travel</option>
            <option value="Meals">Meals</option>
            <option value="Other">Other</option>
          </select>
        </View>
      ) : (
        <Picker
          selectedValue={category}
          onValueChange={v => setCategory(v as string)}
          accessibilityLabel="Category"
        >
          <Picker.Item label="Select a category" value="" />
          <Picker.Item label="Office" value="Office" />
          <Picker.Item label="Travel" value="Travel" />
          <Picker.Item label="Meals" value="Meals" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      )}
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={v => setType(v as any)}
        accessibilityLabel="Type"
      >
        <Picker.Item label="Expense" value="expense" />
        <Picker.Item label="Income" value="income" />
      </Picker>
      <FormField label="Notes" value={notes} onChangeText={setNotes} />
      <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} accessibilityLabel="Save receipt">
        Save receipt
      </Button>
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')}>{snackbar}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  picker: { marginBottom: 8 },
});
