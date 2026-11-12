import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { layout, space, theme } from '../../theme';

interface Props {
  title?: string;
  subtitle?: string;
  wide?: boolean; // dashboards use the wider column
  children: React.ReactNode;
  /**
   * Content rendered as a fixed overlay, outside the scrollable area, so it
   * never scrolls with `children` and can never be covered by list items
   * (e.g. FABs, snackbars anchored to the bottom of the screen).
   */
  overlay?: React.ReactNode;
  /**
   * Height (dp) of the fixed bottom `overlay` zone (e.g. FABs + the safe-area inset, and
   * optionally the snackbar above them). When set, the ScrollView's own box is shrunk by this
   * amount (via `marginBottom`), so its visible/scrollable area ends *above* the overlay. That
   * guarantees list content can never render underneath the overlay - even when the content is
   * short and isn't actually scrolled - because the overlay occupies a strip of the screen that
   * the ScrollView simply doesn't draw into.
   */
  overlayInset?: number;
}

/** Page frame for every screen: background, page padding, a centered max-width column and an optional h1.
 * Anything passed via `overlay` is rendered as a sibling of the ScrollView (not inside its scrollable
 * content), so it stays fixed to the screen regardless of scroll position. */
export default function Screen({ title, subtitle, wide, children, overlay, overlayInset = 0 }: Props) {
  return (
    <View style={styles.page}>
      <ScrollView
        style={[styles.scroll, overlayInset ? { marginBottom: overlayInset } : null]}
        contentContainerStyle={[styles.content, { maxWidth: wide ? layout.maxWideWidth : layout.maxContentWidth }]}
        accessible={true}
        focusable={true}
      >
        {title || subtitle ? (
          <View style={styles.header}>
            {title ? <Text variant="headlineMedium" accessibilityRole="header" style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text variant="bodyLarge" style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  // Use the design token spacing * 2 (16dp) for horizontal padding
  content: { width: '100%', alignSelf: 'center', paddingHorizontal: space(2), paddingBottom: space(16), gap: space(2) },
  header: { gap: space(1), marginBottom: space(1) },
  title: { fontWeight: '700', color: theme.colors.onSurface },
  subtitle: { color: theme.colors.secondary },
});
