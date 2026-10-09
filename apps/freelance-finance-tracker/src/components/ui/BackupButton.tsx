import React from 'react';
import PrimaryButton from './PrimaryButton';
import { theme } from '../../theme';

/** Button used on the Backup screen to initiate backup creation. */
export default function BackupButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PrimaryButton
      label={label}
      onPress={onPress}
      variant="primary"
      style={{ backgroundColor: theme.colors.secondary }}
      // PrimaryButton already sets accessibilityLabel via its label prop.
    />
  );
}
