// src/components/ui/FormField.tsx
import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  errorMessage?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  accessibilityLabel?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  error = false,
  errorMessage,
  keyboardType,
  secureTextEntry,
  accessibilityLabel,
}) => (
  <View style={styles.container}>
    <TextInput
      mode="outlined"
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={error}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      accessibilityLabel={accessibilityLabel || label}
    />
    {error && errorMessage && <HelperText type="error">{errorMessage}</HelperText>}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
});