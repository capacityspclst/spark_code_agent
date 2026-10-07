// src/screens/PolicyScreen.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, Checkbox } from 'react-native-paper';
import { setPolicyAcceptance, POLICY_VERSION } from '../lib/policy';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/ui/PrimaryButton';

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
        Track receipts and mileage locally – your data never leaves the device.
      </Text>
      <Checkbox.Item
        status={checked ? 'checked' : 'unchecked'}
        onPress={toggle}
        label="I agree to the Terms of Use and Privacy Policy."
        accessibilityLabel="I agree to the Terms of Use and Privacy Policy."
      />
      <PrimaryButton onPress={handleContinue} disabled={!checked || saving} loading={saving} style={{ marginTop: 24 }}>
        Continue
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({});