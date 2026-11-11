import React from 'react';
import { Card, Chip, Icon, Text } from 'react-native-paper';
import { Image, StyleSheet, View } from 'react-native';
import { space, theme } from '../../theme';

interface Props {
  amount: string; // pre-formatted, e.g. "$42.10" or "12 mi"
  note?: string; // secondary line, e.g. notes or purpose
  date: string; // ISO date string (YYYY-MM-DD)
  category: string;
  typeLabel: string; // e.g. "Expense" / "Income"
  photoUri?: string;
  onPress?: () => void;
}

/** Formats an ISO date (YYYY-MM-DD) as "D MMM YYYY", e.g. "11 Nov 2026". */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Shared row used by ReceiptCard/MileageCard to render a single recent-activity /
 * list entry: a leading photo thumbnail (or paperclip icon), the amount and note on
 * the left, a type chip top-right, and a "date · category" caption line. */
export default function TransactionRow({ amount, note, date, category, typeLabel, photoUri, onPress }: Props) {
  return (
    <Card mode="outlined" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.leading}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.thumb} accessibilityLabel="Receipt photo" />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Icon source="paperclip" size={16} color={theme.colors.onSurfaceVariant} />
            </View>
          )}
        </View>
        <View style={styles.main}>
          <View style={styles.row}>
            <Text variant="titleMedium" style={styles.amount}>{amount}</Text>
            <Chip compact mode="flat" style={styles.chip} textStyle={styles.chipText}>
              {typeLabel}
            </Chip>
          </View>
          {note ? <Text variant="bodyMedium" style={styles.note}>{note}</Text> : null}
          <Text variant="bodySmall" style={styles.caption}>{formatDate(date)} · {category}</Text>
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
    elevation: 0,
  },
  content: { flexDirection: 'row', gap: space(1.5), paddingVertical: space(1) },
  leading: { justifyContent: 'flex-start' },
  thumb: { width: 40, height: 40, borderRadius: 8 },
  thumbPlaceholder: { backgroundColor: theme.colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, gap: space(0.5) },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space(1) },
  amount: { color: theme.colors.onSurface },
  chip: { backgroundColor: theme.colors.secondaryContainer },
  chipText: { fontSize: 12, color: theme.colors.onSecondaryContainer },
  note: { color: theme.colors.onSurfaceVariant },
  caption: { color: theme.colors.onSurfaceVariant },
});
