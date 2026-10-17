import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Screen, EmptyState } from '../components/ui';
import { getLedger } from '../lib/ledgerHelpers';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import HistoryList from '../components/ui/HistoryList';
import { LedgerEntry } from '../lib/ledger';
import { getStore } from '../lib/storage';

export default function MileageHistoryScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const { recordId } = route.params ?? {};
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    (async () => {
      const ledger = await getLedger(getStore());
      const filtered = ledger.filter(e => e.recordId === recordId && e.kind.startsWith('mileage.'));
      setEntries(filtered as any);
      setLoading(false);
    })();
  }, [recordId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading history..." />;
  }

  if (entries.length === 0) {
    return (
      <Screen title="Mileage history">
        <EmptyState
          icon="history"
          title="No changes yet"
          body="This mileage entry has never been edited."
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const items = entries.map(e => ({ date: e.at, kind: e.kind, preview: undefined }));
  return (
    <Screen title="Mileage history">
      <HistoryList entries={items} />
    </Screen>
  );
}
