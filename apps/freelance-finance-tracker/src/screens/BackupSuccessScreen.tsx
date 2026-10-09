import React from 'react';
import { View } from 'react-native';
import { PrimaryButton, Screen } from '../components/ui';
import { Text } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function BackupSuccessScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <Screen title="Backup">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <Text variant="titleMedium">Backup ready to share</Text>
        <PrimaryButton label="Restore from backup" variant="primary" onPress={() => navigation.navigate('Restore')} />
      </View>
    </Screen>
  );
}
