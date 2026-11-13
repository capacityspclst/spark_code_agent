import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';

/**
 * Simple recent activity list used in the dashboard.
 * It reserves space at the bottom so FAB and tab bar are not covered.
 */
export default function RecentActivityList({ activities }: { activities: any[] }) {
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row} accessibilityLabel="activity-row">
      <Text variant="titleMedium" style={styles.title}>
        {item.description ?? item.type ?? 'Activity'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {item.date}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: theme.FAB_CONTAINER_HEIGHT + theme.TAB_BAR_HEIGHT + theme.spacing * 2,
  },
  contentContainer: {
    gap: theme.spacing,
  },
  row: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing * 2,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    // no amount displayed
    fontWeight: '500',
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
  },
});
