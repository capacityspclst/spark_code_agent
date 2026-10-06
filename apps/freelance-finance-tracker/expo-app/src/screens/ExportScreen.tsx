import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import Screen from '../components/ui/Screen';

export default function ExportScreen() {
  const [loading, setLoading] = useState<'idle' | 'csv' | 'pdf'>('idle');
  const [message, setMessage] = useState('');

  const handleExport = async (type: 'csv' | 'pdf') => {
    setLoading(type);
    try {
      const token = await getToken();
      await axios.get(`${API_URL}/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      setMessage('Report ready to share.');
    } catch (e) {
      Alert.alert('Export failed. Please try again.');
    } finally {
      setLoading('idle');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.heading}>Export your data</Text>
      <PrimaryButton
        title="Export CSV"
        onPress={() => handleExport('csv')}
        loading={loading === 'csv'}
        disabled={loading !== 'idle'}
        accessibilityLabel="Export CSV"
      />
      <PrimaryButton
        title="Export PDF"
        onPress={() => handleExport('pdf')}
        loading={loading === 'pdf'}
        disabled={loading !== 'idle'}
        accessibilityLabel="Export PDF"
      />
      {loading !== 'idle' && (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});