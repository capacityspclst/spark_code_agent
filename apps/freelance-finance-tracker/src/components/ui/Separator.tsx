import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

/** Thin horizontal line used to separate sections, per DESIGN.md */
export default function Separator(_props?: any) {
  return <View style={styles.separator} accessibilityElementsHidden />;
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: theme.colors.surfaceVariant,
    marginVertical: 8, // spacing between rows per design (8dp above Delete row)
  },
});
