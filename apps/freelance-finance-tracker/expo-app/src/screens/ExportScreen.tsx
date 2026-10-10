import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async (type: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      const token = await getToken();
      await axios.get(`${API_URL}/export/${type}`, {
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
      <Text style={styles.heading}>Export your data</Text>
      <PrimaryButton title="Export CSV" onPress={() => handleExport('csv')} accessibilityLabel="Export CSV" disabled={loading} />
      <PrimaryButton title="Export PDF" onPress={() => handleExport('pdf')} accessibilityLabel="Export PDF" disabled={loading} />
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