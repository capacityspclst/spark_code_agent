import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { layout, space, theme } from '../../theme';

interface Props { label: string; description?: string; value: boolean; onChange: (value: boolean) => void }

/** A labelled on/off setting: the whole row is one switch (role switch, its state and label), so it's easy to
 * tap and works with assistive tech and the UI flow. Paper's Switch isn't used: on the web it has no name. */
export default function SettingSwitch({ label, description, value, onChange }: Props) {
  return (
    <Pressable
      role="switch"
      aria-checked={value}
      aria-label={label}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text variant="bodyLarge">{label}</Text>
        {description ? <Text variant="bodyMedium" style={styles.description}>{description}</Text> : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]} aria-hidden>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2), minHeight: layout.touchTarget + space(2), paddingHorizontal: space(2), paddingVertical: space(1.5) },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: space(0.5) },
  description: { color: theme.colors.secondary },
  track: { width: 52, height: 32, borderRadius: 16, borderWidth: 2, borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant, justifyContent: 'center', paddingHorizontal: 4 },
  trackOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  thumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.outline },
  thumbOn: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.onPrimary, alignSelf: 'flex-end' },
});
