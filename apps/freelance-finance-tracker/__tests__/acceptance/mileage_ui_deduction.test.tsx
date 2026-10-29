import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import React from 'react';
import { TextInput } from 'react-native';
import { DEFAULT_MILEAGE_RATE } from '../../src/lib/settings';

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

    // Render the screen
    const renderResult = render(<MileageEntryScreen navigation={navigation} />);
    const { getByText, UNSAFE_getAllByType } = renderResult;

    // Locate the mileage TextInput.  We look for a TextInput whose placeholder
    // or accessibility label contains the word "Miles".  This works even if the
    // testing library version does not expose getByPlaceholderText.
    const inputs = UNSAFE_getAllByType(TextInput);
    const milesInput = inputs.find((node: any) => {
      const placeholder = node.props?.placeholder;
      const a11yLabel = node.props?.accessibilityLabel ?? node.props?.accessibilityLabel;
      return (
        (typeof placeholder === 'string' && /Miles/i.test(placeholder)) ||
        (typeof a11yLabel === 'string' && /Miles/i.test(a11yLabel))
      );
    });

    // Ensure we actually found the input; if not, the test will fail early.
    expect(milesInput).toBeDefined();

    // Simulate user typing a decimal mileage.
    fireEvent.changeText(milesInput as any, '12.5');

    // Compute the expected deduction using the default mileage rate.
    const expectedDeduction = (12.5 * DEFAULT_MILEAGE_RATE).toFixed(2); // e.g. "8.19"

    // Wait for the UI to display the calculated deduction.
    await waitFor(() => {
      // The UI may include surrounding text or a currency symbol; we simply
      // look for a text node that contains the computed number.
      const matcher = (content: string) => content.includes(expectedDeduction);
      expect(getByText(matcher)).toBeTruthy();
    });
  });
});
