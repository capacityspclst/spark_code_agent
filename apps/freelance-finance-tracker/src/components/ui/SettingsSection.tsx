import React, { Fragment } from 'react';
import { View, StyleSheet } from 'react-native';
import { space } from '../../theme';
import Separator from './Separator';

type Props = {
  children: React.ReactNode;
  /** Adds 16dp of padding above the section's first row. */
  showTopPadding?: boolean;
  /** Adds 16dp of padding below the section's last row. */
  showBottomPadding?: boolean;
  /** When true, a Separator line is rendered between each child row. */
  separator?: boolean;
};

/** Groups SettingsRow items, with optional top/bottom padding and separator lines, per DESIGN.md. */
export default function SettingsSection({ children, showTopPadding = false, showBottomPadding = false, separator = false }: Props) {
  const items = React.Children.toArray(children);

  return (
    <View
      style={[
        styles.container,
        showTopPadding && styles.topPadding,
        showBottomPadding && styles.bottomPadding,
      ]}
    >
      {separator
        ? items.map((child, index) => (
            <Fragment key={index}>
              {index > 0 ? <Separator /> : null}
              {child}
            </Fragment>
          ))
        : items}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space(1),
  },
  topPadding: {
    paddingTop: space(2),
  },
  bottomPadding: {
    paddingBottom: space(2),
  },
});
