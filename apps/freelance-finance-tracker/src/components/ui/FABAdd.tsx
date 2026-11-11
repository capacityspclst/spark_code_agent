import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { layout, space, theme } from '../../theme';

/**
 * Speed-dial add control built from Paper's `FAB` primitives: a plus-icon
 * anchor FAB plus two labelled action FABs ("Receipt" / "Mileage"). The
 * whole group renders inside a small absolutely-positioned overlay anchored
 * bottom-right, pushed above the bottom tab bar (plus the safe-area inset),
 * so it never overlaps other on-screen buttons and stays inside the
 * centered max-width container on desktop.
 *
 * (A plain Paper `<FAB.Group>` was tried here but its full-screen backdrop
 * swallows taps on whatever sits underneath it, and its action items render
 * as a focusable-but-unlabelled nested button on web; this smaller, always
 * visible stack avoids both problems while keeping the same Paper `FAB`
 * look.)
 */
export default function FABAdd() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  const bottom = layout.tabBarHeight + insets.bottom + space(2);

  return (
    <View style={[styles.overlay, { bottom }]} pointerEvents="box-none">
      <FAB
        icon="car"
        label="Mileage"
        size="small"
        accessibilityLabel="Mileage"
        testID="fab-action-mileage"
        onPress={goToMileage}
        style={[styles.action, { backgroundColor: theme.colors.secondary }]}
        color={theme.colors.onSecondary}
      />
      <FAB
        icon="receipt"
        label="Receipt"
        size="small"
        accessibilityLabel="Receipt"
        testID="fab-action-receipt"
        onPress={goToReceipt}
        style={[styles.action, { backgroundColor: theme.colors.secondary }]}
        color={theme.colors.onSecondary}
      />
      <FAB
        icon="plus"
        accessibilityLabel="Add"
        testID="fab-anchor"
        onPress={() => {}}
        style={[styles.anchor, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    right: space(2),
    alignItems: 'flex-end',
  },
  action: {
    marginBottom: space(1),
  },
  anchor: {
    marginTop: space(1),
  },
});
