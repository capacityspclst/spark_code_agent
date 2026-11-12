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
import { DASHBOARD_OVERLAY_RESERVED_HEIGHT } from '../navigation/constants';

type DashboardRouteParams = {};

// Bottom padding for the recent-activity scroll area: the full height reserved for the fixed
// bottom overlay (tab bar + SimpleAddButtons stack + ReceiptSavedSnackbar + buffer), per
// DESIGN.md, so the last list item is never hidden behind it. The live safe-area inset is
// added on top of this at render time (see `overlayHeight` below).
export const recentActivityContainerStyle = { paddingBottom: DASHBOARD_OVERLAY_RESERVED_HEIGHT };

export default function DashboardScreen() {
  // Lazy load navigation and route hooks to avoid side effects during static analysis
  const { useNavigation, useRoute } = require('@react-navigation/native');
  const navigation:any = useNavigation();
  const route:any = useRoute();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([]);
  const [mileageDeduction, setMileageDeduction] = useState<number>(0);
  const [mileageRate, setMileageRate] = useState<number>(0);
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
    const rate = await getMileageRate(store);
    setMileageRate(rate);
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

  // The FABs and the "saved" snackbar are rendered via Screen's `overlay` prop, which
  // places them as siblings of the ScrollView (not inside its scrollable content). That
  // way they stay fixed to the bottom of the screen and never scroll over/under the
  // recent-activity list, and the list can never scroll past them either.
  return (
    <Screen
      title="Dashboard"
      wide
      overlayHeight={DASHBOARD_OVERLAY_RESERVED_HEIGHT + insets.bottom}
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
              receipts directly avoids that entirely, while recentActivityContainerStyle still
              reserves enough bottom space for the last item to clear the overlay. */}
          <View style={recentActivityContainerStyle}>
            {receipts.map((item) => (
              <ReceiptCard key={`receipt-${item.id}`} receipt={item} />
            ))}
            {mileageEntries.map((item) => (
              <MileageCard
                key={`mileage-${item.id}`}
                entry={item}
                amount={calculateMileageDeduction(item.miles, mileageRate)}
              />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}
