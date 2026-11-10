import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Screen, SettingsRow } from '../components/ui';
import { space, theme } from '../theme';

/** Read‑only Terms of Service page, reachable from Settings. */
export default function TermsOfServiceScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <Screen title="Terms of Service">
      <View style={{ gap: space(1.5) }}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          This app is not tax, legal or financial advice. Check important figures with a qualified professional. All
          data you enter stays on this device; we never receive, see or store it.
        </Text>
        <SettingsRow label="Back" testID="terms-of-service-back" onPress={() => navigation.goBack()} showChevron={false} />
      </View>
    </Screen>
  );
}
