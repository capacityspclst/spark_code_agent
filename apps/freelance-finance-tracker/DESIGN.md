# DESIGN.md

## Users and goal
- **Primary users**: Freelancers, gig workers, and independent contractors who track income & expenses on‑the‑go, often offline.  
- **Goal**: Add a receipt in ≤ 30 seconds by taking or selecting a photo, optionally scanning it, editing the auto‑filled fields, picking a date, selecting a category, and saving.  
- **Success**: “Receipt saved” snackbar appears, the new receipt shows on the dashboard, and the user can continue working without extra steps.

## Primary flow
1. **Open app →** policy gate (once).  
2. **Dashboard** (bottom tab bar always visible).  
3. **Tap FAB → “Receipt” mini‑FAB** → navigates to **Add receipt** screen.  
4. **Add receipt** screen:  
   a. If device supports OCR, **Scan receipt** button is visible; otherwise it is hidden.  
   b. User can tap **Scan receipt** → camera/gallery → OCR → loading spinner → fields auto‑filled (or “no data” alert).  
   c. User may edit any field; Date field shows a calendar icon inside the input.  
   d. User selects/creates a Category via the dropdown/“Add category…” dialog.  
   e. **Save receipt** button (enabled only when required fields are valid) → loading → “Receipt saved” snackbar.  
5. Return to Dashboard (bottom tab bar unchanged).

## Screens and states

| Screen                | State                | UI elements & notes                                                                                                                                                       |
|-----------------------|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **PolicyGate**        | Loading              | Full‑screen `ActivityIndicator`; text “Checking policy version…”.                                                                                                         |
|                       | Default              | Policy text, checkbox, **Accept** button (disabled until checked).                                                                                                         |
|                       | Error                | Full‑screen error view + **Retry** button; message “Unable to store your acceptance. Please try again.”                                                                   |
| **Dashboard**         | Loading              | Centered `ActivityIndicator`.                                                                                                                                              |
|                       | Empty                | `EmptyState` with illustration, title *Nothing here yet*, description prompting to add a receipt, primary button **Add receipt**.                                         |
|                       | Populated            | Up to 4 `SummaryCard`s + recent activity list.                                                                                                                             |
| **Add receipt**       | Default (form)       | - Photo picker (optional) <br> - **Scan receipt** button (hidden when OCR unsupported) <br> - Outlined `FormField`s: Photo, Amount, Date (icon inside), Category, Type, Notes <br> - **Save receipt** button (disabled until form valid) |
|                       | OCR loading          | Overlay semi‑transparent view with `ActivityIndicator` and label “Analyzing receipt…”.                                                                                     |
|                       | OCR success           | Form fields pre‑filled; each shows `HelperText` “Check these details”.                                                                                                    |
|                       | OCR no data           | Alert dialog: “No details could be extracted – please enter manually.”                                                                                                    |
|                       | Date picker open      | `DatePickerModal` anchored to Date field.                                                                                                                                   |
|                       | Category dropdown open| `Menu` anchored to Category field.                                                                                                                                          |
|                       | Add‑category dialog   | `Dialog` with `TextInput` label “Category name”; validation messages.                                                                                                      |
|                       | Validation error      | `HelperText type="error"` under the offending field; focus moves to first error on submit.                                                                                |
|                       | Saving               | **Save receipt** shows spinner, label hidden.                                                                                                                               |
|                       | Save error           | `Snackbar` with “Unable to save receipt. Please try again.”                                                                                                                |
| **Settings → Categories**| Default          | List of categories with inline rename, hide toggle, **Add category…** button.                                                                                              |
|                       | Add dialog           | Same as Add‑category dialog in receipt screen.                                                                                                                              |
|                       | Rename mode          | Inline `TextInput` replaces category label.                                                                                                                                 |
|                       | Validation error     | `HelperText type="error"` with messages “Category must be 1‑140 characters.” / “Category already exists.”                                                               |
|                       | Delete error (in‑use)| `Snackbar` “Category is used by receipts – hide instead.”                                                                                                                  |
| **Any screen**        | Offline (banner)     | Full‑width banner: “You are offline. Some actions require an internet connection.”                                                                                         |

## Layout
- **Mobile‑first**: viewport **390 dp** wide, no horizontal scroll.  
- **Global container**: `Screen` component = `SafeAreaView` + `ScrollView` with horizontal padding **16 dp** (`spacing*2`).  
- **Max content width**: **420 dp**; centered on desktop (1280 dp).  
- **Vertical rhythm**: 8 dp base grid (spacing values 4, 8, 12, 16, 24, 32 dp).  
- **Bottom tab bar**: fixed **56 dp** height, icons + labels centered, anchored bottom on all platforms.  
- **FAB**: 56 × 56 dp, inset **16 dp** from right & bottom; expands to two 40 × 40 dp mini‑FABs.  
- **Form**: each `FormField` full width, vertical gap **12 dp** (standard spacing). No larger gaps.  
- **Add receipt screen specifics**:  
  * Date field includes a right `TextInput.Icon` (calendar) inside the input; tap opens picker.  
  * “Scan receipt” button placed directly below photo picker; hidden when OCR unsupported.  
