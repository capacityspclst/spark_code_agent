import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckboxField, PrimaryButton } from '../components/ui';
import { POLICY_VERSION } from '../lib/policy';
import { space, theme } from '../theme';
import BottomActionBar from '../components/ui/BottomActionBar';

export const POLICY_SECTIONS: { heading: string; body: string }[] = [
  { heading: 'Your data stays on this device', body: 'Everything you enter is stored only on this device, encrypted. We never receive, see or store your data, and the app never sends it anywhere.' },
  { heading: 'Backups are yours', body: 'You are responsible for your own backups. Exported files go only where you choose to save or share them.' },
  { heading: 'Not professional advice', body: 'This app is not tax, legal or financial advice. Check important figures with a qualified professional.' },
];

interface Props { onAccept: () => void; readOnly?: boolean }

/** Policy gate screen with scrollable policy text and a fixed bottom action bar. */
export default function PolicyScreen({ onAccept, readOnly }: Props) {
  const [agreed, setAgreed] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
          Terms of Use and Privacy Policy
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Version {POLICY_VERSION}. Please read and agree to continue.
        </Text>
        <Card mode="outlined" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {POLICY_SECTIONS.map((s) => (
              <View key={s.heading} style={styles.section}>
                <Text variant="titleMedium" style={styles.heading}>{s.heading}</Text>
                <Text variant="bodyMedium" style={styles.body}>{s.body}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
      {readOnly ? null : (
        <BottomActionBar>
          <CheckboxField label="I have read and agree to the Terms of Use and Privacy Policy." checked={agreed} onChange={setAgreed} />
          <PrimaryButton label="Accept" disabled={!agreed} onPress={onAccept} />
          {!agreed && <Text variant="bodySmall" style={styles.hint}>Tick the box above to continue.</Text>}
        </BottomActionBar>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: space(2), paddingTop: space(3), paddingBottom: space(2) },
  title: { fontWeight: '600', marginBottom: space(1) },
  subtitle: { color: theme.colors.onSurfaceVariant, marginBottom: space(2) },
  card: { backgroundColor: theme.colors.surface, marginBottom: space(2) },
  cardContent: { gap: space(1), paddingVertical: space(2) },
  section: { marginBottom: space(2) },
  heading: { fontWeight: '600', marginBottom: space(0.5) },
  body: { color: theme.colors.onSurfaceVariant },
  hint: { color: theme.colors.secondary, textAlign: 'center' },
});
