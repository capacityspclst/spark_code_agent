import React from 'react';
import PrimaryButton from './PrimaryButton';
import { theme } from '../../theme';

/** Button used on the Restore screen to initiate restore action. */
export default function RestoreButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PrimaryButton
      label={label}
      onPress={onPress}
      variant="primary"
      style={{ backgroundColor: theme.colors.secondary }}
    />
  );
}
