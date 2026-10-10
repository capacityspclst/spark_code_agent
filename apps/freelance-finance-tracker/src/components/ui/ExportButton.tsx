import React from 'react';
import { Button } from 'react-native-paper';
import { theme } from '../../theme';

type Props = {
  label: string;
  onPress: () => Promise<void> | void;
};

/** Simple button used on the Export screen. */
export default function ExportButton({ label, onPress }: Props) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      accessibilityLabel={label}
      style={{ marginVertical: 8, backgroundColor: theme.colors.secondary }}
      labelStyle={{ color: theme.colors.onSecondary }}
    >
      {label}
    </Button>
  );
}
