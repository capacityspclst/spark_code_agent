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
      disabled={disabled}
      loading={loading}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
      contentStyle={{ height: 56, minWidth: 120, justifyContent: 'center' }}
      style={{
        marginVertical: theme.spacing.md,
        // subtle elevation for depth
        ...theme.elevation.card,
        borderRadius: theme.radii.md,
      }}
      labelStyle={{ ...theme.typography.button, color: theme.colors.onPrimary, fontWeight: '600' }}
    >
      {title}
    </Button>
  );
}
