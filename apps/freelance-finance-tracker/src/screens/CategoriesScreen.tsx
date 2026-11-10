import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Screen, FormField, PrimaryButton, SettingSwitch } from '../components/ui';
import { Snackbar, Dialog, Portal, Text } from 'react-native-paper';
import { getStore } from '../lib/storage';
import { getAllCategories, addCustomCategory, renameCategory, hideCategory, deleteCategory, syncCategoriesWithReceipts } from '../lib/categories';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { theme } from '../theme';

export default function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; hidden: boolean; custom: boolean }>>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [addName, setAddName] = useState('');
  const [snack, setSnack] = useState<string>('');

  const load = async () => {
    const store = getStore();
    // Pick up any categories that only exist because a receipt used them
    // (e.g. typed freeform on the Add receipt screen) so they can be renamed too.
    await syncCategoriesWithReceipts(store);
    const list = await getAllCategories(store, { includeHidden: true });
    setCategories(list);
  };

  useEffect(() => {
    load();
  }, []);

  const startRename = (cat: typeof categories[0]) => {
    setEditId(cat.id);
    setNewName(cat.name);
  };

  const submitRename = async (cat: typeof categories[0], name?: string) => {
    const err = await renameCategory(getStore(), cat.id, name ?? newName);
    if (err) setSnack(err); else { setSnack('Category renamed'); load(); }
    setEditId(null);
  };

  // Auto-save a rename shortly after the user stops typing, so the change
  // doesn't require a separate explicit confirmation step.
  useEffect(() => {
    if (!editId) return undefined;
    const cat = categories.find((c) => c.id === editId);
    if (!cat || newName === cat.name || !newName.trim()) return undefined;
    const timer = setTimeout(() => {
      submitRename(cat, newName);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newName, editId]);

  const toggleHide = async (cat: typeof categories[0]) => {
    await hideCategory(getStore(), cat.id);
    load();
  };

  const handleDelete = async (cat: typeof categories[0]) => {
    const err = await deleteCategory(getStore(), cat.id);
    if (err) setSnack(err); else load();
  };

  const handleAdd = async () => {
    const err = await addCustomCategory(getStore(), addName.trim());
    if (err) setSnack(err); else { load(); setAddVisible(false); setAddName(''); }
  };

  return (
    <Screen title="Categories">
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <PrimaryButton label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        {categories.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}>
            {editId === c.id ? (
              <FormField
                label="Rename category"
                value={newName}
                onChangeText={setNewName}
                placeholder="New name"
                onBlur={() => submitRename(c)}
                onSubmitEditing={() => submitRename(c)}
              />
            ) : (
              <Pressable
                onPress={() => startRename(c)}
                accessibilityRole="button"
                accessibilityLabel={c.name}
              >
                <Text variant="bodyMedium">{c.name}</Text>
              </Pressable>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {editId === c.id ? (
                <PrimaryButton label="Save" variant="text" onPress={() => submitRename(c)} />
              ) : (
                <PrimaryButton label="Rename" variant="text" onPress={() => startRename(c)} />
              )}
              <SettingSwitch label="Hide" value={c.hidden} onChange={() => toggleHide(c)} />
              {c.custom && (
                <PrimaryButton label="Delete" variant="text" onPress={() => handleDelete(c)} />
              )}
            </View>
          </View>
        ))}
        <PrimaryButton label="Add category…" onPress={() => setAddVisible(true)} />
        <Portal>
          <Dialog visible={addVisible} onDismiss={() => setAddVisible(false)}>
            <Dialog.Title>Add new category</Dialog.Title>
            <Dialog.Content>
              <FormField label="Category name" value={addName} onChangeText={setAddName} placeholder="Category name" />
            </Dialog.Content>
            <Dialog.Actions>
              <PrimaryButton label="Cancel" variant="text" onPress={() => setAddVisible(false)} />
              <PrimaryButton label="Add" onPress={handleAdd} />
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
          {snack}
        </Snackbar>
      </ScrollView>
    </Screen>
  );
}
