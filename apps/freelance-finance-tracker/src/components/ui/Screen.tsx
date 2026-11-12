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
   * Height (dp), including any safe-area inset, reserved at the bottom of the screen for
   * `overlay`. Applied as a `marginBottom` on the ScrollView itself (not just its content),
   * so the ScrollView's own rendered box never extends into the area the overlay occupies.
   * Content that would otherwise land there simply requires scrolling to reveal, instead of
   * rendering underneath the fixed overlay.
   */
  overlayHeight?: number;
}

/** Page frame for every screen: background, page padding, a centered max-width column and an optional h1.
 * Anything passed via `overlay` is rendered as a sibling of the ScrollView (not inside its scrollable
 * content), so it stays fixed to the screen regardless of scroll position. */
export default function Screen({ title, subtitle, wide, children, overlay, overlayHeight }: Props) {
  return (
    <View style={styles.page}>
      <ScrollView
        style={[styles.scroll, overlayHeight ? { marginBottom: overlayHeight } : null]}
        contentContainerStyle={[styles.content, { maxWidth: wide ? layout.maxWideWidth : layout.maxContentWidth }]}
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
