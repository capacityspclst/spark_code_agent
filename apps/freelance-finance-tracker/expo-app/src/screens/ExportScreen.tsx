import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';

export default function ExportScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async (type: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      const token = await getToken();
      const resp = await axios.get(`${API_URL}/export/${type}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const uri = `file://${expoFileSystem.documentDirectory}export.${type}`;
      // Save to temporary file (we use expo-file-system)
      const expoFileSystem = await import('expo-file-system');
      await expoFileSystem.default.writeAsStringAsync(uri, resp.data, { encoding: expoFileSystem.default.Encoding.UTF8,});
      await Sharing.shareAsync(uri);
      setMessage('Report ready to share.');
    } catch (e) {
      Alert.alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <View style={styles.container} accessibilityRole="main">
      <Button title="Export CSV" onPress={() => handleExport('csv')} disabled={loading} accessibilityLabel="Export CSV" />
      <Button title="Export PDF" onPress={() => handleExport('pdf')} disabled={loading} accessibilityLabel="Export PDF" />
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});