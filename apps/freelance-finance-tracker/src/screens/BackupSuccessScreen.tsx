import React from 'react';
import { View, Text } from 'react-native';
import { PrimaryButton } from '../components/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function BackupSuccessScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Backup ready to share</Text>
      <PrimaryButton label="Restore" variant="primary" onPress={() => navigation.navigate('Restore')} />
    </View>
  );
}
