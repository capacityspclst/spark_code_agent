# DESIGN.md

## Users and goal
**Who:** Freelance professionals (designers, writers, developers, gig workers) who need a quick, reliable way to record receipts, mileage, and produce tax‑ready reports.  
**Goal:** Capture a receipt or mileage entry in ≤ 2 taps, see an instantly updated financial summary, and export a CSV or PDF with a single tap.  
**Success feels like:** “All my expenses are up‑to‑date, I can read my net income at a glance, and I can send a tax‑ready report to my accountant in seconds.”

---

## Primary flow
1. **Open app** → checks SecureStore for a JWT.  
2. **Unauthenticated** → show **Sign In** screen with a link to **Sign Up**.  
3. **Sign Up** → email + password (live rule list) → *Create account* → loading → store JWT → navigate to **Dashboard**.  
4. **Dashboard** → four summary cards; if no data, an empty state with primary CTA **Add first receipt**.  
5. **Add receipt** → tap **FAB** (bottom‑right) → **Receipt Capture** → request camera permission (fallback to library) → snap/pick photo → fill amount, date, category, notes → *Save receipt* → loading → success toast → new receipt appears in the list.  
6. **Add mileage** → tap **Mileage** tab (bottom) → **Mileage Entry** → fill date, miles, notes → *Save mileage* → loading → success toast → new mileage appears in list.  
7. **Export** → tap **Export** tab → choose **Export CSV** or **Export PDF** → generation spinner → native share sheet opens → user saves or sends file.  

*Every primary action is reachable at all times from the persistent bottom tab bar (or the left navigation drawer on web). No screen ever leaves the user without a forward path.*

---

## Screens and states

### Sign Up
| State            | UI elements (key)                                                | Exact message |
|------------------|-------------------------------------------------------------------|---------------|
| Default          | Email, Password fields; **Create account** button; link “Already have an account? Log in”. | – |
| Loading          | Fields disabled, dimmed overlay spinner.                         | “Creating account…” |
| Field error      | Inline text under the offending field.                            | “Enter a valid email address.” *or* “Password must be at least 12 characters, include uppercase, lowercase, number, and symbol.” |
| Submission error | Top toast (red background).                                      | “We couldn’t create your account. Please check the fields and try again.” |

### Sign In
| State            | UI elements (key)                                                | Exact message |
|------------------|-------------------------------------------------------------------|---------------|
| Default          | Email, Password fields; **Log in** button; link “Don’t have an account? Sign up”. | – |
| Loading          | Fields disabled, overlay spinner.                                 | “Signing you in…” |
| Field error      | Inline text under field.                                          | Same as Sign Up. |
| Submission error | Top toast (red background).                                      | “Incorrect email or password.” |

### Dashboard
| State            | UI elements (key)                                                | Exact message |
|------------------|-------------------------------------------------------------------|---------------|
| Loading          | Full‑screen ActivityIndicator.                                   | “Loading summary…” |
| Empty            | Illustration, title **No data yet**, body, primary CTA **Add first receipt**. | “You haven’t added any receipts or mileage yet. Tap the + button to get started.” |
| Success          | Four summary **Card** components (Income, Expenses, Mileage deduction, Estimated tax) + scrollable list of recent receipts/mileage. | – |
| API error        | Banner at top.                                                   | “Failed to load data. Pull down to retry.” |
| Offline          | Banner at top.                                                   | “You’re offline – data may be outdated.” |

### Receipt Capture
| State                | UI elements (key)                                          | Exact message |
|----------------------|-------------------------------------------------------------|---------------|
| Permission prompt    | Modal with **Allow** / **Deny** buttons.                    | “FinanceMate needs camera access to photograph receipts.” |
| Permission denied    | Notice with **Choose from library** button.                 | “Camera access denied. You can select a photo from your library.” |
| Default (no image)   | Placeholder illustration + tap prompt.                       | “Tap to take a photo or choose from library.” |
| Image selected       | Preview thumbnail, fields: Amount, Date, Category, Notes.   | – |
| Loading (upload)     | Full‑screen spinner.                                        | “Uploading receipt…” |
| Success              | Toast.                                                      | “Receipt saved.” |
| Upload error         | Toast (red).                                                | “Upload failed. Check your connection and try again.” |
| Edge – long category | Truncated with ellipsis; tooltip on web.                    | – |

