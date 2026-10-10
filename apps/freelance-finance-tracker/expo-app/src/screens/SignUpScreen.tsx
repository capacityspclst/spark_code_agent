import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import { FontAwesome } from '@expo/vector-icons';
import LoadingOverlay from '../components/LoadingOverlay';
import PrimaryButton from '../components/ui/PrimaryButton';
import FormField from '../components/ui/FormField';
import axios from 'axios';

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [submissionError, setSubmissionError] = useState('');

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
      setSubmissionError("We couldn't create your account. Please check the fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {submissionError ? <Text style={styles.submissionError} accessibilityRole="alert">{submissionError}</Text> : null}
      <Text style={styles.title}>Create your account</Text>
      <FormField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        error={!!errorEmail}
        accessibilityLabel="Email address"
        placeholder="Email address"
        keyboardType="email-address"
      />
      {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}
      <View style={styles.passwordContainer}>
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={!!errorPassword}
          secureTextEntry={secureEntry}
          accessibilityLabel="Password"
          placeholder="Password"
        />
        <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)} accessibilityLabel={secureEntry ? "Show password" : "Hide password"}>
          <FontAwesome name={secureEntry ? 'eye-slash' : 'eye'} size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
      {errorPassword ? <Text style={styles.error}>{errorPassword}</Text> : null}
      <Text style={styles.helper}>12 + characters, uppercase, lowercase, number, symbol</Text>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <PrimaryButton title="Create account" onPress={handleSignup} accessibilityLabel="Create account" />
      )}
      <TouchableOpacity
        onPress={() => navigation.navigate('SignIn')}
        style={styles.link}
        accessibilityRole="link"
        accessibilityLabel="Log in"
        testID="back-to-signin"
      >
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
      {loading && <LoadingOverlay message="Creating account…" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  error: { color: theme.colors.error, ...theme.typography.caption, marginTop: theme.spacing.xs },
  helper: { color: theme.colors.placeholder, ...theme.typography.caption, marginTop: theme.spacing.xs },
  link: { marginTop: theme.spacing.lg, alignItems: 'center' },
  linkText: { color: theme.colors.secondary, ...theme.typography.body, textDecorationLine: 'underline' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  submissionError: { color: theme.colors.error, ...theme.typography.body, marginBottom: theme.spacing.sm },
});