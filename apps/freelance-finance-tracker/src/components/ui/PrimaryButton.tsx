import React from 'react';
import { Button } from 'react-native-paper';
import type { ButtonProps } from 'react-native-paper';
import { layout } from '../../theme';

type Props = Omit<ButtonProps, 'mode' | 'children'> & { label: string; variant?: 'primary' | 'secondary' | 'text' };

/** The one button style. Never silently disabled without a reason shown nearby. */
export default function PrimaryButton({ label, variant = 'primary', contentStyle, ...rest }: Props) {
  const mode = variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text';
  return (
    <Button
      mode={mode}
      accessibilityLabel={label}
      contentStyle={[{ minHeight: layout.touchTarget }, contentStyle]}
      {...rest}
      // Explicitly set children to the label to avoid type mismatches
    >
      {label}
    </Button>
  );
}
