import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { theme, space } from '../../theme';

/**
 * FAB with a speed-dial of two actions: "Receipt" and "Mileage".
 * Anchored to the bottom-right, above the bottom tab bar, so it never
 * overlaps list content below it.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [open, setOpen] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <FAB.Group
      open={open}
      visible
      icon={open ? 'close' : 'plus'}
      fabStyle={styles.fab}
      style={[styles.group, { bottom: tabBarHeight + space(2), right: space(2), left: 'auto', top: 'auto' }]}
      onStateChange={({ open }) => setOpen(open)}
      actions={[
        { icon: 'receipt', label: 'Receipt', onPress: goToReceipt, testID: 'fab-action-receipt' },
        { icon: 'run', label: 'Mileage', onPress: goToMileage, testID: 'fab-action-mileage' },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  group: {
    zIndex: 2,
  },
  fab: {
    marginBottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
