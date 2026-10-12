import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen, FormField, ChoiceField } from '../components/ui';
import { Snackbar } from 'react-native-paper';
import ReceiptImagePicker from '../components/ui/ReceiptImagePicker';
import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../lib/storage';
import { addReceipt } from '../lib/receiptStore';
import { validateReceiptAmount } from '../lib/validation';
import { Receipt, ReceiptType } from '../lib/models';
import { setPendingSnack } from '../lib/uiState';
import { persistPhoto } from '../lib/photos';
import { recognizeReceiptText, parseReceipt, ParsedReceipt } from '../lib/ocr';
import { getAllCategories } from '../lib/categories';
import { IconButton } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [preFilled, setPreFilled] = useState<Partial<ParsedReceipt>>({});

  // Load categories for dropdown (hidden filtered)
  useEffect(() => {
    (async () => {
      const list = await getAllCategories(getStore());
      setCategories(list.map((c) => ({ id: c.id, name: c.name })));
    })();
  }, []);

  const amountError = validateReceiptAmount(amount);

  const validate = () => {
    if (amountError) return amountError;
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
    const id = uuidv4();
    const receipt: Receipt = {
      id,
      amount: Number(amount),
      date,
      category,
      type,
      notes,
      photoUri,
    };
    try {
      if (photoUri) receipt.photoUri = await persistPhoto(photoUri, id);
      await addReceipt(getStore(), receipt);
      setPendingSnack('Receipt saved');
      navigation.navigate('Main', { screen: 'Dashboard' });
    } catch (e) {
      setError('Unable to save receipt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && validate() === '' && !amountError;

  const startScan = async () => {
    if (!photoUri) {
      setError('Please select a photo first.');
      return;
    }
    try {
      const text = await recognizeReceiptText(photoUri);
      if (!text) {
        setError('No details could be extracted – please enter manually.');
        return;
      }
      const parsed = parseReceipt(text);
      setPreFilled(parsed);
      if (parsed.total) setAmount(parsed.total.toString());
      if (parsed.date) setDate(parsed.date);
      if (parsed.merchant) setCategory(parsed.merchant);
    } catch (e: any) {
      setError(e.message ?? 'Scanning failed');
    }
  };

  return (
    <Screen title="Add receipt">
      <View style={{ gap: 12 }}>
        <ReceiptImagePicker photoUri={photoUri} onChange={setPhotoUri} />
        <PrimaryButton label="Scan receipt" onPress={startScan} disabled={!photoUri} />
        <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" error={amountError ?? undefined} />
        {/* Date field with picker */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <IconButton icon="calendar" onPress={() => setShowDatePicker(true)} accessibilityLabel="Select receipt date" />
        </View>
        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          date={date ? new Date(date) : new Date()}
          onConfirm={(params: any) => {
            const d = params.date;
            const iso = d.toISOString().split('T')[0];
            setDate(iso);
            setShowDatePicker(false);
          }}
          validRange={{ endDate: new Date() }}
        />
        {/* Category field */}
        <FormField label="Category" value={category} onChangeText={setCategory} placeholder="Select category" />
        <ChoiceField<ReceiptType>
          label="Type"
          value={type}
          onChange={setType}
          options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
        />
        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Enter notes about this receipt" />
        {error ? <Snackbar visible={true} onDismiss={() => setError('')} duration={3000}>{error}</Snackbar> : null}
        <PrimaryButton label="Save receipt" onPress={onSave} loading={saving} disabled={!canSave} />
      </View>
    </Screen>
  );
}
