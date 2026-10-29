# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, and independent contractors who need a quick, private way to track income, expenses, and mileage **offline**.  
- **Goal** – Capture a receipt or mileage entry, edit any auto‑filled fields, pick a date, select (or create) a category, and save the record with a single tap.  
- **Success feels like** – “The receipt was saved / mileage logged / category renamed. A snackbar confirms it and the new item appears instantly in my dashboard.”

## Primary flow
1. **Launch → Policy gate** – accept the policy if not already accepted.  
2. **Dashboard** – bottom tab bar (Dashboard | Receipts | Mileage | Settings) always visible.  
3. **Add receipt** – tap the **large FAB** ➜ expands to two **mini‑FABs**: “Add receipt” and “Add mileage”.  
4. **Receipt entry** – fill fields (optional photo, amount, date, category, type, notes).  
   - If the device supports scanning, the **Scan receipt** button is shown; otherwise it’s hidden.  
   - The date field shows a calendar icon **inside** the TextInput.  
   - Validation runs on blur and on submit.  
   - Press **Save receipt** → loading → snackbar “Receipt saved”.  
5. **Add mileage** – similar flow; the **Miles** field accepts numbers > 0 with at most one decimal place.  
6. **Settings → Categories** – list rows with a chevron.  
   - Tap a row to rename inline (TextInput replaces the label).  
   - Switch row toggles **App lock** (single row, no extra button).  
   - “Delete all data” row appears last, in the error colour, separated by a divider.  
7. **All screens** – bottom tab bar remains reachable; any primary action from the flow is always reachable via the FAB or tab bar.

## Screens and states

| Screen | State | UI elements | Message / copy |
|--------|-------|-------------|----------------|
| **PolicyGateScreen** | Loading | Full‑screen `ActivityIndicator` | “Checking policy version…” |
| | Default | Policy text, checkbox, **Accept** button (disabled until checked) | – |
| | Error | Full‑screen error view, **Retry** button | “Unable to store your acceptance. Please try again.” |
| **DashboardScreen** | Loading | Centered `ActivityIndicator` | – |
| | Empty | `EmptyState` – icon, title **Nothing here yet**, description “Add a receipt or mileage entry to start tracking your finances.”, primary button **Add receipt** | – |
| | Populated | **SummaryCard** × 4, **Recent activity** list, **Add receipt** & **Add mileage** mini‑FABs (positioned **above** the list, not covering it) | – |
| **ReceiptEntryScreen** | Default (form) | Photo picker, **Scan receipt** button (visible only if scanner supported), outlined `FormField`s (Photo, Amount, Date, Category, Type, Notes), **Save receipt** button (disabled until form valid) | – |
| | Date picker open | `DatePickerModal` anchored to date field | – |
| | Category menu open | `Menu` anchored to category field | – |
| | Add‑category dialog open | `Dialog` with **Add new category** title, TextInput label **Category name** | – |
| | Validation error (field) | `HelperText type="error"` under field | *Amount must be greater than 0.*; *Date is required.*; *Category name must be 1–40 characters.*; *Category already exists.* |
| | Saving | **Save receipt** shows spinner, label hidden | – |
| | Save success | `Snackbar` | “Receipt saved” |
| | Save error | `Snackbar` | “Unable to save receipt. Please try again.” |
| **MileageEntryScreen** | Same as ReceiptEntryScreen, but without photo & category fields; **Miles** TextInput accepts decimals | – |
| | Validation error (miles) | `HelperText type="error"` | *Miles must be > 0.*; *Miles must have at most 1 decimal place.* |
| | Save success | `Snackbar` | “Mileage saved” |
| **SettingsScreen** | Default | List rows with chevron: **App lock** (switch), **Mileage rate**, **Tax rate**, **Export**, **Backup & restore**, **Categories**, **Policy**, **Delete all data** (error colour, separated by divider) | – |
| | Delete all data confirm | `Dialog` with title **Delete all data?** | “This action cannot be undone.” |
| **CategoriesScreen** | Default | List rows: category name, hide toggle, chevron for details | – |
| | Rename mode | Inline `TextInput` replaces label, auto‑focus | – |
| | Rename error | `HelperText type="error"` | *Category name must be 1–40 characters.*; *Category already exists.* |
| | Hide toggle error (if in use) | `Snackbar` | “Category is used by receipts – hide instead.” |
| **Any screen** | Offline banner | Full‑width banner at top | “You are offline. Some actions require an internet connection.” |

