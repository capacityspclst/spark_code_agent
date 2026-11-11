import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { space, theme } from '../../theme';
import PrimaryButton from './PrimaryButton';

interface Props { icon: string; title: string; body: string; actionLabel?: string; onAction?: () => void }

/**
 * What a screen shows with no data yet: says what to do next. The icon is
 * decorative (PaperProvider hides it). Centers in the available height
 * (the parent Screen uses contentContainerStyle={{flexGrow: 1}}) so it
 * never looks like it's pinned to the top with dead space below.
 */
export default function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Avatar.Icon size={64} icon={icon} style={styles.icon} color={theme.colors.onPrimaryContainer} />
      <Text variant="titleLarge" style={styles.title}>{title}</Text>
      <Text variant="bodyMedium" style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.action}
          contentStyle={styles.actionContent}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: space(3), paddingVertical: space(6) },
  icon: { backgroundColor: theme.colors.primaryContainer, marginBottom: space(2) },
  title: { fontWeight: '600', textAlign: 'center', color: theme.colors.onSurface, marginBottom: space(1) },
  body: { color: theme.colors.onSurfaceVariant, textAlign: 'center', maxWidth: 288, marginBottom: space(3) },
  action: { borderWidth: 0 },
  actionContent: { height: 48, paddingHorizontal: space(3) },
});
