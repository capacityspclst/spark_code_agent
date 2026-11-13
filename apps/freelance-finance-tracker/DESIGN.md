# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, and independent contractors who need a quick, private way to track income, expenses, and mileage **offline**.  
- **Goal** – On any signed‑in screen the user can see a concise financial snapshot, add receipts or mileage in a single tap, and receive instant feedback without losing context.  
- **Success feels like** – “I open the app, instantly see my latest earnings and expenses, tap *Add receipt*, watch the “Receipt saved” banner appear, keep scrolling my activity list, and can reach any other feature from the bottom tabs at any moment.”

## Primary flow
1. **Launch → Policy gate** (unchanged).  
2. **Dashboard** – bottom tab bar shows **Dashboard**, **Receipts**, **Mileage**, **Settings**; **Dashboard** tab is selected.  
3. **Dashboard screen** loads recent activity (loading indicator → list).  
4. **Add a receipt** – tap the **Add receipt** button that stays fixed at the bottom of the screen (above the tab bar).  
5. **Save receipt** – after the form submits, a **Receipt saved** snackbar slides in from the top and announces success.  
6. **Dashboard updates** – the new receipt appears as the top row in the recent activity list (amount shown).  
7. **User can scroll** – the list scrolls beneath the fixed add‑buttons; the buttons never disappear.  
8. **All primary actions** (Add mileage, go to Receipts, Mileage, Settings) remain reachable via the bottom tab bar at any time.

The shortest path to the core job (“add a receipt and see confirmation”) is steps 2‑6.

## Screens and states

| Screen | State | UI elements | Message / copy |
|--------|-------|-------------|----------------|
| **DashboardScreen** | Loading | Full‑screen `ActivityIndicator` overlay | “Loading recent activity…” |
| | Error (fetch) | Full‑screen error view with **Retry** button | “Unable to load recent activity. Pull to refresh.” |
| | Empty | `EmptyState` component (icon, title, description, primary button) | Title: **No recent activity**<br>Desc: *Add a receipt or mileage entry to start tracking your finances.*<br>Button label: **Add receipt** |
| | Ready (list) | `RecentActivityList` (FlatList) with `ActivityRow`s, `SimpleAddButtons` overlay, optional `ReceiptSavedSnackbar` overlay | – |
| | Snackbar (after save) | `ReceiptSavedSnackbar` (Paper `Snackbar`) anchored top | “Receipt saved” (or “Mileage saved”) |
| **AddReceiptScreen** (modal) | Default | Form fields (`FormField`s), **Save** `PrimaryButton` | – |
| | Loading (submit) | `PrimaryButton` shows spinner, inputs disabled | – |
| | Validation error | Field‑level `HelperText` under each invalid input; first invalid field receives focus | – |
| **AddMileageScreen** – same states as AddReceiptScreen | – | – | – |
| **SettingsScreen** – unchanged (refer to existing spec) | – | – | – |

### Activity row
- Shows **title** (e.g., “Client lunch”) and **amount** (e.g., “$12.34”) aligned start‑end.
- Tappable – opens detail view (not part of this spec) – accessibility label: “Client lunch, $12.34”.

## Layout
- **Mobile‑first**: viewport **390 dp** wide; horizontal padding **16 dp** (`spacing*2`). No horizontal scroll.  
- **Global container**: `Screen` component (`SafeAreaView` + `ScrollView`). Content max‑width **420 dp**, centered on desktop (1280 dp breakpoint).  
- **DashboardScreen**  
  - Root `View` with `position: relative` to host absolute overlays.  
  - `RecentActivityList` – `FlatList` inside the `Screen`. `contentContainerStyle` includes `paddingBottom: 124 dp` (56 dp bottom tab + 68 dp for overlay button group + 16 dp safe area) so the last row never hides behind the buttons.  
  - **SimpleAddButtons** – `View` `position: absolute; left: 16 dp; right: 16 dp; bottom: 72 dp` (56 dp tab + 16 dp margin). Contains two `PrimaryButton`s (`Add receipt`, `Add mileage`) laid out in a row with `gap: 8 dp`. Each button height **48 dp**, min‑touch area **44 × 44 dp**.  
  - **ReceiptSavedSnackbar** – `Snackbar` `position: absolute; top: 16 dp; left: 16 dp; right: 16 dp`. Uses default `surface` background, `onSurface` text. Has `accessibilityLiveRegion="assertive"`.  
  - **BottomTabBar** – fixed **56 dp** height, anchored to bottom, full‑width. Labels **Dashboard**, **Receipts**, **Mileage**, **Settings** always fully visible on 390 × 844 screens.  
