import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import PrimaryButton from './PrimaryButton';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/**
 * FAB group: a visible "Add" FAB plus two primary action buttons for
 * Receipt and Mileage. All three stay on screen above the tab bar.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View style={styles.container} pointerEvents="box-none">
      <PrimaryButton label="Receipt" variant="primary" onPress={goToReceipt} style={styles.button} />
      <PrimaryButton label="Mileage" variant="primary" onPress={goToMileage} style={styles.button} />
      <FAB
        icon="plus"
        accessibilityLabel="Add"
        label="Add"
        onPress={() => {}}
        style={styles.addButton}
      />
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
    marginBottom: theme.spacing,
  },
  button: {
    minWidth: 120,
    minHeight: 44,
    marginTop: theme.spacing,
  },
});
