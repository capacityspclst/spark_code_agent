import React from 'react';
import { Card, Chip, Text } from 'react-native-paper';
import { Image, StyleSheet, View } from 'react-native';
import { space, theme } from '../../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats an ISO date string (YYYY-MM-DD) as "D MMM YYYY", e.g. "11 Nov 2026". */
export function formatRowDate(date: string): string {
  const parts = String(date).split('-');
  if (parts.length !== 3) return date;
  const [y, m, d] = parts;
  const monthIndex = Number(m) - 1;
  const month = MONTHS[monthIndex] ?? m;
  return `${Number(d)} ${month} ${y}`;
}

interface Props {
  /** Leading, large figure (amount, miles, …). */
  amount: string;
  /** Short label under the amount (notes, purpose, …). */
  note?: string;
  date: string;
  category: string;
  /** Top-right chip label, e.g. "Expense" / "Income". */
  chipLabel: string;
  photoUri?: string;
  onPress?: () => void;
}

/** Shared row layout for recent-activity / list cards (receipts, mileage): outlined
 * Material 3 card with a clear visual hierarchy between the amount, note and the
 * date/category metadata, and a flat chip (instead of plain colored text) for the type. */
export default function TransactionRow({ amount, note, date, category, chipLabel, photoUri, onPress }: Props) {
  return (
    <Card mode="outlined" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <View style={styles.leading}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.thumbnail} />
            ) : null}
            <View style={styles.textColumn}>
              <Text variant="titleMedium" style={styles.amount}>{amount}</Text>
              {note ? <Text variant="bodyMedium" style={styles.note}>{note}</Text> : null}
              <View style={styles.metaRow}>
                <Text variant="bodySmall" style={styles.meta}>
                  {formatRowDate(date)} · {category}
                </Text>
              </View>
            </View>
          </View>
          <Chip compact mode="flat" style={styles.chip} textStyle={styles.chipText}>
            {chipLabel}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: space(2),
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outlineVariant,
  },
  content: { padding: space(1) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  leading: { flexDirection: 'row', gap: space(1), flexShrink: 1 },
  thumbnail: { width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant },
  textColumn: { gap: 2, flexShrink: 1 },
  amount: { color: theme.colors.onSurface },
  note: { color: theme.colors.onSurfaceVariant },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta: { color: theme.colors.onSurfaceVariant },
  chip: { backgroundColor: theme.colors.secondaryContainer },
  chipText: { fontSize: 12, color: theme.colors.onSecondaryContainer },
});
