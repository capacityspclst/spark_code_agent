import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { saveToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email) {
      Alert.alert('Error', 'Enter a valid email address.');
      return;
    }
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      Alert.alert('Error', 'Password must be at least 12 characters, include uppercase, lowercase, number, and symbol.');
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.post(`${API_URL}/auth/signup`, { email, password });
      const token = resp.data.access_token;
      await saveToken(token);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      Alert.alert('We couldn’t create your account. Please check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container} accessibilityRole="main">
      <Text style={styles.title}>Create your account</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email address"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password"
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <Button title="Create account" onPress={handleSignup} accessibilityLabel="Create account" />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.link} accessibilityRole="link">
        <Text>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  field: { marginBottom: theme.spacing.md },
  label: { ...theme.typography.body, color: theme.colors.onSurface },
  input: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.secondary },
  link: { marginTop: theme.spacing.lg, alignItems: 'center' },
});