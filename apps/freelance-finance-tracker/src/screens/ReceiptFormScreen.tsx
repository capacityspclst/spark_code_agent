// src/screens/ReceiptFormScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
    navigation.navigate('Dashboard', { showSnackbar: true });
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
      <FormField label="Category" value={category} onChangeText={setCategory} />
      <View style={styles.row}>
        <Text style={{ marginRight: 8 }}>Type</Text>
        <Picker selectedValue={type} style={{ flex: 1 }} onValueChange={v => setType(v as any)}>
          <Picker.Item label="Expense" value="expense" />
          <Picker.Item label="Income" value="income" />
        </Picker>
      </View>
      <FormField label="Notes" value={notes} onChangeText={setNotes} />
      <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} accessibilityLabel="Save receipt">
        Save receipt
      </Button>
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')}>{snackbar}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
});