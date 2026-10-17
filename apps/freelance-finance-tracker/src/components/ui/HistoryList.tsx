import React from 'react';
import { FlatList } from 'react-native';
import HistoryItem, { HistoryItemProps } from './HistoryItem';

interface Props {
  entries: HistoryItemProps[];
}

export default function HistoryList({ entries }: Props) {
  return (
    <FlatList
      data={entries}
      keyExtractor={(item, index) => `${item.kind}-${index}`}
      renderItem={({ item }) => <HistoryItem {...item} />}
    />
  );
}