### Mileage Entry
| State            | UI elements (key)                                                | Exact message |
|------------------|-------------------------------------------------------------------|---------------|
| Default          | Date picker, miles numeric input, notes, **Save mileage** button. | – |
| Loading          | Fields disabled, overlay spinner.                                 | “Saving mileage…” |
| Success          | Toast.                                                            | “Mileage entry saved.” |
| Error            | Toast (red).                                                      | “Failed to save mileage. Please try again.” |

### Export
| State                | UI elements (key)                                         | Exact message |
|----------------------|------------------------------------------------------------|---------------|
| Default              | Two large **Export CSV** / **Export PDF** buttons.         | – |
| Loading – CSV        | Buttons disabled, spinner next to CSV button.             | “Generating CSV…” |
| Loading – PDF        | Buttons disabled, spinner next to PDF button.             | “Generating PDF…” |
| Success              | Native share sheet opens; post‑share toast.                | “Report ready to share.” |
| Error                | Toast (red).                                               | “Export failed. Please try again.” |
| Offline              | Banner at top.                                            | “Cannot export while offline.” |

### Settings (optional)
| State | UI elements | Exact message |
|-------|-------------|---------------|
| Default | List items: **Account**, **Appearance**, **Help & Feedback**, **Log out** button. | – |
| Loading | Full‑screen spinner. | “Loading settings…” |

*All scrollable containers are vertical only; safe‑area insets are respected.*

---

## Layout
**Mobile (≥ 390 px)**  
- **Global max‑content width:** 360 px, centered.  
- **Header (Appbar):** 56 px height, left‑aligned app name, right‑aligned settings icon; elevation 1.  
- **Bottom Tab Bar:** fixed 56 px, background `background`, icons 24 px, optional label 12 px (`caption`).  
- **FAB:** 56 px diameter, anchored bottom‑right (‑16 px from edges).  
- **Cards:** 16 px horizontal margin, 12 px vertical spacing, radius `md` (8 px), elevation `card`.  
- **Forms:** vertical stack, 16 px padding, 12 px gap between fields, each field height 48 px.  
- **Touch targets:** ≥ 44 × 44 px; buttons min‑height 48 px, min‑width 120 px.  
- **No horizontal scrolling**; all content fits within 390 px width.

**Desktop (Expo web – 1280 px)**  
- **Navigation drawer (left):** 240 px, icons + labels, background `surface`.  
- **Main pane:** max‑width 720 px, centered, 24 px gutter between drawer and pane.  
- **Header:** same 56 px height inside main pane.  
- **Bottom Tab Bar:** hidden; drawer provides navigation.  
- **Grid:** 8 px baseline; cards and lists use the same spacing as mobile.  
- **All layouts respect the 4/8 px scale** and never cause side‑scroll.

---

## Design tokens
Tokens are supplied **both** as a React‑Native Paper MD3 theme and as CSS custom properties for the web build.

```ts
// expo-app/src/theme.ts
export const theme = {
  // ── Colors ─────────────────────────────────────────────────────
  colors: {
    // Brand
    primary: '#0066FF',            // CTA, active tab
    primaryVariant: '#004C99',     // pressed primary
    onPrimary: '#FFFFFF',          // text/icon on primary

    accent: '#FF9800',             // secondary CTA
    accentPressed: '#E68A00',      // pressed accent
    onAccent: '#212121',           // text/icon on accent

    // Surfaces & backgrounds
    background: '#F5F6FA',         // app background
    surface: '#FFFFFF',            // cards, inputs
    surfaceVariant: '#F0F0F0',

    // Text & UI
    onSurface: '#212121',          // body, headings
    secondary: '#5F5F5F',          // caption, secondary text
    placeholder: '#5F5F5F',        // placeholder text
    disabled: '#404040',           // disabled text
    disabledBackground: '#E0E0E0',

    // Status
    error: '#D32F2F',
    onError: '#FFFFFF',
    success: '#2E7D32',
    onSuccess: '#FFFFFF',
    outline: '#79747E',
  },

  // ── Roundness ───────────────────────────────────────────────
  roundness: 8,

  // ── Spacing (4/8 px grid) ─────────────────────────────────────
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  // ── Elevation ─────────────────────────────────────────────────
  elevation: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },

  // ── Typography (MD3 type scale) ───────────────────────────────
  // Paper component mapping (e.g., headlineMedium, titleMedium, bodyLarge)
  typography: {
    headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
    headlineMedium: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
    headlineSmall: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
    titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
    titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
    labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
    labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
    labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  },
};
```

