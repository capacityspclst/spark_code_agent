import React from 'react';
import { View } from 'react-native';
import { PrimaryButton, Screen } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function BackupScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <Screen title="Backup">
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Create encrypted backup" variant="secondary" onPress={() => navigation.navigate('backup_passphrase_modal' as any)} />
      </View>
    </Screen>
  );
}
