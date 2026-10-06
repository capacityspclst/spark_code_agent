import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Pressable } from 'react-native';
import axios from 'axios';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [summaryResp, receiptsResp] = await Promise.all([
        axios.get(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/receipts`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSummary(summaryResp.data);
      setReceipts(receiptsResp.data);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
      if (route.params?.receiptSaved) {
        setShowMessage(true);
        navigation.setParams({ receiptSaved: false });
      }
    }
  }, [isFocused, route.params?.receiptSaved]);

  // auto hide toast after a while
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  if (loading) {
    return (
      <View style={styles.center} accessibilityRole="none">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading summary…</Text>
      </View>
    );
  }

  const empty = !summary || (summary.income === 0 && summary.expenses === 0 && summary.mileage_deduction === 0 && summary.estimated_tax === 0);

  return (
    <ScrollView contentContainerStyle={styles.container} accessibilityRole="none">
      {showMessage && <Text style={styles.toast} accessibilityRole="alert">Receipt saved.</Text>}
      {empty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyText}>You haven’t added any receipts or mileage yet. Tap the + button to get started.</Text>
          <PrimaryButton title="Add first receipt" onPress={() => navigation.navigate('ReceiptCapture')} accessibilityLabel="Add first receipt" />
          <Pressable
            onPress={() => navigation.navigate('ReceiptCapture')}
            accessibilityLabel="Add receipt"
            accessibilityRole="button"
            style={styles.fab}
          >
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </View>
      ) : (
        <View>
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
          {/* List recent receipts */}
          <View style={styles.receiptList}>
            {receipts.map((r) => (
              <View key={r.id} style={styles.receiptItem} accessibilityLabel={`Receipt ${r.id}`}>
                <Text style={styles.receiptAmount}>{r.amount}</Text>
                <Text style={styles.receiptCategory}>{r.category}</Text>
              </View>
            ))}
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
  toast: { backgroundColor: theme.colors.success, color: theme.colors.onSuccess, padding: theme.spacing.sm, marginBottom: theme.spacing.md, textAlign: 'center', ...theme.typography.body },
  empty: { alignItems: 'center', marginTop: theme.spacing.xl },
  emptyTitle: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.sm },
  emptyText: { marginBottom: theme.spacing.lg, textAlign: 'center', ...theme.typography.body },
  cards: { flexDirection: 'column' },
  card: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.radii.md, marginBottom: theme.spacing.md, ...theme.elevation.card },
  cardTitle: { ...theme.typography.h3, color: theme.colors.onSurface },
  cardValue: { ...theme.typography.h2, color: theme.colors.onSurface, marginTop: theme.spacing.sm },
  fab: { marginTop: theme.spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center' },
  fabText: { ...theme.typography.button, color: theme.colors.onAccent },
  receiptList: { marginTop: theme.spacing.lg },
  receiptItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
  receiptAmount: { ...theme.typography.body, color: theme.colors.onSurface },
  receiptCategory: { ...theme.typography.body, color: theme.colors.secondary },
});