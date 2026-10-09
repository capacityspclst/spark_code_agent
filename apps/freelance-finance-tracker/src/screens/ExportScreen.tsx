import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import { generateCsv } from '../lib/exportCsv';
import { generatePdf } from '../lib/exportPdf';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const showSuccess = () => {
    setMessage('Export ready to share');
    setSnack('Export ready to share');
  };

  const exportCsv = async () => {
    try {
      setLoading(true);
      await generateCsv();
      showSuccess();
    } catch (e) {
      setSnack('Export failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    try {
      setLoading(true);
      await generatePdf();
      showSuccess();
    } catch (e) {
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
