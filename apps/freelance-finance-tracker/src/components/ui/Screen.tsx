import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, space, theme } from '../../theme';

interface Props {
  title?: string;
  subtitle?: string;
  wide?: boolean; // dashboards use the wider column
  children: React.ReactNode;
}

/** Page frame for every screen: background, page padding, a centered max-width column and an optional h1. */
export default function Screen({ title, subtitle, wide, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { maxWidth: wide ? layout.maxWideWidth : layout.maxContentWidth, flexGrow: 1 },
      ]}
    >
      {title || subtitle ? (
        <View style={[styles.header, { paddingTop: insets.top + space(1) }]}>
          {title ? <Text variant="headlineMedium" accessibilityRole="header" style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text variant="bodyLarge" style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  // Use the design token spacing * 2 (16dp) for horizontal padding
  content: { width: '100%', alignSelf: 'center', paddingHorizontal: space(2), paddingBottom: space(6), gap: space(2) },
  header: { gap: space(1), marginBottom: space(2) },
  title: { fontWeight: '700', color: theme.colors.onSurface },
  subtitle: { color: theme.colors.secondary },
});
