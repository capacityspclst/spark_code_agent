import React from 'react';
import { StyleSheet, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Two independent primary buttons positioned like FABs but using the app's PrimaryButton component to ensure correct theming and contrast. */
export default function SimpleAddButtons() {
  const navigation = useNavigation<NavigationProp<any>>();

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
    bottom: space(2),
    right: space(2),
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: space(1),
  },
  button: {
    minHeight: 44,
    // Ensure the button uses the primary color for sufficient contrast
    // The PrimaryButton component already applies correct theme colors.
  },
});
