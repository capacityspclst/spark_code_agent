import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { FlatList, View } from 'react-native';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { EmptyState, PrimaryButton, Screen, SummaryCard } from '../components/ui';
import { getStore } from '../lib/storage';
import { Receipt } from '../lib/models';
import { getAllReceipts } from '../lib/receiptStore';
import { computeTotals } from '../lib/finance';
import ReceiptCard from '../components/ui/ReceiptCard';

type DashboardRouteParams = {
  snack?: string;
};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<Record<string, DashboardRouteParams>, string>>();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [snack, setSnack] = useState<string>('');

  const load = async () => {
    setLoading(true);
    const recs = await getAllReceipts(getStore());
    setReceipts(recs);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
      if (route.params?.snack) {
        setSnack(route.params.snack);
        // clear param to avoid repeat when navigating back
        navigation.setParams({ snack: undefined } as any);
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }

  const totals = computeTotals(receipts);

  const empty = receipts.length === 0;

  return (
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
          </View>
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
    </Screen>
  );
}
