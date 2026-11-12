import React from 'react';
import { StyleSheet, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Simple replacement for the FAB speed‑dial.
 * Renders two primary buttons stacked upward, positioned above the bottom tab bar.
 * This avoids nested interactive controls and ensures each button has visible text
 * for screen‑reader users.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  // Bottom offset: tab bar height (56) + standard spacing (16) + safe inset bottom.
  const bottom = 56 + 16 + insets.bottom;

  return (
    <View style={[styles.container, { bottom }]} testID="fab-container">
      <PrimaryButton
        label="Mileage"
        variant="primary"
        onPress={goToMileage}
        testID="fab-mileage"
        style={styles.button}
      />
      <PrimaryButton
        label="Receipt"
        variant="primary"
        onPress={goToReceipt}
        testID="fab-receipt"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  button: {
    marginBottom: 8,
    minWidth: 100,
    minHeight: 44,
  },
});
