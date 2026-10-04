import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

export default function PrimaryButton({ title, onPress, disabled = false, loading = false, accessibilityLabel }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.onPrimary} />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create<{ button: ViewStyle; disabled: ViewStyle; text: TextStyle; textDisabled: TextStyle }>({
  button: {
    backgroundColor: theme.colors.primary,
    height: 48,
    minWidth: 120,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  disabled: {
    backgroundColor: theme.colors.disabledBackground,
    opacity: 0.6,
  },
  text: {
    color: theme.colors.onPrimary,
    ...theme.typography.button,
  },
  textDisabled: {
    color: theme.colors.onSurface,
  },
});
