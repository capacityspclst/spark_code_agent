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
   * amount (via its absolute `bottom` offset), so its visible/scrollable area ends *above* the
   * overlay. That guarantees list content can never render underneath the overlay - even when
   * the content is short and isn't actually scrolled - because the overlay occupies a strip of
   * the screen that the ScrollView simply doesn't draw into.
   */
  overlayInset?: number;
}

/** Page frame for every screen: background, page padding, a centered max-width column and an optional h1.
 * Anything passed via `overlay` is rendered as a sibling of the ScrollView (not inside its scrollable
 * content), so it stays fixed to the screen regardless of scroll position. */
export default function Screen({ title, subtitle, wide, children, overlay, overlayInset = 0 }: Props) {
  return (
    <View style={styles.page}>
      {/*
        The ScrollView is taken out of normal flow (`position: absolute`, pinned to all
        four edges of `page`) instead of being a plain `flex: 1` child. On React Native
        Web a `flex: 1` ScrollView nested inside other `flex: 1` containers can grow to
        fit its content (the classic missing `min-height: 0` flexbox issue) instead of
        being clipped to the available viewport, which would let the list's own height
        push the fixed-position `overlay` further down the page - right on top of the
        last list items - rather than keeping the overlay pinned to the physical bottom
        of the screen. Absolute positioning sizes the ScrollView purely from `page`'s own
        box (never from its content), guaranteeing the list is always confined above the
        `overlayInset` reserved strip and genuinely scrolls within it.
      */}
      <ScrollView
        style={[styles.scroll, overlayInset ? { bottom: overlayInset } : null]}
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
  page: { flex: 1, backgroundColor: theme.colors.background, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Use the design token spacing * 2 (16dp) for horizontal padding
  content: { width: '100%', alignSelf: 'center', paddingHorizontal: space(2), paddingBottom: space(16), gap: space(2) },
  header: { gap: space(1), marginBottom: space(1) },
  title: { fontWeight: '700', color: theme.colors.onSurface },
  subtitle: { color: theme.colors.secondary },
});
