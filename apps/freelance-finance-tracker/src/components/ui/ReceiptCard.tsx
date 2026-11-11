import React from 'react';
import { Card, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { space, theme } from '../../theme';
import type { Receipt } from '../../lib/models';

interface Props {
  receipt: Receipt;
  onPress?: () => void;
}

/** Simple card to display a receipt. */
export default function ReceiptCard({ receipt, onPress }: Props) {
  const { amount, date, category, type, notes, photoUri } = receipt;
  return (
    <Card mode="elevated" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <Text variant="titleMedium" style={styles.amount}>${amount.toFixed(2)}</Text>
          <Text variant="labelLarge" style={styles.type}>{type === 'income' ? 'Income' : 'Expense'}</Text>
        </View>
        <Text variant="bodyMedium" style={styles.detail}>Date: {date}</Text>
        <Text variant="bodyMedium" style={styles.detail}>Category: {category}</Text>
        {notes ? <Text variant="bodySmall" style={styles.notes}>{notes}</Text> : null}
        {photoUri ? <Text variant="bodySmall" style={styles.photo}>[photo attached]</Text> : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space(2), backgroundColor: theme.colors.surface },
  content: { gap: space(1) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontWeight: '600' },
  type: { color: theme.colors.secondary },
  detail: { color: theme.colors.onSurfaceVariant },
  notes: { marginTop: space(1), color: theme.colors.onSurface },
  // Use secondary color for placeholder text instead of undefined placeholder token
  photo: { marginTop: space(1), fontStyle: 'italic', color: theme.colors.secondary },
});
