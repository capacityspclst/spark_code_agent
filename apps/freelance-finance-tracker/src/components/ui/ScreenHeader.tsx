import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { theme, space } from '../../theme';

/** Consistent header used on full‑screen pages (title + optional subtitle). */
export default function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.container} accessible accessibilityRole="header">
      <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text variant="bodyMedium" style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: space(2) },
  title: { fontWeight: '600', marginBottom: space(1) },
  subtitle: { color: theme.colors.onSurfaceVariant },
});
