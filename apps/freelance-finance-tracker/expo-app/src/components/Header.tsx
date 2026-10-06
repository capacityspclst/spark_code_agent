import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { theme } from '../theme';

export default function Header() {
  const handleSettings = () => {
    // Placeholder: navigate to Settings if exists
  };
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea} accessibilityRole="header">
      <View style={styles.header}>
        <Text style={styles.title}>FinanceMate</Text>
        <IconButton
          icon="cog"
          size={24}
          onPress={handleSettings}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.surface,
  },
  header: {
    height: theme.headerHeight,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.onSurface,
  },
});