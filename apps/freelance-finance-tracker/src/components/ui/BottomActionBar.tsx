import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, space } from '../../theme';

/**
 * Fixed action bar anchored to the bottom of the screen.
 * Used on forms (e.g., PolicyGate) to keep the primary CTA thumb‑reachable.
 */
export default function BottomActionBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Surface style={[styles.bar, { paddingBottom: insets.bottom + space(2) }]} elevation={2}>
      <View style={styles.inner}>{children}</View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
    paddingHorizontal: space(2),
    paddingTop: space(2),
  },
  inner: {
    // layout children vertically with spacing
    flexDirection: 'column',
    gap: space(1),
  },
});
