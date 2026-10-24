## Users and goal
- **Primary persona** – freelancers, gig‑workers, and independent contractors who need a quick, private way to record receipts, mileage, and categories on their phone (offline first).  
- **Goal** – Open the app, add a receipt or mileage entry in ≤ 30 seconds, rename categories without losing data, and see a clear confirmation.  
- **Success feels like** – “I tapped **Add receipt**, the OCR ran, I corrected a field, hit **Save receipt**, and a Snackbar says *Receipt saved*; the new entry instantly appears on the Dashboard.”

## Primary flow
1. **Launch → PolicyGate** (once).  
2. **Dashboard** – bottom‑tab bar always visible (Dashboard / Receipts / Mileage / Settings).  
3. **Add entry** – tap the large FAB → mini‑FAB **Receipt** or **Mileage** (always reachable).  
4. **Entry screen** (Receipt or Mileage)  
   - Fill fields (date, amount, miles, category, notes).  
   - Optional: **Scan receipt** (phone only; hidden on web).  
   - Validation runs on blur and on submit.  
   - Tap **Save receipt** / **Save mileage** → loading → Snackbar (*Receipt saved* / *Mileage saved*).  
5. **Return** – Snackbar fades; user remains on Dashboard where the new row is visible.  
6. **Settings → Categories** – rename a category inline; the rename updates all receipts instantly (no extra steps).  
7. **Other settings** – switch App Lock, export, backup, delete all data – reachable from Settings at any time.

## Screens and states

| Screen | State | UI elements | Message / copy |
|--------|-------|-------------|----------------|
| **PolicyGate** | Loading | Full‑screen `ActivityIndicator` | “Checking policy version…” |
| | Default | Policy text, **Accept** checkbox, **Accept** button (disabled until checked) | – |
| | Error | Full‑screen error view + **Retry** button | “Unable to store your acceptance. Please try again.” |
| **Dashboard** | Loading | Centered `ActivityIndicator` | – |
| | Empty | `EmptyState` component | Title *Nothing here yet*; Description *Add a receipt or mileage entry to start tracking your finances.*; Primary button **Add receipt** |
| | Populated | 4 `SummaryCard`s (Total receipts, Total mileage, Tax, Net) + recent‑activity `ScrollView` | – |
| **ReceiptEntry** | Default (form) | Photo picker, conditional **Scan receipt** button, `FormField`s (Amount, Date, Category, Type, Notes), **Save receipt** button (enabled when form valid) | – |
| | OCR loading | Overlay `ActivityIndicator` + label “Analyzing receipt…” | – |
| | OCR success | Fields pre‑filled; each shows `HelperText` *Check these details* | – |
| | OCR no data | Alert dialog | “No details could be extracted – please enter manually.” |
| | Validation error | `HelperText type="error"` under the offending field | Specific messages (see Content) |
| | Saving | **Save receipt** shows spinner, label hidden | – |
| | Save error | `Snackbar` | “Unable to save receipt. Please try again.” |
| **MileageEntry** | Same as ReceiptEntry, but without photo & category; “Miles” field accepts decimals | – |
| **Settings** | Default | List rows: **App lock** (switch), **Mileage rate**, **Tax rate**, **Categories**, **Export**, **Backup & restore**, **Delete all data**, **View Terms & Privacy Policy** | – |
| **Categories** (sub‑screen) | Default | List of categories with inline rename `TextInput`, hide toggle, **Add category…** button | – |
| | Rename mode | Inline `TextInput` replaces label | – |
| | Add dialog | `Dialog` with `TextInput` | Title *Add new category*; label *Category name* |
| | Validation error | `HelperText type="error"` | “Category must be 1‑40 characters.”; “Category already exists.” |
| | Delete‑in‑use error | `Snackbar` | “Category is used by receipts – hide instead.” |
| **Any screen** | Offline indicator (when network required) | Full‑screen banner | “You are offline. Some actions require an internet connection.” |

### Edge & loading states
- **Dashboard recent‑activity list**: scrollable under FABs; bottom padding = 96 dp (FAB height 56 dp + 40 dp margin).  
- **Date picker**: disallows future dates for receipts, allows any date for mileage.  
- **Mileage “Miles” field**: accepts strings like “12.5”, rejects “12.55”, “0”, negatives, or non‑numeric text.  
- **Scan receipt button**: rendered only when `expo-image-picker` / `expo-text-recognizer` reports `isSupported === true`. On web the button is omitted.  
- **Delete all data row**: styled with `error` color, placed last, preceded by a `Divider`.  

## Layout
- **Mobile‑first** – viewport 390 dp wide; no horizontal scroll.  
- **Global container** – `Screen` component = `SafeAreaView` + `ScrollView` with horizontal padding 16 dp (`spacing*2`).  
- **Content width** – max 420 dp; centered on desktop (1280 dp).  
- **Vertical rhythm** – 8 dp grid (spacings of 4, 8, 12, 16, 24, 32 dp).  
- **Bottom tab bar** – fixed height 56 dp, icons + labels centered, anchored bottom on all platforms.  
- **Primary FAB** – 56 × 56 dp, inset 16 dp from right & bottom; expands to two mini‑FABs (40 × 40 dp) for **Receipt** and **Mileage**. Mini‑FABs sit above the recent‑activity list, do not cover content, and have a 12 dp gap between them.  
- **Forms** – each `FormField` full‑width, vertical gap 12 dp. Date field includes right‑aligned calendar icon; Category field includes dropdown arrow.  
- **ReceiptEntry** – title rendered only by `ScreenHeader`; no duplicate header text in body.  
- **Settings** – rows are `List.Item` with trailing chevron; `SettingSwitch` for App Lock; `Divider` before **Delete all data** row.  
- **Desktop breakpoint (≥ 1280 dp)** – layout unchanged; UI remains phone‑first but centered with max‑width column, ensuring ample side whitespace.

