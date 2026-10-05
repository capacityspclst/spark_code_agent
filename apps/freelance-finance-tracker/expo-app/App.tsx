import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Pressable, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ReceiptCaptureScreen from './src/screens/ReceiptCaptureScreen';
import MileageEntryScreen from './src/screens/MileageEntryScreen';
import ExportScreen from './src/screens/ExportScreen';
import { theme } from './src/theme';
import { getToken } from './src/auth';
import Header from './src/components/Header';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.background, height: 56 },
        tabBarActiveTintColor: theme.colors.primaryVariant,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarButton: (props) => {
          const { onPress, accessibilityState, style, children } = props as any;
          // Determine label from the child Text if present, else fallback to empty
          const label = children?.props?.children?.[1]?.props?.children || '';
          return (
            <Pressable
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: accessibilityState?.selected }}
              accessibilityLabel={label}
              style={style}
            >
              {children}
            </Pressable>
          );
        },
        // Use default label rendering (React Navigation handles it)
        tabBarLabel: undefined,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,\n          tabBarAccessibilityLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="ReceiptCapture"
        component={ReceiptCaptureScreen}
        options={{
          title: 'Add Receipt',
          tabBarIcon: ({ color }) => <FontAwesome name="camera" size={24} color={color} />,\n          tabBarAccessibilityLabel: 'Add Receipt',
        }}
      />
      <Tab.Screen
        name="Mileage"
        component={MileageEntryScreen}
        options={{
          title: 'Mileage',
          tabBarIcon: ({ color }) => <FontAwesome name="car" size={24} color={color} />,\n          tabBarAccessibilityLabel: 'Mileage',
        }}
      />
      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{
          title: 'Export',
          tabBarIcon: ({ color }) => <FontAwesome name="download" size={24} color={color} />,\n          tabBarAccessibilityLabel: 'Export',
        }}
      />
    </Tab.Navigator>
  );
}

function MainWithHeader() {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <MainTabs />
    </View>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Auth' | 'Main'>('Auth');

  useEffect(() => {
    async function checkToken() {
      const token = await getToken();
      setInitialRoute(token ? 'Main' : 'Auth');
      setLoading(false);
    }
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} accessibilityRole="alert">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute === 'Main' ? 'Main' : 'Auth'}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainWithHeader} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
