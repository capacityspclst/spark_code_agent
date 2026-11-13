# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, and independent contractors who need a quick, private way to track income, expenses, and mileage **offline**.  
- **Goal** – Access every core action (add receipt, view dashboard, adjust settings) from any signed‑in screen without getting lost.  
- **Success feels like** – “I can open Settings, toggle App Lock, change my tax rate, and see the changed value instantly; the UI always tells me what happened and never leaves me stranded.”

## Primary flow
1. **Launch → Policy gate** (unchanged).  
2. **Dashboard** – bottom tab bar always visible.  
3. **Settings** – tap the Settings tab → Settings screen.  
4. **Settings screen** – rows listed vertically.  
   - Toggle **App Lock** (switch).  
   - Tap any row with a chevron to navigate to its sub‑screen (Mileage rate, Tax rate, Export, Backup & Restore, Categories, Terms of Service, Privacy Policy).  
   - Press **Delete all data** (error‑colored row, separated by a thin divider) → confirmation dialog → data erased.  
5. All other primary flows (Add receipt, Add mileage, etc.) remain unchanged and are always reachable via the bottom tab bar.

## Screens and states

| Screen | State | UI elements | Message / copy |
|--------|-------|-------------|----------------|
| **SettingsScreen** | Default | `SettingsSection` containing multiple `SettingsRow` items: <br>• **App lock** – label + `SettingSwitch` (no chevron) <br>• **Mileage rate**, **Tax rate**, **Export**, **Backup & Restore**, **Categories**, **Terms of Service**, **Privacy Policy** – label + trailing chevron <br>• **Delete all data** – label in error color, trailing chevron optional, preceded by a `Separator` | – |
| | Loading | Full‑screen `ActivityIndicator` overlay (covers screen while settings are fetched) | “Loading settings…” |
| | Error (fetch) | Full‑screen error view with **Retry** button | “Unable to load settings. Please try again.” |
| | Confirmation (delete) | `Dialog` with title **Delete all data**, body “This action cannot be undone. Continue?” and **Cancel / Delete** actions | – |
| | Empty (no categories) – reachable from **Categories** sub‑screen only – handled in that screen’s spec. |

All other screens keep their states from the existing design.

## Layout
- **Mobile‑first**: viewport **390 dp** wide; horizontal padding **16 dp** (`spacing*2`). No horizontal scroll.  
- **Global container**: `Screen` component (`SafeAreaView` + `ScrollView`). Content width max **420 dp**, centered on desktop (1280 dp breakpoint).  
- **SettingsScreen**: vertical list of rows (`SettingsSection`) stacked with **8 dp** vertical rhythm. Each row height **56 dp** (standard MD3 list item). The **Delete all data** row has a `Separator` (`height: 1 dp`, `backgroundColor: theme.colors.surfaceVariant`) placed **8 dp** above it.  
- **Bottom Tab Bar**: fixed **56 dp** height, anchored bottom on all platforms.  
- **Desktop breakpoint (≥1280 dp)**: layout unchanged; the phone‑first UI remains centered with max‑width container.

