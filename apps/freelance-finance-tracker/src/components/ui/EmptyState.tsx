// src/components/ui/EmptyState.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { Text } from 'react-native-paper';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => (
  <View style={styles.container}>
    <Text variant="titleLarge" style={styles.title}>{title}</Text>
    <Text variant="bodyMedium" style={styles.desc}>{description}</Text>
    {actionLabel && onAction && (
      <PrimaryButton onPress={onAction}>{actionLabel}</PrimaryButton>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 40 },
  title: { marginBottom: 8 },
  desc: { marginBottom: 16, textAlign: 'center' },
});