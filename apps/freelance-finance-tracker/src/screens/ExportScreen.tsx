import React, { useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import ExportButton from '../components/ui/ExportButton';
import { generateCsv } from '../lib/exportCsv';
import { generatePdf } from '../lib/exportPdf';
import * as FileSystem from 'expo-file-system';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const exportCsv = async () => {
    try {
      setLoading(true);
      const csv = await generateCsv();
      const uri = FileSystem.documentDirectory + 'export.csv';
      await FileSystem.writeAsStringAsync(uri, csv);
      setSnack('Export ready to share');
    } catch (e) {
      setSnack('Export failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    try {
      setLoading(true);
      const uri = await generatePdf();
      setSnack('Export ready to share');
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
        <ExportButton label="Export CSV" onPress={exportCsv} />
        <ExportButton label="Export PDF" onPress={exportPdf} />
        {loading && <ActivityIndicator accessibilityLabel="Generating export" />}
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </Screen>
  );
}
