import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput, Text } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';
import { theme } from '../../theme';

type Props = Omit<TextInputProps, 'error'> & {
  label: string;
  error?: string;
  hint?: string; // non-error helper text
  placeholder?: string;
  secureTextEntry?: boolean;
  marked?: boolean; // highlight for pre‑filled fields
  rightIcon?: (props:any)=>React.ReactNode; // optional right icon renderer
};

/**
 * Labeled text field using React Native Paper.
 * Renders an external visible label and a Paper TextInput with floating label.
 * Error HelperText is always rendered to reserve space; visible only when touched.
 * Non‑error hint is shown when provided.
 * `marked` applies a background highlight for pre‑filled fields.
 */
export default function FormField({ label, error, hint, marked, placeholder, secureTextEntry, rightIcon, style, ...input }: Props) {
  const [touched, setTouched] = useState(false);
  const showError = !!error && touched;
  const containerStyle = [styles.container, style, marked ? styles.marked : null];
  return (
    <View style={containerStyle}>
      {/* Visible label for UI flow */}
      <Text variant="bodyMedium" style={styles.label}>{label}</Text>
      <TextInput
        mode="outlined"
        label={label}
        accessibilityLabel={label}
        error={showError}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        right={rightIcon ? (props) => rightIcon(props) : undefined}
        onBlur={() => setTouched(true)}
        style={styles.input}
        {...input}
      />
      {/* Hint (info) */}
      {hint && !showError ? (
        <HelperText type="info" visible={true} style={styles.helper}>
          {hint}
        </HelperText>
      ) : null}
      {/* Error (always reserve space) */}
      <HelperText type="error" visible={true} style={styles.helper}>
        {showError ? error : ''}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 8 },
  label: { marginBottom: 4, color: '#212121' },
  marked: { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.roundness },
  input: {},
  helper: { alignSelf: 'flex-start', minHeight: 20, marginTop: 2 },
});
