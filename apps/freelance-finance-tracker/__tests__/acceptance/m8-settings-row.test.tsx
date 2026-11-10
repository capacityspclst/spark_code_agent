import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import SettingsRow from '../../src/components/ui/SettingsRow';
import SettingSwitch from '../../src/components/ui/SettingSwitch';
import { theme } from '../../src/theme';

/**
 * Utility: recursively search a React element tree for a node of a given component type.
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
 * Utility: find a Text component whose children exactly match the supplied string.
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
 * Helper to flatten a style prop (which may be an array) into one object for inspection.
 */
function flattenStyle(style: any): any {
  if (!style) return {};
  return Array.isArray(style) ? Object.assign({}, ...style) : style;
}

describe('SettingsRow component (logic‑only contract)', () => {
  test('renders a row with a trailing switch and no chevron', () => {
    const onSwitchChange = jest.fn();

    const element = SettingsRow({
      label: 'App lock',
      testID: 'settings-row-app-lock',
      showSwitch: true,
      switchValue: false,
      onSwitchChange,
      showChevron: false,
    });

    // Root must be a TouchableOpacity with the supplied testID.
    expect(element).toBeTruthy();
    expect(element.type).toBe(TouchableOpacity);
    expect(element.props.testID).toBe('settings-row-app-lock');

    // The label should appear inside a Text component.
    const labelText = findTextByContent(element, 'App lock');
    expect(labelText).toBeTruthy();

    // A SettingSwitch should be present.
    const switchNode = findInTree(element, SettingSwitch);
    expect(switchNode).toBeTruthy();

    // No chevron should be rendered.
    const chevronNode = findInTree(element, MaterialIcons);
    expect(chevronNode).toBeNull();
  });

  test('renders a navigation row with a trailing chevron icon', () => {
    const onPress = jest.fn();

    const element = SettingsRow({
      label: 'Tax settings',
      testID: 'settings-row-tax-settings',
      onPress,
      showChevron: true,
    });

    // Root is a TouchableOpacity with the provided onPress handler.
    expect(element.type).toBe(TouchableOpacity);
    expect(typeof element.props.onPress).toBe('function');

    // Label text present.
    const labelText = findTextByContent(element, 'Tax settings');
    expect(labelText).toBeTruthy();

    // Chevron icon should be rendered via MaterialIcons.
    const chevronNode = findInTree(element, MaterialIcons);
    expect(chevronNode).toBeTruthy();
    expect(chevronNode.props.name).toBe('chevron-right');

    // No switch should be present.
    const switchNode = findInTree(element, SettingSwitch);
    expect(switchNode).toBeNull();
  });

  test('renders an error‑styled row without chevron or switch', () => {
    const onPress = jest.fn();

    const element = SettingsRow({
      label: 'Delete all data',
      testID: 'settings-row-delete-all-data',
      onPress,
      error: true,
      showChevron: false,
    });

    // Root is a TouchableOpacity.
    expect(element.type).toBe(TouchableOpacity);

    // Label text must be styled with the theme error colour.
    const labelText = findTextByContent(element, 'Delete all data');
    expect(labelText).toBeTruthy();
    const style = flattenStyle(labelText.props.style);
    expect(style?.color).toBe(theme.colors.error);

    // No chevron.
    const chevronNode = findInTree(element, MaterialIcons);
    expect(chevronNode).toBeNull();

    // No switch.
    const switchNode = findInTree(element, SettingSwitch);
    expect(switchNode).toBeNull();

    // Press handler attached to the row.
    expect(typeof element.props.onPress).toBe('function');
    element.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
