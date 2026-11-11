import React from 'react';
import { Card, Text, Chip } from 'react-native-paper';
import { View, StyleSheet, Image } from 'react-native';
import { space, theme } from '../../theme';
import type { Receipt } from '../../lib/models';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  receipt: Receipt;
  onPress?: () => void;
}

/** Transaction row for a receipt, matching design specifications. */
export default function ReceiptCard({ receipt, onPress }: Props) {
  const { amount, date, category, type, notes, photoUri } = receipt;
  // Format date as D MMM YYYY (e.g., "11 Nov 2026").
  const formattedDate = new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Card mode="outlined" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        {/* Top row: amount and type chip */}
        <View style={styles.topRow}>
          <View style={styles.amountColumn}>
            <Text variant="titleMedium" style={styles.amount}>${amount.toFixed(2)}</Text>
            {notes ? <Text variant="bodyMedium" style={styles.note}>{notes}</Text> : null}
          </View>
          <Chip
            compact
            mode="flat"
            style={styles.typeChip}
            textStyle={{ fontSize: 12 }}
            labelStyle={{ color: theme.colors.onSecondaryContainer }}
            theme={{ colors: { surface: theme.colors.secondaryContainer } }}
          >
            {type === 'income' ? 'Income' : 'Expense'}
          </Chip>
        </View>
        {/* Date • Category line */}
        <Text variant="bodySmall" style={styles.dateCategory}>{formattedDate} \u2022 {category}</Text>
        {/* Photo thumbnail if present */}
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel="Receipt photo" />
        ) : (
          <MaterialCommunityIcons name="paperclip" size={16} color={theme.colors.onSurfaceVariant} style={styles.photoIcon} />
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space(2), backgroundColor: theme.colors.surface },
  content: { gap: space(1) },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountColumn: { flex: 1 },
  amount: { fontWeight: '600' },
  note: { color: theme.colors.onSurfaceVariant },
  typeChip: { backgroundColor: theme.colors.secondaryContainer, borderColor: 'transparent' },
  dateCategory: { color: theme.colors.onSurfaceVariant },
  photo: { width: 40, height: 40, borderRadius: 8, marginTop: space(1) },
  photoIcon: { marginTop: space(1) },
});