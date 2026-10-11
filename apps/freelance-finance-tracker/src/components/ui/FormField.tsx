import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';

type Props = Omit<TextInputProps, 'label' | 'error'> & { label: string; error?: string; hint?: string };

/** Labelled text field. accessibilityLabel = label: Paper's floating label isn't linked to the input on the web,
 * and the UI flow and screen readers find fields by this name.
 * The error HelperText is always rendered (visible when error) to reserve space and avoid layout jumps.
 */
export default function FormField({ label, error, hint, style, ...input }: Props) {
  const showError = !!error;
  return (
    <View style={[styles.container, style]}>
      <TextInput
        mode="outlined"
        label={label}
        accessibilityLabel={label}
        error={showError}
        style={styles.input}
        {...input}
      />
      <HelperText type="error" visible={showError} style={styles.helper}>
        {error || ''}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {},
  helper: {
    // Ensure a minimum height to prevent layout shift when error appears/disappears
    minHeight: 20,
  },
});
