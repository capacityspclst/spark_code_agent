// src/screens/PolicyScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { Text, Checkbox, Button, ActivityIndicator } from 'react-native-paper';
import { setPolicyAcceptance, POLICY_VERSION } from '../lib/policy';
import { useNavigation } from '@react-navigation/native';

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

  return (
    <Screen>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Terms of Use and Privacy Policy</Text>
      <Text variant="bodyMedium" style={{ marginBottom: 24 }}>
        Track receipts and mileage locally – your data never leaves the device.
      </Text>
      <View style={styles.checkboxRow}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={() => setChecked(!checked)}
          accessibilityLabel="I agree to the Terms of Use and Privacy Policy."
        />
        <Text style={{ flex: 1 }}>I agree to the Terms of Use and Privacy Policy.</Text>
      </View>
      <Button
        mode="contained"
        onPress={handleContinue}
        disabled={!checked || saving}
        loading={saving}
        style={{ marginTop: 24 }}
        accessibilityLabel="Continue"
      >
        Continue
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
});
