import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { space, theme } from '../../theme';

interface Props { label: string; value: string; tone?: 'default' | 'positive' | 'accent' }

/** A labelled figure (totals on dashboards). */
export default function SummaryCard({ label, value, tone = 'default' }: Props) {
  const color = tone === 'positive' ? theme.colors.success : tone === 'accent' ? theme.colors.primary : theme.colors.onSurface;
  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="labelLarge" style={styles.label}>{label}</Text>
        <Text variant="headlineSmall" style={[styles.value, { color }]}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 150, backgroundColor: theme.colors.surface },
  content: { gap: space(1), paddingVertical: space(2) },
  label: { color: theme.colors.secondary },
  value: { fontWeight: '700' },
});
