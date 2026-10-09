import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Two independent FABs for adding a receipt or mileage entry.
 * Icons are rendered as decorative elements with aria-hidden to avoid nested interactive warnings.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();

  const goToReceipt = () => {
    navigation.getParent?.()?.navigate('ReceiptEntry');
  };

  const goToMileage = () => {
    navigation.getParent?.()?.navigate('MileageEntry');
  };

  const receiptIcon = ({ size, color }: { size: number; color: string }) => (
    <MaterialCommunityIcons name="receipt" size={size} color={color} aria-hidden />
  );
  const mileageIcon = ({ size, color }: { size: number; color: string }) => (
    <MaterialCommunityIcons name="run" size={size} color={color} aria-hidden />
  );

  return (
    <Portal>
      <View style={styles.container} pointerEvents="box-none">
        <FAB
          style={[styles.fab, styles.receipt]}
          small
          icon={receiptIcon}
          accessibilityLabel="Add receipt"
          accessibilityRole="button"
          onPress={goToReceipt}
          color={theme.colors.onSecondary}
          theme={{ colors: { accent: theme.colors.secondary } }}
        />
        <FAB
          style={[styles.fab, styles.mileage]}
          small
          icon={mileageIcon}
          accessibilityLabel="Add mileage"
          accessibilityRole="button"
          onPress={goToMileage}
          color={theme.colors.onSecondary}
          theme={{ colors: { accent: theme.colors.secondary } }}
        />
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: space(2), right: space(2), flexDirection: 'column', alignItems: 'center' },
  fab: { marginBottom: space(1), elevation: 4 },
  receipt: {},
  mileage: {},
});
