import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../../theme';

/**
 * Simple recent activity list used in the dashboard.
 * It reserves space at the bottom so FAB and tab bar are not covered.
 */
const RecentActivityList = ({ activities }: { activities: any[] }) => {
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row} accessibilityLabel="activity-row">
      <View style={styles.textGroup}>
        <Text style={styles.title}>
          {item.description ?? item.purpose ?? item.type ?? 'Activity'}
        </Text>
        <Text style={styles.subtitle}>
          {item.date}
        </Text>
      </View>
      {typeof item.amount === 'number' ? (
        <Text style={styles.amount}>{`$${item.amount.toFixed(2)}`}</Text>
      ) : typeof item.miles === 'number' ? (
        <Text style={styles.amount}>{`${item.miles} mi`}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingBottom: theme.FAB_CONTAINER_HEIGHT + theme.TAB_BAR_HEIGHT + theme.spacing * 2 }}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};
export default RecentActivityList;

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
  textGroup: {
    flex: 1,
  },
  amount: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
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
