import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import { acceptPolicy, getPolicyAcceptance, policyAccepted } from './lib/policy';
import { getStore } from './lib/storage';
import PolicyScreen from './screens/PolicyScreen';
import { theme } from './theme';
import { getAppLockEnabled } from './lib/settings';
import { authenticate } from './lib/appLock';

// Every Paper icon goes through this renderer. Icons sit inside labelled controls, so the glyph is decorative
// and hidden from screen readers (Paper's default web icon is an unlabelled role="img", which fails axe).
const paperSettings = { icon: (props: React.ComponentProps<typeof MaterialCommunityIcons>) => <MaterialCommunityIcons {...props} aria-hidden /> };

type Gate = 'loading' | 'policy' | 'ready';

export default function App() {
  const [gate, setGate] = useState<Gate>('loading');
  const [locked, setLocked] = useState<boolean>(false);

  // Initial policy check
  useEffect(() => {
    getPolicyAcceptance(getStore())
      .then((a) => setGate(policyAccepted(a) ? 'ready' : 'policy'))
      .catch(() => setGate('policy'));
  }, []);

  // Check app lock after policy is ready (initial launch)
  useEffect(() => {
    if (gate === 'ready') {
      (async () => {
        const enabled = await getAppLockEnabled();
        if (enabled) {
          const ok = await authenticate();
          setLocked(!ok);
        }
      })();
    }
  }, [gate]);

  // Re‑authenticate whenever the app returns to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'active' && gate === 'ready') {
        const enabled = await getAppLockEnabled();
        if (enabled) {
          const ok = await authenticate();
          setLocked(!ok);
        } else {
          setLocked(false);
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, [gate]);

  const accept = async () => {
    await acceptPolicy(getStore());
    setGate('ready');
  };

  // Show loading while checking policy or when locked after a successful auth check fails
  if (gate === 'loading' || (gate === 'ready' && locked)) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme} settings={paperSettings}>
          <StatusBar style="dark" />
          <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading" />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme} settings={paperSettings}>
        <StatusBar style="dark" />
        {gate === 'policy' ? (
          <PolicyScreen onAccept={accept} />
        ) : (
          <Navigation />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
