// src/theme.ts
import { MD3LightTheme } from 'react-native-paper';

export const appTheme = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D0E7FF',
    onPrimaryContainer: '#001D36',
    secondary: '#4A5862',
    onSecondary: '#FFFFFF',
    background: '#F6F9FC',
    surface: '#FFFFFF',
    surfaceVariant: '#E8EBEF',
    onSurface: '#1F1F1F',
    onSurfaceVariant: '#4A5862',
    outline: '#757575',
    error: '#B3261E',
    onError: '#FFFFFF',
    disabled: '#8A8A8A',
  },
  // 8‑px spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
};
