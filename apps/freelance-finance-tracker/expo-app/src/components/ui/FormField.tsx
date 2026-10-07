import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
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
};

export default function FormField({ label, value, onChangeText, error, helperText, secureTextEntry, keyboardType, accessibilityLabel, right }: Props) {
  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel || label}
        style={{ backgroundColor: theme.colors.surface, height: 48 }}
        right={right}
      />
      {error && helperText ? <HelperText type="error" visible>{helperText}</HelperText> : null}
    </>
  );
}
