import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Button } from 'react-native';
import axios from 'axios';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';

export default function ExportScreen() {
  const [loadingType, setLoadingType] = useState<null | 'csv' | 'pdf'>(null);
  const [message, setMessage] = useState('');

  const handleExport = async (type: 'csv' | 'pdf') => {
    setLoadingType(type);
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/export/${type}`, {
        responseType: type === 'csv' ? 'text' : 'arraybuffer',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Lazy import with any casting to avoid TS errors
      const FileSystem: any = (await import('expo-file-system')).default;
      const Sharing: any = (await import('expo-sharing')).default;

      const cacheDir: string = FileSystem.cacheDirectory as string;
      const fileName = `export.${type}`;
      const uri = `${cacheDir}${fileName}`;

      if (type === 'csv') {
        await FileSystem.writeAsStringAsync(uri, response.data as string, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else {
        const arrayBuffer = response.data as ArrayBuffer;
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      await Sharing.shareAsync(uri);
      setMessage('Report ready to share.');
    } catch (e) {
      Alert.alert('Export failed. Please try again.');
    } finally {
      setLoadingType(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Export CSV"
        onPress={() => handleExport('csv')}
        disabled={!!loadingType}
        color={theme.colors.primary}
        accessibilityLabel="Export CSV"
        testID="export-csv-button"
      />
      <Button
        title="Export PDF"
        onPress={() => handleExport('pdf')}
        disabled={!!loadingType}
        color={theme.colors.primary}
        accessibilityLabel="Export PDF"
        testID="export-pdf-button"
      />
      {loadingType && (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});