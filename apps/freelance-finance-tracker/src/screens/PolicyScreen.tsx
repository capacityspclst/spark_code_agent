// src/screens/PolicyScreen.tsx
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, useTheme } from 'react-native-paper';
import { setPolicyAcceptance, POLICY_VERSION } from '../lib/policy';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/ui/PrimaryButton';

export default function PolicyScreen() {
  const navigation = useNavigation<any>();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const spacing = (theme as any).spacing || {};

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
      <Text variant="headlineMedium" style={{ marginBottom: spacing.md ?? 16 }}>
        Terms of Use and Privacy Policy
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: spacing.lg ?? 24 }}>
        Track receipts and mileage locally \u2013 your data never leaves the device.
      </Text>
      {/* Accessible custom checkbox */}
      <Pressable
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel="I agree to the Terms of Use and Privacy Policy."
        aria-checked={checked}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm ?? 8 }}
      >
        <Text variant="bodyLarge" style={{ marginRight: spacing.sm ?? 8 }}>
          {checked ? '\u2611' : '\u2610'}
        </Text>
        <Text variant="bodyMedium">
          I agree to the Terms of Use and Privacy Policy.
        </Text>
      </Pressable>
      <PrimaryButton
        onPress={handleContinue}
        disabled={!checked || saving}
        loading={saving}
        style={{ marginTop: spacing.lg ?? 24 }}
      >
        Continue
      </PrimaryButton>
    </Screen>
  );
}
