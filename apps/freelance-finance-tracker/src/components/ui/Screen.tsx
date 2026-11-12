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
   * Extra bottom padding (dp) to reserve on the *scrollable content* (e.g. FAB stack height +
   * snackbar height + safe-area inset), so that once the user scrolls all the way to the end,
   * the last list item always clears the fixed `overlay` (per DESIGN.md: "Bottom padding on the
   * ScrollView = FAB height + tab bar height + safe-area inset ... to guarantee the last list
   * item is never hidden behind the FABs"). The ScrollView itself still spans the *whole* page
   * (it is not shrunk/clipped to end above the overlay) so the list can genuinely be scrolled
   * past/underneath the floating buttons, per the requirement that it must be scrollable past
   * them rather than stopping short. The `overlay` is rendered on top with a higher `zIndex` so
   * it is always visible above whatever list content is currently scrolled behind it.
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
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { maxWidth: wide ? layout.maxWideWidth : layout.maxContentWidth },
          overlayInset ? { paddingBottom: Math.max(space(16), overlayInset) } : null,
        ]}
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
      {/* Rendered after (on top of) the ScrollView, so it stays visually above any list
          content the user has scrolled underneath it. */}
      <View style={styles.overlay} pointerEvents="box-none">
        {overlay}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Sits on top of the ScrollView (later in paint order) so fixed-position overlay content
  // (FABs, snackbars) is never covered by list items scrolled underneath it. `box-none`
  // lets touches pass through the empty parts of this layer to the ScrollView below.
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 },
  // Use the design token spacing * 2 (16dp) for horizontal padding
  content: { width: '100%', alignSelf: 'center', paddingHorizontal: space(2), paddingBottom: space(16), gap: space(2) },
  header: { gap: space(1), marginBottom: space(1) },
  title: { fontWeight: '700', color: theme.colors.onSurface },
  subtitle: { color: theme.colors.secondary },
});
