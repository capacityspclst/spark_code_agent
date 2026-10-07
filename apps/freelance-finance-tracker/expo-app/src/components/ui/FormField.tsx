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
};

export default function FormField({ label, value, onChangeText, error, helperText, secureTextEntry, keyboardType, accessibilityLabel, right, placeholder }: Props) {
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text style={{ ...theme.typography.titleMedium, color: theme.colors.onSurface, marginBottom: theme.spacing.xs }}>{label}</Text>
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel || label}
        placeholder={placeholder}
        style={{ backgroundColor: theme.colors.surface, height: 48 }}
        right={right}
      />
      {error && helperText ? <HelperText type="error" visible>{helperText}</HelperText> : null}
    </View>
  );
}
