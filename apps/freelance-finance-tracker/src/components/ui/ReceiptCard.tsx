import React from 'react';
import { Card, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { space, theme } from '../../theme';
import type { Receipt } from '../../lib/models';
import PrimaryButton from './PrimaryButton';

interface Props {
  receipt: Receipt;
  onPress?: () => void;
}

/** Simple card to display a receipt with a pressable amount button. */
export default function ReceiptCard({ receipt, onPress }: Props) {
  const { amount, date, category, type, notes, photoUri } = receipt;
  return (
    <Card mode="elevated" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <PrimaryButton label={amount.toFixed(2)} onPress={onPress} variant="text" />
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
  type: { color: theme.colors.secondary },
  detail: { color: theme.colors.onSurfaceVariant },
  notes: { marginTop: space(1), color: theme.colors.onSurface },
  photo: { marginTop: space(1), fontStyle: 'italic', color: theme.colors.secondary },
});
