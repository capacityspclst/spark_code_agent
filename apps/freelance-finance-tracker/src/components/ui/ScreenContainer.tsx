import React from 'react';
import { View, StyleSheet } from 'react-native';
import { space } from '../../theme';

/**
 * Constrains content to a comfortable max width and adds horizontal padding.
 * Used on large viewports to avoid ultra‑wide lines while keeping phone layout.
 */
export default function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: 840,
    paddingHorizontal: space(3), // 24dp
    gap: space(2),
  },
});
