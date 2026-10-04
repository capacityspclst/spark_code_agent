# DESIGN.md

## Users and goal
**User:** Freelance professionals (designers, writers, developers, gig workers) who need a fast, reliable way to record receipts, mileage, and generate tax‑ready reports.  
**Goal:** Capture a receipt or mileage entry in ≤ 2 taps, see an instantly updated financial summary, and export a CSV or PDF with one tap.  
**Success feels like:** “My expenses are up‑to‑date, I can read my net income at a glance, and I can send my tax report to my accountant with a single tap.”

---

## Primary flow
1. **Open app** → checks for stored JWT.  
2. **Unauthenticated** → shows **Sign‑In** screen with link to **Sign‑Up**.  
3. **Sign‑Up** – email + password (live rule list) → “Create account” → loading → JWT stored securely → navigate to **Dashboard**.  
4. **Dashboard** – four summary cards; empty state shows primary CTA “Add first receipt”.  
5. **Add receipt** – tap **+** tab → **Receipt Capture** → request camera permission (fallback to library) → snap/pick photo → fill amount, date, category, notes → “Save receipt” → loading → success toast → entry appears in list.  
6. **Add mileage** – tap **Mileage** tab → **Mileage Entry** screen → fill date, miles, notes → “Save mileage” → loading → success toast → entry appears in list.  
7. **Export** – tap **Export** tab → choose **Export CSV** or **Export PDF** → generation spinner → native share sheet opens → user saves or sends file.

All primary actions are reachable from the persistent bottom tab bar; no screen leaves the user without a forward path.

---

## Screens and states

| Screen                | State                | UI elements (key)                              | Exact message |
|-----------------------|----------------------|------------------------------------------------|---------------|
| **Sign‑Up**           | Default              | Email, Password fields; “Create account” button; “Already have an account? Log in” link | – |
|                       | Loading              | Disabled fields, overlay spinner               | “Creating account…” |
|                       | Field error          | Inline text under field                        | “Enter a valid email address.” / “Password must be at least 12 characters, include uppercase, lowercase, number, and symbol.” |
|                       | Submission error     | Top toast                                      | “We couldn’t create your account. Please check the fields and try again.” |
| **Sign‑In**           | Default              | Email, Password fields; “Log in” button; “Don’t have an account? Sign up” link | – |
|                       | Loading              | Disabled fields, overlay spinner               | “Signing you in…” |
|                       | Field error          | Inline text                                    | Same as Sign‑Up |
|                       | Submission error     | Top toast                                      | “Incorrect email or password.” |
| **Dashboard**         | Loading              | Full‑screen spinner                            | “Loading summary…” |
|                       | Empty                | Card with illustration, text, primary CTA “Add first receipt” | “You haven’t added any receipts or mileage yet. Tap the + button to get started.” |
|                       | Success              | Four summary cards, receipt & mileage lists    | – |
|                       | API error            | Banner                                         | “Failed to load data. Pull down to retry.” |
|                       | Offline              | Banner                                         | “You’re offline – data may be outdated.” |
| **Receipt Capture**   | Permission prompt    | Modal with “Allow” / “Deny”                    | “FinanceMate needs camera access to photograph receipts.” |
|                       | Permission denied    | UI with fallback notice & “Choose from library” button | “Camera access denied. You can select a photo from your library.” |
|                       | Default (no image)   | Placeholder illustration & tap prompt          | “Tap to take a photo or choose from library” |
|                       | Loading (upload)     | Full‑screen spinner                            | “Uploading receipt…” |
|                       | Success              | Toast                                          | “Receipt saved.” |
|                       | Upload error         | Toast                                          | “Upload failed. Check your connection and try again.” |
|                       | Edge – long category | Truncated text with ellipsis; tooltip on web   | – |
| **Mileage Entry**     | Default              | Date picker, miles numeric input, notes, “Save mileage” button | – |
|                       | Loading              | Disabled inputs, spinner overlay               | “Saving mileage…” |
|                       | Success              | Toast                                          | “Mileage entry saved.” |
|                       | Error                | Toast                                          | “Failed to save mileage. Please try again.” |
| **Export**            | Default              | Two large buttons: “Export CSV”, “Export PDF”  | – |
|                       | Loading (CSV)        | Disabled buttons, spinner                      | “Generating CSV…” |
|                       | Loading (PDF)        | Disabled buttons, spinner                      | “Generating PDF…” |
|                       | Success              | Native share sheet opens; post‑share toast      | “Report ready to share.” |
|                       | Error                | Toast                                          | “Export failed. Please try again.” |
|                       | Offline              | Banner                                         | “Cannot export while offline.” |
| **Settings** (optional) | Default           | List items: “Account”, “Appearance”, “Help & Feedback” | – |
|                       | Loading              | Spinner                                        | “Loading settings…” |

