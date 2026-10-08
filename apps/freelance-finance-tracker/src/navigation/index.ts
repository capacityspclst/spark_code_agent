// src/navigation/index.ts
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PolicyScreen from '../screens/PolicyScreen';
import BottomTabNavigator from '../components/ui/BottomTabNavigator';
import { getPolicyAcceptance } from '../lib/policy';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Screen } from '../components/ui/Screen';

export type RootStackParamList = {
  policy: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('policy');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const acceptance = await getPolicyAcceptance();
      if (acceptance && acceptance.version === '1.0') {
        setInitialRoute('Main');
      } else {
        setInitialRoute('policy');
      }
      setChecking(false);
    };
    check();
  }, []);

  if (checking) {
    return (
      <Screen>
        <ActivityIndicator />
        <Text>Loading…</Text>
      </Screen>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="policy" component={PolicyScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
