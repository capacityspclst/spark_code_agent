import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '../../theme';
import { TAB_BAR_HEIGHT } from '../../navigation/constants';

/** SimpleAddButtons renders two primary action buttons positioned absolutely.
 * PrimaryButton and navigation are required lazily to avoid side‑effects during module load.
 * It is anchored above the fixed bottom tab bar (and the device's safe-area inset) so it
 * never overlaps the bottom tab bar, and - since it is rendered as a `Screen` overlay sibling
 * of the scrollable recent-activity list rather than inside it - it never scrolls with (and
 * so never covers) the list content.
 */
export default function SimpleAddButtons() {
  // Lazy load navigation hook and PrimaryButton inside the function.
  const { useNavigation } = require('@react-navigation/native');
  const navigation = useNavigation();
  const PrimaryButton = require('./PrimaryButton').default;
  const insets = useSafeAreaInsets();

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View
      style={[styles.container, { bottom: TAB_BAR_HEIGHT + insets.bottom + space(2) }]}
      pointerEvents="box-none"
    >
      <PrimaryButton label="Receipt" variant="primary" onPress={goToReceipt} accessibilityLabel="Receipt" />
      <PrimaryButton label="Mileage" variant="primary" onPress={goToMileage} accessibilityLabel="Mileage" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Default (no safe-area inset) bottom offset: tab bar height (56dp) + 16dp gap = 72dp.
    // Overridden per-render above using the live tab-bar height + safe-area inset.
    bottom: TAB_BAR_HEIGHT + space(2),
    right: space(2),
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: space(1),
    elevation: 4,
    zIndex: 10,
  },
});
