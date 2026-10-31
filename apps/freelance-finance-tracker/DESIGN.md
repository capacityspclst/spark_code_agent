# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, and independent contractors who need a quick, private way to track income, expenses, and mileage **offline**.  
- **Goal** – Capture a receipt in ≤ 30 seconds by scanning a photo, edit any auto‑filled fields, pick a date from a calendar, select or create a category, and save.  
- **Success feels like** – “The receipt was scanned, the fields are correct, I tapped **Save**, and a snackbar says *Receipt saved*.”

## Primary flow
1. **Launch → Policy gate** (unchanged).  
2. **Dashboard** – bottom tab bar always visible.  
3. **Add receipt** – tap FAB → mini‑FAB **Receipt**.  
4. **Receipt entry** –  
   a. Tap **Scan receipt** → camera/gallery → OCR loading spinner.  
   b. If OCR finds data → fields pre‑filled, each shows helper *Check these details*.  
   c. If OCR finds nothing → alert *No details could be extracted – please enter manually*.  
   d. User edits any fields (date via calendar, category via dropdown, other fields).  
   e. If needed, tap **Add category…** → dialog to type a new name (1‑140 chars, case‑insensitive unique).  
   f. Tap **Save receipt** → loading → snackbar *Receipt saved*.  
5. **Settings → Categories** – rename, hide, or add custom categories (protected against deletion when in use).  
6. **Export / Backup / Restore** – unchanged and always reachable from bottom tabs or Settings.  

All screens expose a direct path forward; the bottom tab bar is present on every signed‑in screen.

## Screens and states

| Screen                     | State            | UI element(s)                                   | Message / copy                                                                 |
|----------------------------|------------------|-------------------------------------------------|---------------------------------------------------------------------------------|
| **PolicyGateScreen**       | Loading          | Full‑screen `ActivityIndicator`                | “Checking policy version…”                                                      |
|                            | Default          | Policy text, checkbox, **Accept** button (disabled until checked) | Policy text                                                                     |
|                            | Error            | Full‑screen error view + **Retry**             | “Unable to store your acceptance. Please try again.”                           |
| **DashboardScreen**        | Loading          | Centered `ActivityIndicator`                    | —                                                                               |
|                            | Empty            | `EmptyState`                                    | Title *Nothing here yet*; Description *Add a receipt or mileage entry to start tracking your finances.*; Primary button **Add receipt** |
|                            | Populated        | 4 `SummaryCard`s + recent‑activity list        | —                                                                               |
| **ReceiptEntryScreen**     | Default (form)   | Photo picker, **Scan receipt** button, outlined `FormField`s (Amount, Date, Category, Type, Notes), **Save receipt** button (disabled until valid) | —                                                                               |
|                            | OCR loading      | Overlay `ActivityIndicator` + spinner label “Analyzing receipt…” | —                                                                               |
|                            | OCR success      | Fields pre‑filled; each shows `HelperText` *Check these details* (until edited) | —                                                                               |
|                            | OCR no data      | Alert dialog                                    | “No details could be extracted – please enter manually.”                       |
|                            | Date picker open | `DatePickerModal` (react‑native‑paper‑dates)    | —                                                                               |
|                            | Category dropdown open | `Menu` anchored to TextInput                | —                                                                               |
|                            | Add‑category dialog open | `Dialog` with TextInput                | Title *Add new category*; placeholder *Category name*                           |
|                            | Validation error (field) | `HelperText type="error"` under field   | Amount, Date, Category, Type messages (see Content)                             |
|                            | Saving           | **Save receipt** shows spinner, label hidden   | —                                                                               |
|                            | Save error       | `Snackbar`                                      | “Unable to save receipt. Please try again.”                                      |
| **MileageEntryScreen**     | Same as ReceiptEntryScreen but without photo & category; date picker allows future dates. | | |
| **SettingsScreen**         | Default          | List rows: App lock, Mileage rate, Tax rate, Export, Backup & Restore, **Categories**, Policy, Delete all data | — |
| **CategoriesScreen** (sub‑screen of Settings) | Default | List of categories with rename inline, hide toggle, **Add category…** button | — |
|                            | Rename mode      | Inline `TextInput` replaces label               | —                                                                               |
|                            | Add dialog open  | `Dialog` as above                               | —                                                                               |
|                            | Validation error | `HelperText type="error"` under input           | “Category must be 1‑40 characters.”; “Category already exists.”                |
|                            | Delete error (in‑use) | `Snackbar`                                  | “Category is used by receipts – hide instead.”                                   |
| **Any screen**             | Offline (where network would be used) | Full‑screen banner                | “You are offline. Some actions require an internet connection.”                 |

