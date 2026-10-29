// Simple mock for @testing-library/react-native using react-test-renderer.
import * as React from 'react';
import { create } from 'react-test-renderer';

type Node = any;

type GetByText = (text: string | RegExp) => any;

type QueryByText = (text: string | RegExp) => any;

type GetByPlaceholderText = (placeholder: string | RegExp) => any;

type GetByA11yRole = (role: string, options?: any) => any;

type QueryByA11yRole = (role: string, options?: any) => any;

type QueryAllByText = (text: string | RegExp) => Node[];

type Unmount = () => void;

// Keep reference to the last renderer for cleanup.
let currentRenderer: { unmount: Unmount } | null = null;

function render(component: React.ReactElement, _options?: any): any {
  const testRenderer = create(component);
  const root = testRenderer.root;
  // Store for cleanup.
  currentRenderer = { unmount: () => testRenderer.unmount() };

  const getByText: GetByText = (text) => {
    const nodes = root.findAll((node: Node) => {
      const child = node.props?.children;
      if (typeof child !== 'string') return false;
      return typeof text === 'string' ? child === text : text.test(child);
    });
    if (nodes.length === 0) throw new Error('Unable to find element with text: ' + text);
    return nodes[0];
  };

  const queryByText: QueryByText = (text) => {
    const nodes = root.findAll((node: Node) => {
      const child = node.props?.children;
      if (typeof child !== 'string') return false;
      return typeof text === 'string' ? child === text : text.test(child);
    });
    return nodes[0] || null;
  };

  const getByPlaceholderText: GetByPlaceholderText = (placeholder) => {
    const nodes = root.findAll((node: Node) => {
      const ph = node.props?.placeholder;
      if (!ph) return false;
      return typeof placeholder === 'string' ? ph === placeholder : placeholder.test(ph);
    });
    if (nodes.length === 0) throw new Error('Unable to find element with placeholder: ' + placeholder);
    return nodes[0];
  };

  const getByA11yRole: GetByA11yRole = (role, options) => {
    const name = options?.name;
    const nodes = root.findAll((node: Node) => {
      if (node.props?.accessibilityRole !== role) return false;
      if (!name) return true;
      const label = node.props?.accessibilityLabel;
      if (typeof label !== 'string') return false;
      return typeof name === 'string' ? label === name : name.test(label);
    });
    if (nodes.length === 0) throw new Error('Unable to find element with role: ' + role);
    return nodes[0];
  };

  const queryByA11yRole: QueryByA11yRole = (role, options) => {
    const name = options?.name;
    const nodes = root.findAll((node: Node) => {
      if (node.props?.accessibilityRole !== role) return false;
      if (!name) return true;
      const label = node.props?.accessibilityLabel;
      if (typeof label !== 'string') return false;
      return typeof name === 'string' ? label === name : name.test(label);
    });
    return nodes[0] || null;
  };

  const queryAllByText: QueryAllByText = (text) => {
    return root.findAll((node: Node) => {
      const child = node.props?.children;
      if (typeof child !== 'string') return false;
      return typeof text === 'string' ? child === text : text.test(child);
    });
  };

  const UNSAFE_getAllByType = (type: any) => root.findAll((node: Node) => node.type === type);

  return {
    getByText,
    queryByText,
    getByPlaceholderText,
    getByA11yRole,
    queryByA11yRole,
    queryAllByText,
    UNSAFE_getAllByType,
    // expose unmount for manual cleanup if needed
    unmount: () => testRenderer.unmount(),
  };
}

const fireEvent = {
  changeText: (node: any, value: string) => {
    if (node.props?.onChangeText) {
      node.props.onChangeText(value);
    } else if (node.props?.onChange) {
      node.props.onChange(value);
    }
  },
};

const waitFor = async (cb: any) => {
  // In real library this retries, but here we just call directly.
  await cb();
};

const cleanup = () => {
  // No unmount to avoid accessing .root on an unmounted renderer.
  currentRenderer = null;
};

export { render, fireEvent, waitFor, cleanup };
