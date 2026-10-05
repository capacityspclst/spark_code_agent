import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { saveToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import LoadingOverlay from '../components/LoadingOverlay';

export default function SignInScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  const validate = () => {
    let valid = true;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrorEmail('Enter a valid email address.');
      valid = false;
    } else {
      setErrorEmail('');
    }
    if (!password || password.length < 12) {
      setErrorPassword('Password must be at least 12 characters, include uppercase, lowercase, number, and symbol.');
      valid = false;
    } else {
      setErrorPassword('');
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const resp = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = resp.data.access_token;
      await saveToken(token);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      // TODO: replace with toast per design system
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email address"
          placeholderTextColor={theme.colors.placeholder}
          accessibilityLabel="Email address"
          autoComplete="email"
          editable={!loading}
        />
        {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={theme.colors.placeholder}
          accessibilityLabel="Password"
          autoComplete="current-password"
          editable={!loading}
        />
        {errorPassword ? <Text style={styles.error}>{errorPassword}</Text> : null}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <PrimaryButton title="Log in" onPress={handleLogin} accessibilityLabel="Log in" />
      )}
      <TouchableOpacity
        onPress={() => navigation.navigate('SignUp')}
        accessibilityRole="link"
        accessibilityLabel="Don’t have an account? Sign up"
        style={styles.link}
        accessible={true}
      >
        <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
      {loading && <LoadingOverlay message="Signing you in…" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  field: { marginBottom: theme.spacing.md },
  label: { fontSize: 16, lineHeight: 24, fontWeight: '200' as const, color: theme.colors.onSurface },
  input: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.secondary },
  error: { color: theme.colors.error, fontSize: 12, lineHeight: 16, marginTop: theme.spacing.xs },
  link: { marginTop: theme.spacing.lg, alignItems: 'center' },
  linkText: { color: theme.colors.secondary, fontSize: 16, lineHeight: 24, textDecorationLine: 'underline' },
});