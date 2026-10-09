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
import AppLockScreen from '../screens/AppLockScreen';
import TaxSettingsScreen from '../screens/TaxSettingsScreen';
import ExportScreen from '../screens/ExportScreen';
import BackupScreen from '../screens/BackupScreen';
import BackupPassphraseScreen from '../screens/BackupPassphraseScreen';
import RestoreScreen from '../screens/RestoreScreen';
import BackupSuccessScreen from '../screens/BackupSuccessScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

// Tab icons are decorative: the tab's label names it (aria-hidden keeps axe from flagging an unlabelled image).
const tabIcon = (name: React.ComponentProps<typeof MaterialCommunityIcons>['name']) =>
  ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name={name} color={color} size={size} aria-hidden />;

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator initialRouteName="SettingsMain">
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} options={{ headerShown: false }} />
      <SettingsStack.Screen name="Export" component={ExportScreen} options={{ title: 'Export data' }} />
      <SettingsStack.Screen name="Backup" component={BackupScreen} options={{ title: 'Backup & restore' }} />
      <SettingsStack.Screen name="backup_passphrase_modal" component={BackupPassphraseScreen} options={{ title: 'Create backup' }} />
      <SettingsStack.Screen name="Restore" component={RestoreScreen} options={{ title: 'Restore backup' }} />
      <SettingsStack.Screen name="AppLock" component={AppLockScreen} options={{ title: 'App lock' }} />
      <SettingsStack.Screen name="TaxSettings" component={TaxSettingsScreen} options={{ title: 'Tax settings' }} />
    </SettingsStack.Navigator>
  );
}

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
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: tabIcon('view-dashboard-outline'),
          tabBarLabel: 'Dashboard',
          tabBarAccessibilityLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Receipts"
        component={ReceiptsScreen}
        options={{
          tabBarIcon: tabIcon('receipt-outline'),
          tabBarLabel: 'Receipts',
          tabBarAccessibilityLabel: 'Receipts',
        }}
      />
      <Tab.Screen
        name="Mileage"
        component={MileageScreen}
        options={{
          tabBarIcon: tabIcon('run'),
          tabBarLabel: 'Mileage',
          tabBarAccessibilityLabel: 'Mileage',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: tabIcon('cog-outline'),
          tabBarLabel: 'Settings',
          tabBarAccessibilityLabel: 'Settings',
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            // Reset Settings stack to its main screen when the tab is pressed
            navigation.navigate('Settings', { screen: 'SettingsMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.colors.background, primary: theme.colors.primary } };

/** Main app after the policy is accepted: tabs, plus the policy as a read‑only page. */
export default function Navigation() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Policy" options={{ title: 'Terms and Privacy Policy' }}>
          {() => <PolicyScreen readOnly onAccept={() => {}} />}
        </Stack.Screen>
        <Stack.Screen name="BackupSuccess" component={BackupSuccessScreen} options={{ title: 'Backup' }} />
        <Stack.Screen name="ReceiptEntry" options={{ title: 'Add receipt' }} component={ReceiptEntryScreen} />
        <Stack.Screen name="MileageEntry" options={{ title: 'Add mileage' }} component={MileageEntryScreen} />
        {/* Other modal screens can be added here if needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
