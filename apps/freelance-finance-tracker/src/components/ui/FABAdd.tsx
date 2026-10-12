import React from 'react';
import { StyleSheet, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/**
 * Simple FAB replacement that always shows two primary action buttons: "Receipt" and "Mileage".
 * Positioned above the bottom tab bar, matching the design tokens.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Primary action – add a receipt – uses a contained button to stand out. */}
      <PrimaryButton label="Receipt" variant="primary" onPress={goToReceipt} style={styles.button} />
      {/* Secondary action – add mileage – outlined to appear less prominent. */}
      <PrimaryButton label="Mileage" variant="secondary" onPress={goToMileage} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: space(2),
    right: space(2),
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: space(1),
    // Ensure it appears above other UI layers.
    elevation: 4,
    zIndex: 10,
  },
  button: {
    minWidth: 120,
    minHeight: 44,
  },
});