```css
/* expo-app/web/theme.css – generated from the object above */
:root {
  /* Colors */
  --color-primary: #0066FF;
  --color-primary-variant: #004C99;
  --color-on-primary: #FFFFFF;
  --color-accent: #FF9800;
  --color-accent-pressed: #E68A00;
  --color-on-accent: #212121;
  --color-background: #F5F6FA;
  --color-surface: #FFFFFF;
  --color-surface-variant: #F0F0F0;
  --color-on-surface: #212121;
  --color-secondary: #5F5F5F;
  --color-placeholder: #5F5F5F;
  --color-disabled: #404040;
  --color-disabled-bg: #E0E0E0;
  --color-error: #D32F2F;
  --color-on-error: #FFFFFF;
  --color-success: #2E7D32;
  --color-on-success: #FFFFFF;
  --color-outline: #79747E;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-xxl: 32px;
  --space-xxxl: 40px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Typography (pixel values) */
  --font-headline-large: 32px;
  --font-headline-medium: 24px;
  --font-headline-small: 20px;
  --font-title-large: 22px;
  --font-title-medium: 16px;
  --font-title-small: 14px;
  --font-body-large: 16px;
  --font-body-medium: 14px;
  --font-body-small: 12px;
  --font-label-large: 14px;
  --font-label-medium: 12px;
  --font-label-small: 11px;
}

/* Contrast pairs (foreground / background) */
| Foreground hex | Background hex | Use                              | Size |
|----------------|----------------|----------------------------------|------|
| #FFFFFF        | #0066FF        | Primary button label (normal)    | ui   |
| #FFFFFF        | #004C99        | Primary button label (pressed)   | ui   |
| #212121        | #FF9800        | Accent button label (normal)     | ui   |
| #212121        | #E68A00        | Accent button label (pressed)    | ui   |
| #404040        | #E0E0E0        | Disabled button label            | ui   |
| #0066FF        | #FFFFFF        | Text link (primary)              | normal |
| #212121        | #FFFFFF        | Header / app name (large)        | large |
| #212121        | #FFFFFF        | Card title (large)               | large |
| #212121        | #FFFFFF        | Body text                        | normal |
| #5F5F5F        | #FFFFFF        | Secondary / caption text         | normal |
| #5F5F5F        | #FFFFFF        | Placeholder text                 | normal |
| #404040        | #E0E0E0        | Disabled input text              | normal |
| #D32F2F        | #FFFFFF        | Input error text                 | normal |
| #0066FF        | #F5F6FA        | Tab icon & label (active)        | ui   |
| #5F5F5F        | #F5F6FA        | Tab icon & label (inactive)      | ui   |
| #212121        | #FFFFFF        | List item primary text           | normal |
| #5F5F5F        | #FFFFFF        | List item secondary (date)       | normal |
| #212121        | #FFFFFF        | Dialog title (large)             | large |
| #212121        | #FFFFFF        | Dialog body text                 | normal |
| #212121        | #FFFFFF        | Toast / Snackbar text (info)     | ui   |
| #FFFFFF        | #D32F2F        | Toast / Snackbar error text      | ui   |
| #212121        | #FFFFFF        | Input label text                 | normal |
| #212121        | #FFFFFF        | Modal title (large)              | large |
| #212121        | #FFFFFF        | Modal body text                  | normal |
| #212121        | #FFFFFF        | FAB icon                         | ui   |

## Components

All UI elements are thin wrappers around **React Native Paper (MD3)** components, placed in `src/components/ui/`. Each wrapper enforces the visual style, sizing, and interaction states defined in the design tokens.

| Component | Paper component | Props / variants | States (default, hover, focus‑visible, active, disabled, loading) | Size / layout | Minimum touch target |
|-----------|-----------------|------------------|---------------------------------------------------------------|----------------|----------------------|
| **Screen** | `View` (wrapper) | `style={styles.screen}` – adds `paddingHorizontal: theme.spacing.lg`, `maxWidth: 360`, `alignSelf: 'center'` | – | Full‑screen container | – |
| **FormField** | `TextInput` (mode="outlined") | `label`, `value`, `onChangeText`, `error`, `secureTextEntry`, optional `right` icon (e.g., eye for password) | Default, Focused (`borderColor: primary`), Error (`borderColor: error`), Disabled (`backgroundColor: disabledBackground`), Loading (spinner in `right` slot) | Height 48 px, horizontal padding md, radius sm | 44 × 44 px |
| **PrimaryButton** | `Button` (mode="contained") | `onPress`, `disabled`, `loading`, `contentStyle={styles.buttonContent}` | Default (`backgroundColor: primary`, `textColor: onPrimary`), Pressed (`primaryVariant`), Focus-visible (2 px solid `primary`), Disabled (`disabledBackground` + `disabled` text), Loading (spinner + label) | Height 48 px, min‑width 120 px, borderRadius md | 44 × 44 px |
| **AccentButton** | `Button` (mode="contained-tonal") | Same as PrimaryButton but uses `accent` palette | Same states as PrimaryButton | Same | Same |
| **TextLink** | `Button` (mode="text") | `onPress`, `disabled` | Default (`textColor: primary`), Hover (underline), Focus-visible (2 px solid `primary`), Disabled (opacity 0.5) | Height 44 px, min‑width 44 px | 44 × 44 px |
| **SummaryCard** | `Card` | `title`, `children` (value) | Normal (elevation card), Pressed (elevation 1), Disabled (bg `disabledBackground`) | Padding lg, radius md, shadow from `elevation.card` | – |
| **EmptyState** | `View` + `Image` + `Text` + `PrimaryButton` | `title`, `description`, `ctaLabel`, `onPressCTA` | Default only (static) | Centered column, max‑width 340 px | – |
| **ListItem** | `List.Item` | `title`, `description`, `left`, `right`, `onPress` | Normal (ripple), Pressed (background `primary` at 8 % opacity), Disabled (opacity 0.4) | Height 64 px, full‑width touchable row | 44 × 44 px |
| **BottomTabBar** | `BottomNavigation` | `navigationState`, `onIndexChange`, `renderScene`, `shifting={false}` | Active (icon & label `primary`), Inactive (`secondary`), Focus-visible (2 px solid `primary`) | Height 56 px, equal‑width tabs | 44 × 44 px |
| **Header (Appbar)** | `Appbar.Header` | `title`, optional `action` (e.g., settings icon) | Default, Elevated (shadow 1) | Height 56 px, background `surface` | – |
| **FAB** | `FAB` | `icon="plus"`, `onPress`, `style={styles.fab}` | Default (`accent`), Pressed (`accentPressed`), Disabled (`disabledBackground`) | 56 × 56 px, borderRadius 28 px | 56 × 56 px |
| **Modal** | `Portal` + `Dialog` | `visible`, `onDismiss`, `title`, `children`, `actions` | Default, Loading (spinner inside content) | Max‑width 340 px, radius lg | – |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"`, `color={theme.colors.primary}` | – | 24 px | – |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `action` (optional) | Normal (bg `surface`), Error (`error` background, `onError` text) | – | – |
| **HelperText** | `HelperText` | `type="error"` (or `"info"`), `visible`, `children` | Visible only when error prop true | – | – |

