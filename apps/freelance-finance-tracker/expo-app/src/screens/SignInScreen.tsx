import React, { useState } from 'react';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { saveToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import LoadingOverlay from '../components/LoadingOverlay';
import FormField from '../components/ui/FormField';
import { TextInput } from 'react-native-paper';

export default function SignInScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);

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
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <FormField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        error={!!errorEmail}
        helperText={errorEmail}
        keyboardType="email-address"
        accessibilityLabel="Email address"
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={!!errorPassword}
        helperText={errorPassword}
        secureTextEntry={secureEntry}
        accessibilityLabel={secureEntry ? "Show password" : "Hide password"}
        right={<TextInput.Icon name={secureEntry ? 'eye-off' : 'eye'} onPress={() => setSecureEntry(!secureEntry)} accessibilityLabel={secureEntry ? 'Show password' : 'Hide password'} />}
      />
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
      >
        <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
      {loading && <LoadingOverlay message="Signing you in…" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  link: { marginTop: theme.spacing.lg, alignSelf: 'center' },
  linkText: { color: theme.colors.secondary, ...theme.typography.bodyMedium, textDecorationLine: 'underline' },
});