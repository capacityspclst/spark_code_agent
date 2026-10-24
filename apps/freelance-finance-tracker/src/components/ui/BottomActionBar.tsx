import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Snackbar, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, space } from '../../theme';

/**
 * Bottom action bar providing mini‑FABs for adding receipts or mileage entries
 * and optionally showing a Snackbar. Rendered in normal flow above other content.
 */
export default function BottomActionBar({
  snackMessage,
  onAddReceipt,
  onAddMileage,
}: {
  snackMessage?: string;
  onAddReceipt: () => void;
  onAddMileage: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Surface
      style={[styles.bar, { paddingBottom: insets.bottom + space(2) }]}
      elevation={2}
    >
      <View style={styles.inner}>
        {snackMessage ? (
          <Snackbar visible={true} onDismiss={() => {}} duration={3000}>
            {snackMessage}
          </Snackbar>
        ) : null}
        <FAB
          size="small"
          style={styles.fab}
          icon="receipt"
          onPress={onAddReceipt}
          accessibilityLabel="Add receipt"
        />
        <FAB size="small" style={styles.fab} icon="map" onPress={onAddMileage} accessibilityLabel="Add mileage" />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
    paddingHorizontal: space(2),
    paddingTop: space(2),
    // No absolute positioning; part of normal layout flow.
  },
  inner: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: space(1),
  },
  fab: {
    marginTop: space(1),
  },
});
