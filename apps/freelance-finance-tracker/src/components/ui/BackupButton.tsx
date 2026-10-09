import React from 'react';
import PrimaryButton from './PrimaryButton';

type Props = {
  label?: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
};

/** Wrapper button for initiating backup flow. */
export default function BackupButton({ label = 'Create encrypted backup', onPress, loading }: Props) {
  return <PrimaryButton label={label} variant="secondary" onPress={onPress} loading={loading} />;
}
