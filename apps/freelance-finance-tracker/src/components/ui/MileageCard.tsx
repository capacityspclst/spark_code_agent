import React from 'react';
import { Card, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { space, theme } from '../../theme';
import type { MileageEntry } from '../../lib/models';

interface Props {
  entry: MileageEntry;
  /** Dollar deduction for this entry (miles * mileage rate). When provided, shown as the
   * row's headline amount so mileage rows match receipt rows, which always lead with a
   * dollar amount. */
  amount?: number;
  onPress?: () => void;
}

/** Simple card to display a mileage entry. */
export default function MileageCard({ entry, amount, onPress }: Props) {
  const { date, miles, purpose } = entry;
  return (
    <Card mode="elevated" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <Text variant="titleMedium" style={styles.miles}>
            {typeof amount === 'number' ? `$${amount.toFixed(2)}` : `${miles} mi`}
          </Text>
          <Text variant="labelLarge" style={styles.purpose}>Mileage</Text>
        </View>
        <Text variant="bodyMedium" style={styles.detail}>Date: {date}</Text>
        <Text variant="bodyMedium" style={styles.detail}>{miles} mi{purpose ? ` \u2013 ${purpose}` : ''}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space(2), backgroundColor: theme.colors.surface },
  content: { gap: space(1) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miles: { fontWeight: '600' },
  purpose: { color: theme.colors.secondary },
  detail: { color: theme.colors.onSurfaceVariant },
});
