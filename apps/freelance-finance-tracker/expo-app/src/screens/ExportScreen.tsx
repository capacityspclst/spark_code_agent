import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export default function ExportScreen() {
  const [loadingType, setLoadingType] = useState<null | 'csv' | 'pdf'>(null);
  const [message, setMessage] = useState('');

  const handleExport = async (type: 'csv' | 'pdf') => {
    setLoadingType(type);
    try {
      const token = await getToken();
      const resp = await axios.get(`${API_URL}/export/${type}`, {
        responseType: 'text', // assume backend returns base64 string
        headers: { Authorization: `Bearer ${token}` },
      });
      const base64 = resp.data as string;
      const uri = `${FileSystem.cacheDirectory}export.${type}`;
      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
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
      <PrimaryButton
        title="Export CSV"
        onPress={() => handleExport('csv')}
        disabled={!!loadingType}
        loading={loadingType === 'csv'}
        accessibilityLabel="Export CSV"
      />
      <PrimaryButton
        title="Export PDF"
        onPress={() => handleExport('pdf')}
        disabled={!!loadingType}
        loading={loadingType === 'pdf'}
        accessibilityLabel="Export PDF"
      />
      {loadingType && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});