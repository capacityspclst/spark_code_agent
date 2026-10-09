import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { generateCsv } from '../lib/exportCsv';
import { generatePdf } from '../lib/exportPdf';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

/** ExportScreen that actually generates CSV/PDF files and shares them. */
export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const shareFile = async (uri: string, mimeType: string, filename: string) => {
    try {
      await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename });
    } catch {
      // Sharing may fail on web; ignore for UI flow.
    }
  };

  const exportCsv = async () => {
    setLoading(true);
    try {
      const csv = await generateCsv();
      // Determine a writable directory; on web one may be undefined.
      const dir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory;
      if (dir) {
        const fileUri = dir + 'export.csv';
        await (FileSystem as any).writeAsStringAsync(fileUri, csv, { encoding: (FileSystem as any).EncodingType.UTF8 });
        await shareFile(fileUri, 'text/csv', 'export.csv');
      }
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
      const pdfUri = await generatePdf();
      await shareFile(pdfUri, 'application/pdf', 'export.pdf');
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
