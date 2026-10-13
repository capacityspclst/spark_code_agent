import React from 'react';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Screen } from '../components/ui';

// Minimal receipt detail screen with a History button (top‑right).
export default function ReceiptDetailScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  const openHistory = () => {
    // In a full app this would navigate to a History screen filtered by the receipt id.
    // For now we just navigate to a placeholder route if it exists.
    navigation.navigate('History' as any);
  };

  return (
    <Screen title="Receipt Details">
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <IconButton icon="history" accessibilityLabel="History" onPress={openHistory} />
      </View>
      <Text>Receipt detail view (placeholder)</Text>
    </Screen>
  );
}
