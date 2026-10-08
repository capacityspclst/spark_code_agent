import React from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';

type Props = Omit<TextInputProps, 'label' | 'error'> & { label: string; error?: string; hint?: string };

/** Labelled text field. accessibilityLabel = label: Paper's floating label isn't linked to the input on the web,
 * and the UI flow and screen readers find fields by this name. */
export default function FormField({ label, error, hint, ...input }: Props) {
  return (
    <View>
      <TextInput mode="outlined" label={label} accessibilityLabel={label} error={!!error} {...input} />
      {error ? <HelperText type="error">{error}</HelperText> : hint ? <HelperText type="info">{hint}</HelperText> : null}
    </View>
  );
}
