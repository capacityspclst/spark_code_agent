import React from 'react';
import { View } from 'react-native';
import { theme } from '../../src/theme';

/**
 * Separator is a very small presentational component. The test verifies its
 * static style without needing a renderer.
 */
describe('Separator component', () => {
  test('renders a 1 dp tall View with surfaceVariant background colour', () => {
    // Dynamically import the component – it should exist after implementation.
    let Separator: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      Separator = require('../../src/components/ui/Separator').default;
    } catch {
      // Component missing – let the assertion fail.
    }
    expect(Separator).toBeTruthy();

    // Call the functional component directly – it returns a React element.
    const element = Separator({});
    expect(element).toBeTruthy();
    expect(element.type).toBe(View);

    const style = element.props.style;
    // Styles may be an array or object; flatten for inspection.
    const flatten = Array.isArray(style) ? Object.assign({}, ...style) : style;

    expect(flatten).toHaveProperty('height', 1);
    expect(flatten).toHaveProperty('backgroundColor', theme.colors.surfaceVariant);
  });
});
