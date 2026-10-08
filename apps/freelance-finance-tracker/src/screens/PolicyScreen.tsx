import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { CheckboxField, PrimaryButton, Screen } from '../components/ui';
import { POLICY_VERSION } from '../lib/policy';
import { space, theme } from '../theme';

// Replace with the app's real Terms of Use and Privacy Policy (keep it plain and honest).
export const POLICY_SECTIONS: { heading: string; body: string }[] = [
  { heading: 'Your data stays on this device', body: 'Everything you enter is stored only on this device, encrypted. We never receive, see or store your data, and the app never sends it anywhere.' },
  { heading: 'Backups are yours', body: 'You are responsible for your own backups. Exported files go only where you choose to save or share them.' },
  { heading: 'Not professional advice', body: 'This app is not tax, legal or financial advice. Check important figures with a qualified professional.' },
];

interface Props { onAccept: () => void; readOnly?: boolean }

/** First screen until the current policy version is accepted; nothing else in the app is reachable before that. */
export default function PolicyScreen({ onAccept, readOnly }: Props) {
  const [agreed, setAgreed] = useState(false);
  return (
    <Screen title="Terms of Use and Privacy Policy" subtitle={`Version ${POLICY_VERSION}. Please read and agree to continue.`}>
      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.content}>
          {POLICY_SECTIONS.map((s) => (
            <React.Fragment key={s.heading}>
              <Text variant="titleMedium" style={styles.heading}>{s.heading}</Text>
              <Text variant="bodyMedium" style={styles.body}>{s.body}</Text>
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>
      {readOnly ? null : (
        <>
          <CheckboxField label="I agree to the Terms of Use and Privacy Policy." checked={agreed} onChange={setAgreed} />
          <PrimaryButton label="Continue" disabled={!agreed} onPress={onAccept} />
          {!agreed ? <Text variant="bodySmall" style={styles.hint}>Tick the box above to continue.</Text> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface },
  content: { gap: space(1), paddingVertical: space(2) },
  heading: { fontWeight: '600', marginTop: space(1) },
  body: { color: theme.colors.onSurfaceVariant },
  hint: { color: theme.colors.secondary, textAlign: 'center' },
});
