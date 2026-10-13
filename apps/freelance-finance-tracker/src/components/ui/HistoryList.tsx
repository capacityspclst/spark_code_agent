import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import type { LedgerEntry } from '../../lib/ledger';

/** Simple list of ledger entries for a record. */
export default function HistoryList({ entries }: { entries: LedgerEntry[] }) {
  if (!entries || entries.length === 0) {
    return <Text>No history found.</Text>;
  }
  const renderItem = ({ item }: { item: LedgerEntry }) => (
    <Card style={{ marginVertical: 4, padding: 8 }}>
      <View>
        <Text>{item.at}</Text>
        <Text>{item.kind}</Text>
        <Text>{JSON.stringify(item.data)}</Text>
      </View>
    </Card>
  );
  return <FlatList data={entries} keyExtractor={(i) => i.seq.toString()} renderItem={renderItem} />;
}
