import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** FAB that opens mini-FABs for adding a receipt or mileage entry.
 * The main FAB has an accessible label "Add".
 * Mini FABs are labelled "Add receipt" and "Mileage" for compatibility with UI flow.
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  const goToReceipt = () => {
    navigation.getParent?.()?.navigate('ReceiptEntry');
    setOpen(false);
  };

  const goToMileage = () => {
    navigation.getParent?.()?.navigate('MileageEntry');
    setOpen(false);
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
        {open && (
          <View style={styles.miniContainer}>
            <FAB
              style={styles.miniFab}
              small
              icon={receiptIcon}
              accessibilityLabel="Add receipt"
              accessibilityRole="button"
              onPress={goToReceipt}
              color={theme.colors.onSecondary}
              theme={{ colors: { accent: theme.colors.secondary } }}
            />
            <FAB
              style={styles.miniFab}
              small
              icon={mileageIcon}
              accessibilityLabel="Mileage"
              accessibilityRole="button"
              onPress={goToMileage}
              color={theme.colors.onSecondary}
              theme={{ colors: { accent: theme.colors.secondary } }}
            />
          </View>
        )}
        <FAB
          style={styles.fab}
          icon="plus"
          accessibilityLabel="Add"
          accessibilityRole="button"
          onPress={toggle}
          color={theme.colors.onSecondary}
          theme={{ colors: { accent: theme.colors.secondary } }}
        />
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: space(2), right: space(2), alignItems: 'center' },
  fab: { elevation: 4 },
  miniContainer: { marginBottom: 8, flexDirection: 'column-reverse', alignItems: 'center' },
  miniFab: { marginBottom: 8 },
});
