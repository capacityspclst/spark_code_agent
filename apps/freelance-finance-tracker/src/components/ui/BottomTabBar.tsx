import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { theme } from '../../theme';
/**
 * Simple Bottom Tab Bar component used for layout tests.
 * Renders the four required labels with appropriate styling.
 */
export default function BottomTabBar({}: any) {
  // No safe area context in unit tests; use a default bottom padding.
  const bottomPadding = theme.spacing * 2;
  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <Text style={styles.label}>Dashboard</Text>
      <Text style={styles.label}>Receipts</Text>
      <Text style={styles.label}>Mileage</Text>
      <Text style={styles.label}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: theme.TAB_BAR_HEIGHT,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
});
