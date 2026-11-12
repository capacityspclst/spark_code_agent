declare module 'react-native-paper-dates' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';
  interface DatePickerModalProps {
  cancelLabel?: string;
  confirmLabel?: string;
  accessibilityLabel?: string;
  label?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  accessibilityLabel?: string;
    locale?: string;
    mode?: 'single' | 'range' | 'multiple';
    visible: boolean;
    onDismiss: () => void;
    date?: Date;
    onConfirm: (params: { date: Date }) => void;
    validRange?: { startDate?: Date; endDate?: Date };
    // other props omitted
  }
  export const DatePickerModal: React.ComponentType<DatePickerModalProps>;
}
