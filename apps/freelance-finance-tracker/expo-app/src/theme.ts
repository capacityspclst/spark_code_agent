export const theme = {
  // ---- Colors ----
  colors: {
    // Brand
    primary: '#0050CC',          // darker CTA for sufficient contrast
    primaryVariant: '#003399',   // pressed primary
    accent: '#FF9500',           // secondary CTA
    accentPressed: '#E68A00',    // pressed accent (10 % darker)
    onAccent: '#212121',        // text/icon on accent
    // Surfaces
    background: '#F5F6FA',       // app background
    surface: '#FFFFFF',          // cards, inputs
    // Text
    onPrimary: '#FFFFFF',        // text on primary
    onSurface: '#212121',        // body & heading text
    secondary: '#5F5F5F',        // secondary/caption
    placeholder: '#707070',      // placeholder per spec
    disabled: '#4D4D4D',
    // Status
    error: '#D32F2F',
    success: '#2E7D32',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
    // Disabled UI
    disabledBackground: '#E0E0E0',
    // Outline
    outline: '#79747E',
  },

  // ---- Spacing (4/8 px grid) ----
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  // ---- Border radius ----
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
  },

  // ---- Elevation (card shadow) ----
  elevation: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },

  // ---- Typography (type scale) ----
  typography: {
    h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
    titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
    titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
    headlineMedium: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
    bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const }, // alias for bodyMedium
    labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
    labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
    labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '600' as const },
    button: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  },

  // Header height token
  headerHeight: 56,
} as const;
