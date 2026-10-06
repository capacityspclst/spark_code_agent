import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

type Props = { message: string };

export default function LoadingOverlay({ message }: Props) {
  return (
    <View
      style={styles.overlay}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="assertive"
    >
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        accessibilityLabel={message}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  message: {
    marginTop: theme.spacing.md,
    color: theme.colors.onSurface,
    ...theme.typography.body,
  },
});