# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, and independent contractors who need a fast, private way to track income, expenses, and mileage **offline** on their phone.  
- **Goal** – Capture a receipt or mileage entry in ≤ 30 seconds, edit any auto‑filled fields, select or create a category, and save.  
- **Success feels like** – “The receipt was scanned, the fields are correct, I tapped **Save**, and a snackbar says *Receipt saved*.”  

## Primary flow
1. **Launch → Policy gate** (unchanged).  
2. **Dashboard** – bottom tab bar always visible.  
3. **Add receipt** – tap FAB → mini‑FAB **Receipt**.  
4. **Receipt entry** –  
   a. *If scanning is available* → **Scan receipt** (camera/gallery) → OCR spinner.  
   b. *If OCR finds data* → fields pre‑filled with helper *Check these details*.  
   c. *If OCR finds nothing* → alert *No details could be extracted – please enter manually*.  
   d. Edit any fields (date via calendar, category via dropdown, etc.).  
   e. **Add category…** → dialog to type a new name (1‑40 chars, case‑insensitive unique).  
   f. **Save receipt** → loading → snackbar *Receipt saved*.  
5. **Add mileage** – FAB → mini‑FAB **Mileage** → mileage entry screen (decimal miles allowed).  
6. **Settings → Categories** – rename, hide, or add custom categories; renaming updates receipts automatically.  
7. **Export / Backup / Restore** – reachable via bottom tabs or Settings at any time.  

All screens expose a direct path forward; the bottom tab bar is present on every signed‑in screen.

## Screens and states

| Screen | State | UI element(s) | Message / copy |
|--------|-------|----------------|----------------|
| **PolicyGateScreen** | Loading | Full‑screen `ActivityIndicator` | “Checking policy version…” |
| | Default | Policy text, checkbox, **Accept** button (disabled until checked) | Policy text |
| | Error | Full‑screen error view + **Retry** | “Unable to store your acceptance. Please try again.” |
| **DashboardScreen** | Loading | Centered `ActivityIndicator` | — |
| | Empty | `EmptyState` (icon, title, description, primary button) | Title *Nothing here yet*; Description *Add a receipt or mileage entry to start tracking your finances.*; Button **Add receipt** |
| | Populated | 4 `SummaryCard`s + **Recent activity** list (scrollable) | — |
| | Snackbar | `Snackbar` anchored **above** the list (z‑index 1) | “Receipt saved”, “Mileage saved”, “Category renamed”, … |
| **ReceiptEntryScreen** | Default (form) | Photo picker, **Scan receipt** button (conditionally rendered), outlined `FormField`s (Amount, Date, Category, Type, Notes), **Save receipt** button (disabled until valid) | — |
| | OCR loading | Overlay `ActivityIndicator` + label “Analyzing receipt…” | — |
| | OCR success | Fields pre‑filled; each shows `HelperText` *Check these details* (until edited) | — |
| | OCR no data | Alert dialog | “No details could be extracted – please enter manually.” |
| | Date picker open | `DatePickerModal` | — |
| | Category dropdown open | `Menu` anchored to TextInput | — |
| | Add‑category dialog | `Dialog` with TextInput | Title *Add new category*; Placeholder *Category name* |
| | Validation error (field) | `HelperText type="error"` under field | Amount: “Enter a valid amount.”; Date: “Select a date.”; Category: “Select a category.”; Type: “Select a type.” |
| | Save loading | **Save receipt** shows spinner, label hidden | — |
| | Save error | `Snackbar` | “Unable to save receipt. Please try again.” |
| **MileageEntryScreen** | Same as ReceiptEntryScreen (no photo, category) | – | – |
| | Validation error (mileage) | `HelperText type="error"` under Miles field | “Mileage must be > 0 and have at most one decimal place.” |
| **CategoriesScreen** | Default | List of categories (`ListItemRow`s) with inline rename, hide toggle, **Add category…** button | — |
| | Renaming inline | TextInput replaces label in place | — |
| | Rename success | `Snackbar` | “Category renamed.” |
| | Rename error | `HelperText type="error"` under input | “Invalid name”, “Category already exists”, “Category not found”. |
| | Add‑category dialog | `Dialog` | Title *Add new category*; Placeholder *Category name* |
| | Hide toggle error | `Snackbar` | “Category is used by receipts – hide instead.” |
| **SettingsScreen** | Default | List rows (`SettingRow`) – App lock (switch), Mileage rate, Tax rate, Export, Backup & Restore, **Categories**, View Terms & Privacy Policy, **Delete all data** (error‑colored, separated by divider) | — |
| | Delete all confirmation | Alert dialog | “Are you sure you want to delete all data? This action cannot be undone.” |
| **Any screen** | Offline (when network needed) | Full‑screen banner | “You are offline. Some actions require an internet connection.” |

