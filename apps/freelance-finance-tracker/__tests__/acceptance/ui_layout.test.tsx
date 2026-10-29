import { render, cleanup } from '@testing-library/react-native';
import React from 'react';

// Helper to load a screen after applying a fresh mock environment
function loadScreen<T>(modulePath: string): T {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const screen = require(modulePath);
  return screen.default as T;
}

afterEach(() => {
  cleanup();
  jest.resetModules();
});

describe('ReceiptEntryScreen – Scan receipt button visibility', () => {
  it('shows the Scan receipt button when scanning is supported', () => {
    jest.doMock('expo-text-extractor', () => ({
      isSupported: true,
      extractTextFromImage: jest.fn(),
    }));

    const ReceiptEntryScreen = loadScreen<any>('../../src/screens/ReceiptEntryScreen');
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const { queryByText } = render(<ReceiptEntryScreen navigation={navigation} />);
    expect(queryByText(/Scan receipt/i)).toBeTruthy();
  });

  it('hides the Scan receipt button when scanning is not supported', () => {
    jest.doMock('expo-text-extractor', () => ({
      isSupported: false,
      extractTextFromImage: jest.fn(),
    }));

    const ReceiptEntryScreen = loadScreen<any>('../../src/screens/ReceiptEntryScreen');
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const { queryByText } = render(<ReceiptEntryScreen navigation={navigation} />);
    expect(queryByText(/Scan receipt/i)).toBeNull();
  });
});

describe('SettingsScreen – App lock UI', () => {
  it('renders a single switch row for App lock and no separate button', () => {
    const SettingsScreen = loadScreen<any>('../../src/screens/SettingsScreen');

    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const { getByA11yRole, queryByA11yRole } = render(
      <SettingsScreen navigation={navigation} />
    );

    // Switch with the label “App lock” must be present
    expect(getByA11yRole('switch', { name: /App lock/i })).toBeTruthy();

    // No button labelled “App lock” should exist
    expect(queryByA11yRole('button', { name: /App lock/i })).toBeNull();
  });
});

describe('DashboardScreen – title appears only once', () => {
  it('renders the screen title a single time, in the header only', () => {
    const DashboardScreen = loadScreen<any>('../../src/screens/DashboardScreen');

    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const route = {};

    const { queryAllByText } = render(
      <DashboardScreen navigation={navigation} route={route} />
    );

    // The word “Dashboard” should appear exactly once
    expect(queryAllByText('Dashboard')).toHaveLength(1);
  });
});
