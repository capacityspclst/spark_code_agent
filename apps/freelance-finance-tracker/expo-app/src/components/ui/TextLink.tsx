import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

type Props = {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
  testID?: string;
};

export default function TextLink({ onPress, children, accessibilityLabel, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      {({ pressed }) => (
        <Text
          style={[styles.text, pressed && styles.pressed]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    color: theme.colors.primary,
    ...theme.typography.button,
    textDecorationLine: 'underline',
  },
  pressed: {
    // underline persists, maybe extra style
  },
});
