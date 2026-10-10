import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Modal, Text as PaperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import PrimaryButton from './PrimaryButton';

/**
 * Simple FAB that opens a modal with two options: Add receipt and Mileage.
 * Implemented with Pressable to avoid nested interactive elements.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  const goToReceipt = () => {
    navigation.getParent?.()?.navigate('ReceiptEntry');
    setOpen(false);
  };

  const goToMileage = () => {
    navigation.getParent?.()?.navigate('MileageEntry');
    setOpen(false);
  };

  return (
    <>
      {/* Main FAB */}
      <View style={styles.container} pointerEvents="box-none">
        <Pressable
          onPress={toggle}
          accessibilityLabel="Add"
          accessibilityRole="button"
          style={styles.fab}
        >
          <MaterialCommunityIcons name="plus" size={24} color={theme.colors.onSecondary} />
        </Pressable>
      </View>
      {/* Modal with options */}
      <Modal visible={open} onDismiss={toggle} contentContainerStyle={styles.modal}>
        <PaperText variant="titleMedium" style={{ marginBottom: 8 }}>
          Add entry
        </PaperText>
        <PrimaryButton label="Add receipt" variant="primary" onPress={goToReceipt} style={styles.button} />
        <PrimaryButton label="Mileage" variant="primary" onPress={goToMileage} style={styles.button} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: space(2), right: space(2), alignItems: 'center' },
  fab: {
    backgroundColor: theme.colors.secondary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 },
  button: { marginTop: 8 },
});
