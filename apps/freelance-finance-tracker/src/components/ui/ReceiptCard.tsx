import React from 'react';
import TransactionRow from './TransactionRow';
import type { Receipt } from '../../lib/models';

interface Props {
  receipt: Receipt;
  onPress?: () => void;
}

/** Recent-activity / list row for a receipt: amount, note, date · category, type chip
 * and a photo thumbnail (or paperclip icon when no photo was attached). */
export default function ReceiptCard({ receipt, onPress }: Props) {
  const { amount, date, category, type, notes, photoUri } = receipt;
  return (
    <TransactionRow
      amount={`$${amount.toFixed(2)}`}
      note={notes}
      date={date}
      category={category}
      typeLabel={type === 'income' ? 'Income' : 'Expense'}
      photoUri={photoUri}
      onPress={onPress}
    />
  );
}
