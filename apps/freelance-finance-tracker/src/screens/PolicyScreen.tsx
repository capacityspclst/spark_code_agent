// src/screens/PolicyScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text } from 'react-native-paper';
import { setPolicyAcceptance, POLICY_VERSION } from '../lib/policy';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Text as RNText } from 'react-native';

export default function PolicyScreen() {
  const navigation = useNavigation<any>();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    await setPolicyAcceptance(POLICY_VERSION, now);
    setSaving(false);
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const toggle = () => setChecked(prev => !prev);

  return (
    <Screen>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Terms of Use and Privacy Policy</Text>
      <Text variant="bodyMedium" style={{ marginBottom: 24 }}>
        Track receipts and mileage locally \u2013 your data never leaves the device.
      </Text>
      <Pressable
        style={styles.checkboxRow}
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel="I agree to the Terms of Use and Privacy Policy."
      >
        <RNText style={styles.box}>{checked ? '\u2611' : '\u2610'}</RNText>
        <RNText style={styles.label}>I agree to the Terms of Use and Privacy Policy.</RNText>
      </Pressable>
      <PrimaryButton onPress={handleContinue} disabled={!checked || saving} loading={saving} style={{ marginTop: 24 }}>
        Continue
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  box: { fontSize: 24, marginRight: 8 },
  label: { fontSize: 16 },
});