import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Screen, SettingsRow } from '../components/ui';
import { space, theme } from '../theme';

/** Read‑only Privacy Policy page, reachable from Settings. */
export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <Screen title="Privacy Policy">
      <View style={{ gap: space(1.5) }}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Everything you enter is stored only on this device, encrypted. We never receive, see or store your data,
          and the app never sends it anywhere. You are responsible for your own backups.
        </Text>
        <SettingsRow label="Back" testID="privacy-policy-back" onPress={() => navigation.goBack()} showChevron={false} />
      </View>
    </Screen>
  );
}