### Edge states
- **Long text** – titles and descriptions truncate with ellipsis after two lines.
- **Many recent activity items** – list scrolls independently; add‑buttons stay pinned above list.
- **Offline** – any network request falls back to local storage; UI shows banner but remains usable.
- **Permission denied** – when camera permission is denied, show a dialog with **Open Settings** button.

## Layout
- **Mobile‑first** – viewport **390 dp** wide, no horizontal scroll.  
- **Global container** – `Screen` component = `SafeAreaView` + `ScrollView` with **horizontal padding 16 dp** (`spacing*2`).  
- **Content width** – max **420 dp**, centered on desktop (breakpoint **1280 dp**).  
- **Vertical rhythm** – 8 dp grid (spacing multiples: 4, 8, 12, 16, 24, 32 dp).  
- **Bottom tab bar** – fixed height **56 dp**, icons + labels centered, anchored bottom on all platforms.  
- **FAB** – 56 × 56 dp, inset **16 dp** from right & bottom; expands to two **mini‑FABs** 40 × 40 dp spaced **8 dp** vertically. Mini‑FABs placed **above** the recent‑activity list, not overlapping it.  
- **Forms** – each `FormField` full‑width, vertical gap **12 dp**.  
- **Date field** – `TextInput` with trailing calendar icon inside the input (right‑aligned).  
- **Category field** – trailing dropdown arrow inside the input.  
- **Scan receipt button** – positioned **below** the photo picker, **above** other inputs; hidden when `expo-image-picker` reports scanning unsupported.  
- **Settings rows** – `List.Item` style, chevron trailing icon, height **56 dp**; divider before **Delete all data** row.  
- **Desktop breakpoint (1280 dp)** – layout unchanged; content stays centered, preserving phone‑first appearance.  

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

    // Secondary (teal) – used for mini‑FABs, switches, active menu items
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

```css
/* public/theme.css */
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
| #FFFFFF | #015958 | Mini‑FAB background (secondary) | large (icon) |

All pairs meet **WCAG AA** (≥ 4.5:1 normal text, ≥ 3:1 UI).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, optional `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error`, `right` (icon) | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` with `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled |
| **DatePickerField** | `TextInput` trigger + `DatePickerModal` | `value`, `onConfirm`, `label="Date"`, `right` (calendar icon) | ≥ 44 × 44 dp (input) | closed, open, error |
| **CategorySelect** | `TextInput` trigger + `Menu` | `value`, `onSelect`, `categories` array, `label="Category"`, `right` (dropdown arrow) | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | – | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` (2‑5) | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, optional `icon` | – | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | receipt props, `onPress` | – | default, pressed (elev 2), focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` | – | selected, unselected |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` `mode="secondary"`) | `icon`, optional `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **Dialog** | `Portal` + `Dialog` | `visible`, `onDismiss`, `title`, `children`, `actions` | – | default, focus‑visible |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | – | default |
| **HelperText** | `HelperText` | `type="error"` or default | – | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` | `"small"` | – | default |

All interactive elements meet the **44 × 44 dp** minimum touch area. Hover/focus states appear on web; native platforms use ripple/opacity feedback.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), `<ScrollView>` (`role="main"`), `BottomNavigation` (`role="navigation"`).  
- **Headings** – One `<Text variant="headlineMedium">` per screen (acts as `<h1>`). Sub‑sections use `titleMedium` (`<h2>`). No heading level skips.  
- **Labels** – Every `TextInput` has a visible `label`. Icon‑only buttons (FABs, Scan) provide `accessibilityLabel` (e.g., “Add receipt”, “Scan receipt”).  
- **Focus management** – On validation failure, the first invalid field receives programmatic focus (`ref.focus()`). Dialogs trap focus.  
- **Visible focus** – 2 dp outline using `theme.colors.outline` appears on keyboard navigation.  
- **Keyboard navigation** – All tappable components reachable via `Tab`/`Shift+Tab`; `Enter`/`Space` activates focused button.  
- **Reduced motion** – `useReducedMotion` disables non‑essential animations when `prefers-reduced-motion` is true.  
- **Live announcements** – OCR start/end, save success, error messages announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel** – Receipt thumbnail: “Receipt photo”; Empty‑state illustration: “Empty state illustration”.  
- **No colour‑only cues** – Errors also show an alert icon; disabled controls have `accessibilityState={{ disabled: true }}`.  
- **Touch feedback** – Native ripple on Android, opacity on iOS; both meet the 44 dp target.

