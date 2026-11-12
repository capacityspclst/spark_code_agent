import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { EmptyState, PrimaryButton, Screen } from '../components/ui';
import { getStore } from '../lib/storage';
import { MileageEntry } from '../lib/models';
import { getAllMileageEntries } from '../lib/mileageStore';
import MileageCard from '../components/ui/MileageCard';
import FABAdd from '../components/ui/FABAdd';
import { theme } from '../theme';

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
        <View style={{ flex: 1 }}>
          <EmptyState
            icon="run-outline"
            title="No trips yet"
            body="Log your first drive to track mileage deductions."
            actionLabel="Add mileage"
            onAction={() => navigation.navigate('MileageEntry')}
          />
        </View>
      ) : (
        <>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>Recent trips</Text>
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MileageCard entry={item} />}
            contentContainerStyle={{ paddingBottom: 96 }}
          />
        </>
      )}
      <FABAdd />
    </Screen>
  );
}
