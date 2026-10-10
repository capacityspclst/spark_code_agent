import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

type Props = {
  children: React.ReactNode;
  style?: any;
};

export default function Screen({ children, style }: Props) {
  return (
    <View style={[styles.screen, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: theme.colors.background,
  },
});