All components expose the following **state props** where applicable: `disabled`, `loading`, `error`, `focused`. They all respect the 44 × 44 px minimum touch target and provide a visible focus ring (2 px solid `primary`) on keyboard focus.

---

## Accessibility

| Principle | Implementation |
|-----------|----------------|
| **Landmarks & roles** | Root container `<SafeAreaView>` with `accessibilityRole="main"`. `<Header>` uses `accessibilityRole="banner"`. `<BottomTabBar>` has `role="tablist"`; each tab button `role="tab"` with `accessibilityState={{ selected }}`. |
| **Heading hierarchy** | Each screen begins with a single `h1` (`accessibilityRole="header"` level 1). Subsequent headings use Paper text variants (`titleLarge`, `titleMedium`, etc.) mapped to logical levels. |
| **Labels** | Every input has a visible `<Text>` label linked via `nativeID` and `accessibilityLabel`. Icon buttons (e.g., password eye, settings gear, FAB) have explicit `accessibilityLabel` (“Show password”, “Settings”, “Add receipt”). |
| **Error indication** | Inline error messages rendered with `HelperText type="error"` are linked to the corresponding input via `accessibilityDescribedBy`. On submit, focus automatically moves to the first invalid field (`ref.current?.focus()`). |
| **Focus management** | Navigation actions programmatically set focus to the first interactive element on the destination screen. Modals trap focus until dismissed. |
| **Visible focus indicator** | All focusable elements display a 2 px solid `primary` outline when focused (keyboard/web). |
| **Keyboard navigation** | All components are reachable via Tab/Shift+Tab. `Enter` activates the default button on a form. The `BottomNavigation` can be navigated with arrow keys. |
| **Reduced motion** | Custom hook `useReducedMotion` disables non‑essential animations (e.g., card elevation change, ripple effects) when `prefers-reduced‑motion` is enabled. |
| **Alt text / accessible images** | Receipt preview image includes `accessibilityLabel="Receipt photo"`. Dialog icons and illustrations have meaningful `accessibilityLabel`s or are marked `accessible={false}` if decorative. |
| **No color‑only cues** | Error states also show an error icon; disabled states combine reduced opacity with `disabled` color. |
| **Live regions** | Toasts and Snackbars call `announceForAccessibility(message)` on mount so screen readers announce them immediately. |
| **Touch target assurance** | All tappable controls meet the 44 × 44 px minimum; extra padding ensures comfortable tapping on small screens. |
| **Semantic text** | Use proper Paper text variants for semantics (e.g., `headlineMedium` for page titles, `bodyLarge` for body copy). |
| **Screen‑reader navigation** | The order of elements follows visual order; hidden elements (e.g., loading spinners) are `accessibilityElementsHidden={true}` when not visible. |

