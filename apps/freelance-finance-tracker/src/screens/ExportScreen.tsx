import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import ExportButton from '../components/ui/ExportButton';
import { generateCsv } from '../lib/exportCsv';
import { generatePdf } from '../lib/exportPdf';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const showSuccess = (navigateToSettings: boolean) => {
    setMessage('Export ready to share');
    setSnack('Export ready to share');
    if (navigateToSettings) {
      // Navigate back to Settings tab via the Main stack
      navigation.navigate('Main' as any, { screen: 'Settings' } as any);
    }
  };

  const exportCsv = async () => {
    try {
      setLoading(true);
      await generateCsv();
      // Stay on Export screen after CSV export.
      showSuccess(false);
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
      // After PDF export, return to Settings tab.
      showSuccess(true);
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
        {message ? <Text accessibilityRole="alert" style={{ marginTop: 8 }}>{message}</Text> : null}
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </Screen>
  );
}
