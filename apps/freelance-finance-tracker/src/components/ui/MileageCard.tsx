import React from 'react';
import TransactionRow from './TransactionRow';
import type { MileageEntry } from '../../lib/models';

interface Props {
  entry: MileageEntry;
  onPress?: () => void;
}

/** Recent-activity / list row for a mileage entry: distance, purpose and date. */
export default function MileageCard({ entry, onPress }: Props) {
  const { date, miles, purpose } = entry;
  return (
    <TransactionRow
      amount={`${miles} mi`}
      date={date}
      category={purpose}
      typeLabel="Mileage"
      onPress={onPress}
    />
  );
}
