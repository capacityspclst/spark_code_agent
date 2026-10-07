// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { EmptyState } from '../components/ui/EmptyState';
import { SummaryCard } from '../components/ui/SummaryCard';
import { useNavigation } from '@react-navigation/native';
import { listReceipts, listMileage } from '../lib/records';
import { getTotalIncome, getTotalExpenses, getMileageDeduction, getEstimatedTax } from '../lib/calculations';
import { getConfig } from '../lib/records';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [receiptsCount, setReceiptsCount] = useState(0);
  const [mileageCount, setMileageCount] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [tax, setTax] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    const receipts = await listReceipts();
    const mileage = await listMileage();
    setReceiptsCount(receipts.length);
    setMileageCount(mileage.length);
    const inc = await getTotalIncome();
    const exp = await getTotalExpenses();
    setIncome(inc);
    setExpenses(exp);
    const cfg = await getConfig();
    const rate = cfg.mileageRate ?? 0.58;
    const taxRate = cfg.taxRate ?? 0.22;
    const ded = await getMileageDeduction(rate);
    setDeduction(ded);
    const taxVal = getEstimatedTax(taxRate, inc, exp, ded);
    setTax(taxVal);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
        <Text>Loading dashboard…</Text>
      </Screen>
    );
  }

  const hasActivity = receiptsCount > 0 || mileageCount > 0;

  return (
    <Screen>
      {!hasActivity ? (
        <EmptyState
          title="No activity yet"
          description="Add a receipt or mileage entry to get started."
          actionLabel="Add receipt"
          onAction={() => navigation.navigate('Receipts')}
        />
      ) : (
        <View>
          <SummaryCard title="Income" value={income.toFixed(2)} />
          <SummaryCard title="Expenses" value={expenses.toFixed(2)} />
          <SummaryCard title="Mileage deduction" value={deduction.toFixed(2)} />
          <SummaryCard title="Estimated tax" value={tax.toFixed(2)} />
          <PrimaryButton onPress={() => navigation.navigate('Receipts')}>Add receipt</PrimaryButton>
          <PrimaryButton onPress={() => navigation.navigate('Mileage')}>Add mileage</PrimaryButton>
        </View>
      )}
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>{snackbarMsg}</Snackbar>
    </Screen>
  );
}
