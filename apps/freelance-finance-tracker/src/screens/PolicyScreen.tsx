import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckboxField, PrimaryButton } from '../components/ui';
import { POLICY_VERSION } from '../lib/policy';
import { layout, space, theme } from '../theme';

export const POLICY_SECTIONS: { icon: string; heading: string; body: string }[] = [
  { icon: 'shield-lock-outline', heading: 'Your data stays on this device', body: 'Everything you enter is stored only on this device, encrypted. We never receive, see or store your data, and the app never sends it anywhere.' },
  { icon: 'cloud-lock-outline', heading: 'Backups are yours', body: 'You are responsible for your own backups. Exported files go only where you choose to save or share them.' },
  { icon: 'scale-balance', heading: 'Not professional advice', body: 'This app is not tax, legal or financial advice. Check important figures with a qualified professional.' },
];

interface Props { onAccept: () => void; readOnly?: boolean }

/** Policy gate: one centered column (phone and desktop) with the policy, then the agreement right below it. */
export default function PolicyScreen({ onAccept, readOnly }: Props) {
  const [agreed, setAgreed] = useState(false);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <View style={styles.header}>
            <Avatar.Icon size={56} icon="shield-check-outline" style={styles.badge} color={theme.colors.onPrimaryContainer} />
            <Text variant="headlineMedium" style={styles.title} accessibilityRole="header">Terms of Use and Privacy Policy</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Version {POLICY_VERSION}. Please read and agree to continue.</Text>
          </View>
          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {POLICY_SECTIONS.map((s) => (
                <View key={s.heading} style={styles.section}>
                  <Avatar.Icon size={40} icon={s.icon} style={styles.sectionIcon} color={theme.colors.primary} />
                  <View style={styles.sectionText}>
                    <Text variant="titleMedium" style={styles.heading}>{s.heading}</Text>
                    <Text variant="bodyMedium" style={styles.body}>{s.body}</Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
          {readOnly ? null : (
            <Card mode="outlined" style={styles.card}>
              <Card.Content style={styles.agree}>
                <CheckboxField label="I have read and agree to the Terms of Use and Privacy Policy." checked={agreed} onChange={setAgreed} />
                <PrimaryButton label="Accept" disabled={!agreed} onPress={onAccept} />
                {!agreed ? <Text variant="bodySmall" style={styles.hint}>Tick the box to continue.</Text> : null}
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, padding: layout.pagePadding, paddingBottom: space(6) },
  column: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', gap: space(2) },
  header: { alignItems: 'center', gap: space(1), paddingTop: space(2), paddingBottom: space(1) },
  badge: { backgroundColor: theme.colors.primaryContainer },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { color: theme.colors.secondary, textAlign: 'center' },
  card: { backgroundColor: theme.colors.surface },
  cardContent: { gap: space(2.5), paddingVertical: space(2.5) },
  section: { flexDirection: 'row', gap: space(2), alignItems: 'flex-start' },
  sectionIcon: { backgroundColor: theme.colors.surfaceVariant },
  sectionText: { flex: 1, gap: space(0.5) },
  heading: { fontWeight: '600' },
  body: { color: theme.colors.onSurfaceVariant },
  agree: { gap: space(1.5), paddingVertical: space(1.5) },
  hint: { color: theme.colors.secondary, textAlign: 'center' },
});
