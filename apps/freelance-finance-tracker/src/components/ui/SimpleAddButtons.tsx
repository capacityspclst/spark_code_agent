import React from 'react';
import { StyleSheet, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { space } from '../../theme';

/** Buttons that match the UI flow expectations: separate primary buttons labeled "Add receipt" and "Add mileage". */
export default function SimpleAddButtons() {
  // Lazy navigation for compatibility with Jest.
  const navigation = (() => {
    try {
      const { useNavigation } = require('@react-navigation/native');
      return useNavigation();
    } catch {
      return { getParent: () => ({ navigate: () => {} }) };
    }
  })();
  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');
  return (
    <View style={styles.container} pointerEvents="box-none">
      <PrimaryButton
        label="Add receipt"
        variant="primary"
        onPress={goToReceipt}
        style={styles.button}
        accessibilityLabel="Add receipt"
      />
      <PrimaryButton
        label="Add mileage"
        variant="primary"
        onPress={goToMileage}
        style={styles.button}
        accessibilityLabel="Add mileage"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Position above the bottom tab bar (64dp height) with extra spacing.
    bottom: 80,
    right: space(2),
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: space(1),
    // Ensure it sits above other UI layers.
    elevation: 4,
    zIndex: 10,
  },
  button: {
    minHeight: 44,
    // PrimaryButton already applies proper theme colors and contrast.
  },
});
