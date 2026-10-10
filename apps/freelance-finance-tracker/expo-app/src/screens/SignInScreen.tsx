import React, { useState } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { saveToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import LoadingOverlay from '../components/LoadingOverlay';
import { FontAwesome } from '@expo/vector-icons';
import FormField from '../components/ui/FormField';
import PrimaryButton from '../components/ui/PrimaryButton';
import { Button, IconButton } from 'react-native-paper';

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
      // Show error toast (not implemented)
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex:1, padding: theme.spacing.lg, backgroundColor: theme.colors.background }}>
      <Text style={{ ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg }}>Welcome back</Text>
      <FormField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        error={!!errorEmail}
        accessibilityLabel="Email address"
        placeholder="Email address"
        keyboardType="email-address"
      />
      {errorEmail ? <Text style={{ color: theme.colors.error, ...theme.typography.caption }}>{errorEmail}</Text> : null}
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={!!errorPassword}
        secureTextEntry={secureEntry}
        accessibilityLabel="Password"
        placeholder="Password"
      />
      <IconButton
        icon={secureEntry ? 'eye-off' : 'eye'}
        size={24}
        onPress={() => setSecureEntry(!secureEntry)}
        accessibilityLabel={secureEntry ? 'Show password' : 'Hide password'}
        style={{ alignSelf: 'flex-end', marginTop: -theme.spacing.lg }}
      />
      {errorPassword ? <Text style={{ color: theme.colors.error, ...theme.typography.caption }}>{errorPassword}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <PrimaryButton title="Log in" onPress={handleLogin} accessibilityLabel="Log in" />
      )}
      <Button mode="text" onPress={() => navigation.navigate('SignUp')} accessibilityLabel="Don’t have an account? Sign up" style={{ marginTop: theme.spacing.lg, alignSelf: 'center' }}>
        Don’t have an account? Sign up
      </Button>
      {loading && <LoadingOverlay message="Signing you in…" />}
    </SafeAreaView>
  );
}
