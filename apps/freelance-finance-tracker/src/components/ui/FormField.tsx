import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput, Text } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

type Props = Omit<TextInputProps, 'label' | 'error'> & {
  label: string;
  error?: string;
  hint?: string; // non‑error helper text, e.g., "Check these details"
  placeholder?: string;
  secureTextEntry?: boolean;
  marked?: boolean; // highlight for pre‑filled fields
};

/**
 * Labeled text field using React Native Paper.
 * Renders a visible label (<Text>) for UI flow and a Paper TextInput.
 * The TextInput receives `accessibilityLabel` equal to the label for screen readers.
 * An error HelperText is always rendered (visible when error) to reserve space and avoid layout jumps.
 * A non‑error hint is rendered when `hint` is provided.
 * When `marked` is true, the field background is highlighted to draw attention until edited.
 */
export default function FormField({ label, error, hint, marked, placeholder, secureTextEntry, style, ...input }: Props) {
  const [visible, setVisible] = useState(!secureTextEntry);
  const showError = !!error;
  const toggleVisibility = () => setVisible((v) => !v);
  const containerStyle = [styles.container, style, marked ? styles.marked : null];
  return (
    <View style={containerStyle}>
      {/* Visible label for UI flow */}
      <Text variant="bodyMedium" style={styles.label} accessibilityRole="text">
        {label}
      </Text>
      <TextInput
        mode="outlined"
        label={label}
        accessibilityLabel={label}
        error={showError}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry && !visible}
        right={secureTextEntry ? (
          <TextInput.Icon
            icon={visible ? 'eye-off' : 'eye'}
            onPress={toggleVisibility}
            accessibilityLabel={visible ? 'Hide passphrase' : 'Show passphrase'}
            aria-hidden={true}
          />
        ) : undefined}
        style={styles.input}
        {...input}
      />
      {/* Hint (info) */}
      {hint && !showError ? (
        <HelperText type="info" visible={true} style={styles.helper}>
          {hint}
        </HelperText>
      ) : null}
      {/* Error */}
      <HelperText type="error" visible={showError} style={styles.helper}>
        {error || ''}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 8 },
  marked: { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.roundness },
  label: { marginBottom: 4, color: '#212121' },
  input: {},
  helper: { alignSelf: 'flex-start', minHeight: 20, marginTop: 2 },
});
