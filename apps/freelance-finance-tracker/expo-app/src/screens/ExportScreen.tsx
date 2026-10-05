import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Platform, Button as RNButton } from 'react-native';
import axios from 'axios';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import NetInfo from '@react-native-community/netinfo';

export default function ExportScreen() {
  const [loadingType, setLoadingType] = useState<null | 'csv' | 'pdf'>(null);
  const [message, setMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    NetInfo.fetch().then(state => setIsOnline(state.isConnected ?? true));
    return () => unsubscribe();
  }, []);

  const handleExport = async (type: 'csv' | 'pdf') => {
    setLoadingType(type);
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/export/${type}`, {
        responseType: type === 'csv' ? 'text' : 'arraybuffer',
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const disabled = loadingType !== null || !isOnline;

  const renderButton = (title: string, type: 'csv' | 'pdf') => {
    if (Platform.OS === 'web') {
      return (
        <RNButton
          title={title}
          onPress={() => handleExport(type)}
          disabled={disabled}
          color={theme.colors.primary}
          testID={`export-${type}-button`}
        />
      );
    }
    return (
      <PrimaryButton
        title={title}
        onPress={() => handleExport(type)}
        disabled={disabled}
        loading={loadingType === type}
        accessibilityLabel={title}
        testID={`export-${type}-button`}
      />
    );
  };

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.banner} accessibilityRole="alert">
          <Text style={styles.bannerText}>Cannot export while offline.</Text>
        </View>
      )}
      {renderButton('Export CSV', 'csv')}
      {renderButton('Export PDF', 'pdf')}
      {loadingType && (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  banner: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.md,
  },
  bannerText: {
    color: theme.colors.onPrimary,
    ...theme.typography.body,
  },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});