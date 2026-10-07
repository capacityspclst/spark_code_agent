import React from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
};

export default function Screen({ children, scroll = false }: Props) {
  const Container = scroll ? ScrollView : View;
  const { width } = useWindowDimensions();
  // Determine if we are on a wide screen (desktop) >= 768px
  const isDesktop = width >= 768;
  const containerStyle = [
    styles.container,
    isDesktop ? styles.desktopContainer : styles.mobileContainer,
  ];
  return (
    <Container style={containerStyle} contentContainerStyle={scroll ? styles.scrollContent : undefined}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignSelf: 'center',
  },
  mobileContainer: {
    paddingHorizontal: theme.spacing.lg, // 16px on mobile
    maxWidth: 360,
    paddingTop: theme.spacing.lg,
  },
  desktopContainer: {
    paddingHorizontal: theme.spacing.xl, // 24px on desktop
    maxWidth: 720,
    paddingTop: theme.spacing.xl,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
});
