// src/components/ui/PrimaryButton.tsx
import React from 'react';
import { Button } from 'react-native-paper';

export const PrimaryButton: React.FC<{
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: any;
}> = ({ onPress, disabled, loading, children, style }) => (
  <Button mode="contained" onPress={onPress} disabled={disabled} loading={loading} style={style} accessibilityRole="button">
    {children}
  </Button>
);