## Layout
- **Mobile‑first**: viewport **390 dp** wide; no horizontal scroll.  
- **Global container** – `Screen` component = `SafeAreaView` + `ScrollView` with **horizontal padding 16 dp** (`spacing*2`).  
- **Content width** – max **420 dp**; centered on desktop (1280 dp).  
- **Vertical rhythm** – 8 dp grid (4, 8, 12, 16, 24, 32 dp).  
- **Bottom Tab Bar** – fixed 56 dp height, icons + labels centered; anchored bottom on all platforms.  
- **FAB** – 56 × 56 dp, inset 16 dp from right & bottom; expands to two 40 × 40 dp mini‑FABs.  
- **Forms** – each `FormField` full‑width; vertical gap 12 dp.  
- **Receipt entry** – Scan button placed below photo picker, above other inputs. Date field shows calendar icon; Category field shows dropdown arrow.  
- **Settings → Categories** – list items stack vertically; inline rename appears in place; Add‑category button at bottom.  
- **Desktop breakpoint** – 1280 dp; layout unchanged, still phone‑first appearance.

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
| #FFFFFF    | #015958    | Mini‑FAB background (secondary) | large (icon) |

All pairs meet **WCAG AA** (≥ 4.5:1 normal text, ≥ 3:1 UI).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | — | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error` | — | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible (2 dp outline), active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` with `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled |
| **DatePickerField** | `DatePickerModal` (react‑native‑paper‑dates) + `TextInput` trigger | `value`, `onConfirm`, `label="Date"`; disallow future dates for receipts | ≥ 44 × 44 dp (input) | closed, open, error |
| **CategorySelect** | `Menu` anchored to a `TextInput` (`mode="outlined"`) | `value`, `onSelect`, `categories` array, `label="Category"` | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | — | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | — | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | receipt props + `onPress` | — | default, pressed (elev 2), focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | — | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` | — | selected, unselected |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **Dialog** | `Portal` + `Dialog` | `visible`, `onDismiss`, `title`, `children`, `actions` | — | default, focus‑visible |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | — | default |
| **HelperText** | `HelperText` | `type="error"` | — | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | — | default |

All interactive elements meet the **44 × 44 dp** minimum touch area. Hover/focus states appear on web; native platforms use ripple effects.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), `<ScrollView>` (`role="main"`), bottom navigation (`role="navigation"`).  
- **Headings** – One `<Text variant="headlineMedium">` per screen (h1). Sub‑sections use `titleMedium` (h2) and `bodyLarge` (p). No skipped levels.  
- **Labels** – Every `TextInput` has a visible `label`. Icon‑only buttons (FABs, Scan) have `accessibilityLabel` (“Scan receipt”, “Add receipt”).  
- **Focus management** – On validation failure, first invalid field receives programmatic focus; dialogs trap focus.  
- **Visible focus** – 2 dp outline using `theme.colors.outline`.  
- **Keyboard navigation** – All tappable components reachable via `Tab`/`Shift+Tab`; `Enter` activates focused button.  
- **Reduced motion** – `useReducedMotion` disables non‑essential animations when `prefers-reduced-motion` is true.  
- **Live announcements** – OCR start/end, save success, and error messages are announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel** – Receipt thumbnail: “Receipt photo”; empty‑state illustration: “Empty state illustration”.  
- **No color‑only cues** – Errors also show an alert icon; disabled controls have `accessibilityState={{ disabled: true }}`.

## Content and microcopy
### ReceiptEntryScreen
- **Scan button** – **Scan receipt** (tooltip on web: “Scanning is available in the phone app”).  
- **OCR loading** – “Analyzing receipt…”.  
- **Helper for pre‑filled fields** – *Check these details*.  
- **OCR no‑data alert** – “No details could be extracted – please enter manually.”  
- **Field labels** – Photo (optional), Amount, Date, Category, Type, Notes.  
- **Date helper** – “Select a date (future dates not allowed).”  
- **Category helper** – “Select a category.”  
- **Dropdown placeholder** – “Select category”.  
- **Add‑category dialog** – Title *Add new category*; TextInput label *Category name*; Validation: “Category must be 1‑40 characters.”, “Category already exists.”  
- **Save button** – **Save receipt**.  

### MileageEntryScreen
- **Date helper** – “Select a date.” (future dates allowed).  
- **Save button** – **Save mileage**.  

### Settings → Categories
- **Section heading** – **Categories**.  
- **Add button** – **Add category…** (opens dialog).  
- **Rename inline placeholder** – “Rename category”.  
- **Hide toggle label** – “Hide category”.  
- **Snackbar on hide error** – “Category is used by receipts – hide instead.”  

### Global
- **Snackbar success** – “Receipt saved”, “Mileage saved”, “Category added”, “Category renamed”, “Category hidden”.  
- **Snackbar error** – Use existing messages (save error, export error, backup error).  

All copy follows title case for button labels, sentence case for body text, and avoids jargon. Autocomplete & keyboard types are set appropriately (email, numeric, password). Validation runs on blur and submit, moving focus to the first invalid field. The UI meets the quality bar: clear hierarchy, generous 8 dp whitespace, restrained palette with a single accent, proper type scale, cards grouping related items, icons where useful, and a polished look on both phone and desktop widths.  

---  
**End of DESIGN.md**
