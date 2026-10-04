import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const resp = await axios.get(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      setSummary(resp.data);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.center} accessibilityRole="alert">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading summary…</Text>
      </View>
    );
  }

  const empty = !summary || (summary.income === 0 && summary.expenses === 0 && summary.mileage_deduction === 0 && summary.estimated_tax === 0);

  return (
    <ScrollView contentContainerStyle={styles.container} accessibilityRole="main">
      {empty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>You haven’t added any receipts or mileage yet. Tap the + button to get started.</Text>
          <Button title="Add first receipt" onPress={() => navigation.navigate('ReceiptCapture')} accessibilityLabel="Add first receipt" />
        </View>
      ) : (
        <View style={styles.cards}>
          <View style={styles.card} accessibilityLabel="Income">
            <Text style={styles.cardTitle}>Income</Text>
            <Text style={styles.cardValue}>${summary.income.toFixed(2)}</Text>
          </View>
          <View style={styles.card} accessibilityLabel="Expenses">
            <Text style={styles.cardTitle}>Expenses</Text>
            <Text style={styles.cardValue}>${summary.expenses.toFixed(2)}</Text>
          </View>
          <View style={styles.card} accessibilityLabel="Mileage deduction">
            <Text style={styles.cardTitle}>Mileage deduction</Text>
            <Text style={styles.cardValue}>${summary.mileage_deduction.toFixed(2)}</Text>
          </View>
          <View style={styles.card} accessibilityLabel="Estimated tax">
            <Text style={styles.cardTitle}>Estimated tax</Text>
            <Text style={styles.cardValue}>${summary.estimated_tax.toFixed(2)}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: theme.spacing.md, ...theme.typography.body },
  empty: { alignItems: 'center', marginTop: theme.spacing.xl },
  emptyText: { marginBottom: theme.spacing.lg, textAlign: 'center', ...theme.typography.body },
  cards: { flexDirection: 'column' },
  card: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.radii.md, marginBottom: theme.spacing.md, ...theme.elevation.card },
  cardTitle: { ...theme.typography.h3, color: theme.colors.onSurface },
  cardValue: { ...theme.typography.h2, color: theme.colors.onSurface, marginTop: theme.spacing.sm },
});