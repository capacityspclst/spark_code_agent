import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

export default function PrimaryButton({ title, onPress, disabled = false, loading = false, accessibilityLabel, testID }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={() => {
        if (!isDisabled) onPress();
      }}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={isDisabled ? { disabled: true } : undefined}
      accessible={true}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.onPrimary} />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    backgroundColor: theme.colors.primaryVariant,
  },
  text: {
    color: theme.colors.onPrimary,
    ...theme.typography.button,
  },
  textDisabled: {
    color: theme.colors.disabled,
  },
});