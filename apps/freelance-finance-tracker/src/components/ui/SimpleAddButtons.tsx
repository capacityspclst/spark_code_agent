import React from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '../../theme';

/** SimpleAddButtons renders two primary action buttons positioned absolutely.
 * PrimaryButton and navigation are required lazily to avoid side‑effects during module load.
 */
export default function SimpleAddButtons() {
  // Lazy load navigation hook and PrimaryButton inside the function.
  const { useNavigation } = require('@react-navigation/native');
  const navigation = useNavigation();
  const PrimaryButton = require('./PrimaryButton').default;

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View style={styles.container} pointerEvents="box-none">
      <PrimaryButton label="Receipt" variant="primary" onPress={goToReceipt} accessibilityLabel="Receipt" />
      <PrimaryButton label="Mileage" variant="primary" onPress={goToMileage} accessibilityLabel="Mileage" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // 80dp ensures space above tab bar (>=72dp per tests)
    right: space(2),
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: space(1),
    elevation: 4,
    zIndex: 10,
  },
});