All scrollable content is vertical only; safe‑area insets are respected.

---

## Layout

**Mobile (≥ 390 px)**  
- Global max content width: **360 px**, centered.  
- **Header:** 56 px height, left‑aligned app name, right‑aligned settings icon.  
- **Bottom Tab Bar:** fixed 56 px, background `background`, icons 24 px, optional label 12 px (`caption`).  
- **Cards:** 16 px horizontal margin, 12 px vertical spacing, radius `md`, elevation `card`.  
- **Forms:** vertical stack, 16 px padding, 12 px gap between fields.  
- **Touch targets:** ≥ 44 × 44 px; buttons height 48 px, min‑width 120 px.  
- No horizontal scrolling.

**Desktop (1280 px – Expo web build)**  
- **Navigation drawer** (left): 240 px, icons + labels.  
- **Main pane:** max‑width 720 px, centered.  
- Header stays at top of main pane (56 px).  
- Bottom tab bar hidden; drawer provides navigation.  
- Grid uses 8 px baseline; 24 px gutter between drawer and main pane.

All spacing follows the 4/8 px scale.

---

## Design tokens

Tokens are provided as a **React‑Native theme object** (for Expo) **and** as CSS custom properties (for the web fallback).

```ts
// expo-app/src/theme.ts
export const theme = {
  // ---- Colors ----
  colors: {
    // Brand
    primary: '#0066FF',          // CTA & active tab
    primaryVariant: '#004C99',   // pressed primary
    accent: '#FF9500',           // secondary CTA
    accentPressed: '#E68A00',    // pressed accent (10 % darker)
    onAccent: '#212121',         // text/icon on accent
    // Surfaces
    background: '#F5F6FA',       // app background
    surface: '#FFFFFF',          // cards, inputs
    // Text
    onPrimary: '#FFFFFF',        // text on primary
    onSurface: '#212121',        // body & heading text
    secondary: '#5F5F5F',        // secondary/caption
    placeholder: '#707070',      // placeholder text
    disabled: '#4D4D4D',         // disabled UI text
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
```

**CSS fallback generated from the object**

