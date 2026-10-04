export const theme = {
  // ---- Colors ----
  colors: {
    // Brand
    primary: '#0066FF',          // CTA & active tab
    primaryVariant: '#004C99',   // pressed primary
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
    placeholder: '#5F5F5F',      // increased contrast placeholder
    disabled: '#4D4D4D',
    // Status
    error: '#D32F2F',
    success: '#2E7D32',
    // Disabled UI
    disabledBackground: '#E0E0E0',
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
    h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
    button: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  },
};
