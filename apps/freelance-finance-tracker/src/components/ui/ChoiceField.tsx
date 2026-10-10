import React from 'react';
import { View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { space, theme } from '../../theme';

interface Props<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** A small set of choices (2-5): React Native has no HTML select element. The UI flow's "select" step picks options by label.
 * For longer lists use a Paper Menu anchored to a button with the field's label. */
export default function ChoiceField<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <View style={{ gap: space(1) }}>
      <Text variant="labelLarge" style={{ color: theme.colors.secondary }} accessibilityRole="text">{label}</Text>
      <SegmentedButtons
        value={value}
        onValueChange={(v) => onChange(v as T)}
        buttons={options.map((o) => ({ value: o.value, label: o.label, accessibilityLabel: o.label }))}
      />
    </View>
  );
}
