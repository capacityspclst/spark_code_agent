import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import FormField from '../components/ui/FormField';
import Screen from '../components/ui/Screen';
import axios from 'axios';
import { Alert } from 'react-native';

export default function MileageEntryScreen() {
  const navigation = useNavigation<any>();
  const [date, setDate] = useState('');
  const [miles, setMiles] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  const fetchEntries = async () => {
    try {
      const token = await getToken();
      const resp = await axios.get(`${API_URL}/mileage`, { headers: { Authorization: `Bearer ${token}` } });
      setEntries(resp.data);
    } catch (e) {
      // ignore errors for now
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSave = async () => {
    if (!date || !miles) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const payload = { date, miles: parseInt(miles, 10), notes };
      await axios.post(`${API_URL}/mileage`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Mileage entry saved.');
      await fetchEntries();
    } catch (e) {
      setMessage('Failed to save mileage. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.entry}>
      <Text style={styles.entryText}>{item.miles}</Text>
      {item.notes ? <Text style={styles.entryNotes}>{item.notes}</Text> : null}
    </View>
  );

  return (
    <Screen scroll>
      <Text style={styles.title}>New mileage entry</Text>
      <FormField label="Date" value={date} onChangeText={setDate} accessibilityLabel="Date" />
      <FormField label="Miles driven" value={miles} onChangeText={setMiles} keyboardType="numeric" accessibilityLabel="Miles driven" />
      <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} accessibilityLabel="Notes (optional)" />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <PrimaryButton title="Save mileage" onPress={handleSave} accessibilityLabel="Save mileage" />
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={renderItem}
        style={styles.list}
        ListHeaderComponent={<Text style={styles.listHeader}>Mileage entries</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.bodyMedium },
  list: { marginTop: theme.spacing.lg },
  listHeader: { ...theme.typography.h3, color: theme.colors.onSurface, marginBottom: theme.spacing.sm },
  entry: { paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
  entryText: { ...theme.typography.bodyMedium, color: theme.colors.onSurface },
  entryNotes: { ...theme.typography.bodySmall, color: theme.colors.secondary },
});