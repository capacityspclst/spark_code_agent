// src/components/ui/SummaryCard.tsx
import React from 'react';
import { Card, Text, useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => {
  const theme: any = useTheme();
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.row}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {title}
            </Text>
            <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
              {value}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  textContainer: {},
});
