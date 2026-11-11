import React from 'react';
import { Button } from 'react-native-paper';
import type { ButtonProps } from 'react-native-paper';
import { layout, theme } from '../../theme';
import { Platform } from 'react-native';

type Props = Omit<ButtonProps, 'mode' | 'children'> & { label: string; variant?: 'primary' | 'secondary' | 'text'; disabled?: boolean };

/** The one button style. Provides accessibility hint when disabled and outlines on web for focus/disabled states. */
export default function PrimaryButton({ label, variant = 'primary', contentStyle, disabled, ...rest }: Props) {
  const mode = variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text';
  const hint = disabled ? 'Complete all required fields before proceeding.' : undefined;
  // Web styling: outline for focus/disabled states, consistent opacity when disabled
  const webStyle = Platform.OS === 'web' ? { outline: `2px solid ${theme.colors.outline}`, opacity: disabled ? 0.6 : 1 } : {};
  return (
    <Button
      mode={mode}
      uppercase={false}
      accessibilityLabel={label}
      accessibilityHint={hint}
      disabled={disabled}
      contentStyle={[{ minHeight: layout.touchTarget }, contentStyle]}
      style={webStyle}
      {...rest}
    >
      {label}
    </Button>
  );
}
