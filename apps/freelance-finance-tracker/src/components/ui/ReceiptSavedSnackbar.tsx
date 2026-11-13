import React from 'react';
import { Snackbar } from 'react-native-paper';
import { theme } from '../../theme';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
};

/**
 * Snackbar that appears above the FAB group, per DESIGN.md.
 */
export default function ReceiptSavedSnackbar({ visible, onDismiss, children }: Props) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
      style={{
        position: 'absolute',
        bottom: theme.FAB_CONTAINER_HEIGHT + theme.TAB_BAR_HEIGHT + theme.spacing * 2,
        left: 0,
        right: 0,
        zIndex: 9,
      }}
    >
      {children}
    </Snackbar>
  );
}
