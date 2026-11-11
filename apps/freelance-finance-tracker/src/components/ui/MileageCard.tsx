import React from 'react';
import TransactionRow from './TransactionRow';
import type { MileageEntry } from '../../lib/models';

interface Props {
  entry: MileageEntry;
  onPress?: () => void;
}

/** Row used to display a mileage entry in a list. */
export default function MileageCard({ entry, onPress }: Props) {
  const { date, miles, purpose } = entry;
  return (
    <TransactionRow
      amount={`${miles} mi`}
      date={date}
      category={purpose}
      chipLabel="Mileage"
      onPress={onPress}
    />
  );
}
