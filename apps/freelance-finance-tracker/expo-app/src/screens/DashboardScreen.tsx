import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Pressable } from 'react-native';
import axios from 'axios';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import Screen from '../components/ui/Screen';
import SummaryCard from '../components/ui/SummaryCard';
import EmptyState from '../components/ui/EmptyState';
import { FontAwesome } from '@expo/vector-icons';

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
    <Screen scroll>
      {showMessage && <Text style={styles.toast} accessibilityRole="alert">Receipt saved.</Text>}
      {empty ? (
        <EmptyState
          title="No data yet"
          description="You haven’t added any receipts or mileage yet. Tap the + button to get started."
          ctaLabel="Add first receipt"
          onPressCTA={() => navigation.navigate('ReceiptCapture')}
        />
      ) : (
        <>
          <View style={styles.cards}>
            <SummaryCard title="Income" value={`$${summary.income.toFixed(2)}`} accessibilityLabel="Income" />
            <SummaryCard title="Expenses" value={`$${summary.expenses.toFixed(2)}`} accessibilityLabel="Expenses" />
            <SummaryCard title="Mileage deduction" value={`$${summary.mileage_deduction.toFixed(2)}`} accessibilityLabel="Mileage deduction" />
            <SummaryCard title="Estimated tax" value={`$${summary.estimated_tax.toFixed(2)}`} accessibilityLabel="Estimated tax" />
          </View>
          <View style={styles.receiptList}>
            {receipts.map((r) => (
              <View key={r.id} style={styles.receiptItem} accessibilityLabel={`Receipt ${r.id}`}>
                <Text style={styles.receiptAmount}>{r.amount}</Text>
                <Text style={styles.receiptCategory}>{r.category}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      <Pressable
        onPress={() => navigation.navigate('ReceiptCapture')}
        accessibilityLabel="Add receipt"
        accessibilityRole="button"
        style={styles.fabButton}
      >
        <FontAwesome name="plus" size={24} color={theme.colors.onAccent} accessible={false} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: theme.spacing.md, ...theme.typography.bodyMedium },
  toast: { backgroundColor: theme.colors.success, color: theme.colors.onSuccess, padding: theme.spacing.sm, marginBottom: theme.spacing.md, textAlign: 'center', ...theme.typography.bodyMedium },
  cards: { flexDirection: 'column' },
  receiptList: { marginTop: theme.spacing.lg },
  receiptItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
  receiptAmount: { ...theme.typography.bodyMedium, color: theme.colors.onSurface },
  receiptCategory: { ...theme.typography.bodyMedium, color: theme.colors.secondary },
  fabButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});