import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
};

export default function Screen({ children, scroll = false }: Props) {
  const Container = scroll ? ScrollView : View;
  return (
    <Container style={styles.container} contentContainerStyle={scroll ? styles.scrollContent : undefined}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    alignSelf: 'center',
    maxWidth: 360,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
});
