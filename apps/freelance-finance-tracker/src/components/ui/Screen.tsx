import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { layout, space, theme } from '../../theme';

interface Props {
  title?: string;
  subtitle?: string;
  wide?: boolean; // dashboards use the wider column
  children: React.ReactNode;
}

/** Page frame for every screen: background, page padding, a centered max-width column and an optional h1. */
export default function Screen({ title, subtitle, wide, children }: Props) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, { maxWidth: wide ? layout.maxWideWidth : layout.maxContentWidth }]}>
      {title || subtitle ? (
        <View style={styles.header}>
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
  content: { width: '100%', alignSelf: 'center', padding: layout.pagePadding, paddingBottom: space(6), gap: space(2) },
  header: { gap: space(1), marginBottom: space(1) },
  title: { fontWeight: '700', color: theme.colors.onSurface },
  subtitle: { color: theme.colors.secondary },
});
