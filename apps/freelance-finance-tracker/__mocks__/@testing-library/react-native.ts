// Simple mock for @testing-library/react-native using react-test-renderer.
import * as React from 'react';
import { create } from 'react-test-renderer';

function render(component: React.ReactElement, _options?: any): any {
  const testRenderer = create(component);
  const root = testRenderer.root;

  const getByText = (text: string | RegExp) => {
    const nodes = root.findAll((node) => {
      const child = node.props?.children;
      if (typeof child !== 'string') return false;
      return typeof text === 'string' ? child === text : text.test(child);
    });
    if (nodes.length === 0) throw new Error('Unable to find element with text: ' + text);
    return nodes[0];
  };

  const queryByText = (text: string | RegExp) => {
    const nodes = root.findAll((node) => {
      const child = node.props?.children;
      if (typeof child !== 'string') return false;
      return typeof text === 'string' ? child === text : text.test(child);
    });
    return nodes[0] || null;
  };

  const getByPlaceholderText = (placeholder: string | RegExp) => {
    const nodes = root.findAll((node) => {
      const ph = node.props?.placeholder;
      if (!ph) return false;
      return typeof placeholder === 'string' ? ph === placeholder : placeholder.test(ph);
    });
    if (nodes.length === 0) throw new Error('Unable to find element with placeholder: ' + placeholder);
    return nodes[0];
  };

  const getByA11yRole = (role: string, options?: any) => {
    const name = options?.name;
    const nodes = root.findAll((node) => {
      if (node.props?.accessibilityRole !== role) return false;
      if (!name) return true;
      const label = node.props?.accessibilityLabel;
      if (typeof label !== 'string') return false;
      return typeof name === 'string' ? label === name : name.test(label);
    });
    if (nodes.length === 0) throw new Error('Unable to find element with role: ' + role);
    return nodes[0];
  };

  const queryByA11yRole = (role: string, options?: any) => {
    const name = options?.name;
    const nodes = root.findAll((node) => {
      if (node.props?.accessibilityRole !== role) return false;
      if (!name) return true;
      const label = node.props?.accessibilityLabel;
      if (typeof label !== 'string') return false;
      return typeof name === 'string' ? label === name : name.test(label);
    });
    return nodes[0] || null;
  };

  const queryAllByText = (text: string | RegExp) => {
    return root.findAll((node) => {
      const child = node.props?.children;
      if (typeof child !== 'string') return false;
      return typeof text === 'string' ? child === text : text.test(child);
    });
  };

  return { getByText, queryByText, getByPlaceholderText, getByA11yRole, queryByA11yRole, queryAllByText, UNSAFE_getAllByType: (type) => root.findAll(node => node.type === type) };
}

const fireEvent = {};
const waitFor = (cb: any) => cb();
const cleanup = () => {};

export { render, fireEvent, waitFor, cleanup };
