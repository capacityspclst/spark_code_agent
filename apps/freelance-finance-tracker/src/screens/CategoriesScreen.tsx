import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Screen, FormField, PrimaryButton, SettingSwitch } from '../components/ui';
import { Snackbar, Dialog, Portal, Text } from 'react-native-paper';
import { getStore } from '../lib/storage';
import { getAllCategories, addCustomCategory, renameCategory, hideCategory, deleteCategory } from '../lib/categories';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { theme } from '../theme';

export default function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; hidden: boolean; custom: boolean }>>([]);
  const [newNames, setNewNames] = useState<Record<string, string>>({});
  const [addVisible, setAddVisible] = useState(false);
  const [addName, setAddName] = useState('');
  const [snack, setSnack] = useState<string>('');

  const load = async () => {
    const list = await getAllCategories(getStore(), { includeHidden: true });
    setCategories(list);
    const init: Record<string, string> = {};
    list.forEach(c => {
      init[c.id] = c.name;
    });
    setNewNames(init);
  };

  useEffect(() => {
    load();
  }, []);

  const rename = async (cat: typeof categories[0], newName: string) => {
    if (!newName || newName.toLowerCase() === cat.name.toLowerCase()) {
      setSnack('Category rename failed');
      return;
    }
    const err = await renameCategory(getStore(), cat.id, newName);
    if (err) {
      // Show generic failure message expected by UI flow
      setSnack('Category rename failed');
    } else {
      setSnack('Category renamed');
      load();
    }
  };

  const toggleHide = async (cat: typeof categories[0]) => {
    await hideCategory(getStore(), cat.id);
    load();
  };

  const handleDelete = async (cat: typeof categories[0]) => {
    const err = await deleteCategory(getStore(), cat.id);
    if (err) setSnack(err);
    else load();
  };

  const handleAdd = async () => {
    const err = await addCustomCategory(getStore(), addName.trim());
    if (err) setSnack(err);
    else {
      load();
      setAddVisible(false);
      setAddName('');
    }
  };

  return (
    <Screen title="Categories">
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        {categories.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}>
            <FormField
              label={c.name.split(' ')[0]}
              value={newNames[c.id] ?? c.name}
              onChangeText={(v) => {
                setNewNames(prev => ({ ...prev, [c.id]: v }));
                if (v && v !== c.name) {
                  rename(c, v);
                }
              }}
              />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
