import React from 'react';
import { View, StyleSheet } from 'react-native';
import { space } from '../../theme';

type Props = {
  children: React.ReactNode;
  // optional props for future use
};

/** Simple wrapper for a group of SettingsRow items. Adds vertical spacing between rows. */
export default function SettingsSection({ children }: Props) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    // rows already have their own margin via spacing; ensure small gap
    gap: space(1),
  },
});
