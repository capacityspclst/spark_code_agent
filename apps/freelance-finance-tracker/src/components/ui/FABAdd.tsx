import React from 'react';
import { StyleSheet, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '../../navigation/constants';

/**
 * Simple FAB replacement that always shows two primary action buttons: "Receipt" and "Mileage".
 * Positioned above the bottom tab bar, matching the design tokens.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View style={[styles.container, { bottom: TAB_BAR_HEIGHT + insets.bottom + space(2) }]} pointerEvents="box-none">
      <PrimaryButton label="Receipt" variant="primary" onPress={goToReceipt} style={styles.button} />
      <PrimaryButton label="Mileage" variant="primary" onPress={goToMileage} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
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
