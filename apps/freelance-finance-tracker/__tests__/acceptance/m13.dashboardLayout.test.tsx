import React from 'react';
import { Text, View, Dimensions } from 'react-native';
import FABAdd from '../../src/components/ui/FABAdd';
import RecentActivityList from '../../src/components/ui/RecentActivityList';
import BottomTabBar from '../../src/components/ui/BottomTabBar';
import { theme } from '../../src/theme';

/**
 * Mock the navigation hook used inside FABAdd so that the component can be
 * invoked as a plain function without a navigation container.
 */
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      getParent: () => ({
        navigate: jest.fn(),
      }),
    }),
  };
});

/**
 * Utility: flatten a style prop (array or object) into a plain object for inspection.
 */
function flattenStyle(style: any): any {
  if (!style) return {};
  return Array.isArray(style) ? Object.assign({}, ...style) : style;
}

/**
 * Recursive search for a node that satisfies a predicate on its style.
 */
function findNodeWithStyleCondition(
  node: any,
  predicate: (style: any) => boolean,
): any | null {
  if (!node) return null;
  const style = node.props?.style;
  if (style && predicate(style)) {
    return node;
  }
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findNodeWithStyleCondition(child, predicate);
      if (found) return found;
    }
  } else if (children) {
    return findNodeWithStyleCondition(children, predicate);
  }
  return null;
}

/**
 * Recursive search for a Text node whose children exactly match the supplied string.
 */
function findTextByContent(node: any, content: string): any | null {
  if (!node) return null;
  if (node.type === Text && node.props?.children === content) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findTextByContent(child, content);
      if (found) return found;
    }
  } else if (children) {
    return findTextByContent(children, content);
  }
  return null;
}

/**
 * Force the test environment to use a 390 × 844 dp phone size.
 */
beforeAll(() => {
  // The RN test environment does not always provide Dimensions.set.
  // Provide a simple mock if missing.
  // @ts-ignore
  if (typeof Dimensions.set !== 'function') {
    // @ts-ignore
    Dimensions.set = jest.fn();
  }
  Dimensions.set({
    window: { width: 390, height: 844, scale: 2, fontScale: 2 },
    screen: { width: 390, height: 844, scale: 2, fontScale: 2 },
  });
});

describe('Dashboard layout', () => {
  test('FABAdd is absolutely positioned above the tab bar', () => {
    // FABAdd is a pure‑function component – invoke it directly.
    const element = FABAdd({});
    const fabNode = findNodeWithStyleCondition(element, (s) => s?.position === 'absolute');
    expect(fabNode).toBeTruthy();

    const style = flattenStyle(fabNode?.props?.style);
    // Must be positioned absolutely.
    expect(style.position).toBe('absolute');
    // Bottom offset should be at least the tab‑bar height plus a small margin.
    const minBottom = theme.TAB_BAR_HEIGHT + theme.spacing; // 8 dp margin
    expect(style.bottom).toBeGreaterThanOrEqual(minBottom);
    // Right offset should be non‑negative.
    expect(style.right).toBeGreaterThanOrEqual(0);
    // Ensure it sits above scroll content.
    expect(style.zIndex).toBeGreaterThanOrEqual(10);
  });

  test('RecentActivityList reserves space for FAB and tab bar', () => {
    const activities = [
      { id: 'a1', type: 'receipt', amount: 12.34, description: 'Coffee' },
      { id: 'a2', type: 'mileage', miles: 15, amount: 8.78, description: 'Trip' },
    ];
    const element = RecentActivityList({ activities });

    // The root ScrollView should have a paddingBottom large enough.
    const containerStyle = flattenStyle(element.props?.style);
    const expectedPadding = theme.FAB_CONTAINER_HEIGHT + theme.TAB_BAR_HEIGHT;
    expect(containerStyle.paddingBottom).toBeGreaterThanOrEqual(expectedPadding);
  });

  test('Each activity row does NOT display its amount', () => {
    const activities = [
      { id: 'a1', type: 'receipt', amount: 12.34, description: 'Coffee' },
      { id: 'a2', type: 'mileage', miles: 15, amount: 8.78, description: 'Trip' },
    ];
    const element = RecentActivityList({ activities });

    // Look for Text nodes that directly contain the formatted amounts.
    const amountNode1 = findTextByContent(element, '12.34');
    const amountNode2 = findTextByContent(element, '8.78');
    expect(amountNode1).toBeNull();
    expect(amountNode2).toBeNull();
  });

  test('BottomTabBar shows all four labels on a 390×844 phone', () => {
    const state = {
      index: 0,
      routes: [
        { key: 'dashboard', name: 'Dashboard' },
        { key: 'receipts', name: 'Receipts' },
        { key: 'mileage', name: 'Mileage' },
        { key: 'settings', name: 'Settings' },
      ],
    };
    const descriptors = {};
    const navigation = {};

    const element = BottomTabBar({ state, descriptors, navigation });

    // Verify each label appears somewhere in the rendered tree.
    const labelDashboard = findTextByContent(element, 'Dashboard');
    const labelReceipts = findTextByContent(element, 'Receipts');
    const labelMileage = findTextByContent(element, 'Mileage');
    const labelSettings = findTextByContent(element, 'Settings');

    expect(labelDashboard).toBeTruthy();
    expect(labelReceipts).toBeTruthy();
    expect(labelMileage).toBeTruthy();
    expect(labelSettings).toBeTruthy();
  });
});
