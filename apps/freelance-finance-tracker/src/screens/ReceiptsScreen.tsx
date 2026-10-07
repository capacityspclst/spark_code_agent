// src/screens/ReceiptsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, ActivityIndicator, Button, Card } from 'react-native-paper';
import { listReceipts, Receipt } from '../lib/records';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { EmptyState } from '../components/ui/EmptyState';

export default function ReceiptsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const load = async () => {
    setLoading(true);
    const data = await listReceipts();
    setReceipts(data);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    load();
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
        <Text>Loading receipts…</Text>
      </Screen>
    );
  }

  const has = receipts.length > 0;

  return (
    <Screen>
      {!has ? (
        <EmptyState
          title="No receipts"
          description="You haven’t added any receipts. Tap the + button to add one."
          actionLabel="Add receipt"
          onAction={() => navigation.navigate('ReceiptForm')}
        />
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text>{item.category} • {item.date}</Text>
                <Text>${item.amount.toFixed(2)}</Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
      <PrimaryButton onPress={() => navigation.navigate('ReceiptForm')}>Add receipt</PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8 },
});
