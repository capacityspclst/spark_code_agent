declare module '@testing-library/react-native' {
  import * as React from 'react';
  import { ReactTestRendererJSON } from 'react-test-renderer';
  export function render(component: React.ReactElement, options?: any): {
    getByText: (text: string | RegExp) => any;
    queryByText: (text: string | RegExp) => any | null;
    getByA11yRole: (role: string, options?: { name?: string | RegExp }) => any;
    queryByA11yRole: (role: string, options?: { name?: string | RegExp }) => any | null;
    queryAllByText: (text: string | RegExp) => any[];
    // other functions can be added as needed
  };
  export const fireEvent: any;
  export const waitFor: any;
  export const cleanup: any;
}