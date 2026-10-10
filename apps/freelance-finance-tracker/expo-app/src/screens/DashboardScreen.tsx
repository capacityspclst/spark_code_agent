import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import axios from 'axios';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import SummaryCard from '../components/ui/SummaryCard';
import EmptyState from '../components/ui/EmptyState';
import Screen from '../components/ui/Screen';

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
      <Screen>
        <View style={styles.center} accessibilityRole="none">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading summary…</Text>
        </View>
      </Screen>
    );
  }

  const empty = !summary || (summary.income === 0 && summary.expenses === 0 && summary.mileage_deduction === 0 && summary.estimated_tax === 0);

  return (
    <Screen>
      {showMessage && <Text style={styles.toast} accessibilityRole="alert">Receipt saved.</Text>}
      {empty ? (
        <>
          <EmptyState
            title="No data yet"
            description="You haven’t added any receipts or mileage yet. Tap the + button to get started."
            ctaLabel="Add first receipt"
            onPressCTA={() => navigation.navigate('ReceiptCapture')}
          />
          {/* FAB for adding receipt */}
          <FAB
            icon="plus"
            accessibilityLabel="Add receipt"
            onPress={() => navigation.navigate('ReceiptCapture')}
            style={styles.fab}
          />
        </>
      ) : (
        <View>
          <SummaryCard title="Income" value={`$${summary.income.toFixed(2)}`} />
          <SummaryCard title="Expenses" value={`$${summary.expenses.toFixed(2)}`} />
          <SummaryCard title="Mileage deduction" value={`$${summary.mileage_deduction.toFixed(2)}`} />
          <SummaryCard title="Estimated tax" value={`$${summary.estimated_tax.toFixed(2)}`} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: theme.spacing.md, ...theme.typography.body },
  toast: { backgroundColor: theme.colors.success, color: theme.colors.onSuccess, padding: theme.spacing.sm, marginBottom: theme.spacing.md, textAlign: 'center' as const, ...theme.typography.body },
  receiptList: { marginTop: theme.spacing.lg },
  receiptItem: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
  receiptAmount: { ...theme.typography.body, color: theme.colors.onSurface },
  receiptCategory: { ...theme.typography.body, color: theme.colors.secondary },
  fab: { position: 'absolute', right: -16, bottom: -16, margin: theme.spacing.lg },
});