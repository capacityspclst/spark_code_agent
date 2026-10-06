import React from 'react';
import { Card, Text } from 'react-native-paper';
import { theme } from '../../theme';

type Props = {
  title: string;
  value: string;
  accessibilityLabel?: string;
};

export default function SummaryCard({ title, value, accessibilityLabel }: Props) {
  return (
    <Card style={styles.card} accessibilityLabel={accessibilityLabel}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        <Text variant="headlineMedium" style={styles.value}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = {
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    ...theme.elevation.card,
  },
  title: {
    color: theme.colors.onSurface,
    ...theme.typography.titleMedium,
  },
  value: {
    color: theme.colors.onSurface,
    ...theme.typography.headlineMedium,
    marginTop: theme.spacing.xs,
  },
};