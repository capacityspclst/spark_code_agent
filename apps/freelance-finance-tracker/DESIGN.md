# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, independent contractors who need a fast, private way to track income, expenses, and mileage **offline**.  
- **Goal** – capture a receipt or mileage entry in ≤ 30 seconds, edit any auto‑filled fields, select or create a category, and save with clear feedback.  
- **Success feels like** – “I tapped **Save receipt**, a snackbar said *Receipt saved*, and the new entry appears instantly on the dashboard.”

## Primary flow
1. **Launch → Policy gate** – first‑time users accept the policy, then land on **Dashboard** (bottom tab always visible).  
2. **Dashboard** – shows four summary cards and a scrollable “Recent activity” list. The list never scrolls under the add‑entry buttons.  
3. **Primary action** – tap the **FAB** (bottom‑right). It expands to two **Mini FABs**: **Add receipt** (camera icon) and **Add mileage** (road icon). The FAB floats 16 dp above the bottom tab bar.  
4. **Add receipt** – Mini FAB → **ReceiptEntryScreen** (header title “Add receipt”).  
   - If the device supports a camera, the **Scan receipt** button appears below the optional Photo picker.  
   - User fills fields (Amount, Date (icon inside), Category (dropdown), Type, Notes) and taps **Save receipt** → loading → snackbar *Receipt saved*.  
5. **Add mileage** – Mini FAB → **MileageEntryScreen**.  
   - **Miles** field accepts a decimal (e.g., “12.5”). Validation runs live.  
   - **Save mileage** → loading → snackbar *Mileage saved*.  
6. **Settings** – accessible via bottom tab → **SettingsScreen**. Rows are list items with chevrons; “App lock” appears as a single toggle row. “Delete all data” is an error‑colored row, separated from the others.  
7. **Categories** – Settings → **CategoriesScreen**. Inline rename, hide toggle, and **Add category…** dialog. Renaming a category updates every receipt that used the old name (case‑insensitive).  

Every screen always offers a forward path (bottom tabs, primary button, or explicit navigation), so no user is ever stranded.

## Screens and states

| Screen | State | UI elements | Message / copy |
|--------|-------|-------------|----------------|
| **PolicyGateScreen** | Loading | Full‑screen `ActivityIndicator` | “Checking policy version…” |
| | Default | Policy text, checkbox, **Accept** button (disabled until checked) | – |
| | Error | Full‑screen error view + **Retry** button | “Unable to store your acceptance. Please try again.” |
| **DashboardScreen** | Loading | Centered `ActivityIndicator` | – |
| | Empty | `EmptyState` component | Title: *Nothing here yet*<br>Desc: *Add a receipt or mileage entry to start tracking your finances.*<br>Primary button: **Add receipt** |
| | Populated | 4 `SummaryCard`s + scrollable **RecentActivity** list (each row shows date, type, amount) | – |
| | Snackbar | `Snackbar` anchored above bottom tab | “Receipt saved”, “Mileage saved”, … |
| **ReceiptEntryScreen** | Default (form) | `Appbar` title “Add receipt”, optional **Scan receipt** button (hidden on web), outlined `FormField`s (Photo, Amount, Date + calendar icon, Category + chevron, Type, Notes), **Save receipt** button (disabled until valid) | – |
| | Date picker open | `DatePickerModal` anchored to Date field | – |
| | Category menu open | `Menu` anchored to Category field | – |
| | Add‑category dialog | `Dialog` with TextInput | Title: *Add new category*; Placeholder: *Category name* |
| | Validation error (field) | `HelperText type="error"` | “Amount must be a positive number.”, “Date is required.”, “Category must be 1‑40 characters.”, “Category already exists.” |
| | Saving | **Save receipt** shows ActivityIndicator, label hidden | – |
| | Save error | `Snackbar` | “Unable to save receipt. Please try again.” |
| **MileageEntryScreen** | Default (form) | Same layout as ReceiptEntryScreen, without Photo or Category. Miles field `keyboardType='numeric'` accepts one decimal place. | – |
| | Validation error (Miles) | `HelperText type="error"` | “Miles must be > 0.”, “Miles must be ≤ 10 000.”, “Miles can have at most 1 decimal place.” |
| **SettingsScreen** | Default | `Appbar` title “Settings”, list rows (`SettingItem`): **App lock** (switch), **Mileage rate**, **Tax rate**, **Export**, **Backup & restore**, **Categories**, **Policy**, **Delete all data** (error color, separated by divider) | – |
| **CategoriesScreen** | Default | List of `CategoryRow`s with hide toggle, rename inline, **Add category…** button at bottom | – |
| | Rename mode | Inline `TextInput` replaces label | – |
| | Add dialog | Same as in ReceiptEntryScreen | – |
| | Validation error | `HelperText type="error"` | “Category must be 1‑40 characters.”, “Category already exists.” |
| | Hide‑in‑use error | `Snackbar` | “Category is used by receipts – hide instead.” |
| **Any screen** | Offline banner | Full‑width banner at top | “You are offline. Some actions require an internet connection.” |
| | Permission denied (camera) | Alert dialog | “Camera permission denied. You can still add receipt manually.” |

