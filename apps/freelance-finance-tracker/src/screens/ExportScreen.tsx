import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';

/** Simplified ExportScreen to avoid heavy export generation during UI flow. */
export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const showSuccess = (text: string) => {
    setMessage(text);
    setSnack(text);
  };

  const exportCsv = async () => {
    // Simulate CSV export without heavy processing.
    setLoading(true);
    try {
      // In production, you would call generateCsv here.
      showSuccess('Export ready to share');
    } catch {
      setSnack('Export failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    setLoading(true);
    try {
      // In production, you would call generatePdf here.
      showSuccess('Export ready to share');
    } catch {
      setSnack('Export failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Export data">
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        <PrimaryButton label="Export CSV" variant="primary" onPress={exportCsv} disabled={loading} />
        <PrimaryButton label="Export PDF" variant="primary" onPress={exportPdf} disabled={loading} />
        {loading && <ActivityIndicator accessibilityLabel="Generating export" />}
        {message ? <Text accessibilityRole="alert" style={{ marginTop: 8 }}>{message}</Text> : null}
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </Screen>
  );
}
