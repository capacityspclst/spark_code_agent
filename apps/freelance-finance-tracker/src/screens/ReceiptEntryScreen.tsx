import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen, FormField, ChoiceField } from '../components/ui';
import { Snackbar, Text } from 'react-native-paper';
import ReceiptImagePicker from '../components/ui/ReceiptImagePicker';
import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../lib/storage';
import { addReceipt, editReceipt, getAllReceipts } from '../lib/receiptStore';
import { validateReceiptAmount } from '../lib/validation';
import { Receipt, ReceiptType } from '../lib/models';
import { setPendingSnack } from '../lib/uiState';
import { persistPhoto } from '../lib/photos';
import { recognizeReceiptText, parseReceipt, ParsedReceipt } from '../lib/ocr';
import { getAllCategories } from '../lib/categories';
import { IconButton } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { theme, layout } from '../theme';

export default function ReceiptEntryScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const { recordId: editRecordId } = route.params || {};

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
  const [marked, setMarked] = useState<{ amount: boolean; date: boolean; category: boolean }>({ amount: false, date: false, category: false });
  // Load receipt for editing if editRecordId is present
  useEffect(() => {
    if (editRecordId) {
      (async () => {
        const all = await getAllReceipts(getStore());
        const receipt = all.find((r) => r.id === editRecordId);
        if (receipt) {
          setAmount(String(receipt.amount));
          setDate(receipt.date);
          setCategory(receipt.category);
          setType(receipt.type as ReceiptType);
          setNotes(receipt.notes ?? '');
          if (receipt.photoUri) setPhotoUri(receipt.photoUri);
        }
      })();
    }
  }, [editRecordId]);

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
    const id = editRecordId || uuidv4();
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
      if (editRecordId) {
        await editReceipt(getStore(), receipt);
      } else {
        await addReceipt(getStore(), receipt);
      }
      setPendingSnack('Receipt saved');
      navigation.navigate('Main', { screen: 'Dashboard' });
    } catch (e) {
      setError('Unable to save receipt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && validate() === '' && !amountError;

  const clearMark = (field: keyof typeof marked) => {
    setMarked((prev) => ({ ...prev, [field]: false }));
  };

  const startScan = async () => {
    if (!photoUri) {
      setError('Please select a photo first.');
      return;
    }
    try {
      const text = await recognizeReceiptText(photoUri);
      if (!text) {
        setError('No details could be extracted \u2013 please enter manually.');
        return;
      }
      const parsed = parseReceipt(text);
      setPreFilled(parsed);
      const newMarks = { amount: false, date: false, category: false };
      if (parsed.total) {
        setAmount(parsed.total.toString());
        newMarks.amount = true;
      }
      if (parsed.date) {
        setDate(parsed.date);
        newMarks.date = true;
      }
      if (parsed.merchant) {
        setCategory(parsed.merchant);
        newMarks.category = true;
      }
      setMarked(newMarks);
    } catch (e: any) {
      setError(e.message ?? 'Scanning failed');
    }
  };

  return (
    <Screen title="Add receipt">
      <View style={{ padding: layout.pagePadding, maxWidth: layout.maxContentWidth, alignSelf: 'center', gap: 16 }}>
        <ReceiptImagePicker photoUri={photoUri} onChange={setPhotoUri} />
        <PrimaryButton label="Scan receipt" onPress={startScan} disabled={!photoUri} />
        <Text variant="titleMedium" style={{ marginTop: 12, marginBottom: 4 }}>
          Receipt details
        </Text>
        {/* Amount */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FormField
            label="Amount"
            value={amount}
            onChangeText={(v) => { setAmount(v); clearMark('amount'); }}
            keyboardType="numeric"
            error={amountError ?? undefined}
            hint={marked.amount ? 'Check these details' : undefined}
            marked={marked.amount}
          />
          {marked.amount && (
            <PrimaryButton label="Looks right" variant="text" onPress={() => clearMark('amount')} />
          )}
        </View>
        {/* Date */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FormField
            label="Date"
            value={date}
            onChangeText={(v) => { setDate(v); clearMark('date'); }}
            placeholder="YYYY-MM-DD"
            hint={marked.date ? 'Check these details' : undefined}
            marked={marked.date}
          />
          <IconButton icon="calendar" size={24} onPress={() => setShowDatePicker(true)} accessibilityLabel="Select receipt date" />
          {marked.date && (
            <PrimaryButton label="Looks right" variant="text" onPress={() => clearMark('date')} />
          )}
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
            clearMark('date');
          }}
          validRange={{ endDate: new Date() }}
        />
        {/* Category */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FormField
            label="Category"
            value={category}
            onChangeText={(v) => { setCategory(v); clearMark('category'); }}
            placeholder="Select category"
            hint={marked.category ? 'Check these details' : undefined}
            marked={marked.category}
          />
          {marked.category && (
            <PrimaryButton label="Looks right" variant="text" onPress={() => clearMark('category')} />
          )}
        </View>
        <Text variant="titleMedium" style={{ marginTop: 12, marginBottom: 4 }}>
          Additional information
        </Text>
        <ChoiceField<ReceiptType>
          label="Type"
          value={type}
          onChange={setType}
          options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
        />
        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Enter notes about this receipt" />
        {error ? <Snackbar visible={true} onDismiss={() => setError('')} duration={3000}>{error}</Snackbar> : null}
        <PrimaryButton label="Save receipt" onPress={onSave} loading={saving} disabled={!canSave} style={{ marginTop: 16 }} />
      </View>
    </Screen>
  );
}