## Design tokens
> **Implementation** – exported as a Material 3 theme object for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`). No dark theme is required.

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

## Components
All UI wrappers live in `src/components/ui/` and map to React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **ScreenHeader** | `Appbar.Header` | `title` (string), optional `subtitle` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error`, `right` (icon) | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible (2 dp outline), active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` + `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled |
| **DatePickerField** | `DatePickerModal` + `TextInput` trigger | `value`, `onConfirm`, `label="Date"`, `disabledFuture` (receipts) | ≥ 44 × 44 dp (input) | closed, open, error |
| **CategorySelect** | `Menu` anchored to `TextInput` | `value`, `onSelect`, `categories[]`, `label="Category"` | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | – | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons[]` | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, optional `icon` | – | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | receipt props + `onPress` | – | default, pressed (elev 2), focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` | – | selected, unselected |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **BottomActionBar** | custom component | `onAddReceipt`, `onAddMileage`, optional `snackbarMessage` | – | default |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | – | default |
| **HelperText** | `HelperText` | `type="error"` | – | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | – | default |

All touch targets respect the **44 × 44 dp** minimum. Hover/focus styles appear on web; native platforms use ripple/elevation feedback.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), main content `<ScrollView>` (`role="main"`), `BottomNavigation` (`role="navigation"`).  
- **Heading hierarchy** – one `<Text variant="headlineMedium">` per screen (treated as `<h1>`). Sub‑sections use `titleMedium` (`<h2>`) and `bodyLarge` (`<p>`). No skipped levels.  
- **Labels** – every `TextInput` has a visible `label`. Icon‑only buttons (FABs, Scan) have `accessibilityLabel` (“Add receipt”, “Add mileage”, “Scan receipt”).  
- **Focus management** – on validation failure, the first invalid field receives programmatic focus; dialogs trap focus.  
- **Visible focus** – 2 dp outline using `theme.colors.outline` on focus‑visible state.  
- **Keyboard navigation** – all tappable components reachable via `Tab`/`Shift+Tab`; `Enter` activates focused button.  
- **Reduced motion** – UI respects `prefers-reduced-motion`; non‑essential animations (FAB expansion, Snackbar slide) are disabled when reduced‑motion is true.  
- **Live announcements** – OCR start/end, save success, and error messages are announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel** – receipt thumbnail: “Receipt photo”; empty‑state illustration: “Empty state illustration”.  
- **No color‑only cues** – errors also show an alert icon; disabled controls set `accessibilityState={{ disabled: true }}`.

## Content and microcopy
### Global
- **Snackbar success** – “Receipt saved”, “Mileage saved”, “Category added”, “Category renamed”, “Category hidden”.  
- **Snackbar error** – “Unable to save receipt. Please try again.”, “Unable to save mileage. Please try again.”, “Category is used by receipts – hide instead.”  

### Dashboard
- **FAB tooltip (web)** – “Scanning is available in the phone app”.  
- **Empty‑state action** – button label **Add receipt**.  

### ReceiptEntryScreen
- **Screen title** – “Add receipt” (rendered only by `ScreenHeader`).  
- **Scan button** – **Scan receipt** (shown only when scanner supported).  
- **OCR loading** – “Analyzing receipt…”.  
- **Helper for pre‑filled fields** – *Check these details*.  
- **OCR no‑data alert** – “No details could be extracted – please enter manually.”  
- **Field labels** – Photo (optional), Amount, Date, Category, Type, Notes.  
- **Date helper** – “Select a date (future dates not allowed).”  
- **Category helper** – “Select a category.”  
- **Dropdown placeholder** – “Select category”.  
- **Add‑category dialog** – Title *Add new category*; TextInput label *Category name*; validation messages: “Category must be 1‑40 characters.”, “Category already exists.”  
- **Save button** – **Save receipt**.  

### MileageEntryScreen
- **Screen title** – “Add mileage”.  
- **Field label** – Miles.  
- **Miles helper** – “Enter miles (max 1 decimal place, > 0).”  
- **Validation messages** – “Miles must be > 0”, “Miles must be ≤ 10,000”, “Miles can have at most 1 decimal place”.  
- **Save button** – **Save mileage**.  

### Settings → Categories
- **Section heading** – **Categories**.  
- **Add button** – **Add category…** (opens dialog).  
- **Rename inline placeholder** – “Rename category”.  
- **Hide toggle label** – “Hide category”.  

### Settings (general)
- **App lock row** – switch labeled **App lock** (single row).  
- **Other rows** – list items with chevron: **Mileage rate**, **Tax rate**, **Export**, **Backup & restore**, **View Terms and Privacy Policy**.  
- **Delete all data row** – label **Delete all data** in `error` color, placed last, separated by a `Divider`.  

All copy uses title case for button labels and sentence case for body text, avoiding jargon. Autocomplete & keyboard types are set appropriately (email, numeric, password). Validation runs on blur and on submit, moving focus to the first invalid field.
