import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { space, theme } from '../../theme';
import PrimaryButton from './PrimaryButton';

interface Props { icon: string; title: string; body: string; actionLabel?: string; onAction?: () => void }

/** What a screen shows with no data yet: says what to do next. The icon is decorative (PaperProvider hides it). */
export default function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Avatar.Icon size={64} icon={icon} style={styles.icon} color={theme.colors.onPrimaryContainer} />
      <Text variant="titleLarge" style={styles.title}>{title}</Text>
      <Text variant="bodyLarge" style={styles.body}>{body}</Text>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space(2), paddingVertical: space(6), paddingHorizontal: space(2) },
  icon: { backgroundColor: theme.colors.primaryContainer },
  title: { fontWeight: '600', textAlign: 'center' },
  body: { color: theme.colors.secondary, textAlign: 'center' },
});
