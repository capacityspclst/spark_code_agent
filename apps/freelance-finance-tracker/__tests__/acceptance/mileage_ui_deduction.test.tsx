import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
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

describe('MileageEntryScreen – deduction displays correct value for decimal miles', () => {
  it('shows the correct deduction when a decimal mileage is entered', async () => {
    const MileageEntryScreen = loadScreen<any>('../../src/screens/MileageEntryScreen');
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };

    const { getByPlaceholderText, getByText } = render(
      <MileageEntryScreen navigation={navigation} />
    );

    // Find the miles input (placeholder contains the word "Miles")
    const milesInput = getByPlaceholderText(/Miles/i);
    fireEvent.changeText(milesInput, '12.5');

    // The deduction should be calculated using the exact decimal miles.
    // Default mileage rate is 0.585, so 12.5 * 0.585 = 7.3125 (≈ 7.31 when rounded to two decimals).
    // Accept either the full value or the rounded representation.
    await waitFor(() => {
      // Look for a text node that contains the expected numeric part.
      const deductionMatcher = (content: string) => /7\.31/.test(content);
      expect(getByText(deductionMatcher)).toBeTruthy();
    });
  });
});
