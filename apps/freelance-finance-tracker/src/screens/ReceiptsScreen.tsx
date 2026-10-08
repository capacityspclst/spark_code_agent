import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { EmptyState, PrimaryButton, Screen } from '../components/ui';
import { getStore } from '../lib/storage';
import { Receipt } from '../lib/models';
import { getAllReceipts } from '../lib/receiptStore';
import ReceiptCard from '../components/ui/ReceiptCard';

export default function ReceiptsScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const load = async () => {
    setLoading(true);
    const recs = await getAllReceipts(getStore());
    setReceipts(recs);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }

  const empty = receipts.length === 0;

  return (
    <Screen title="Receipts">
      {empty ? (
        <EmptyState
          icon="receipt-outline"
          title="No receipts recorded"
          body="Tap the + button to add your first receipt."
          actionLabel="Add receipt"
          onAction={() => navigation.navigate('ReceiptEntry')}
        />
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReceiptCard receipt={item} />}
        />
      )}
    </Screen>
  );
}
