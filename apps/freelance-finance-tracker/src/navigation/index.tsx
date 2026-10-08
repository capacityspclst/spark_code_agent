import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ReceiptsScreen from '../screens/ReceiptsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PolicyScreen from '../screens/PolicyScreen';
import ReceiptEntryScreen from '../screens/ReceiptEntryScreen';
import MileageScreen from '../screens/MileageScreen';
import MileageEntryScreen from '../screens/MileageEntryScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab icons are decorative: the tab's label names it (aria-hidden keeps axe from flagging an unlabelled image).
const tabIcon = (name: React.ComponentProps<typeof MaterialCommunityIcons>['name']) =>
  ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name={name} color={color} size={size} aria-hidden />;

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: { backgroundColor: theme.colors.surface, height: 64, paddingTop: 6, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: tabIcon('view-dashboard-outline') }} />
      <Tab.Screen name="Receipts" component={ReceiptsScreen} options={{ tabBarIcon: tabIcon('receipt-outline') }} />
      <Tab.Screen name="Mileage" component={MileageScreen} options={{ tabBarIcon: tabIcon('run-outline') }} />
      <Tab.Screen name="Settings" options={{ tabBarIcon: tabIcon('cog-outline') }}>
        {({ navigation }) => <SettingsScreen onViewPolicy={() => navigation.getParent()?.navigate('Policy')} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.colors.background, primary: theme.colors.primary } };

/** Main app after the policy is accepted: tabs, plus the policy as a read-only page. */
export default function Navigation() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Policy" options={{ title: 'Terms and Privacy Policy' }}>
          {() => <PolicyScreen readOnly onAccept={() => {}} />}
        </Stack.Screen>
        <Stack.Screen name="ReceiptEntry" options={{ title: 'Add receipt' }} component={ReceiptEntryScreen} />
        <Stack.Screen name="MileageEntry" options={{ title: 'Add mileage' }} component={MileageEntryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
