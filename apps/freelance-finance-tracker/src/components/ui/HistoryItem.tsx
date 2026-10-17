import React from 'react';
import { List } from 'react-native-paper';
import { View, Text } from 'react-native';
import { theme } from '../../theme';

export interface HistoryItemProps {
  date: string;
  kind: string;
  preview?: string;
}

export default function HistoryItem({ date, kind, preview }: HistoryItemProps) {
  return (
    <List.Item
      title={kind}
      description={date}
      right={preview ? props => <Text style={{ color: theme.colors.onSurfaceVariant }}>{preview}</Text> : undefined}
    />
  );
}
