import { MD3LightTheme, configureFonts } from 'react-native-paper';

// Design tokens from DESIGN.md
export const space = (n: number) => n * 8; // 8dp grid

export const layout = {
  pagePadding: space(3), // 24dp
  maxContentWidth: 420, // updated to match design (max 420dp)
  maxWideWidth: 960,
  touchTarget: 48,
};

export const FAB_CONTAINER_HEIGHT = 80; // dp
export const TAB_BAR_HEIGHT = 56; // dp
export const spacing = 8; // base spacing in dp

export const theme = {
  FAB_CONTAINER_HEIGHT,
  TAB_BAR_HEIGHT,
  spacing,

  ...MD3LightTheme,
  roundness: 8,
  fonts: configureFonts({ config: { fontFamily: 'System' } }),
  colors: {
    ...MD3LightTheme.colors,
    // Primary (deep blue)
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFE5FF',
    onPrimaryContainer: '#001D35',
    // Secondary (darker teal)
    secondary: '#015958',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#C8F4EF',
    onSecondaryContainer: '#00201A',
    // Surfaces & background
    surface: '#FFFFFF',
    surfaceVariant: '#F2F2F2',
    background: '#F5F5F5',
    onSurface: '#212121',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    // Disabled / placeholder
    disabled: '#E0E0E0',
    onDisabled: '#212121',
    placeholder: '#6F6F6F',
    // Status
    error: '#B00020',
    onError: '#FFFFFF',
    success: '#166534',
  },
};

export type AppTheme = typeof theme;
