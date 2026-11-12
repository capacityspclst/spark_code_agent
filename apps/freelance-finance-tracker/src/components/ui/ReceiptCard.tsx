import React from 'react';
import { Card, Text, Chip } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { space, theme } from '../../theme';
import type { Receipt } from '../../lib/models';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
          <Text variant="titleLarge" style={styles.amount}>${amount.toFixed(2)}</Text>
          <Chip
            compact
            mode="flat"
            textStyle={{ fontSize: 12, color: theme.colors.onSecondaryContainer }}
            style={styles.typeChip}
            accessibilityLabel={type === 'income' ? 'Income' : 'Expense'}
            accessibilityRole="text"
          >
            {type === 'income' ? 'Income' : 'Expense'}
          </Chip>
        </View>
        <Text variant="bodySmall" style={styles.detail}>${date} · {category}</Text>
        {notes ? <Text variant="bodyMedium" style={styles.notes}>{notes}</Text> : null}
        {photoUri ? (
          <View style={styles.photoRow}>
            <MaterialCommunityIcons name="paperclip" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={styles.photo}>Photo attached</Text>
          </View>
        ) : null}
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
  typeChip: { backgroundColor: theme.colors.secondaryContainer },
  detail: { color: theme.colors.onSurfaceVariant },
  notes: { marginTop: space(1), color: theme.colors.onSurface },
  photoRow: { flexDirection: 'row', alignItems: 'center', marginTop: space(1), gap: space(1) },
  photo: { marginLeft: space(0.5) },
});