## Design tokens
> **Implementation** – exported as a Material 3 theme object for React Native Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`).  

```ts
// src/theme.ts
export const theme = {
  roundness: 8,
  spacing: 8, // base unit (8 dp)

  colors: {
    // Primary (deep blue)
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFE5FF',
    onPrimaryContainer: '#001D35',

    // Secondary (teal) – used for switches, mini‑FABs, active menu items
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
| #212121    | #F2F2F2    | Card title on surface‑variant | normal |
| #212121    | #FFFFFF    | Dialog title | large (headline) |
| #212121    | #FFFFFF    | Settings row label (default) | normal |
| #B00020    | #FFFFFF    | Delete All Data row label | normal |
| #212121    | #F2F2F2    | Separator line | UI |
| #212121    | #FFFFFF    | Chevron icon (trailing) | UI |

All pairs meet **WCAG AA** (≥ 4.5:1 for normal text, ≥ 3:1 for UI elements).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | – | default, hover, focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **Separator** | `View` | `style` (height 1 dp, backgroundColor theme.colors.surfaceVariant) | – | default |
| **SettingsRow** | `TouchableOpacity` (styled) containing `Text` (label) + optional trailing element (`SettingSwitch`, chevron `MaterialIcons`), uses **Paper** `surface` background | `label`, `onPress`, `showChevron?`, `showSwitch?`, `switchValue?`, `onSwitchChange?`, `error?` | min 44 × 44 dp (row height 56 dp) | default, pressed (ripple), hover (web), focus‑visible (2 dp outline), disabled, error |
| **SettingsSection** | `View` | `children`, `showTopPadding?`, `showBottomPadding?`, `separator?` | – | default |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **Dialog**, **Snackbar**, **ActivityIndicator**, **HelperText**, **BottomTabBar**, **FABAdd**, **MiniFAB** – unchanged from existing spec.

All interactive elements satisfy the **44 × 44 dp** minimum touch area. Hover/focus states appear on web; native platforms use Ripple / elevation feedback.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), main content (`<ScrollView role="main">`), bottom navigation (`role="navigation"`).  
- **Headings** – one `<Text variant="headlineMedium">` per screen (treated as `<h1>`). Sub‑sections use `titleMedium` (`<h2>`). No skipped heading levels.  
- **Labels** – Every `FormField` has a visible `label`. `SettingsRow` rows are **buttons**: they have `accessibilityRole="button"` and `accessibilityLabel` equal to their visible label (e.g., “Export”). The chevron icon is decorative (`accessibilityIgnoresInvertColors`). `SettingSwitch` has its label read by the screen reader (`accessibilityLabel`).  
- **Focus management** – On validation error, the first invalid field receives programmatic focus (`focus()`). Dialogs trap focus while open.  
- **Visible focus** – 2 dp outline using `theme.colors.outline` appears on `focus-visible` (web) and via `accessibilityState={{ focused: true }}` on native.  
- **Keyboard navigation** – All tappable components reachable with `Tab`/`Shift+Tab`; `Enter` activates focused button.  
- **Reduced motion** – `useReducedMotion` disables non‑essential animations when the user prefers reduced motion.  
- **Live announcements** – Success and error `Snackbar` messages are announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel** – Icons that convey meaning (e.g., chevron) have `accessibilityLabel="Navigate"` if not purely decorative.  
- **No color‑only cues** – Error rows use both error color and an alert icon (`MaterialIcons` “error”). Disabled controls set `accessibilityState={{ disabled: true }}`.

### Settings‑specific notes
- `SettingsRow` with `showSwitch` uses `accessibilityRole="switch"` on the internal `Switch`.  
- The **Delete all data** row has `error` prop true; its label is announced with the error tone and the row is placed after a `Separator`.  
- The `Separator` is ignored by screen readers (`accessibilityElementsHidden`).  

## Content and microcopy
### SettingsScreen rows
| Row | Label | Trailing element | Action / navigation |
|-----|-------|------------------|---------------------|
| App lock | **App lock** | `SettingSwitch` (on/off) | Toggles app‑lock state instantly |
| Mileage rate | **Mileage rate** | Chevron (`>`), navigates to **MileageRateScreen** | Adjust default mileage reimbursement |
| Tax rate | **Tax rate** | Chevron, navigates to **TaxRateScreen** | Set custom tax percentage |
| Export | **Export** | Chevron, navigates to **ExportScreen** | Export receipts as CSV/JSON |
| Backup & Restore | **Backup & restore** | Chevron, navigates to **BackupScreen** | Create or restore encrypted backup |
| Categories | **Categories** | Chevron, navigates to **CategoriesScreen** | Manage category list |
| Terms of Service | **Terms of Service** | Chevron, navigates to **TermsScreen** | View legal terms |
| Privacy Policy | **Privacy Policy** | Chevron, navigates to **PrivacyScreen** | View privacy policy |
| Delete all data | **Delete all data** | Chevron (optional), styled with `theme.colors.error` | Opens confirmation dialog; on confirm, erases all stored data |

### Miscellaneous copy
- **Switch accessibilityLabel** – “App lock”.  
- **Delete confirmation dialog** – Title: **Delete all data**; Body: “This action cannot be undone. Continue?”; Buttons: **Cancel** (text) and **Delete** (contained, error color).  
- **Error Snackbar** – “Unable to delete data. Please try again.” (when deletion fails).  
- **Success Snackbar** – “All data deleted.” (when deletion succeeds).  
- **Loading indicator** – “Loading settings…” (full‑screen overlay).  
- **Retry button (error state)** – **Retry**.  

All copy follows title case for button/row labels, sentence case for body text, and avoids jargon. Input fields elsewhere respect autocomplete and proper keyboard types (email, numeric, password) as defined in the broader app spec.

---  
**End of DESIGN.md**
