import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { theme } from '../../theme';

type Props = {
  title: string;
  description: string;
  ctaLabel: string;
  onPressCTA: () => void;
};

export default function EmptyState({ title, description, ctaLabel, onPressCTA }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <PrimaryButton title={ctaLabel} onPress={onPressCTA} accessibilityLabel={ctaLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.sm },
  description: { ...theme.typography.bodyMedium, color: theme.colors.onSurface, marginBottom: theme.spacing.lg, textAlign: 'center' },
});