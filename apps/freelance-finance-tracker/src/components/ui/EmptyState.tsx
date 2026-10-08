// src/components/ui/EmptyState.tsx
import React from 'react';
import { View } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => (
  <View style={{ alignItems: 'center', marginTop: 32 }}>
    <Card style={{ padding: 16, maxWidth: 300 }}>
      <Title>{title}</Title>
      <Paragraph>{description}</Paragraph>
      {actionLabel && onAction && <Button onPress={onAction}>{actionLabel}</Button>}
    </Card>
  </View>
);
