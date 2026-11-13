import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import SimpleAddButtons from '../../src/components/ui/SimpleAddButtons';
import ReceiptCard from '../../src/components/ui/ReceiptCard';

/* Mock navigation used inside SimpleAddButtons (it calls useNavigation). */
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

/**
 * Recursively search a React element (the plain object returned by a component
 * function) for a node whose `type` matches the supplied component.
 */
function findInTree(node: any, type: any): any | null {
  if (!node) return null;
  if (node.type === type) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findInTree(child, type);
      if (found) return found;
    }
  } else if (children) {
    return findInTree(children, type);
  }
  return null;
}

/**
 * Find a Text node whose rendered string includes the supplied substring.
 */
function findTextContaining(node: any, substr: string): any | null {
  if (!node) return null;
  if (node.type === Text && typeof node.props?.children === 'string') {
    if ((node.props.children as string).includes(substr)) return node;
  }
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findTextContaining(child, substr);
      if (found) return found;
    }
  } else if (children) {
    return findTextContaining(children, substr);
  }
  return null;
}

/**
 * Flatten a style prop (which may be an array, a numeric StyleSheet ID,
 * or a plain object) into a plain object for inspection.
 */
function flattenStyle(style: any): any {
  if (!style) return {};
  return StyleSheet.flatten(style);
}

describe('Dashboard layout contract (logic‑only)', () => {
  test('SimpleAddButtons is positioned absolutely so it overlays the activity list', () => {
    // Calling the component function returns a React element tree.
    const element = SimpleAddButtons({});
    expect(element).toBeTruthy();

    const container = findInTree(element, View);
    expect(container).toBeTruthy();

    const style = flattenStyle(container.props?.style);
    expect(style.position).toBe('absolute');
    // The container should be anchored to the bottom of the screen.
    expect(style.bottom).not.toBeUndefined();
  });

  test('ReceiptSavedSnackbar uses absolute positioning to overlay content', () => {
    // Dynamically import the component – it should exist after implementation.
    let ReceiptSavedSnackbar: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ReceiptSavedSnackbar = require('../../src/components/ui/ReceiptSavedSnackbar').default;
    } catch {
      // Component missing – let the assertion fail.
    }
    expect(ReceiptSavedSnackbar).toBeTruthy();

    const element = ReceiptSavedSnackbar({ visible: true, message: 'Receipt saved' });
    expect(element).toBeTruthy();

    const container = findInTree(element, View);
    expect(container).toBeTruthy();

    const style = flattenStyle(container.props?.style);
    expect(style.position).toBe('absolute');
    expect(style.top).not.toBeUndefined();
  });

  test('ReceiptCard displays the receipt amount in its rendered output', () => {
    const receipt = {
      id: 'r123',
      amount: 123.45,
      date: '2023-01-01',
      category: 'Supplies',
      type: 'expense',
      notes: '',
    };
    const element = ReceiptCard({ receipt });
    expect(element).toBeTruthy();

    // Look for a Text node that contains the numeric amount (we accept stringified form).
    const amountNode = findTextContaining(element, '123.45');
    expect(amountNode).toBeTruthy();
  });
});