All states move focus to the first invalid field, announce key changes for screen‑reader users, and respect `prefers-reduced-motion`.

## Layout
- **Mobile‑first**: viewport **390 dp** width, never scroll horizontally.  
- **Global container** (`Screen`): `SafeAreaView` + `ScrollView` with horizontal padding **16 dp** (`spacing*2`). Max content width **420 dp**, centered on desktop (1280 dp).  
- **Vertical rhythm**: 8 dp grid (spacing values 4, 8, 12, 16, 24, 32 dp).  
- **Bottom Tab Bar**: fixed height **56 dp**, icons + labels centered, always visible. Labels fit within 390 dp width.  
- **FAB**: 56 × 56 dp, positioned **16 dp** from right & bottom safe area. Expands to two **Mini FABs** (40 × 40 dp) stacked vertically with **12 dp** gap.  
- **Snackbar**: anchored above the tab bar with **8 dp** inset; the Recent Activity list has bottom padding **96 dp** (FAB + tab + spacing) so the snackbar never covers list rows.  
- **Dashboard**: Summary cards in a 2 × 2 grid (wrap on narrow screens). Recent Activity list is a `FlatList` with `contentContainerStyle` padding bottom **96 dp**.  
- **Form screens**: Fields full width, vertical gap **12 dp**. Date field shows trailing calendar icon inside the `TextInput`. Category field shows trailing chevron. Scan receipt button sits directly below the optional Photo picker and is hidden on the web.  
- **Settings list**: Each row (`SettingItem`) height **56 dp**, left‑aligned label, right‑aligned control (switch or chevron). Divider (`1 dp`) separates “Delete all data”. Row uses `TouchableRipple`.  
- **Categories list**: Same layout as Settings rows; rename inline swaps the label for a `TextInput`.  
- **Desktop breakpoint (1280 dp)**: Layout unchanged; container remains centered at 420 dp, preserving a phone‑first aesthetic on larger screens.

