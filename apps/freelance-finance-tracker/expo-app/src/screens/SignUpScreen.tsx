import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../components/PrimaryButton';
import { saveToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import { FontAwesome } from '@expo/vector-icons';
import LoadingOverlay from '../components/LoadingOverlay';

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);

  const validate = () => {
    let valid = true;
    if (!email) {
      setErrorEmail('Enter a valid email address.');
      valid = false;
    } else {
      setErrorEmail('');
    }
    const pwd = password;
    if (pwd.length < 12 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd)) {
      setErrorPassword('Password must be at least 12 characters, include uppercase, lowercase, number, and symbol.');
      valid = false;
    } else {
      setErrorPassword('');
    }
    return valid;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const resp = await axios.post(`${API_URL}/auth/signup`, { email, password });
      const token = resp.data.access_token;
      await saveToken(token);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      alert('We couldn\u2019t create your account. Please check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email address"
          accessibilityLabel="Email address"
          editable={!loading}
        />
        {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureEntry}
            placeholder="Password"
            accessibilityLabel="Password"
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)} accessibilityLabel="Show password">
            <FontAwesome name={secureEntry ? 'eye-slash' : 'eye'} size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
        {errorPassword ? <Text style={styles.error}>{errorPassword}</Text> : null}
        <Text style={styles.helper}>12 + characters, uppercase, lowercase, number, symbol</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <PrimaryButton title="Create account" onPress={handleSignup} accessibilityLabel="Create account" />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.link} accessibilityRole="link">
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
      {loading && <LoadingOverlay message="Creating account…" />}
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  title: TextStyle;
  field: ViewStyle;
  label: TextStyle;
  input: ViewStyle;
  error: TextStyle;
  helper: TextStyle;
  link: ViewStyle;
  linkText: TextStyle;
  passwordRow: ViewStyle;
}>({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  field: { marginBottom: theme.spacing.md },
  label: { ...theme.typography.body, color: theme.colors.onSurface },
  input: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.secondary },
  error: { color: theme.colors.error, ...theme.typography.small, marginTop: 4 },
  helper: { color: theme.colors.placeholder, ...theme.typography.small, marginTop: 4 },
  link: { marginTop: theme.spacing.lg, alignItems: 'center' },
  linkText: { color: theme.colors.primary },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm },
});