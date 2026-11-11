import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import SettingSwitch from './SettingSwitch';
import { theme, layout, space } from '../../theme';

type Props = {
  label: string;
  testID?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  error?: boolean;
};

/** A reusable settings row, conforming to DESIGN.md */
export default function SettingsRow({
  label,
  testID,
  onPress,
  showChevron = false,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  error = false,
}: Props) {
  // Row acts as a button unless a switch is present (switch itself handles its own press)
  const Container = TouchableOpacity;
  const containerProps: any = {
    style: [styles.row, error && styles.errorRow],
    ...(onPress && !showSwitch ? { onPress, accessibilityRole: 'button', accessibilityLabel: label } : {}),
    testID,
  };

  return (
    <Container {...containerProps}>
      <Text variant="bodyLarge" style={[styles.label, error && { color: theme.colors.error }]}>{label}</Text>
      {showSwitch && (
        <SettingSwitch
          label={label}
          value={switchValue}
          onChange={onSwitchChange!}
        />
      )}
      {showChevron && !showSwitch && (
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} aria-hidden={true} />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: space(2),
    paddingVertical: space(1),
    backgroundColor: theme.colors.surface,
  },
  errorRow: {
    // background stays same, label color handled separately
  },
  label: {
    color: theme.colors.onSurface,
    flex: 1,
  },
});
