import React from 'react';
import { TextInput, HelperText, Text } from 'react-native-paper';
import { View } from 'react-native';
import { theme } from '../../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  accessibilityLabel?: string;
  right?: React.ReactNode;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
};

export default function FormField({
  label,
  value,
  onChangeText,
  error,
  helperText,
  secureTextEntry,
  keyboardType,
  accessibilityLabel,
  right,
  placeholder,
  multiline = false,
  numberOfLines = 1,
}: Props) {
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text
        style={{
          ...theme.typography.titleMedium,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.xs,
        }}
      >
        {label}
      </Text>
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel || label}
        placeholder={placeholder}
        style={{
          backgroundColor: theme.colors.surface,
          // Height 56px gives comfortable touch target
          height: multiline ? undefined : 56,
          // For multiline ensure minHeight
          minHeight: multiline ? 80 : undefined,
        }}
        multiline={multiline}
        numberOfLines={numberOfLines}
        right={right}
      />
      {error && helperText ? (
        <HelperText type="error" visible>
          {helperText}
        </HelperText>
      ) : null}
    </View>
  );
}
