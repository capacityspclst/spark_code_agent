// Minimal mock for @testing-library/react-native used in acceptance tests.
// Provides a very simple render implementation based on react-test-renderer JSON output.
import * as React from 'react';
import { create } from 'react-test-renderer';

function walk(node: any, predicate: (n: any) => boolean, results: any[] = []): any[] {
  if (!node) return results;
  if (predicate(node)) results.push(node);
  const children = node.children;
  if (Array.isArray(children)) {
    children.forEach((c) => walk(typeof c === 'object' ? c : null, predicate, results));
  }
  return results;
}

function render(component: React.ReactElement, _options?: any) {
  const testRenderer = create(component);
  const tree = testRenderer.toJSON();

  const getByText = (text: string | RegExp) => {
    const matches = walk(tree, (n) => typeof n.props?.children === 'string' && (typeof text === 'string' ? n.props.children === text : text.test(n.props.children)));
    if (matches.length === 0) throw new Error('Unable to find element with text: ' + text);
    return matches[0];
  };
  const queryByText = (text: string | RegExp) => {
    const matches = walk(tree, (n) => typeof n.props?.children === 'string' && (typeof text === 'string' ? n.props.children === text : text.test(n.props.children)));
    return matches[0] || null;
  };
  const getByA11yRole = (role: string, options?: any) => {
    const name = options?.name;
    const matches = walk(tree, (n) => n.props?.accessibilityRole === role && (!name || (typeof n.props?.accessibilityLabel === 'string' && (typeof name === 'string' ? n.props.accessibilityLabel === name : name.test(n.props.accessibilityLabel)))));
    if (matches.length === 0) throw new Error('Unable to find element with role: ' + role);
    return matches[0];
  };
  const queryByA11yRole = (role: string, options?: any) => {
    const name = options?.name;
    const matches = walk(tree, (n) => n.props?.accessibilityRole === role && (!name || (typeof n.props?.accessibilityLabel === 'string' && (typeof name === 'string' ? n.props.accessibilityLabel === name : name.test(n.props.accessibilityLabel)))));
    return matches[0] || null;
  };
  const queryAllByText = (text: string | RegExp) => {
    return walk(tree, (n) => typeof n.props?.children === 'string' && (typeof text === 'string' ? n.props.children === text : text.test(n.props.children)));
  };
  return { getByText, queryByText, getByA11yRole, queryByA11yRole, queryAllByText };
}

const fireEvent = {};
const waitFor = (cb: any) => cb();
const cleanup = () => {};

export { render, fireEvent, waitFor, cleanup };