```css
:root {
  /* Colors */
  --color-primary: #0066FF;
  --color-primary-variant: #004C99;
  --color-accent: #FF9500;
  --color-accent-pressed: #E68A00;
  --color-on-accent: #212121;
  --color-background: #F5F6FA;
  --color-surface: #FFFFFF;
  --color-on-primary: #FFFFFF;
  --color-on-surface: #212121;
  --color-secondary: #5F5F5F;
  --color-placeholder: #707070;
  --color-error: #D32F2F;
  --color-success: #2E7D32;
  --color-disabled: #4D4D4D;
  --color-disabled-bg: #E0E0E0;

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

  /* Typography */
  --font-h1: 32px;
  --font-h2: 24px;
  --font-h3: 20px;
  --font-body: 16px;
  --font-small: 14px;
  --font-caption: 12px;
  --font-button: 16px;
}

/* Contrast pairs (foreground / background) for WCAG checks */
| Foreground hex | Background hex | Use | Size |
|----------------|----------------|-----|------|
| #FFFFFF        | #0066FF        | Primary button label (normal state) | ui |
| #FFFFFF        | #004C99        | Primary button label (pressed) | ui |
| #212121        | #FF9500        | Accent button label (normal) | ui |
| #212121        | #E68A00        | Accent button label (pressed) | ui |
| #4D4D4D        | #E0E0E0        | Disabled button label | ui |
| #0066FF        | #FFFFFF        | Text link (primary) | normal |
| #212121        | #FFFFFF        | Header / app name (h2) | large |
| #212121        | #FFFFFF        | Card title (h3) | large |
| #212121        | #FFFFFF        | Body text | normal |
| #5F5F5F        | #FFFFFF        | Secondary / caption text | normal |
| #707070        | #FFFFFF        | Placeholder text | normal |
| #4D4D4D        | #E0E0E0        | Disabled input text | normal |
| #D32F2F        | #FFFFFF        | Error message text | normal |
| #2E7D32        | #FFFFFF        | Success message text | normal |
| #0066FF        | #F5F6FA        | Tab icon & label (active) | ui |
| #5F5F5F        | #F5F6FA        | Tab icon & label (inactive) | ui |
| #212121        | #FFFFFF        | List item primary text | normal |
| #5F5F5F        | #FFFFFF        | List item secondary (date) | normal |
| #212121        | #FFFFFF        | Modal title (h3) | large |
| #212121        | #FFFFFF        | Modal body text | normal |
| #212121        | #FFFFFF        | Toast text | ui |
| #212121        | #FFFFFF        | Input label text | normal |
| #D32F2F        | #FFFFFF        | Input error text | normal |

## Components

### Button
| Variant | Background (default) | Text color (default) | Hover / active | Disabled | Loading |
|---------|----------------------|----------------------|----------------|----------|---------|
| Primary | `primary` `#0066FF` | `onPrimary` `#FFFFFF` | `primaryVariant` `#004C99` | `disabledBackground` `#E0E0E0` + `disabled` text `#4D4D4D` | Spinner + label (white) |
| Accent  | `accent` `#FF9500` | `onAccent` `#212121` | `accentPressed` `#E68A00` | Same as Primary disabled | Spinner + label (dark) |
| Text link | transparent | `primary` `#0066FF` | underline, same color | opacity 0.5, same color | – |
| Disabled (stand‑alone) | `disabledBackground` | `disabled` | – | – | – |

- Height 48 px, min‑width 120 px, border‑radius `md` (8 px).  
- Touch target ≥ 44 × 44 px.  
- Focus ring: 2 px solid `primary`.

### TextInput (filled)
- Container: `surface` `#FFFFFF` bg, radius `sm` (4 px), padding `md` (12 px), border 1 px `secondary` `#5F5F5F`.  
- **States:**  
  - **Default:** border `secondary`.  
  - **Focused:** border `primary` `#0066FF`.  
  - **Error:** border `error` `#D32F2F`.  
  - **Disabled:** bg `disabledBackground` `#E0E0E0`, text `disabled` `#4D4D4D`.  
- Visible label above input (linked via `nativeID`).  
- Placeholder color `placeholder` `#707070`.  
- Password field includes trailing eye‑icon with `accessibilityLabel="Show password"`.

### Card
- Background `surface` `#FFFFFF`, radius `md` (8 px), shadow `elevation.card`, padding `lg` (16 px).  
- **States:** Normal, Pressed (elevation reduced), Disabled (bg `disabledBackground`).

### ListItem (receipt / mileage)
- Layout: leading icon, primary text, secondary text (date), optional trailing chevron.  
- Height 64 px, full‑row touch target, press background = `primary` at 8 % opacity.  
- Accessible label combines title and date.

### Bottom Tab Bar
- Fixed height 56 px, background `background` `#F5F6FA`.  
- Icons 24 px, optional label `caption` (12 px).  
- Active tab: icon & label `primary` `#0066FF`; inactive: `secondary` `#5F5F5F`.  
- Each tab button ≥ 48 px high, equal width, touch target ≥ 44 × 44 px.

