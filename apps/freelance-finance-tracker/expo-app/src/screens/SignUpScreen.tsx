import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import PrimaryButton from '../components/ui/PrimaryButton';
import FormField from '../components/ui/FormField';
import { saveToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import { FontAwesome } from '@expo/vector-icons';
import LoadingOverlay from '../components/LoadingOverlay';
import Screen from '../components/ui/Screen';
import { Button } from 'react-native-paper';

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);

  const validate = () => {
    let valid = true;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrorEmail('Enter a valid email address.');
      valid = false;
    } else {
      setErrorEmail('');
    }
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
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
    <Screen>
      <View style={styles.container}>
        {submissionError ? <Text style={styles.submissionError} accessibilityRole="alert">{submissionError}</Text> : null}
        <Text style={styles.title}>Create your account</Text>
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
          right={<FontAwesome name={secureEntry ? 'eye-slash' : 'eye'} size={24} color={theme.colors.secondary} />}
        />
        <Text style={styles.helper}>12 + characters, uppercase, lowercase, number, symbol</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <PrimaryButton title="Create account" onPress={handleSignup} accessibilityLabel="Create account" />
        )}
        <Button
          mode="text"
          onPress={() => navigation.navigate('SignIn')}
          accessibilityLabel="Log in"
          style={styles.link}
        >
          Already have an account? Log in
        </Button>
        {loading && <LoadingOverlay message="Creating account…" />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: theme.spacing.lg },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  helper: { color: theme.colors.placeholder, ...theme.typography.caption, marginTop: theme.spacing.xs },
  link: { marginTop: theme.spacing.lg, alignSelf: 'center' },
  submissionError: { color: theme.colors.error, ...theme.typography.body, marginBottom: theme.spacing.sm },
});