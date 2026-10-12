import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput, Text } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = Omit<TextInputProps, 'label' | 'error'> & {
  label: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
};

/**
 * Labeled text field using React Native Paper.
 * Renders a visible label (<Text>) for UI flow and a Paper TextInput.
 * The TextInput receives `accessibilityLabel` equal to the label for screen readers.
 * An error HelperText is always rendered (visible when error) to reserve space and avoid layout jumps.
 */
export default function FormField({ label, error, hint, placeholder, secureTextEntry, style, ...input }: Props) {
  const [visible, setVisible] = useState(!secureTextEntry);
  const showError = !!error;
  const toggleVisibility = () => setVisible((v) => !v);
  return (
    <View style={[styles.container, style]}>
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
      <HelperText type="error" visible={showError} style={styles.helper}>
        {error || ''}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 8 },
  label: { marginBottom: 4, color: '#212121' },
  input: {},
  helper: { alignSelf: 'flex-start', minHeight: 20, marginTop: 2 },
});
