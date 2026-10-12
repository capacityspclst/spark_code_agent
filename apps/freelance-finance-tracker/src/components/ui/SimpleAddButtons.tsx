import React from 'react';
import { StyleSheet, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Buttons that match the UI flow expectations: separate primary buttons labeled "Receipt" and "Mileage". */
export default function SimpleAddButtons() {
  const navigation = useNavigation<NavigationProp<any>>();

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
