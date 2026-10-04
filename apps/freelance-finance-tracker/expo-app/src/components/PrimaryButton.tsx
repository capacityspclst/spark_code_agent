import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';
import { theme } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

export default function PrimaryButton({ title, onPress, disabled = false, loading = false, accessibilityLabel }: Props) {
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled || loading;

  const handlePress = (e: GestureResponderEvent) => {
    if (!isDisabled) onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled, focused && styles.focused]}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={isDisabled ? { disabled: true } : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.onPrimary} />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create<{ button: ViewStyle; disabled: ViewStyle; focused: ViewStyle; text: TextStyle; textDisabled: TextStyle }>({
  button: {
    backgroundColor: theme.colors.primary,
    height: 48,
    minWidth: 120,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  disabled: {
    backgroundColor: theme.colors.disabledBackground,
  },
  focused: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.onPrimary,
    ...theme.typography.button,
  },
  textDisabled: {
    color: theme.colors.disabled,
  },
});