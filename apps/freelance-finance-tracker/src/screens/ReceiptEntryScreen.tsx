import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen, FormField, ChoiceField } from '../components/ui';
import { addReceipt } from '../lib/receiptStore';
import { getStore } from '../lib/storage';
import { Receipt, ReceiptType } from '../lib/models';
import { Snackbar } from 'react-native-paper';
import { setPendingSnack } from '../lib/uiState';
import ReceiptImagePicker from '../components/ui/ReceiptImagePicker';
import { v4 as uuidv4 } from 'uuid';

export default function ReceiptEntryScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ReceiptType>('expense');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 'Enter a positive amount.';
    if (!date) return 'Select a date.';
    if (!category) return 'Choose a category.';
    if (!type) return 'Select expense or income.';
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
    const receipt: Receipt = {
      id: uuidv4(),
      amount: Number(amount),
      date,
      category,
      type,
      notes,
      photoUri,
    };
    try {
      await addReceipt(getStore(), receipt);
      setPendingSnack('Receipt saved');
      navigation.navigate('Main', { screen: 'Dashboard' });
    } catch (e) {
      setError('Unable to save receipt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Add receipt">
      <View style={{ gap: 12 }}>
        <ReceiptImagePicker photoUri={photoUri} onChange={setPhotoUri} />
        <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <FormField label="Category" value={category} onChangeText={setCategory} />
        <ChoiceField<ReceiptType>
          label="Type"
          value={type}
          onChange={setType}
          options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
        />
        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />
        {error ? <Snackbar visible={true} onDismiss={() => setError('')} duration={3000}>{error}</Snackbar> : null}
        <PrimaryButton label="Save receipt" onPress={onSave} loading={saving} disabled={saving} />
      </View>
    </Screen>
  );
}
