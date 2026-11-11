import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { EmptyState, PrimaryButton, Screen } from '../components/ui';
import { getStore } from '../lib/storage';
import { Receipt } from '../lib/models';
import { getAllReceipts } from '../lib/receiptStore';
import ReceiptCard from '../components/ui/ReceiptCard';
import { theme, space } from '../theme';
import { TAB_BAR_HEIGHT } from '../navigation/constants';

export default function ReceiptsScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
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
    <Screen
      title="Receipts"
      overlay={
        <FAB
          icon="plus"
          label="Add receipt"
          onPress={() => navigation.navigate('ReceiptEntry')}
          style={[styles.fab, { backgroundColor: theme.colors.primaryContainer, bottom: TAB_BAR_HEIGHT + insets.bottom + space(2) }]}
          color={theme.colors.onPrimaryContainer}
        />
      }
    >
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
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  );
}

const styles = {
  fab: { position: 'absolute' as const, right: space(2) },
  listContent: { paddingBottom: space(12) },
};
