import React from 'react';
import { Card, List, Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import type { MileageEntry } from '../../lib/models';

interface Props {
  entry: MileageEntry;
  onPress?: () => void;
}

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Simple card to display a mileage entry. */
export default function MileageCard({ entry, onPress }: Props) {
  const { date, miles, purpose } = entry;
  return (
    <Card mode="outlined" style={styles.card} onPress={onPress}>
      <List.Item
        title={purpose}
        titleNumberOfLines={1}
        description={`${miles} mi \u00b7 ${formatDate(date)}`}
        descriptionStyle={styles.description}
        right={() => <Text variant="titleMedium" style={styles.miles}>{miles} mi</Text>}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, elevation: 0 },
  description: { color: theme.colors.onSurfaceVariant },
  miles: { alignSelf: 'center', marginRight: 8 },
});
