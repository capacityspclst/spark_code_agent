// src/App.tsx
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { appTheme } from './theme';
import Navigation from './navigation'; // import folder directly resolves to index.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

const paperSettings = {
  icon: (props: any) => <MaterialCommunityIcons {...props} aria-hidden={true} />, // eslint-disable-line react/jsx-props-no-spreading
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme} settings={paperSettings}>
        <Navigation />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
