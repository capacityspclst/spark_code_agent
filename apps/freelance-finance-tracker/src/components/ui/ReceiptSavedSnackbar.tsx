import React from 'react';
import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { space } from '../../theme';

/**
 * Snackbar shown after saving a receipt or mileage entry.
 * Positioned absolutely above the FABs and bottom tab bar.
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
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
      style={styles.container}
      accessibilityLabel="Snackbar"
    >
      {children}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // 80dp from bottom ensures it stays above the FABs and tab bar (>=72dp as required by tests)
    bottom: space(10),
    // Align to the right edge with the same horizontal inset as FABs
    right: space(2),
    // Prevent it from stretching full width; Paper will size it based on content.
    // Left offset is not needed because we position on the right.
  },
});