## Content and microcopy
### Global
- **Snackbar success** – “Receipt saved”, “Mileage saved”, “Category added”, “Category renamed”, “Category hidden”.  
- **Snackbar error** – existing messages (e.g., “Unable to save receipt. Please try again.”).  

### PolicyGateScreen
- **Accept button** – “Accept”.  
- **Policy text** – concise one‑sentence statement.  

### DashboardScreen
- **EmptyState title** – “Nothing here yet”.  
- **EmptyState description** – “Add a receipt or mileage entry to start tracking your finances.”  
- **Primary button (empty)** – “Add receipt”.  
- **Mini‑FAB labels** – “Add receipt”, “Add mileage”.  

### ReceiptEntryScreen
- **Screen title** – “Add receipt” (appears only in `Appbar.Header`).  
- **Photo field label** – “Photo (optional)”.  
- **Amount label** – “Amount”.  
- **Date label** – “Date”.  
- **Date helper** – “Select a date (future dates not allowed).”  
- **Category label** – “Category”.  
- **Category helper** – “Select a category.”  
- **Type label** – “Type”.  
- **Notes label** – “Notes”.  
- **Scan receipt button** – “Scan receipt”.  
- **Scan tooltip (web)** – “Scanning is available in the phone app”.  
- **Save button** – “Save receipt”.  
- **Field errors** – “Amount must be greater than 0.”; “Date is required.”; “Category name must be 1–40 characters.”; “Category already exists.”; “Please select a category.”  
- **OCR loading** – “Analyzing receipt…”.  
- **OCR no‑data alert** – “No details could be extracted – please enter manually.”  

### MileageEntryScreen
- **Screen title** – “Add mileage” (header only).  
- **Miles label** – “Miles”.  
- **Miles helper** – “Enter miles driven (up to 1 decimal place).”.  
- **Miles field error** – “Miles must be > 0.”; “Miles must have at most 1 decimal place.”  
- **Save button** – “Save mileage”.  

### SettingsScreen
- **App lock row** – label “App lock” with a `SettingSwitch`.  
- **Mileage rate row** – “Mileage rate”.  
- **Tax rate row** – “Tax rate”.  
- **Export row** – “Export”.  
- **Backup & restore row** – “Backup & restore”.  
- **Categories row** – “Categories”.  
- **Policy row** – “Policy”.  
- **Delete all data row** – “Delete all data” (error colour).  

### CategoriesScreen
- **Section heading** – “Categories”.  
- **Add category button** – “Add category…”.  
- **Inline rename placeholder** – “Rename category”.  
- **Hide toggle label** – “Hide category”.  
- **Rename success Snackbar** – “Category renamed”.  
- **Add success Snackbar** – “Category added”.  

### AddCategoryDialog
- **Title** – “Add new category”.  
- **TextInput label** – “Category name”.  
- **Error messages** – “Category must be 1–40 characters.”; “Category already exists.”  

### Delete all data dialog
- **Title** – “Delete all data?”.  
- **Content** – “This action cannot be undone.”  
- **Confirm button** – “Delete”.  
- **Cancel button** – “Cancel”.  

All copy follows title case for button labels, sentence case for helper / body text, and avoids jargon. Autocomplete & keyboard types are set appropriately (email, numeric, password). Validation runs on blur and on submit, moving focus to the first invalid field. The UI meets the quality bar: clear visual hierarchy, generous 8 dp whitespace, restrained palette with a single accent, proper type scale, cards grouping related items, icons where useful, and a polished look on both phone and desktop widths.  

---  
**End of DESIGN.md**
