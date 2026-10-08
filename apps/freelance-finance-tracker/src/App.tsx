import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import { acceptPolicy, getPolicyAcceptance, policyAccepted } from './lib/policy';
import { getStore } from './lib/storage';
import PolicyScreen from './screens/PolicyScreen';
import { theme } from './theme';

// Every Paper icon goes through this renderer. Icons sit inside labelled controls, so the glyph is decorative
// and hidden from screen readers (Paper's default web icon is an unlabelled role="img", which fails axe).
const paperSettings = { icon: (props: React.ComponentProps<typeof MaterialCommunityIcons>) => <MaterialCommunityIcons {...props} aria-hidden /> };

type Gate = 'loading' | 'policy' | 'ready';

export default function App() {
  const [gate, setGate] = useState<Gate>('loading');

  useEffect(() => {
    getPolicyAcceptance(getStore())
      .then((a) => setGate(policyAccepted(a) ? 'ready' : 'policy'))
      .catch(() => setGate('policy')); // unreadable store: ask again rather than hang on a spinner
  }, []);

  const accept = async () => {
    await acceptPolicy(getStore());
    setGate('ready');
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme} settings={paperSettings}>
        <StatusBar style="dark" />
        {gate === 'loading' ? (
          <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading" />
        ) : gate === 'policy' ? (
          <PolicyScreen onAccept={accept} />
        ) : (
          <Navigation />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
