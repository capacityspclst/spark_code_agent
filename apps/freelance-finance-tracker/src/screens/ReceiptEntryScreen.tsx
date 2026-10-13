import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PrimaryButton, Screen, FormField, ChoiceField } from '../components/ui';
import { Snackbar, Text, Menu, IconButton, TextInput } from 'react-native-paper';
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
import { DatePickerModal } from 'react-native-paper-dates';
import { theme, layout } from '../theme';

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
  const [menuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [marked, setMarked] = useState<{ amount: boolean; date: boolean; category: boolean }>({ amount: false, date: false, category: false });

  // Load categories for dropdown (excluding hidden)
  useEffect(() => {
    (async () => {
      const list = await getAllCategories(getStore());
      const visible = list.filter((c) => !c.hidden);
      setCategories(visible.map((c) => ({ id: c.id, name: c.name })));
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
    if (err) { setError(err); return; }
    setError('');
    setSaving(true);
    const id = uuidv4();
    const receipt: Receipt = { id, amount: Number(amount), date, category, type, notes, photoUri };
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

  const clearMark = (field: keyof typeof marked) => setMarked(prev => ({ ...prev, [field]: false }));

  const startScan = async () => {
    if (!photoUri) { setError('Please select a photo first.'); return; }
    try {
      const text = await recognizeReceiptText(photoUri);
      if (!text) { setError('No details could be extracted \u2013 please enter manually.'); return; }
      const parsed = parseReceipt(text);
      const newMarks = { amount: false, date: false, category: false };
      if (parsed.total) { setAmount(parsed.total.toString()); newMarks.amount = true; }
      if (parsed.date) { setDate(parsed.date); newMarks.date = true; }
      if (parsed.merchant) { setCategory(parsed.merchant); newMarks.category = true; }
      setMarked(newMarks);
    } catch (e: any) { setError(e.message ?? 'Scanning failed'); }
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const selectCategory = (name: string) => { setCategory(name); clearMark('category'); closeMenu(); };

  return (
    <Screen title="Add receipt">
      <View style={{ padding: layout.pagePadding, maxWidth: layout.maxContentWidth, alignSelf: 'center', gap: 16 }}>
        <ReceiptImagePicker photoUri={photoUri} onChange={setPhotoUri} />
        <PrimaryButton label="Scan receipt" onPress={startScan} disabled={!photoUri} variant="primary" />
        <Text variant="titleMedium" style={{ marginTop: 12, marginBottom: 4 }}>Receipt details</Text>
        <FormField label="Amount" value={amount} onChangeText={v => { setAmount(v); clearMark('amount'); }} keyboardType="numeric" error={amountError ?? undefined} hint={marked.amount ? 'Check these details' : undefined} marked={marked.amount} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FormField label="Date" value={date} onChangeText={v => { setDate(v); clearMark('date'); }} placeholder="YYYY-MM-DD" hint={marked.date ? 'Check these details' : undefined} marked={marked.date} />
          <IconButton icon="calendar" size={24} onPress={() => setShowDatePicker(true)} accessibilityLabel="Select receipt date" />
        </View>
        <DatePickerModal locale="en" mode="single" visible={showDatePicker} onDismiss={() => setShowDatePicker(false)} date={date ? new Date(date) : new Date()} onConfirm={(p:any)=>{ const d=p.date; const iso=d.toISOString().split('T')[0]; setDate(iso); setShowDatePicker(false); clearMark('date'); }} validRange={{ endDate: new Date() }} />
        <Menu visible={menuVisible} onDismiss={closeMenu} anchor={<Pressable onPress={openMenu}><FormField label="Category" value={category} onChangeText={v => { setCategory(v); clearMark('category'); }} placeholder="Select category" hint={marked.category ? 'Check these details' : undefined} marked={marked.category} /></Pressable>}>
          {categories.map(c => <Menu.Item key={c.id} title={c.name} onPress={() => selectCategory(c.name)} />)}
        </Menu>
        <Text variant="titleMedium" style={{ marginTop: 12, marginBottom: 4 }}>Additional information</Text>
        <ChoiceField<ReceiptType> label="Type" value={type} onChange={setType} options={[{value:'expense',label:'Expense'},{value:'income',label:'Income'}]} />
        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Enter notes about this receipt" />
        {error && <Snackbar visible onDismiss={() => setError('')} duration={3000}>{error}</Snackbar>}
        <PrimaryButton label="Save receipt" onPress={onSave} loading={saving} disabled={!canSave} variant="primary" style={{ marginTop: 16 }} />
      </View>
    </Screen>
  );
}
