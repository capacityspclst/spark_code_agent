import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { layout, space, theme } from '../../theme';

interface Props { label: string; checked: boolean; onChange: (checked: boolean) => void }

/** A real checkbox: one pressable element with role checkbox, its checked state and its label. */
export default function CheckboxField({ label, checked, onChange }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons
        name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={checked ? theme.colors.primary : theme.colors.outline}
        aria-hidden
      />
      <Text variant="bodyLarge" style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(1.5), minHeight: layout.touchTarget, paddingVertical: space(1), borderRadius: space(1) },
  pressed: { opacity: 0.7 },
  label: { flex: 1 },
});
