import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import { FlatList, View } from 'react-native';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { EmptyState, Screen, SummaryCard } from '../components/ui';
import { getStore } from '../lib/storage';
import { Receipt, MileageEntry } from '../lib/models';
import { getAllReceipts } from '../lib/receiptStore';
import { getAllMileageEntries } from '../lib/mileageStore';
import { computeTotals } from '../lib/finance';
import { totalMileageDeduction, DEFAULT_MILEAGE_RATE } from '../lib/mileage';
import ReceiptCard from '../components/ui/ReceiptCard';
import { consumeSnack } from '../lib/uiState';
import SimpleAddButtons from '../components/ui/SimpleAddButtons';

type DashboardRouteParams = {};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<Record<string, DashboardRouteParams>, string>>();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([]);
  const [snack, setSnack] = useState<string>('');

  const load = async () => {
    setLoading(true);
    const recs = await getAllReceipts(getStore());
    const miles = await getAllMileageEntries(getStore());
    setReceipts(recs);
    setMileageEntries(miles);
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
  const mileageDeduction = totalMileageDeduction(mileageEntries, DEFAULT_MILEAGE_RATE);

  const empty = receipts.length === 0 && mileageEntries.length === 0;

  return (
    <Screen title="Dashboard" wide>
      {empty ? (
        <EmptyState
          icon="inbox-outline"
          title="Nothing here yet"
          body="Add a receipt or mileage entry to start tracking your finances."
        />
      ) : (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <SummaryCard label="Income" value={`$${totals.income.toFixed(2)}`} />
            <SummaryCard label="Expenses" value={`$${totals.expenses.toFixed(2)}`} />
            <SummaryCard label="Mileage deduction" value={`$${mileageDeduction.toFixed(2)}`} />
            <SummaryCard label="Estimated tax" value="$0.00" />
          </View>
          <Text variant="titleMedium" style={{ marginTop: 8, marginBottom: 4 }}>Recent activity</Text>
          <FlatList
            data={receipts.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ReceiptCard receipt={item} />}
          />
        </View>
      )}
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
      <SimpleAddButtons />
    </Screen>
  );
}
