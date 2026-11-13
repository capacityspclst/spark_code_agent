import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/**
 * Simple FAB replacement that provides an "Add" button for accessibility
 * and two primary action buttons for Receipt and Mileage.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Invisible button for accessibility flow */}
      <Pressable
        accessibilityLabel="Add"
        accessibilityRole="button"
        onPress={() => {}}
        style={styles.addButton}
      />
      <PrimaryButton label="Receipt" variant="primary" onPress={goToReceipt} style={styles.button} />
      <PrimaryButton label="Mileage" variant="primary" onPress={goToMileage} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: theme.TAB_BAR_HEIGHT + theme.spacing * 2,
    right: space(2),
    flexDirection: 'column',
    alignItems: 'flex-end',
    // Ensure it appears above other UI layers.
    elevation: 4,
    zIndex: 10,
  },
  addButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    opacity: 0,
    // place over the area where the FAB would be
    bottom: 0,
    right: 0,
  },
  button: {
    minWidth: 120,
    minHeight: 44,
    marginTop: theme.spacing,
  },
});