// src/components/ui/BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../../screens/DashboardScreen';
import ReceiptsScreen from '../../screens/ReceiptsScreen';
import MileageScreen from '../../screens/MileageScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import ReceiptFormScreen from '../../screens/ReceiptFormScreen';
import MileageFormScreen from '../../screens/MileageFormScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'Dashboard') iconName = 'view-dashboard';
        else if (route.name === 'Receipts') iconName = 'receipt';
        else if (route.name === 'Mileage') iconName = 'map-marker-distance';
        else if (route.name === 'Settings') iconName = 'cog';
        return <MaterialCommunityIcons name={iconName} size={size} color={color} aria-hidden />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Receipts" component={ReceiptsScreen} />
    <Tab.Screen name="Mileage" component={MileageScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
    {/* hidden form screens */}
    <Tab.Screen name="ReceiptForm" component={ReceiptFormScreen} options={{ tabBarButton: () => null }} />
    <Tab.Screen name="MileageForm" component={MileageFormScreen} options={{ tabBarButton: () => null }} />
  </Tab.Navigator>
);

export default BottomTabNavigator;
