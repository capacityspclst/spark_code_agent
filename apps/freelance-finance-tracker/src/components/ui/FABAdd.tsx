import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { theme, space } from '../../theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Primary FAB that expands to Receipt and Mileage mini‑FABs. */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [open, setOpen] = useState(false);

  const goToReceipt = () => {
    // Navigate to the ReceiptEntry screen (stack screen)
    navigation.getParent?.()?.navigate('ReceiptEntry');
    setOpen(false);
  };

  const goToMileage = () => {
    navigation.getParent?.()?.navigate('MileageEntry');
    setOpen(false);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <FAB
        style={styles.main}
        small={false}
        icon="plus"
        accessibilityLabel="Add"
        onPress={() => setOpen(!open)}
        color={theme.colors.onPrimary}
        theme={{ colors: { accent: theme.colors.primary } }}
      />
      {open && (
        <View style={styles.miniContainer}>
          <FAB
            style={styles.mini}
            small
            icon="receipt"
            accessibilityLabel="Receipt"
            onPress={goToReceipt}
            color={theme.colors.onSecondary}
            theme={{ colors: { accent: theme.colors.secondary } }}
          />
          <FAB
            style={styles.mini}
            small
            icon="run"
            accessibilityLabel="Mileage"
            onPress={goToMileage}
            color={theme.colors.onSecondary}
            theme={{ colors: { accent: theme.colors.secondary } }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: space(2), right: space(2) },
  main: { elevation: 4 },
  miniContainer: { flexDirection: 'column', marginBottom: space(2), alignItems: 'center' },
  mini: { marginTop: space(1) },
});
