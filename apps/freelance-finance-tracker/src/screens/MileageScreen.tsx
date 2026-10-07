// src/screens/MileageScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, ActivityIndicator, Card } from 'react-native-paper';
import { listMileage, MileageEntry } from '../lib/records';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { EmptyState } from '../components/ui/EmptyState';

export default function MileageScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MileageEntry[]>([]);

  const load = async () => {
    setLoading(true);
    const data = await listMileage();
    setEntries(data);
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
        <Text>Loading mileage…</Text>
      </Screen>
    );
  }

  const has = entries.length > 0;

  return (
    <Screen>
      {!has ? (
        <EmptyState
          title="No mileage entries"
          description="Tap the + button to add your first trip."
          actionLabel="Add mileage"
          onAction={() => navigation.navigate('MileageForm')}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text>{item.date} • {item.purpose}</Text>
                <Text>{item.miles} miles</Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
      <PrimaryButton onPress={() => navigation.navigate('MileageForm')}>Add mileage</PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8 },
});