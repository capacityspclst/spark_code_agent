import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * FAB Group that expands to actions for adding a receipt or mileage entry.
 * Positioned above the bottom tab bar with safe‑area aware offset.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <FAB.Group
      open={open}
      icon={open ? 'close' : 'plus'}
      onStateChange={({ open }) => setOpen(open)}
      actions={[
        { icon: 'receipt', label: 'Receipt', onPress: goToReceipt },
        { icon: 'car', label: 'Mileage', onPress: goToMileage },
      ]}
      style={{
        position: 'absolute',
        right: space(2),
        bottom: insets.bottom + space(2),
      }}
    />
  );
}

const styles = StyleSheet.create({});