import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native-paper';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Navigation imports are required lazily inside the component to avoid side effects during static import
import { EmptyState, Screen, SummaryCard } from '../components/ui';
import { getStore } from '../lib/storage';
import { Receipt, MileageEntry } from '../lib/models';
import { getAllReceipts } from '../lib/receiptStore';
import { getAllMileageEntries } from '../lib/mileageStore';
import { computeTotals } from '../lib/finance';
import { totalMileageDeduction, calculateMileageDeduction } from '../lib/mileage';
import { getTaxRate, getMileageRate } from '../lib/settings';
import ReceiptCard from '../components/ui/ReceiptCard';
import MileageCard from '../components/ui/MileageCard';
import { consumeSnack } from '../lib/uiState';
import SimpleAddButtons from '../components/ui/SimpleAddButtons';
import ReceiptSavedSnackbar from '../components/ui/ReceiptSavedSnackbar';
import { space } from '../theme';
import { OVERLAY_RESERVED_HEIGHT } from '../navigation/constants';

type DashboardRouteParams = {};

// Bottom padding for the recent-activity scroll area: FAB height (56dp) + tab bar
// height (56dp) + safe-area inset (~16dp) as specified in DESIGN.md, so the last
// list item is never hidden behind the fixed FABs/tab bar overlay.
export const recentActivityContainerStyle = { paddingBottom: Math.max(space(16), OVERLAY_RESERVED_HEIGHT) };

type ActivityItem =
  | { kind: 'receipt'; id: string; date: string; receipt: Receipt }
  | { kind: 'mileage'; id: string; date: string; entry: MileageEntry; amount: number };

export default function DashboardScreen() {
  // Lazy load navigation and route hooks to avoid side effects during static analysis
  const { useNavigation, useRoute } = require('@react-navigation/native');
  const navigation:any = useNavigation();
  const route:any = useRoute();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([]);
  const [mileageRate, setMileageRateState] = useState<number>(0);
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
    const rate = await getMileageRate(store);
    setMileageRateState(rate);
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

  // Recent activity combines both receipts and mileage entries (every activity row must show
  // its amount: a dollar figure for receipts, and the dollar deduction for mileage entries),
  // most recent first.
  const activity: ActivityItem[] = [
    ...receipts.map((receipt) => ({ kind: 'receipt' as const, id: receipt.id, date: receipt.date, receipt })),
    ...mileageEntries.map((entry) => ({
      kind: 'mileage' as const,
      id: entry.id,
      date: entry.date,
      entry,
      amount: calculateMileageDeduction(entry.miles, mileageRate),
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // The FABs and the "saved" snackbar are rendered via Screen's `overlay` prop, which
  // places them as siblings of the ScrollView (not inside its scrollable content). That
  // way they stay fixed to the bottom of the screen and never scroll over/under the
  // recent-activity list. `overlayInset` shrinks the ScrollView's own viewport by the
  // overlay's full reserved height (FABs + snackbar + tab bar + safe-area inset), so no
  // list item can ever render underneath the fixed overlay, whether or not the list is
  // actually scrolled.
  return (
    <Screen
      title="Dashboard"
      wide
      overlayInset={OVERLAY_RESERVED_HEIGHT + insets.bottom}
      overlay={
        <>
          {snack ? (
            <ReceiptSavedSnackbar visible={true} onDismiss={() => setSnack('')}>
              {snack}
            </ReceiptSavedSnackbar>
          ) : null}
          <SimpleAddButtons />
        </>
      }
    >
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
          {/* Rendered directly inside the Screen's own ScrollView (not as a nested
              FlatList/VirtualizedList) per DESIGN.md: "Recent activity list – inside the
              ScrollView." Nesting a FlatList inside a ScrollView is unreliable (its height can
              collapse to the viewport instead of growing with content), which can make the
              fixed-position FABs/snackbar appear to sit on top of list items. Mapping the
              combined receipts + mileage entries directly avoids that entirely, while
              recentActivityContainerStyle and the Screen's overlayInset both reserve enough
              bottom space for the last item to clear the overlay. */}
          <View style={recentActivityContainerStyle}>
            {activity.map((item) =>
              item.kind === 'receipt' ? (
                <ReceiptCard key={`receipt-${item.id}`} receipt={item.receipt} />
              ) : (
                <MileageCard key={`mileage-${item.id}`} entry={item.entry} amount={item.amount} />
              )
            )}
          </View>
        </View>
      )}
    </Screen>
  );
}
