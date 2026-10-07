// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { appTheme } from './theme';
import Navigation from './navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// All Paper icons go through this renderer to make them decorative for accessibility.
const paperSettings = {
  icon: (props: any) => <MaterialCommunityIcons {...props} aria-hidden={true} />, // eslint-disable-line react/jsx-props-no-spreading
};

export default function App() {
  // No special initialization needed for now.
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme} settings={paperSettings}>
        <Navigation />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
