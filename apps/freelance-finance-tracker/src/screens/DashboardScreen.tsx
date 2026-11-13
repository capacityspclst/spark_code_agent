import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native-paper';
import { FlatList, View } from 'react-native';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { EmptyState, Screen, SummaryCard } from '../components/ui';
import { getStore } from '../lib/storage';
import { Receipt, MileageEntry } from '../lib/models';
import { getAllReceipts } from '../lib/receiptStore';
import { getAllMileageEntries } from '../lib/mileageStore';
import { computeTotals } from '../lib/finance';
import { totalMileageDeduction } from '../lib/mileage';
import { getTaxRate } from '../lib/settings';
import ReceiptCard from '../components/ui/ReceiptCard';
import { consumeSnack } from '../lib/uiState';
import SimpleAddButtons from '../components/ui/SimpleAddButtons';
import ReceiptSavedSnackbar from '../components/ui/ReceiptSavedSnackbar';
import { space } from '../theme';

type DashboardRouteParams = {};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<Record<string, DashboardRouteParams>, string>>();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([]);
  const [mileageDeduction, setMileageDeduction] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [snack, setSnack] = useState<string>('');

  const load = async () => {
    setLoading(true);
    const store = getStore();
    const recs = await getAllReceipts(store);
    const miles = await getAllMileageEntries(store);
    setReceipts(recs);
    setMileageEntries(miles);
    const deduction = await totalMileageDeduction(miles);
    setMileageDeduction(deduction);
    const taxRate = await getTaxRate(store);
    const totals = computeTotals(recs);
    const taxable = Math.max(0, totals.income - totals.expenses - deduction);
    setTax(taxable * taxRate);
    setLoading(false);
    const pending = consumeSnack();
    if (pending) setSnack(pending);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }

  const totals = computeTotals(receipts);

  const empty = receipts.length === 0 && mileageEntries.length === 0;

  // Wrap content in a relative container so absolute overlays can sit on top without scrolling.
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <Screen title="Dashboard" wide>
        {empty ? (
          <EmptyState
            icon="inbox-outline"
            title="Nothing here yet"
            body="Add a receipt or mileage entry to start tracking your finances."
            actionLabel="Add receipt"
            onAction={() => navigation.navigate('ReceiptEntry')}
          />
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <SummaryCard label="Income" value={`$${totals.income.toFixed(2)}`} />
              <SummaryCard label="Expenses" value={`$${totals.expenses.toFixed(2)}`} />
              <SummaryCard label="Mileage deduction" value={`$${mileageDeduction.toFixed(2)}`} />
              <SummaryCard label="Estimated tax" value={`$${tax.toFixed(2)}`} />
            </View>
            <Text variant="titleMedium" style={{ marginTop: 8, marginBottom: 4 }}>Recent activity</Text>
            <FlatList
              data={receipts.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ReceiptCard receipt={item} />}
              // Add bottom padding so the last rows are not hidden behind the overlay buttons.
              contentContainerStyle={{ paddingBottom: space(16) }}
              accessibilityRole="list"
            />
          </View>
        )}
        {snack ? (
          <ReceiptSavedSnackbar visible={true} onDismiss={() => setSnack('')} message={snack} />
        ) : null}
      </Screen>
      {/* Overlay buttons that stay fixed while scrolling. */}
      <SimpleAddButtons />
    </View>
  );
}
