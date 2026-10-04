import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';

export default function Header() {
  const navigation = useNavigation<any>();
  const handleSettings = () => {
    // Placeholder: navigate to Settings if exists
    // navigation.navigate('Settings');
  };
  return (
    <View style={styles.header} accessibilityRole="header">
      <Text style={styles.title}>FinanceMate</Text>
      <TouchableOpacity
        onPress={handleSettings}
        accessibilityLabel="Settings"
        accessibilityRole="button"
      >
        <FontAwesome name="cog" size={24} color={theme.colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
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