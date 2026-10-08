// Design tokens. Screens and components take every color, size and spacing value from here (a validator
// rejects hard-coded colors and font sizes in screens). Replace the values with the app's DESIGN.md tokens.
import { MD3LightTheme, configureFonts } from 'react-native-paper';

export const space = (n: number) => n * 8; // 8px grid: space(1)=8, space(2)=16, space(3)=24 ...

export const layout = {
  pagePadding: space(3),
  maxContentWidth: 560, // forms and single-column screens on wide displays
  maxWideWidth: 960, // dashboards
  touchTarget: 48,
};

export const theme = {
  ...MD3LightTheme,
  roundness: 3,
  fonts: configureFonts({ config: { fontFamily: 'System' } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1D4ED8', // 6.7:1 on white
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBE4FF',
    onPrimaryContainer: '#0B1F5C',
    secondary: '#475569', // 7.6:1 on white
    background: '#F6F7FB',
    surface: '#FFFFFF',
    surfaceVariant: '#EEF1F7',
    onSurfaceVariant: '#3F4A5A',
    outline: '#6B7280',
    error: '#B42318',
    success: '#166534',
  },
};

export type AppTheme = typeof theme;