### Header (top app bar)
- Height 56 px, background `surface` `#FFFFFF`, bottom border 1 px `secondary` `#5F5F5F`.  
- Left: app name (`h2` style) `onSurface` `#212121`.  
- Right: settings icon button `secondary`, `accessibilityLabel="Settings"`.

### Modal (permission, error)
- Centered overlay, max‑width 340 px, background `surface`, radius `lg` (12 px).  
- Title `h3` style, body `body` style, actions spaced horizontally.

### ActivityIndicator
- Size 24 px, color `primary` `#0066FF`.

### Toast / Snackbar
- Bottom‑center, background `surface` `#FFFFFF` with subtle shadow, text `onSurface` `#212121`.  
- Auto‑dismiss after 3 s, swipe‑to‑dismiss enabled.  
- Error toast may use `error` background `#D32F2F` with `onPrimary` text `#FFFFFF` (contrast ≥ 4.5:1).

All components expose TypeScript props for size, state, and accessibility, and respect the 44 × 44 px minimum touch target.

---

## Accessibility

- **Landmarks:** `<SafeAreaView>` with `accessibilityRole="main"`; `<Header>` as `banner`; `<TabBar>` as `tablist`; each tab button `role="tab"` with `accessibilityState.selected`.  
- **Headings:** Exactly one `h1` per screen (`accessibilityRole="header"`), followed by `h2`/`h3` in logical order.  
- **Labels:** Every input has a visible `<Text>` label linked via `accessibilityLabel`/`nativeID`. No placeholder‑only fields.  
- **Buttons & IconButtons:** All have explicit `accessibilityLabel` (“Add receipt”, “Show password”, “Export CSV”, etc.).  
- **Focus Management:** On navigation, focus moves to the first interactive element; on validation error focus jumps to the first invalid field (`ref.current?.focus()`).  
- **Visible Focus Indicator:** 2 px solid `primary` outline appears on focus (keyboard/web).  
- **Keyboard Navigation:** All controls reachable via Tab; active modals trap focus until dismissed.  
- **Reduced Motion:** `useReducedMotion()` disables non‑essential animations (e.g., card elevation changes).  
- **Alt Text / Accessible Images:** Receipt preview uses `accessibilityLabel="Receipt photo"`.  
- **No Color‑Only Cues:** Error state includes an error icon; disabled state uses both opacity and `disabled` text color.  
- **Touch Targets:** Minimum 44 × 44 px; additional padding ensures comfortable tapping.  
- **Live Regions:** Toasts are announced using `announceForAccessibility` so screen readers read them immediately.  

---

## Content and microcopy

### Branding
- **App name:** **FinanceMate**  
- **Tagline (on sign‑up screen):** “Your freelance finance sidekick – capture receipts, track mileage, export tax‑ready reports.”

### Sign‑Up
- **Title:** “Create your account”  
- **Email label:** “Email address”  
- **Password label:** “Password”  
- **Password helper (live):** “12 + characters, upper‑case, lower‑case, number, symbol”  
- **Primary button:** “Create account”  
- **Secondary link:** “Already have an account? Log in”

### Sign‑In
- **Title:** “Welcome back”  
- **Email label:** “Email address”  
- **Password label:** “Password”  
- **Primary button:** “Log in”  
- **Secondary link:** “Don’t have an account? Sign up”

### Dashboard
- **Card titles:** “Income”, “Expenses”, “Mileage deduction”, “Estimated tax”  
- **Empty state title:** “No data yet”  
- **Empty state body:** “Add receipts or mileage to see your financial summary.”  
- **Primary empty CTA:** “Add first receipt”

### Receipt Capture
- **Header:** “New receipt”  
- **Photo prompt:** “Tap to take a photo or choose from library”  
- **Field labels:** “Amount (USD)”, “Date”, “Category”, “Notes (optional)”  
- **Placeholders:** “e.g., 45.67”; “Select date”; “e.g., Office supplies”; “Add any extra details…”  
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
- **Button 1:** “Export CSV”  
- **Button 2:** “Export PDF”  
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

All copy follows sentence case, uses plain language, and focuses on clear calls to action.
