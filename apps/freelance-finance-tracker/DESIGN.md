# DESIGN.md

## Users and goal
**Who:** Freelance professionals, gig workers, and independent contractors who need an offline‑first way to track receipts, mileage, and estimate tax liability.  
**Primary job:** Capture a receipt or mileage entry and instantly see an up‑to‑date financial summary, all without any data ever leaving the device.  
**Success:** The user records a receipt or mileage entry in two taps, watches the dashboard totals update instantly, and exports a CSV/PDF for their accountant—while being confident that every piece of data remains encrypted on‑device.

## Primary flow
1. **Launch app** – if the stored policy version is missing or outdated, the app shows the **PolicyScreen**.  
2. **Accept policy** – tick the “I agree…” checkbox and tap **Continue**. The version and date are saved in SecureStore and the user is taken to the main UI.  
3. **Add a receipt** (fastest path) – from the Dashboard tap the **Add receipt** FAB → choose **Take photo** (camera) or **Choose from library** → fill **Amount, Date, Category, Type, Notes** → tap **Save receipt** → ActivityIndicator “Saving receipt…” → Snackbar “Receipt saved”.  
4. **Add mileage** (alternative fast path) – from the Dashboard tap **Add mileage** → fill **Date, Miles, Purpose** → tap **Save mileage** → spinner → Snackbar “Mileage entry saved”.  
5. **View dashboard** – the four SummaryCards (Income, Expenses, Mileage deduction, Estimated tax) refresh automatically; recent activity is listed underneath.  

All other actions (Export, Backup, Settings) are reachable from the bottom‑tab bar at any time, so the user is never stranded.

## Screens and states

| Screen | State | UI / Message |
|--------|-------|--------------|
| **PolicyScreen** | Loading | `<ActivityIndicator />` “Loading policy…” |
| | Default | Scrollable policy text, checkbox “I agree to the Terms of Use and Privacy Policy”, **Continue** button (disabled until checked) |
| | Error (SecureStore) | “Failed to load policy. Please restart the app.” (red) |
| | Updated version | Banner “Policy has been updated to version {VERSION} – please review.” |
| **DashboardScreen** | Loading | ActivityIndicator “Loading dashboard…” |
| | Empty | `EmptyState` – “No activity yet. Add a receipt or mileage entry to get started.” + FAB “Add receipt” |
| | Success | Four `SummaryCard`s + list of the 5 most recent items (receipt thumbnail or mileage icon) |
| | Error (DB) | “Unable to load summary. Please try again later.” |
| **ReceiptsScreen** | Loading | “Loading receipts…” |
| | Empty | `EmptyState` – “You haven’t added any receipts. Tap the + button to add one.” |
| | Success | FlatList of receipt cards (photo thumbnail, amount, date, category) |
| | Error | “Could not load receipts.” |
| **ReceiptFormScreen** | Default | Empty fields (or pre‑filled for edit) |
| | Validation error | Inline `HelperText` (e.g., “Enter a valid amount.”) |
| | Saving | Button shows spinner, label “Saving receipt…” |
| | Success | Navigate back, Snackbar “Receipt saved”. |
| | Edge – long notes | Notes field expands up to 8 lines, scrollable inside. |
| **MileageScreen** | Same pattern as ReceiptsScreen, with mileage‑specific copy. |
| **MileageFormScreen** | Same pattern as ReceiptFormScreen (fields: Date, Miles, Purpose). |
| **SettingsScreen** | Loading | “Loading settings…” |
| | Default | Sections: **App lock**, **Mileage rate**, **Tax rate**, **Backup & restore**, **Policy**, **Delete all data**. |
| | Backup in progress | Dialog “Creating encrypted backup…”, spinner. |
| | Backup success | Snackbar “Backup ready – opening share sheet.” |
| | Restore error | Dialog “Incorrect passphrase or corrupted file.” |
| | Delete confirmation | Alert “This will permanently erase all data. Type **DELETE** to confirm.” |
| **Permission prompts** | System modal with clear explanation, fallback UI when denied. |
| **Biometric auth** | Prompt “Authenticate to unlock the app.” – success/failure messages. |

All screens use the shared **Screen** wrapper (safe‑area + 16 px padding, centered column, max‑width 420 px on phones, 560 px on desktop).

## Layout
*Mobile‑first – 390 px viewport*  
- **Grid:** 4‑column, 8 px gutter.  
- **Horizontal padding:** 16 px (2 × 8 px).  
- **Form / dialog width:** ≤ 420 px, centered.  
- **Bottom Tab Bar:** Fixed 56 px high, icons 24 px, label underneath, touch target ≥ 44 × 44 px.  
- **AppBar / Header:** 56 px high, primary background, centered title.  
- **Cards:** Full‑width within column, 12 px internal padding, elevation 4, margin‑bottom 16 px.  
- **FAB:** 56 px circular, primary background, positioned 16 px from right & bottom on Dashboard.

