import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Button as RNButton } from 'react-native';
import axios from 'axios';
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
      await axios.get(`${API_URL}/export/${type}`, {
        responseType: type === 'csv' ? 'text' : 'arraybuffer',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Report ready to share.');
    } catch (e) {
      Alert.alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <View style={styles.container}>
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
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});