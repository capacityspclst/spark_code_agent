import React, { useState } from 'react';
import { Portal } from 'react-native-paper';
import { FAB } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { space, theme } from '../../theme';

/**
 * FAB with a speed-dial of two actions: "Receipt" and "Mileage".
 * Anchored to the bottom-right, above the bottom tab bar, so the mini-FABs
 * stack upward from the corner and never overlap list content below them.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [open, setOpen] = useState(false);
  let tabBarHeight = 0;
  try {
    // Only available when rendered inside a Bottom Tab Navigator screen.
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = 0;
  }

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible
        icon={open ? 'close' : 'plus'}
        color={theme.colors.onPrimary}
        style={{ position: 'absolute', right: space(2), bottom: tabBarHeight + space(2), left: 'auto', top: 'auto', zIndex: 2 }}
        fabStyle={{ marginBottom: 0, backgroundColor: theme.colors.primary }}
        onStateChange={({ open }) => setOpen(open)}
        actions={[
          { icon: 'receipt', label: 'Receipt', onPress: goToReceipt },
          { icon: 'run', label: 'Mileage', onPress: goToMileage },
        ]}
      />
    </Portal>
  );
}
