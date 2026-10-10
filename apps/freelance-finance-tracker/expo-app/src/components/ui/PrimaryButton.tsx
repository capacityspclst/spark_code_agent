import React from 'react';
import { Button } from 'react-native-paper';
import { theme } from '../../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

export default function PrimaryButton({ title, onPress, disabled = false, loading = false, accessibilityLabel, testID }: Props) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
      contentStyle={{ height: 48, minWidth: 120, justifyContent: 'center' }}
      style={{ marginVertical: theme.spacing.md, borderRadius: theme.radii.md }}
    >
      {title}
    </Button>
  );
}
