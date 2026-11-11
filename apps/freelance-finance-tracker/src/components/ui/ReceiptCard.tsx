import React from 'react';
import TransactionRow from './TransactionRow';
import type { Receipt } from '../../lib/models';

interface Props {
  receipt: Receipt;
  onPress?: () => void;
}

/** Row used to display a receipt in a list (recent activity, Receipts tab, …). */
export default function ReceiptCard({ receipt, onPress }: Props) {
  const { amount, date, category, type, notes, photoUri } = receipt;
  return (
    <TransactionRow
      amount={`$${amount.toFixed(2)}`}
      note={notes}
      date={date}
      category={category}
      chipLabel={type === 'income' ? 'Income' : 'Expense'}
      photoUri={photoUri}
      onPress={onPress}
    />
  );
}
