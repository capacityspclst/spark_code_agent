import React from 'react';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  secureTextEntry?: boolean;
  accessibilityLabel?: string;
  keyboardType?: any;
  placeholder?: string;
};

export default function FormField({ label, value, onChangeText, error = false, secureTextEntry = false, accessibilityLabel, keyboardType, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <PaperTextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={error}
        secureTextEntry={secureTextEntry}
        accessibilityLabel={accessibilityLabel || label}
        keyboardType={keyboardType}
        placeholder={placeholder}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.md },
  input: { backgroundColor: theme.colors.surface },
});