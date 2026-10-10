import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';

type Props = Omit<TextInputProps, 'label' | 'error'> & { label: string; error?: string; hint?: string };

/** Labelled text field. accessibilityLabel = label: Paper's floating label isn't linked to the input on the web,
 * and the UI flow and screen readers find fields by this name. */
export default function FormField({ label, error, hint, style, ...input }: Props) {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        mode="outlined"
        label={label}
        accessibilityLabel={label}
        error={!!error}
        style={styles.input}
        {...input}
      />
      {error ? (
        <HelperText type="error">{error}</HelperText>
      ) : hint ? (
        <HelperText type="info">{hint}</HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    // Ensure touch-friendly height (already default) and rounded corners via theme
  },
});
