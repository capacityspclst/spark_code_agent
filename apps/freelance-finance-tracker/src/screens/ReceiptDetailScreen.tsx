import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Screen, PrimaryButton, EmptyState } from '../components/ui';
import { getStore } from '../lib/storage';
import { getAllReceipts } from '../lib/receiptStore';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';

export default function ReceiptDetailScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const { recordId } = route.params ?? {};
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const all = await getAllReceipts(getStore());
      const r = all.find((r) => r.id === recordId);
      setReceipt(r);
      setLoading(false);
    })();
  }, [recordId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading receipt"/>;
  }

  if (!receipt) {
    return (
      <Screen title="Receipt detail">
        <EmptyState
+          icon="receipt-outline"
          title="Not found"
          body="Receipt not found"
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Receipt detail">
      <PrimaryButton label="Edit" onPress={() => navigation.navigate('ReceiptEntry' as any)} />
      <PrimaryButton label="History" onPress={() => navigation.navigate('ReceiptHistory' as any, { recordId })} />
    </Screen>
  );
}
