import React from 'react';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Screen } from '../components/ui';

export default function MileageDetailScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  const openHistory = () => {
    navigation.navigate('History' as any);
  };

  return (
    <Screen title="Mileage Details">
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <IconButton icon="history" accessibilityLabel="History" onPress={openHistory} />
      </View>
      <Text>Mileage detail view (placeholder)</Text>
    </Screen>
  );
}
