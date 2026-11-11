import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, space } from '../../theme';

/** Consistent header used on every full‑screen page (title + optional subtitle).
 * Matches the Material 3 top‑app‑bar hierarchy: safe‑area aware top padding, 16dp
 * horizontal padding and 16dp bottom padding, with the title rendered at headlineMedium. */
export default function ScreenHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.container, { paddingTop: insets.top + space(2) }]}
      accessible
      accessibilityRole="header"
    >
      {title ? (
        <Text variant="headlineMedium" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {subtitle ? <Text variant="bodyMedium" style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: space(2), paddingBottom: space(2) },
  title: { color: theme.colors.onSurface },
  subtitle: { color: theme.colors.onSurfaceVariant, marginTop: space(1) },
});
