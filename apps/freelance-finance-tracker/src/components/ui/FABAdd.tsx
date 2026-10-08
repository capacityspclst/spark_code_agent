import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Two independent FABs for adding a receipt or mileage entry.
 * They are always visible (no nesting) and have accessibility labels.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();

  const goToReceipt = () => {
    navigation.getParent?.()?.navigate('ReceiptEntry');
  };

  const goToMileage = () => {
    navigation.getParent?.()?.navigate('MileageEntry');
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <FAB
        style={[styles.fab, styles.receipt]}
        small
        icon="receipt"
        accessibilityLabel="Receipt"
        accessibilityRole="button"
        onPress={goToReceipt}
        color={theme.colors.onSecondary}
        theme={{ colors: { accent: theme.colors.secondary } }}
      />
      <FAB
        style={[styles.fab, styles.mileage]}
        small
        icon="run"
        accessibilityLabel="Mileage"
        accessibilityRole="button"
        onPress={goToMileage}
        color={theme.colors.onSecondary}
        theme={{ colors: { accent: theme.colors.secondary } }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: space(2), right: space(2), flexDirection: 'column', alignItems: 'center' },
  fab: { marginBottom: space(1), elevation: 4 },
  receipt: {},
  mileage: {},
});
