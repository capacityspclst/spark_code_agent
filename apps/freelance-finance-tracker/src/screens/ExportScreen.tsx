import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { generateCsv } from '../lib/exportCsv';
import { sharePdfReport } from '../lib/exportPdf';
import { utf8 } from '../lib/crypto';
import { saveAndShare } from '../lib/files';

/** ExportScreen that actually generates CSV/PDF files and shares them. */
export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const stamp = () => new Date().toISOString().slice(0, 10);

  const exportCsv = async () => {
    setLoading(true);
    try {
      await saveAndShare(`tax-export-${stamp()}.csv`, utf8(await generateCsv()), 'text/csv');
      setSnack('Export ready to share');
    } catch {
      setSnack('Export failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    setLoading(true);
    try {
      await sharePdfReport(`tax-report-${stamp()}.pdf`);
      setSnack('Export ready to share');
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
        {snack ? <Text>{snack}</Text> : null}
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </Screen>
  );
}