### Edge states
- **RenameCategory failure** – no receipt is changed; UI remains on the same screen; snackbar “Category rename failed” with specific reason.
- **Mileage entry with invalid decimal** – field stays focused, error helper shown, button remains disabled.
- **Scan receipt unavailable** – **Scan receipt** button omitted from DOM (not just hidden) so it is not focusable by screen readers.
- **Very long category list** – `Recent activity` list scrollable with `paddingBottom: 80dp` to keep FAB visible.
- **Long text in cards** – text truncates with ellipsis after two lines.

## Layout
- **Mobile‑first**: viewport **390 dp** wide, no horizontal scroll.  
- **Global container** – `Screen` component = `SafeAreaView` + `ScrollView` with **horizontal padding 16 dp** (`spacing*2`).  
- **Max content width** – **420 dp**, centered on desktop (1280 dp).  
- **Vertical rhythm** – **8 dp** steps (4, 8, 12, 16, 24, 32 dp).  
- **Bottom Tab Bar** – `BottomNavigation`, fixed **56 dp** height, icons + labels centered, `forceLabelDisplay: true` to guarantee full‑width label visibility on 390 dp screens.  
- **FAB Add** – `FAB` (56 × 56 dp) anchored **right: 16 dp**, **bottom: 16 dp**. Mini‑FABs (40 × 40 dp) appear above main FAB with **bottom: 80 dp** to avoid covering the activity list. `Recent activity` list’s `contentContainerStyle` includes `paddingBottom: 120 dp` to ensure scrolling past FABs.  
- **Forms** – each `FormField` full‑width, vertical gap **12 dp**. Labels always visible; placeholders only for hint text.  
- **Date field** – `TextInput` (outlined) with trailing `calendar` icon (InputAdornment) that opens `DatePickerModal`.  
- **Category field** – `TextInput` with trailing dropdown arrow, opens `Menu`.  
- **Scan receipt button** – placed **below** the photo picker, rendered only when `expo-text-extractor` (or equivalent) reports `isSupported === true`.  
- **Settings rows** – `SettingRow` (Paper `List.Item`) with chevron (`right` prop) for navigation, touch target **≥ 44 × 44 dp**. “Delete all data” row styled with `titleStyle={{ color: theme.colors.error }}` and placed after a `Divider`.  
- **Desktop breakpoint (≥ 1280 dp)** – layout unchanged; UI remains phone‑first with centered content.

## Design tokens
> **Implementation** – exported as a Material 3 theme object for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`).

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

    // Secondary (teal) – used for mini‑FABs, active switches
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
| #FFFFFF | #0061A4 | Primary button label (contained) | normal |
| #0061A4 | #FFFFFF | Text button / outlined button label | normal |
| #212121 | #FFFFFF | Body text on screens & cards | normal |
| #49454F | #FFFFFF | Secondary text (captions, dates) | normal |
| #0061A4 | #F5F5F5 | Bottom‑tab selected icon & label | normal |
| #49454F | #FFFFFF | Unselected tab icon & label | normal |
| #B00020 | #FFFFFF | HelperText error / Snackbar error text | normal |
| #FFFFFF | #B00020 | Snackbar label on error background | normal |
| #212121 | #E0E0E0 | Disabled button label | normal |
| #FFFFFF | #015958 | Switch thumb (on) | UI |
| #015958 | #FFFFFF | Switch track (on) | UI |
| #212121 | #E0E0E0 | Switch thumb (off) | UI |
| #FFFFFF | #0061A4 | Primary FAB icon | large (icon) |
| #FFFFFF | #015958 | Mini‑FAB icon | large (icon) |
| #6F6F6F | #FFFFFF | TextInput placeholder | normal |
| #212121 | #CFE5FF | Card title on primary‑container surface | normal |
| #212121 | #F2F2F2 | Card title on surface‑variant | normal |
| #212121 | #FFFFFF | Dialog title | large (headline) |
| #B00020 | #FFFFFF | Delete‑all‑data row text (error color on surface) | normal |
| #FFFFFF | #015958 | Mini‑FAB background (secondary) | large (icon) |
All pairs meet **WCAG AA** (≥ 4.5:1 normal text, ≥ 3:1 large text/UI).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled |
| **DatePickerField** | `DatePickerModal` + `TextInput` trigger | `value`, `onConfirm`, `label="Date"`; disallow future dates for receipts | ≥ 44 × 44 dp (input) | closed, open, error |
| **CategorySelect** | `Menu` anchored to a `TextInput` (outlined) | `value`, `onSelect`, `categories` array, `label="Category"` | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | – | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | – | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | receipt props + `onPress` | – | default, pressed (elev 2), focus |
| **ActivityRow** | `List.Item` | `title`, `description`, `right` (amount), `onPress` | ≥ 44 × 44 dp | default, pressed, focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes`, `forceLabelDisplay=true` | – | selected, unselected |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **SettingRow** | `List.Item` | `title`, `description?`, `right` (chevron or switch), `onPress` | ≥ 44 × 44 dp | default, pressed, focus |
| **Dialog** | `Portal` + `Dialog` | `visible`, `onDismiss`, `title`, `children`, `actions` | – | default, focus‑visible |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | – | default |
| **HelperText** | `HelperText` | `type="error"` | – | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | – | default |

