// src/components/ui/Screen.tsx
import React from 'react';
import { SafeAreaView, View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

export const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme: any = useTheme();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>{children}</ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    padding: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    gap: 8,
  },
});