- **Desktop breakpoint (≥ 1280 dp)**: layout unchanged, still phone‑first visual; content remains centered with max width.  

## Design tokens
> Exported as a Material 3 theme for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`).  

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

  elevation: {
    level1: { elevation: 1, shadowOpacity: 0.2 },
  },
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

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Default props / purpose | Touch target | States |
|-----------|------------|--------------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, optional `style` | — | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error` | — | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | Same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` + `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled |
| **DatePickerField** | `TextInput` with right `TextInput.Icon` + `DatePickerModal` | `label="Date"`, `value`, `onConfirm` | ≥ 44 × 44 dp (input) | closed, open, error |
| **CategorySelect** | `TextInput` (outlined) + `Menu` | `label="Category"`, `value`, `onSelect`, `categories` | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | — | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` (2‑5 options) | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp touch area | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | — | default, hover (elev 2), focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | — | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` | — | selected, unselected |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` + `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **Dialog** | `Portal` + `Dialog` | `visible`, `onDismiss`, `title`, `children`, `actions` | — | default, focus‑visible |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | — | default |
| **HelperText** | `HelperText` | `type="error"` (or default) | — | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | — | default |

All interactive elements meet **44 × 44 dp** minimum touch area. Hover/focus states appear on web; native platforms use ripple/press feedback.

## Accessibility
- **Landmarks**: `Appbar.Header` (`role="banner"`), `ScrollView` (`role="main"`), `BottomNavigation` (`role="navigation"`).  
- **Heading hierarchy**: One `<Text variant="headlineMedium">` per screen (h1). Sub‑sections use `titleMedium` (h2) and `bodyLarge` (p). No skipped levels.  
- **Labels**: Every `TextInput` has a visible `label`. Icon‑only buttons (FAB, Scan) have `accessibilityLabel` (“Add receipt”, “Scan receipt”).  
- **Focus management**: On validation failure, the first invalid field receives programmatic focus; dialogs trap focus.  
- **Visible focus**: 2 dp outline using `theme.colors.outline`.  
- **Keyboard navigation**: All tappable components reachable via `Tab`/`Shift+Tab`; `Enter` activates focused button.  
- **Reduced motion**: `useReducedMotion` disables non‑essential animations when `prefers-reduced-motion` is true.  
- **Live announcements**: OCR start/end, save success, and error messages announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel**: Receipt thumbnail → “Receipt photo”; empty‑state illustration → “Empty state illustration”.  
- **No color‑only cues**: Errors also show an alert icon; disabled controls expose `accessibilityState={{ disabled: true }}`.

## Content and microcopy
### Add receipt screen
- **Screen header** (AppBar): **Add receipt** (appears only here).  
- **Photo picker**: Button label **Add photo** (optional).  
- **Scan receipt** button: **Scan receipt** (tooltip on web: “Scanning is available in the phone app”). Hidden when `expo-text-extractor` reports `isSupported === false`.  
- **OCR loading**: “Analyzing receipt…” (spinner label).  
- **Helper for pre‑filled fields**: *Check these details*.  
- **OCR no‑data alert**: “No details could be extracted – please enter manually.”  
- **Field labels**: Photo (optional), Amount, Date, Category, Type, Notes.  
- **Date field**: Right icon is a calendar; helper text “Select a date (future dates not allowed).”  
- **Category field**: Dropdown arrow; helper “Select a category.” Placeholder “Select category”.  
- **Add‑category dialog**: Title *Add new category*; `TextInput` label *Category name*; validation messages: “Category must be 1‑140 characters.”, “Category already exists.”  
- **Save button**: **Save receipt** (disabled until form valid). Loading state shows spinner, label hidden.  
- **Success snackbar**: “Receipt saved”.  
- **Error snackbar**: “Unable to save receipt. Please try again.”  

### Dashboard empty state
- **Title**: *Nothing here yet*  
- **Description**: *Add a receipt or mileage entry to start tracking your finances.*  
- **Primary action**: **Add receipt**  

### Settings → Categories
- **Section heading**: **Categories**  
- **Add button**: **Add category…** (opens dialog).  
- **Inline rename placeholder**: *Rename category*  
- **Hide toggle label**: *Hide category*  
- **Snackbar hide error**: “Category is used by receipts – hide instead.”  

### Global
- **Snackbars**: Success – “Receipt saved”, “Mileage saved”, “Category added”, “Category renamed”, “Category hidden”.  
- **Error**: Use existing messages (e.g., save error, export error).  

All copy uses title case for button labels, sentence case for body text, avoids jargon, and includes appropriate autocomplete (email, numeric, password) and keyboard types where needed. Validation runs on blur and on submit, moving focus to the first invalid field.