*Desktop – 1280 px viewport*  
- Same component layout; column width expands to 560 px.  
- Dashboard cards arrange 2 × 2 grid (16 px gap).  
- Bottom tab bar stays at the bottom of the viewport (no stretching).  
- No horizontal scrolling on any screen.

All spacing follows the 8 px scale; vertical rhythm is multiples of 8.

## Design tokens
**Theme object for React Native Paper (MD3) – `src/theme.ts`**

```ts
// src/theme.ts
import { MD3LightTheme } from 'react-native-paper';

export const appTheme = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    primary: '#0061A4',            // strong brand accent
    onPrimary: '#FFFFFF',
    primaryContainer: '#D0E7FF',
    onPrimaryContainer: '#001D36',
    secondary: '#4A5862',          // neutral dark for secondary text/icons
    onSecondary: '#FFFFFF',
    background: '#F6F9FC',
    surface: '#FFFFFF',
    surfaceVariant: '#E8EBEF',
    onSurface: '#1F1F1F',
    onSurfaceVariant: '#4A5862',  // replaces #5C6B73 to satisfy contrast
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
```

**Web fallback (CSS custom properties) – `global.css`**

```css
:root {
  --color-primary: #0061A4;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #D0E7FF;
  --color-on-primary-container: #001D36;
  --color-secondary: #4A5862;
  --color-on-secondary: #FFFFFF;
  --color-background: #F6F9FC;
  --color-surface: #FFFFFF;
  --color-surface-variant: #E8EBEF;
  --color-on-surface: #1F1F1F;
  --color-on-surface-variant: #4A5862;
  --color-outline: #757575;
  --color-error: #B3261E;
  --color-on-error: #FFFFFF;
  --color-disabled: #8A8A8A;
  --radius: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

### Contrast pairs
| foreground | background | use | size |
|------------|------------|-----|------|
| #FFFFFF | #0061A4 | AppBar title (large) | large |
| #FFFFFF | #0061A4 | AppBar action icons, Primary button label, FAB icon | ui |
| #8A8A8A | #FFFFFF | Disabled primary/outlined button label, disabled field text | ui |
| #0061A4 | #FFFFFF | Outlined button label, Text button label, active tab icon + label, link text | normal |
| #4A5862 | #FFFFFF | Inactive tab label + icon, secondary subtitle text, TextInput placeholder & label | normal |
| #4A5862 | #E8EBEF | SummaryCard title/value, secondary text on surface‑variant cards | normal |
| #001D36 | #D0E7FF | Snackbar message (on primaryContainer) | normal |
| #FFFFFF | #B3261E | Error helper text (e.g., “Enter a valid amount.”) | normal |
| #757575 | #FFFFFF | TextInput outline, divider lines | ui |
| #1F1F1F | #FFFFFF | Body text inside cards, dialog content | normal |
| #1F1F1F | #F6F9FC | Body text on app background (empty‑state copy) | normal |
| #0061A4 | #F6F9FC | Accent text on background (rare usage) | normal |

All pairs meet WCAG AA: ≥ 4.5:1 for normal text, ≥ 3:1 for UI parts and large text.

## Components
All UI pieces are thin wrappers around React Native Paper components, using the tokens above.

| Component | Paper base | Props / variants | States (default, hover, focus‑visible, active, disabled, loading) | Minimum touch target |
|-----------|------------|------------------|-------------------------------------------------------------------|----------------------|
| **Screen** | `SafeAreaView` + `View` | `style={{ padding: theme.spacing.md, maxWidth: 420, alignSelf: 'center' }}` | — | — |
| **AppBar** | `Appbar.Header` | `title`, optional `action` icons (`accessibilityLabel`) | default / pressed | 56 px height, ≥ 44 × 44 px icons |
| **BottomTabNavigator** | `BottomNavigation` | `routes` with `icon`, `label` | active / inactive / focus‑visible | icons 24 px, tap area ≥ 44 × 44 px |
| **PrimaryButton** | `Button` (mode=`contained`) | `onPress`, `disabled`, `loading` | default / hover (web) / focus‑visible / active (pressed) / disabled / loading | 48 px height, min‑width 64 px, ≥ 44 × 44 px hit‑area |
| **OutlinedButton** | `Button` (mode=`outlined`) | same as PrimaryButton | same | same |
| **FormField** | `TextInput` (mode=`outlined`) + `HelperText` | `label`, `value`, `onChangeText`, `error`, `keyboardType`, `autoComplete`, `secureTextEntry` | default / focused / error / disabled | height 56 px, full‑width touch |
| **SummaryCard** | `Card` | `title`, `value`, optional `icon` | default / hover (web) | 120 px height, full‑width within container |
| **EmptyState** | `View` + `Text` + optional `Button` | `title`, `description`, `actionLabel`, `onAction` | default | centered column, button uses PrimaryButton |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, optional `action` | default / action‑pressed | width ≤ 90 % viewport, auto‑dismiss 4 s |
| **Dialog** | `Dialog` + `Portal` | `title`, `children`, `visible`, `onDismiss` | default / focus‑visible | max width 560 px |
| **ActivityIndicator** | `ActivityIndicator` | `size`, `animating` | default (spinning) | — |
| **HelperText** | `HelperText` | `type="error"` or default | visible only on error | — |
| **FAB** | `FAB` | `icon`, `label`, `onPress` | default / active / disabled | 56 px circular, ≥ 44 × 44 px hit‑area |

All interactive components guarantee a minimum **44 × 44 px** touch area (visual size may be smaller but invisible padding expands the hit‑area).

## Accessibility
- **Landmarks:** `Screen` has `accessibilityRole="main"`; `AppBar` is `banner`; `BottomNavigation` is `navigation`.  
- **Heading hierarchy:** Each screen starts with one `headlineMedium` (`accessibilityRole="header"`) as the sole **h1**. Sub‑sections use `titleMedium` (**h2**) and `bodyLarge` (**h3**).  
- **Labels:** Every `TextInput` supplies a visible `label`. Icon‑only buttons (`AppBar.Action`, FAB) have explicit `accessibilityLabel`.  
- **Focus management:** Dialogs trap focus; after a successful save focus moves to the primary button on the next screen. Keyboard navigation follows logical order; `Tab` cycles through actionable elements.  
- **Visible focus:** Paper components expose a high‑contrast outline when `focus-visible` (web) or when the OS focus ring is present.  
- **Reduced motion:** All non‑essential animations (screen transitions, FAB reveal) respect `prefers-reduced-motion`; they are disabled when the media query matches.  
- **Alt / accessibilityLabel for images:** Receipt thumbnails use `accessibilityLabel="Receipt photo taken on <date>"`.  
- **No color‑only cues:** Validation errors combine a red icon (`AlertCircle`) with error text; active tab icons also have bold labels; switches announce `checked` state.  
- **ARIA / live regions:** `HelperText` is linked to its `TextInput` via `accessibilityHint`. Snackbar messages set `accessibilityLiveRegion="polite"`. Loading buttons expose `accessibilityState={{ busy: true }}`.  

## Content and microcopy
### Global
- **App name:** “Freelance Finance Tracker”  
- **Tagline (policy screen):** “Track receipts and mileage locally – your data never leaves the device.”

### PolicyScreen
- Checkbox: “I agree to the Terms of Use and Privacy Policy.”  
- Continue button: **Continue**  
- Error: “Failed to load policy. Please restart the app.”  
- Version banner: “Policy has been updated to version {VERSION} – please review.”

### Dashboard
- Card titles: **Income**, **Expenses**, **Mileage deduction**, **Estimated tax**  
- EmptyState title: “No activity yet”  
- EmptyState description: “Add a receipt or mileage entry to see your financial overview.”  
- Primary actions (FAB): **Add receipt**, **Add mileage**  
- Export buttons: **Export CSV**, **Export PDF**

### Receipts
- Screen title: **Receipts**  
- EmptyState title: “No receipts”  
- EmptyState description: “Tap the + button to add your first receipt.”  
- FAB label: **Add receipt**  
- List subtitle pattern: “{Category} • {Date}”

### Receipt Form
- Field labels: **Amount**, **Date**, **Category**, **Type**, **Notes**  
- Type selector: **Expense**, **Income**  
- Photo buttons: **Take photo**, **Choose from library**  
- Save button: **Save receipt**  
- Cancel button: **Cancel**  
- Validation messages: “Enter a valid amount.”, “Date is required.”, “Select a category.”, “Choose expense or income.”  
- Saving indicator: “Saving receipt…”

### Mileage
- Screen title: **Mileage**  
- EmptyState title: “No mileage entries”  
- EmptyState description: “Tap the + button to log your first trip.”  
- FAB label: **Add mileage**

### Mileage Form
- Field labels: **Date**, **Miles**, **Purpose**  
- Save button: **Save mileage**  
- Validation messages: “Enter a numeric value.”, “Date is required.”, “Purpose is required.”  

### Settings
- Section headings: **App lock**, **Mileage rate**, **Tax rate**, **Backup & restore**, **Policy**, **Delete all data**  
- App lock toggle label: “Enable app lock (Face/Touch ID)”  
- Mileage rate placeholder: “e.g., 0.585 USD per mile”  
- Tax rate placeholder: “e.g., 0.22 (22 %)”  
- Backup button: **Create backup**  
- Restore button: **Restore backup**  
- Delete data button: **Delete all data**  
- Delete confirmation: “This will permanently erase all data. Type **DELETE** to confirm.”  
- Backup passphrase prompt: “Enter a passphrase (min 8 characters) to encrypt the backup.”  
- Restore error: “Incorrect passphrase or corrupted file.”  
- Success toasts: “Backup created.”, “Backup restored.”, “Exported to CSV.”, “Exported to PDF.”, “All data deleted.”  

All copy is plain, imperative, and avoids jargon. Dates/amounts follow the device locale; amounts use the device’s currency settings. Icons always accompany text for quick scanning, and every icon has an accessible label.  

---  

*End of DESIGN.md*
