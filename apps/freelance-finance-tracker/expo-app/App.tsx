import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Pressable } from 'react-native';
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

// Cast Tab.Navigator to any to bypass TypeScript prop validation (lazy, detachInactiveScreens)
const AnyTabNavigator = Tab.Navigator as any;

function MainTabs() {
  return (
    // @ts-ignore: using AnyTabNavigator to allow lazy loading props
    <AnyTabNavigator
      lazy={true}
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.surface, height: 56 },
        tabBarActiveTintColor: theme.colors.primaryVariant,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarButton: (props) => {
          const { onPress, accessibilityState, accessibilityLabel, style, children } = props as any;
          return (
            <Pressable
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: accessibilityState?.selected }}
              accessibilityLabel={accessibilityLabel}
              style={style}
            >
              {children}
            </Pressable>
          );
        },
        tabBarLabel: undefined,
        unmountOnBlur: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />, 
          tabBarAccessibilityLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="ReceiptCapture"
        component={ReceiptCaptureScreen}
        options={{
          title: 'Add Receipt',
          tabBarIcon: ({ color }) => <FontAwesome name="camera" size={24} color={color} />, 
          tabBarAccessibilityLabel: 'Add Receipt',
        }}
      />
      <Tab.Screen
        name="Mileage"
        component={MileageEntryScreen}
        options={{
          title: 'Mileage',
          tabBarIcon: ({ color }) => <FontAwesome name="car" size={24} color={color} />, 
          tabBarAccessibilityLabel: 'Mileage',
        }}
      />
      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{
          title: 'Export',
          tabBarIcon: ({ color }) => <FontAwesome name="download" size={24} color={color} />, 
          tabBarAccessibilityLabel: 'Export',
        }}
      />
    </AnyTabNavigator>
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