## Design tokens
**Implementation** – exported as a Material 3 theme for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`). No dark theme is required.

```ts
// src/theme.ts
export const theme = {
  roundness: 8,
  spacing: 8, // base spacing unit (dp)

  colors: {
    // Primary (deep blue)
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFE5FF',
    onPrimaryContainer: '#001D35',

    // Secondary (teal) – used for secondary actions, mini‑FABs, active menu items
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
| #212121 | #E0E0E0 | List item label (disabled) | normal |
| #B00020 | #FFFFFF | Delete‑all‑data row label (error) | normal |

All pairs meet **WCAG AA** (≥ 4.5:1 for normal text, ≥ 3:1 for UI elements).

## Components
All UI wrappers live in `src/components/ui/` and are thin abstractions over React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, optional `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error`, optional `trailingIcon` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` with `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled |
| **DatePickerField** | `TextInput` trigger + `DatePickerModal` | `label="Date"`, `value`, `onConfirm`, `trailingIcon="calendar"` | ≥ 44 × 44 dp (input) | closed, open, error |
| **CategorySelect** | `TextInput` trigger + `Menu` | `label="Category"`, `value`, `onSelect`, `categories`, `trailingIcon="chevron-down"` | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | – | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` (2‑5) | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android`/`Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, optional `icon` | – | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | receipt props + `onPress` | – | default, pressed (elev 2), focus |
| **ActivityRow** | `View` with `Text` | `date`, `type`, `amount` | – | default |
| **SettingItem** | `TouchableRipple` + `View` | `label`, optional `control` (switch, chevron, error style) | ≥ 44 × 44 dp | default, pressed, focus |
| **CategoryRow** | Same as SettingItem, but includes hide toggle and inline rename input | – | ≥ 44 × 44 dp | default, rename mode, hide toggle |
| **EmptyState** | custom view (icon + texts + button) | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` (Dashboard, Receipts, Mileage, Settings) | – | selected, unselected |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children`, optional `type` | – | default |
| **HelperText** | `HelperText` | `type="error"` or default, `children` | – | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | – | default |

All components enforce the 44 × 44 dp minimum touch area, use the theme’s `spacing` and `roundness`, and expose `accessibilityLabel` where needed (FAB icons, Scan button, list rows).

## Accessibility
- **Landmarks**: `Appbar.Header` (`role="banner"`), main `<ScrollView>` (`role="main"`), `BottomNavigation` (`role="navigation"`). Dialogs have `aria-modal="true"`.  
- **Heading structure**: One `<Text variant="headlineMedium">` per screen (treated as h1). Sub‑sections use `titleMedium` (h2) and `bodyLarge` (p). No skipped heading levels.  
- **Labels**: Every `TextInput` has a visible `label`. Icon‑only buttons (FABs, Scan) provide `accessibilityLabel` (“Add receipt”, “Add mileage”, “Scan receipt”).  
- **Focus management**: On validation failure, the first invalid field receives programmatic focus. Dialogs trap focus; closing returns focus to the invoking element.  
- **Visible focus**: 2 dp outline using `theme.colors.outline` appears on focus‑visible for keyboard users. Native platforms use ripple effects.  
- **Keyboard navigation**: All interactive components reachable via `Tab`. `Enter` activates focused buttons; `Space` toggles switches/checkboxes.  
- **Reduced motion**: `useReducedMotion` disables non‑essential animations (FAB expansion, snackbar slide) when `prefers-reduced-motion` is true.  
- **Live announcements**: OCR start/end, save success, and error messages announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel**: Receipt thumbnail → “Receipt photo”. Empty‑state illustration → “Empty state illustration”. Icons inside inputs have descriptive `accessibilityHint`.  
- **No color‑only cues**: Errors show an alert icon; disabled controls have `accessibilityState={{ disabled: true }}`; hidden categories display an eye‑off icon plus text.  
- **Platform differences**: On web, the Scan button is hidden; a tooltip explains “Scanning is available in the phone app”.

## Content and microcopy

### General
- **App name**: Freelance Finance Tracker  
- **Login screen tagline**: “Track receipts and mileage offline – instantly see what you earn.”

### Dashboard
- **Summary card titles**: “Income”, “Expenses”, “Mileage deduction”, “Net”.  
- **Recent activity row**: “{date} · {type} · {amount}”.

### ReceiptEntryScreen
- **Screen title** (AppBar): **Add receipt**  
- **Scan button**: **Scan receipt** (visible only on native platforms)  
- **Photo field label**: **Photo (optional)**  
- **Amount label**: **Amount**  
- **Date label**: **Date** – helper: “Tap the calendar icon to pick a date.”  
- **Category label**: **Category** – placeholder: “Select category” – helper: “Choose an existing category or add a new one.”  
- **Type label**: **Type**  
- **Notes label**: **Notes**  
- **Save button**: **Save receipt**  
- **Validation messages**:  
  - Amount – “Amount must be a positive number.”  
  - Date – “Date is required.”  
  - Category – “Category must be 1‑40 characters.”, “Category already exists.”  
- **Snackbar success**: “Receipt saved”  
- **Snackbar error**: “Unable to save receipt. Please try again.”  
- **Permission denied**: “Camera permission denied. You can still add receipt manually.”  
- **OCR loading**: “Analyzing receipt…”  
- **OCR no‑data alert**: “No details could be extracted – please enter manually.”

### MileageEntryScreen
- **Screen title**: **Add mileage**  
- **Miles label**: **Miles** – placeholder: “e.g., 12.5” – helper: “Enter the distance driven. Up to one decimal place is allowed.”  
- **Validation messages**:  
  - “Miles must be > 0.”  
  - “Miles must be ≤ 10 000.”  
  - “Miles can have at most 1 decimal place.”  
- **Save button**: **Save mileage**  
- **Snackbar success**: “Mileage saved”.

### SettingsScreen
- **Screen title**: **Settings**  
- **Rows** (label + control):  
  - **App lock** – toggle switch.  
  - **Mileage rate** – chevron to rate screen.  
  - **Tax rate** – chevron.  
  - **Export** – chevron.  
  - **Backup & restore** – chevron.  
  - **Categories** – chevron.  
  - **Policy** – chevron.  
  - **Delete all data** – row in **error** color, separated by a thin divider.  
- **Delete‑all‑data row label**: **Delete all data**  
- **Delete confirmation dialog** (existing): Title *Delete all data?*, body *This action cannot be undone.*, actions **Cancel**, **Delete** (error color).

### CategoriesScreen
- **Screen title**: **Categories**  
- **Add button**: **Add category…**  
- **Rename inline placeholder**: “Rename category”  
- **Hide toggle label**: “Hide category”  
- **Add dialog title**: *Add new category*  
- **Add dialog TextInput label**: *Category name*  
- **Validation messages**: “Category must be 1‑40 characters.”, “Category already exists.”  
- **Hide‑in‑use snackbar**: “Category is used by receipts – hide instead.”  
- **Snackbar successes**: “Category added”, “Category renamed”, “Category hidden”.

### EmptyState (Dashboard)
- **Title**: *Nothing here yet*  
- **Description**: *Add a receipt or mileage entry to start tracking your finances.*  
- **Action button**: **Add receipt**

### Global
- **Offline banner**: “You are offline. Some actions require an internet connection.”  
- **Policy gate accept button**: **Accept** (disabled until checkbox is ticked).  
- **Error fallback messages**: Use existing phrasing from the app’s current copy.

All copy follows title case for button labels and headings, sentence case for helpers and alerts, and avoids technical jargon. Autocomplete and keyboard types are set appropriately (email, numeric, password). Validation runs on blur and on submit, moving focus to the first invalid field. The UI meets the quality bar: clear visual hierarchy, generous 8 dp whitespace, restrained palette with a single accent, proper type scale, card‑based grouping, icons where they aid scanning, and a polished look at both phone and desktop widths.

--- End of DESIGN.md ---
