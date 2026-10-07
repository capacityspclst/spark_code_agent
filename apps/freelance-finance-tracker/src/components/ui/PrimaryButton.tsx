// src/components/ui/PrimaryButton.tsx
import React from 'react';
import { Button } from 'react-native-paper';

export const PrimaryButton: React.FC<{
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}> = ({ onPress, disabled, loading, children }) => (
  <Button mode="contained" onPress={onPress} disabled={disabled} loading={loading} accessibilityRole="button">
    {children}
  </Button>
);
