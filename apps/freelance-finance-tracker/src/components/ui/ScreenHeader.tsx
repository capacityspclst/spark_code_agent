import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '../../theme';

/** Header with safe‑area top inset and consistent padding, used by screens instead of the
 * built‑in `title` prop of `Screen`.
 */
export default function ScreenHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + space(2) }]}>
      <Text variant="headlineMedium" accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: space(2),
    paddingBottom: space(2),
  },
});
