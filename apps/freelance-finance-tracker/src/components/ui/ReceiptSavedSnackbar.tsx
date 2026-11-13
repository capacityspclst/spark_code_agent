import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { space } from '../../theme';

/**
 * Snackbar that appears overlayed at the top of the screen.
 * It uses absolute positioning so it does not affect layout of other content.
 */
export default function ReceiptSavedSnackbar({
  visible,
  onDismiss = () => {},
  message,
}: {
  visible: boolean;
  onDismiss?: () => void;
  message: string;
}) {
  if (!visible) return null;
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Snackbar
        visible={true}
        onDismiss={onDismiss}
        duration={3000}
        style={styles.snackbar}
        // Accessibility live region ensures screen readers announce the message.
        accessibilityLiveRegion="assertive"
      >
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: space(2),
    left: space(2),
    right: space(2),
    // ensure it sits above other UI layers
    elevation: 4,
    zIndex: 10,
  },
  snackbar: {
    // No extra style needed, but keep placeholder for future tweaks.
  },
});
