import React from 'react';
import { Card, Text } from 'react-native-paper';
import { theme } from '../../theme';

type Props = {
  title: string;
  value: string;
};

export default function SummaryCard({ title, value }: Props) {
  return (
    <Card style={[styles.card]} mode="elevated">
      <Card.Content>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
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
  title: { ...theme.typography.h3, color: theme.colors.onSurface },
  value: { ...theme.typography.h2, color: theme.colors.onSurface, marginTop: theme.spacing.sm },
};