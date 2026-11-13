import React, { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { FAB } from 'react-native-paper';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/**
 * FAB group with main + and mini actions for Receipt and Mileage.
 * Positioned above the bottom tab bar. Main FAB has accessibilityLabel "Add".
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [open, setOpen] = useState(false);

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <>
      <FAB.Group
        open={open}
        icon={open ? 'close' : 'plus'}
        accessibilityLabel="Add"
        actions={[
          { icon: 'receipt', label: 'Receipt', onPress: goToReceipt, accessibilityLabel: 'Receipt' },
          { icon: 'map', label: 'Mileage', onPress: goToMileage, accessibilityLabel: 'Mileage' },
        ]}
        onStateChange={({ open }) => setOpen(open)}
        style={styles.container}
      />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: theme.TAB_BAR_HEIGHT + theme.spacing * 2,
    right: space(2),
    // Ensure it appears above other UI layers.
    elevation: 4,
    zIndex: 10,
  },
});