- **Desktop (≥1280 dp)**: `Screen` remains centered with max‑width 420 dp; bottom tab bar stays at bottom of viewport, not stretched. All overlay elements keep the same horizontal margins (16 dp) relative to the centered column.

No element scrolls horizontally on phone; vertical scroll only applies to the activity list.

## Design tokens
> **Implementation** – exported as an MD3 theme object for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`).  

```ts
// src/theme.ts
export const theme = {
  roundness: 8,
  spacing: 8, // base unit (8 dp)

  colors: {
    // Primary – deep blue
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFE5FF',
    onPrimaryContainer: '#001D35',

    // Secondary – teal (used for switches, mini‑FABs)
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
    disabled: '#E0E0E0',
    onDisabled: '#212121',
    placeholder: '#6F6F6F',

    // Status
    error: '#B00020',
    onError: '#FFFFFF',
  },

  typography: {
    displayLarge:   { fontSize: 57, lineHeight: 64, fontWeight: '400' },
    headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
    titleMedium:    { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    bodyLarge:      { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    bodyMedium:     { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    labelLarge:     { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  },

  elevation: { level1: { elevation: 1, shadowOpacity: 0.2 } },
};
```

**Web fallback (`public/theme.css`)**

```css
:root {
  --color-primary: #0061A4;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #CFE5FF;
  --color-on-primary-container: #001D35;

  --color-secondary: #015958;
  --color-on-secondary: #FFFFFF;
  --color-secondary-container: #C8F4EF;
  --color-on-secondary-container: #00201A;

  --color-surface: #FFFFFF;
  --color-surface-variant: #F2F2F2;
  --color-background: #F5F5F5;
  --color-on-surface: #212121;
  --color-on-surface-variant: #49454F;
  --color-outline: #79747E;
  --color-disabled: #E0E0E0;
  --color-on-disabled: #212121;
  --color-placeholder: #6F6F6F;
  --color-error: #B00020;
  --color-on-error: #FFFFFF;

  --radius: 8px;
  --spacing-unit: 8px;
}
```

### Contrast pairs
| Foreground | Background | Use | Size |
|------------|------------|-----|------|
| #FFFFFF    | #0061A4    | Primary button label (contained) | normal |
| #0061A4    | #FFFFFF    | Text button / outlined button label | normal |
| #212121    | #FFFFFF    | Body text on screens & cards | normal |
| #212121    | #F5F5F5    | Body text on background | normal |
| #49454F    | #FFFFFF    | Secondary text (captions, dates) | normal |
| #0061A4    | #F5F5F5    | Bottom‑tab selected icon & label | normal |
| #49454F    | #FFFFFF    | Unselected tab icon & label | normal |
| #B00020    | #FFFFFF    | HelperText error / Snackbar error text | normal |
| #FFFFFF    | #B00020    | Snackbar label on error background | normal |
| #212121    | #E0E0E0    | Disabled button label | normal |
| #FFFFFF    | #015958    | Switch thumb (on) | UI |
| #015958    | #FFFFFF    | Switch track (on) | UI |
| #212121    | #E0E0E0    | Switch thumb (off) | UI |
| #FFFFFF    | #0061A4    | Primary FAB icon | large (icon) |
| #FFFFFF    | #015958    | Mini‑FAB icon | large (icon) |
| #6F6F6F    | #FFFFFF    | TextInput placeholder | normal |
| #212121    | #CFE5FF    | Card title on primary‑container surface | normal |
| #212121    | #C8F4EF    | Card title on secondary‑container surface | normal |
| #212121    | #F2F2F2    | Card title on surface‑variant | normal |
| #212121    | #FFFFFF    | Dialog title | large (headline) |
| #212121    | #FFFFFF    | Settings row label (default) | normal |
| #B00020    | #FFFFFF    | Delete All Data row label | normal |
| #212121    | #F2F2F2    | Separator line | UI |
| #212121    | #FFFFFF    | Chevron icon (trailing) | UI |
| #001D35    | #CFE5FF    | Text on primary‑container | normal |
| #00201A    | #C8F4EF    | Text on secondary‑container | normal |

All pairs meet **WCAG AA** (≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI elements).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `autoComplete`, `error` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus-visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus-visible, disabled, loading |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | – | default, hover, focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **Separator** | `View` | `style` (height 1 dp, backgroundColor theme.colors.surfaceVariant) | – | default |
| **SettingsRow** | `TouchableOpacity` (styled) containing `Text` + optional trailing element (`SettingSwitch`, chevron) | `label`, `onPress`, `showChevron?`, `showSwitch?`, `switchValue?`, `onSwitchChange?`, `error?` | min 44 × 44 dp (row height 56 dp) | default, pressed (ripple), hover (web), focus-visible (2 dp outline), disabled, error |
| **SettingsSection** | `View` | `children`, `showTopPadding?`, `showBottomPadding?`, `separator?` | – | default |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **RecentActivityList** | `FlatList` | `data`, `renderItem`, `keyExtractor` | – | default, empty, loading |
| **ActivityRow** | `List.Item` (MD3) | `title`, `description` (amount), `onPress` | – | default, pressed, hover, focus-visible |
| **SimpleAddButtons** | `View` + two `PrimaryButton`s | `onAddReceipt`, `onAddMileage` | Buttons ≥ 44 × 44 dp | default, hover, focus-visible, disabled, loading |
| **ReceiptSavedSnackbar** | `Snackbar` | `visible`, `onDismiss`, `message` | – | default, visible |
| **Dialog**, **Snackbar**, **ActivityIndicator**, **HelperText**, **BottomTabBar**, **FABAdd**, **MiniFAB** – unchanged from existing spec.

All interactive elements satisfy the **44 × 44 dp** minimum touch area. Hover/focus styles appear on web; native platforms use ripple/elevation feedback.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), main content (`<ScrollView role="main">`), bottom navigation (`role="navigation"`).  
- **Headings** – one `<Text variant="headlineMedium">` per screen (treated as `<h1>`). Sub‑sections use `titleMedium` (`<h2>`). No skipped levels.  
- **Labels** – every `FormField` has a visible label; `SimpleAddButtons` buttons have `accessibilityLabel` equal to their text (“Add receipt”, “Add mileage”). `SettingsRow` rows have `accessibilityRole="button"` and `accessibilityLabel` matching the visible label. `SettingSwitch` exposes its label via `accessibilityLabel`. `ActivityRow` provides `accessibilityLabel="${title}, ${amount}"`.  
- **Focus management** – when a field validation error occurs, the first invalid input receives programmatic focus (`focus()`). Snackbar has `accessibilityLiveRegion="assertive"` to announce “Receipt saved”. Dialogs trap focus while open.  
- **Visible focus** – 2 dp outline using `theme.colors.outline` appears on `focus-visible` (web) and via `accessibilityState={{ focused: true }}` on native.  
- **Keyboard navigation** – All tappable components reachable with `Tab`/`Shift+Tab`; `Enter` activates the focused button. The bottom tab bar can be navigated via arrow keys on web.  
- **Reduced motion** – `useReducedMotion` disables non‑essential animations (e.g., snackbar slide) when the user prefers reduced motion.  
- **Alt / accessibilityLabel** – decorative icons (e.g., chevron) use `accessibilityIgnoresInvertColors` and `accessibilityLabel="Navigate"` only when they convey action.  
- **No color‑only cues** – error rows include an error icon; disabled controls set `accessibilityState={{ disabled: true }}`.  
- **Safe area** – overlay components (`SimpleAddButtons`, `ReceiptSavedSnackbar`) respect device insets via `useSafeAreaInsets`.

## Content and microcopy
### DashboardScreen
| Element | Copy |
|--------|------|
| **Add receipt button** | **Add receipt** |
| **Add mileage button** | **Add mileage** |
| **Snackbar (receipt)** | **Receipt saved** |
| **Snackbar (mileage)** | **Mileage saved** |
| **EmptyState title** | **No recent activity** |
| **EmptyState description** | *Add a receipt or mileage entry to start tracking your finances.* |
| **EmptyState primary button** | **Add receipt** |
| **Loading indicator** | **Loading recent activity…** |
| **Error view button** | **Retry** |
| **Error view message** | **Unable to load recent activity. Pull to refresh.** |
| **Activity row – title** | (dynamic, e.g., “Client lunch”) |
| **Activity row – amount** | (dynamic, currency formatted, e.g., “$12.34”) |
| **Bottom tab labels** | **Dashboard**, **Receipts**, **Mileage**, **Settings** |
| **Screen heading** | **Dashboard** (MD3 `headlineMedium`) |

### Form fields (Add receipt / mileage)
- **Label examples** – “Amount”, “Date”, “Category”, “Notes”.  
- **Placeholder** – *optional*: “e.g., 12.34”, “Select date”. (Never placeholder‑only; label always visible.)  
- **Error helper text** – “Please enter a valid amount.”, “Date is required.”  

All copy follows title case for button/row labels, sentence case for body text, and avoids jargon.

---  
**End of DESIGN.md**
