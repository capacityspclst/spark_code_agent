import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { layout, space, theme } from '../../theme';
import ScreenHeader from './ScreenHeader';

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
}

/** Page frame for every screen: background, page padding, a centered max-width column and an optional h1.
 * Anything passed via `overlay` is rendered as a sibling of the ScrollView (not inside its scrollable
 * content), so it stays fixed to the screen regardless of scroll position. */
export default function Screen({ title, subtitle, wide, children, overlay }: Props) {
  return (
    <View style={styles.page}>
      {title || subtitle ? <ScreenHeader title={title ?? ''} subtitle={subtitle} /> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          wide
            ? { maxWidth: layout.maxWideWidth, paddingHorizontal: space(3) }
            : { maxWidth: layout.maxContentWidth },
        ]}
      >
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
});
