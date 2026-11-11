import React from 'react';
import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '../../theme';
import { TAB_BAR_HEIGHT } from '../../navigation/constants';

/**
 * Snackbar shown after saving a receipt or mileage entry.
 * Positioned absolutely above the FABs (SimpleAddButtons) and the fixed bottom tab bar, so
 * - rendered via Screen's `overlay` prop (a sibling of the scrollable recent-activity list,
 * not inside it) - it never scrolls with, and never covers, the list content.
 */
export default function ReceiptSavedSnackbar({
  visible,
  onDismiss,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  // Tab bar + add-buttons row (~48dp tall) + gap above them (8dp per DESIGN.md).
  const bottom = TAB_BAR_HEIGHT + insets.bottom + space(2) + 48 + space(1);
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
      style={[styles.container, { bottom }]}
      accessibilityLabel="Snackbar"
    >
      {children}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Default (no safe-area inset) bottom offset, overridden per-render above using the
    // live tab-bar height + safe-area inset + FAB row height + spacing.
    bottom: TAB_BAR_HEIGHT + space(2) + 48 + space(1),
    // Align to the right edge with the same horizontal inset as FABs
    right: space(2),
    // Prevent it from stretching full width; Paper will size it based on content.
    // Left offset is not needed because we position on the right.
  },
});
