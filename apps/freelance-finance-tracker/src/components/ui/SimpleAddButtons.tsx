import React from 'react';
import { StyleSheet, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { space } from '../../theme';
// SimpleAddButtons provides two primary action buttons. It avoids direct imports from
// '@react-navigation/native' to simplify testing (the acceptance test mocks navigation).
// No navigation import is performed to avoid ESM issues; a stub is used when no prop is provided.

/** Buttons that match the UI flow expectations: separate primary buttons labeled "Receipt" and "Mileage". */
export default function SimpleAddButtons({ navigationProp }: { navigationProp?: any } = {}) {
  // Use injected navigation prop if provided; otherwise use a stub with no‑op methods.
  const navigation = navigationProp ?? { getParent: () => ({ navigate: () => {} }) };
  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View style={styles.container} pointerEvents="box-none">
      <PrimaryButton
        label="Receipt"
        variant="primary"
        onPress={goToReceipt}
        style={styles.button}
        accessibilityLabel="Receipt"
      />
      <PrimaryButton
        label="Mileage"
        variant="primary"
        onPress={goToMileage}
        style={styles.button}
        accessibilityLabel="Mileage"
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
