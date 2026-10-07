import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
      {/* Placeholder illustration */}
      <Image
        source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hHgAFgwJ/9YX8WAAAAABJRU5ErkJggg==' }}
        style={styles.image}
        accessibilityLabel="Empty state illustration"
        accessibilityRole="image"
        accessible={true}
      />
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
  image: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  title: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.sm },
  description: { ...theme.typography.bodyMedium, color: theme.colors.onSurface, marginBottom: theme.spacing.lg, textAlign: 'center' },
});