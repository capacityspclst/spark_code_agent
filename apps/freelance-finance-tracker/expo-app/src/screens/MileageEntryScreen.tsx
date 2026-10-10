import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, StyleSheet, Alert, FlatList } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import FormField from '../components/ui/FormField';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New mileage entry</Text>
      <FormField label="Date" value={date} onChangeText={setDate} accessibilityLabel="Date" placeholder="Date" />
      <FormField label="Miles driven" value={miles} onChangeText={setMiles} accessibilityLabel="Miles driven" keyboardType="numeric" placeholder="e.g., 120" />
      <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} accessibilityLabel="Notes (optional)" placeholder="Add any extra details…" />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <PrimaryButton title="Save mileage" onPress={handleSave} accessibilityLabel="Save mileage" />
      )}
      {message ? <Text style={styles.message} accessibilityRole="alert">{message}</Text> : null}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={renderItem}
        style={styles.list}
        ListHeaderComponent={<Text style={styles.listHeader}>Mileage entries</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
  list: { marginTop: theme.spacing.lg },
  listHeader: { ...theme.typography.h3, color: theme.colors.onSurface, marginBottom: theme.spacing.sm },
  entry: { paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
  entryText: { ...theme.typography.body, color: theme.colors.onSurface },
  entryNotes: { ...theme.typography.body, color: theme.colors.secondary },
});