All interactive elements meet the **44 × 44 dp** minimum touch area. Hover/focus states appear on web; native platforms use ripple effects.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), `<ScrollView>` (`role="main"`), bottom navigation (`role="navigation"`).  
- **Headings** – One `<Text variant="headlineMedium">` per screen (acts as `<h1>`). Sub‑sections use `titleMedium` (`h2`) and `bodyLarge` (`p`). No skipped heading levels.  
- **Labels** – Every `TextInput` has a visible `label`. Icon‑only buttons (FABs, Scan) have `accessibilityLabel` (“Add receipt”, “Add mileage”, “Scan receipt”). `SettingRow` links have `accessibilityLabel` derived from their title.  
- **Focus management** – On validation failure, the first invalid field receives programmatic focus; dialogs trap focus.  
- **Visible focus** – 2 dp outline using `theme.colors.outline` on web; native shows default ripple + focus ring.  
- **Keyboard navigation** – All tappable components reachable via `Tab`/`Shift+Tab`; `Enter` activates focused button.  
- **Reduced motion** – `useReducedMotion` disables non‑essential animations when `prefers-reduced-motion` is true.  
- **Live announcements** – OCR start/end, save success and error messages are announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel** – Receipt thumbnail: “Receipt photo”; empty‑state illustration: “Empty state illustration”.  
- **No color‑only cues** – Errors also show an alert icon; disabled controls expose `accessibilityState={{ disabled: true }}`.  
- **Conditional UI** – When scanning is unavailable, the **Scan receipt** button is omitted from the render tree, so screen readers never encounter it.

## Content and microcopy
### Global
- **Snackbar success** – “Receipt saved”, “Mileage saved”, “Category added”, “Category renamed”, “Category hidden”, “All data deleted”.  
- **Snackbar error** – “Unable to save receipt. Please try again.”, “Unable to save mileage. Please try again.”, “Export failed”, “Backup failed”, “Category rename failed”.  
- **Offline banner** – “You are offline. Some actions require an internet connection.”  

### ReceiptEntryScreen
- **Screen title (header only)** – “Add receipt”.  
- **Scan button** – **Scan receipt** (tooltip on web: “Scanning is available in the phone app”).  
- **OCR loading** – “Analyzing receipt…”.  
- **Helper for pre‑filled fields** – “Check these details”.  
- **OCR no‑data alert** – “No details could be extracted – please enter manually.”  
- **Field labels** – Photo (optional), Amount, Date, Category, Type, Notes.  
- **Date helper** – “Select a date (future dates not allowed).”  
- **Category helper** – “Select a category.”  
- **Dropdown placeholder** – “Select category”.  
- **Add‑category dialog** – Title *Add new category*; TextInput label *Category name*; Validation: “Category must be 1‑40 characters.”, “Category already exists.”, “Invalid category name.”  
- **Save button** – **Save receipt**.  

### MileageEntryScreen
- **Screen title** – “Add mileage”.  
- **Miles field label** – “Miles”.  
- **Miles helper** – “Enter miles (e.g., 12.5).”  
- **Validation error** – “Mileage must be > 0 and have at most one decimal place.”  
- **Save button** – **Save mileage**.  

### CategoriesScreen
- **Section heading** – “Categories”.  
- **Add button** – **Add category…** (opens dialog).  
- **Inline rename placeholder** – “Rename category”.  
- **Hide toggle label** – “Hide category”.  
- **Rename success** – Snackbar “Category renamed”.  
- **Rename error** – “Category rename failed: <reason>”.  
- **Hide error** – “Category is used by receipts – hide instead.”  

### SettingsScreen
- **App lock row** – Switch with label “App lock”. No separate button.  
- **Other rows** – “Mileage rate”, “Tax rate”, “Export”, “Backup & Restore”, “Categories”, “View Terms & Privacy Policy”; each a `SettingRow` with chevron.  
- **Delete all data row** – Text in `theme.colors.error`, separated by a `Divider` and placed last.  
- **Delete confirmation dialog** – Title *Delete all data*; Message *Are you sure you want to delete all data? This action cannot be undone.*; Buttons: **Cancel**, **Delete** (danger style).  

### DashboardScreen
- **Recent activity rows** – Show title (receipt or mileage), date, and amount (e.g., “$12.34”).  
- **FAB labels** – Mini‑FABs: “Receipt”, “Mileage”.  
- **Snackbar after save** – “Receipt saved” or “Mileage saved”.  

All copy follows title case for button labels, sentence case for body text, and avoids jargon. Autocomplete & keyboard types are set appropriately (email, numeric, password). Validation runs on blur and on submit, moving focus to the first invalid field. The UI meets the quality bar: clear visual hierarchy, generous 8 dp whitespace, restrained palette with a single accent, proper type scale, cards grouping related items, icons where useful, and a polished look on both phone and desktop widths.

---  
**End of DESIGN.md**
