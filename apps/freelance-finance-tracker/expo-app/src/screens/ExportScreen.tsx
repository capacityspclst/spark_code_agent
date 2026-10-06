import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Button as RNButton, Platform } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';

export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async (type: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/export/${type}`, {
        responseType: type === 'csv' ? 'text' : 'arraybuffer',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Determine file extension and mime
      const extension = type === 'csv' ? 'csv' : 'pdf';
      const mime = type === 'csv' ? 'text/csv' : 'application/pdf';
      // Write to a temporary file
      const filename = `export_${Date.now()}.${extension}`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      // For csv, response data is string; for pdf, it's arraybuffer -> base64
      let dataToWrite: string;
      if (type === 'csv') {
        dataToWrite = response.data;
      } else {
        // Convert arraybuffer to base64
        const buffer = Buffer.from(response.data, 'binary');
        dataToWrite = buffer.toString('base64');
      }
      await FileSystem.writeAsStringAsync(fileUri, dataToWrite, {
        encoding: type === 'csv' ? FileSystem.Encoding.UTF8 : FileSystem.Encoding.BASE64,
      });
      // Share the file on native platforms
      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(fileUri, {
          mimeType: mime,
          dialogTitle: 'Exported file',
        });
        setMessage('Report ready to share.');
      } else {
        // Fallback: just show a success message
        setMessage('Report ready to share.');
      }
    } catch (e) {
      Alert.alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Heading as per DESIGN.md */}
      <Text style={styles.heading}>Export your data</Text>
      <RNButton
        title="Export CSV"
        onPress={() => handleExport('csv')}
        disabled={loading}
        color={theme.colors.primary}
        accessibilityLabel="Export CSV"
        testID="export-csv-button"
      />
      <RNButton
        title="Export PDF"
        onPress={() => handleExport('pdf')}
        disabled={loading}
        color={theme.colors.primary}
        accessibilityLabel="Export PDF"
        testID="export-pdf-button"
      />
      {loading && (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  heading: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});