---

## Content and microcopy

### Branding
- **App name:** **FinanceMate**
- **Tagline (shown on the sign‑up screen):** “Your freelance finance sidekick – capture receipts, track mileage, export tax‑ready reports.”

### Sign Up
- **Title:** “Create your account”
- **Email label:** “Email address”
- **Password label:** “Password”
- **Password helper (live):** “12 + characters, upper‑case, lower‑case, number, symbol”
- **Primary button:** “Create account”
- **Secondary link:** “Already have an account? Log in”

### Sign In
- **Title:** “Welcome back”
- **Email label:** “Email address”
- **Password label:** “Password”
- **Primary button:** “Log in”
- **Secondary link:** “Don’t have an account? Sign up”

### Dashboard
- **Card titles:** “Income”, “Expenses”, “Mileage deduction”, “Estimated tax”
- **Empty‑state title:** “No data yet”
- **Empty‑state body:** “Add receipts or mileage to see your financial summary.”
- **Primary empty CTA:** “Add first receipt”

### Receipt Capture
- **Header:** “New receipt”
- **Photo prompt:** “Tap to take a photo or choose from library”
- **Field labels:** “Amount (USD)”, “Date”, “Category”, “Notes (optional)”
- **Placeholders:** “e.g., 45.67”, “Select date”, “e.g., Office supplies”, “Add any extra details…”
- **Save button:** “Save receipt”
- **Permission modal title:** “Camera access needed”
- **Permission modal body:** “Allow FinanceMate to use your camera so you can photograph receipts.”
- **Permission denied CTA:** “Choose from library”

### Mileage Entry
- **Header:** “New mileage entry”
- **Field labels:** “Date”, “Miles driven”, “Notes (optional)”
- **Miles placeholder:** “e.g., 120”
- **Save button:** “Save mileage”

### Export
- **Header:** “Export your data”
- **Button 1:** “Export CSV”
- **Button 2:** “Export PDF”
- **Generating CSV toast:** “Generating CSV…”
- **Generating PDF toast:** “Generating PDF…”
- **Success toast:** “Report ready to share.”
- **Error toast:** “Export failed. Please try again.”

### Settings (optional)
- **Sections:** “Account”, “Appearance”, “Help & Feedback”
- **Logout button:** “Log out”

### Toasts & Snackbars
- **Receipt saved:** “Receipt saved.”
- **Mileage saved:** “Mileage entry saved.”
- **Generic error:** “Something went wrong. Please try again.”

### Validation messages
- **Invalid email:** “Enter a valid email address.”
- **Password rules:** “Password must be at least 12 characters, include uppercase, lowercase, number, and symbol.”
- **Amount missing:** “Enter a positive amount.”
- **Miles missing:** “Enter the number of miles driven.”
- **Date missing:** “Select a date.”

All copy follows sentence case, uses plain language, and matches the exact button and link texts referenced in the flow and API integration, ensuring that automated UI tests can locate elements by these strings.
