import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import type { TextInputProps } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = Omit<TextInputProps, 'label' | 'error'> & {
  label: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
};

/** Labelled text field. accessibilityLabel = label: Paper's floating label isn't linked to the input on the web,
 * and the UI flow and screen readers find fields by this name.
 * The error HelperText is always rendered (visible when error) to reserve space and avoid layout jumps.
 */
export default function FormField({ label, error, hint, placeholder, secureTextEntry, style, ...input }: Props) {
  const [visible, setVisible] = useState(!secureTextEntry);
  const showError = !!error;
  const toggleVisibility = () => setVisible((v) => !v);
  return (
    <View style={[styles.container, style]}>
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
  container: {
    width: '100%',
  },
  input: {},
  helper: {
    // Align error text directly under the input with modest spacing.
    alignSelf: 'flex-start',
    minHeight: 20,
    marginTop: 2,
  },
});
