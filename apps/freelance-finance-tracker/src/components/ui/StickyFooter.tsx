import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, HelperText } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, space } from '../../theme';

/** Footer pinned to the bottom of the screen, with safe‑area handling. */
export default function StickyFooter({ children, hint }: { children: React.ReactNode; hint?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Surface style={[styles.footer, { paddingBottom: insets.bottom + space(2) }]} elevation={2}>
      <View style={styles.inner}>{children}</View>
      {hint ? <HelperText type="info" style={styles.hint}>{hint}</HelperText> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
    paddingHorizontal: space(2),
    paddingTop: space(2),
  },
  inner: { flexDirection: 'column', gap: space(1) },
  hint: { textAlign: 'center', marginTop: space(1) },
});
