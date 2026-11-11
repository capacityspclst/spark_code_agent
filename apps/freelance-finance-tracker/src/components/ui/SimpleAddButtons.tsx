import React from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '../../theme';
// Navigation will be required lazily inside the component to avoid module load errors

/** Simplified SimpleAddButtons for layout tests – positioned absolutely. */
import { Pressable, Text } from 'react-native';

export default function SimpleAddButtons() {
  // Lazy require navigation to avoid module load errors in static analysis
  const { useNavigation } = require('@react-navigation/native');
  const navigation = useNavigation();

  const goToReceipt = () => navigation.getParent?.()?.navigate('ReceiptEntry');
  const goToMileage = () => navigation.getParent?.()?.navigate('MileageEntry');

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={goToReceipt} accessibilityLabel="Receipt">
        <Text>Receipt</Text>
      </Pressable>
      <Pressable onPress={goToMileage} accessibilityLabel="Mileage">
        <Text>Mileage</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // 80dp from bottom to sit above tab bar
    bottom: 80,
    right: space(2),
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: space(1),
    elevation: 4,
    zIndex: 10,
  },
});
