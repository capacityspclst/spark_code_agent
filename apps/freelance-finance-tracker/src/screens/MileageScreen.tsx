import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { EmptyState, PrimaryButton, Screen } from '../components/ui';
import { getStore } from '../lib/storage';
import { MileageEntry } from '../lib/models';
import { getAllMileageEntries } from '../lib/mileageStore';
import MileageCard from '../components/ui/MileageCard';

export default function MileageScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MileageEntry[]>([]);

  const load = async () => {
    setLoading(true);
    const data = await getAllMileageEntries(getStore());
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }

  const empty = entries.length === 0;

  return (
    <Screen title="Mileage">
      {empty ? (
        <EmptyState
          icon="run-outline"
          title="No mileage logged"
          body="Tap the + button to log your first mileage entry."
          actionLabel="Add mileage"
          onAction={() => navigation.navigate('MileageEntry')}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MileageCard entry={item} />}
        />
      )}
    </Screen>
  );
}
