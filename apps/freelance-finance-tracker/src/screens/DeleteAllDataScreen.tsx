import React, { useState } from 'react';
import { View } from 'react-native';
import { Dialog, Portal, Button, Text, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getStore } from '../lib/storage';

export default function DeleteAllDataScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [visible, setVisible] = useState(true);
  const [snack, setSnack] = useState<string>('');

  const hideDialog = () => setVisible(false);

  const onDelete = async () => {
    hideDialog();
    try {
      const store = getStore();
      await store.clearAll();
      setSnack('All data deleted.');
      // Return to dashboard after deletion
      navigation.navigate('Dashboard');
    } catch {
      setSnack('Something went wrong. Please try again.');
    }
  };

  return (
    <Screen title="Delete all data">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Delete all data?</Dialog.Title>
            <Dialog.Content>
              <Text>This action cannot be undone.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={onDelete}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
          {snack}
        </Snackbar>
      </View>
    </Screen>
  );
}
