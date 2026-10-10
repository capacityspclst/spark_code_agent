import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ReceiptCaptureScreen from './src/screens/ReceiptCaptureScreen';
import MileageEntryScreen from './src/screens/MileageEntryScreen';
import ExportScreen from './src/screens/ExportScreen';
import { theme } from './src/theme';
import { getToken } from './src/auth';
import Header from './src/components/Header';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AnyTabNavigator = Tab.Navigator as any;

// Build Paper theme from our design tokens
const paperTheme = {
  ...MD3LightTheme,
  roundness: theme.radii.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: theme.colors.primary,
    onPrimary: theme.colors.onPrimary,
    secondary: theme.colors.secondary,
    background: theme.colors.background,
    surface: theme.colors.surface,
    error: theme.colors.error,
    // add other overrides as needed
  },
};

// hide icons from screen readers
const paperSettings = { icon: (props: any) => <MaterialCommunityIcons {...props} aria-hidden={true} /> };

function MainTabs() {
  return (
    // @ts-ignore
    <AnyTabNavigator
      lazy={true}
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.background, height: 56 },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarShowLabel: false,
        tabBarButton: (props: BottomTabBarButtonProps) => {
          const { onPress, accessibilityState, accessibilityLabel, style, children } = props as any;
          const focused = accessibilityState?.selected;
          const focusStyle = focused ? { borderWidth: 2, borderColor: theme.colors.primary } : {};
          return (
            <Pressable
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: accessibilityState?.selected }}
              accessibilityLabel={accessibilityLabel}
              style={[style, focusStyle]}
            >
              {children}
            </Pressable>
          );
        },
        unmountOnBlur: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />, 
          tabBarAccessibilityLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="ReceiptCapture"
        component={ReceiptCaptureScreen}
        options={{
          tabBarIcon: ({ color }) => <FontAwesome name="camera" size={24} color={color} />, 
          tabBarAccessibilityLabel: 'Add Receipt',
        }}
      />
      <Tab.Screen
        name="Mileage"
        component={MileageEntryScreen}
        options={{
          tabBarIcon: ({ color }) => <FontAwesome name="car" size={24} color={color} />, 
          tabBarAccessibilityLabel: 'Mileage',
        }}
      />
      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{
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
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }} accessibilityRole="alert">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme} settings={paperSettings}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown:false }} initialRouteName={initialRoute === 'Main' ? 'Main' : 'Auth'}>
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="Main" component={MainWithHeader} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
