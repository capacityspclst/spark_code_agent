# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, and independent contractors who need a quick, private way to track income, expenses, and mileage **offline**.  
- **Goal** – From any signed‑in screen the user can (1) view a concise summary of recent activity, (2) add a receipt or a mileage entry, and (3) know instantly that the action succeeded.  
- **Success feels like** – “I opened the app, saw my latest entries, tapped the **+** button, and a short toast told me the receipt was saved. The UI never hides important controls under a scrollable list, and the navigation bar always shows all four tab labels.”

## Primary flow
1. **Launch → Policy gate** (unchanged).  
2. **Dashboard** – Bottom tab bar is visible. The screen shows a SummaryCard section (total income, expenses, mileage) and a *Recent Activity* list.  
3. **Add receipt or mileage** – Tap the floating **+** button → a mini‑FAB group expands with two actions: “Receipt” and “Mileage”. Selecting either opens the corresponding Add screen.  
4. **Save** – After completing the form and submitting, a **Snackbar** appears **above** the FAB group with the message **“Receipt saved”** (or “Mileage saved”). The FAB remains on‑screen; the list does not scroll over it.  
5. **Return** – The Dashboard updates, showing the new entry at the top of the Recent Activity list.  
6. **Other tabs** – Settings, Receipts, Mileage are reachable at any time via the bottom tab bar.  

All screens keep a persistent bottom tab bar with the four labeled icons (Dashboard, Receipts, Mileage, Settings).

## Screens and states
| Screen | State | UI elements | Message / copy |
|--------|-------|-------------|----------------|
| **DashboardScreen** | Default (data loaded) | `Screen` wrapper, `SummaryCard` ×3, `RecentActivityList`, FAB group (`FABAdd`), BottomTabBar, optional `ReceiptSavedSnackbar` | – |
| | Loading | Full‑screen `ActivityIndicator` overlay | “Loading dashboard…” |
| | Empty (no activity) | `EmptyState` component with icon 📊, title **“No activity yet”**, description **“Add a receipt or mileage to see recent items.”**, primary button **“Add receipt”** | – |
| | Snackbar visible | `Snackbar` positioned above FAB, background `theme.colors.surfaceVariant` | “Receipt saved” (or “Mileage saved”) |
| | Error (fetch) | Full‑screen error view, retry button | “Unable to load dashboard. Please try again.” |
| **RecentActivityList** | Normal list | `FlatList` of `RecentActivityRow` (title, date, optional icon) – **no amount displayed** | – |
| | Loading more (infinite scroll) | Bottom `ActivityIndicator` inside list | – |
| | Empty row placeholder | *Handled by Dashboard empty state* | – |
| **AddReceiptScreen / AddMileageScreen** | Default | Form fields (`FormField`), validation `HelperText`, submit `PrimaryButton` | – |
| | Submitting | `PrimaryButton` `loading`, disable fields | – |
| | Success | Navigate back → Dashboard shows Snackbar | – |
| **SettingsScreen** | Same as existing spec (unchanged) | – | – |
| **BottomTabBar** | Normal | Four labeled tabs with icons, height **56 dp**, selected color `theme.colors.primary` | – |
| | Safe‑area inset (iOS) | Extra bottom padding to keep labels visible | – |

All copy uses title case for button/row labels and sentence case for body text.

## Layout
- **Mobile‑first**: viewport **390 dp** wide, horizontal padding **16 dp** (`spacing*2`). No horizontal scrolling.
- **Global container**: `Screen` component (`SafeAreaView` + `ScrollView`). Content max‑width **420 dp**, centered on desktop (≥1280 dp breakpoint).
- **DashboardScreen**  
  - `Screen` → `View` with `flex: 1`. Inside: `SummaryCard` stack, then `RecentActivityList`.  
  - `RecentActivityList` is wrapped in a `View` with `flex: 1` and **paddingBottom** = `FAB_CONTAINER_HEIGHT` + `TAB_BAR_HEIGHT` + `spacing*2` (≈ 144 dp) so the list never scrolls under the FAB group.  
  - **FABAdd**: absolute positioned container, `bottom: TAB_BAR_HEIGHT + 16 dp` (≈ 72 dp), `right: 16 dp`, `zIndex: 10`. Uses Paper’s `FAB.Group` with two mini‑FAB actions. Height of the FAB container (including expanded mini‑FABs) is defined as **FAB_CONTAINER_HEIGHT = 80 dp**.  
  - **ReceiptSavedSnackbar**: absolute positioned, `bottom: FAB_CONTAINER_HEIGHT + TAB_BAR_HEIGHT + 8 dp` (≈ 144 dp), `left: 0`, `right: 0`, `zIndex: 9`. Appears above both list and FAB.  
- **RecentActivityRow**: fixed height **56 dp**, horizontal layout: optional leading icon, `title` (primary text), `subtitle` (date). No amount column. Touch target covers full row.  
- **BottomTabBar**: fixed height **56 dp**, anchored to bottom, labels fully visible on 390 × 844 screens. Uses `paddingBottom: safeAreaInsets.bottom` on iOS. No extra bottom margin that clips labels.  
- **Desktop breakpoint (≥1280 dp)**: `Screen` width limited to 420 dp, centered. Bottom tab remains at screen bottom, not stretched.  

All components respect the **8 dp** spacing scale.

## Design tokens
> **Implementation** – Exported as a Material 3 theme object for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`). The theme also exports layout constants `FAB_CONTAINER_HEIGHT` and `TAB_BAR_HEIGHT`.

```ts
// src/theme.ts
export const FAB_CONTAINER_HEIGHT = 80; // dp
export const TAB_BAR_HEIGHT = 56; // dp

export const theme = {
  roundness: 8,
  spacing: 8, // base 8 dp

  colors: {
    // Primary (deep blue)
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFE5FF',
    onPrimaryContainer: '#001D35',

    // Secondary (teal) – used for switch thumb and mini‑FABs
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
  --fab-container-height: 80px;
  --tab-bar-height: 56px;
}
```

### Contrast pairs
| Foreground | Background | Use | Size |
|------------|------------|-----|------|
| #FFFFFF    | #0061A4    | Primary FAB icon, contained button label | large (icon) |
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
| #6F6F6F    | #FFFFFF    | TextInput placeholder | normal |
| #212121    | #CFE5FF    | Card title on primary‑container surface | normal |
| #212121    | #F2F2F2    | Card title on surface‑variant | normal |
| #212121    | #FFFFFF    | Dialog title | large (headline) |
| #212121    | #FFFFFF    | Settings row label (default) | normal |
| #B00020    | #FFFFFF    | Delete All Data row label | normal |
| #212121    | #F2F2F2    | Separator line | UI |
| #212121    | #FFFFFF    | Chevron icon (trailing) | UI |
| #212121    | #FFFFFF    | Recent activity row title | normal |
| #49454F    | #FFFFFF    | Recent activity row subtitle (date) | normal |
| #212121    | #FFFFFF    | EmptyState title | large (headline) |
| #49454F    | #FFFFFF    | EmptyState description | normal |
| #FFFFFF    | #0061A4    | EmptyState primary button label | normal |

All pairs meet **WCAG AA** (≥ 4.5:1 for normal text, ≥ 3:1 for UI elements).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error`, `autoComplete` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (`height: 48 dp`) | default, hover, focus-visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus-visible, disabled, loading |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `accessibilityLabel` | ≥ 44 × 44 dp touch area | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | – | default, hover, focus-visible |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **Separator** | `View` | `style` (height 1 dp, `backgroundColor: theme.colors.surfaceVariant`) | – | default |
| **SettingsRow** | `TouchableOpacity` styled as list item | `label`, `onPress`, `showChevron?`, `showSwitch?`, `switchValue?`, `onSwitchChange?`, `error?` | min 44 × 44 dp (row height 56 dp) | default, pressed (ripple), hover (web), focus-visible, disabled, error |
| **SettingsSection** | `View` | `children`, optional top/bottom padding | – | default |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` | ≥ 44 × 44 dp per segment | default, selected, hover, focus-visible, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **FABAdd** | `FAB.Group` | `open`, `icon="plus"`, `actions=[{icon:"receipt", label:"Receipt", onPress}, {icon:"map", label:"Mileage", onPress}]` | ≥ 44 × 44 dp (main FAB) + mini‑FABs | default, open, closed, pressed, focus-visible |
| **ReceiptSavedSnackbar** | `Snackbar` | `visible`, `onDismiss`, `duration=3000`, `children` | – | visible, hidden |
| **BottomTabBar** | `BottomNavigation` (Paper) | `navigationState`, `onIndexChange`, `renderScene` | – | default, selected |
| **ActivityIndicator**, **Dialog**, **HelperText** – unchanged from Paper defaults.

All interactive elements meet the **44 × 44 dp** minimum touch area. Hover/focus states are rendered on web, while native platforms use Ripple/elevation feedback.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), main content wrapped in `<ScrollView role="main">`, bottom navigation (`role="navigation"`).  
- **Headings** – One `<Text variant="headlineMedium">` per screen (treated as `<h1>`). Sub‑sections use `titleMedium` (`<h2>`). No skipped levels.  
- **Labels** – Every `FormField` has a visible `label`. `FABAdd` actions have `accessibilityLabel` (“Add receipt”, “Add mileage”). `SettingsRow` items have `accessibilityRole="button"` and `accessibilityLabel` matching the visible label. Switches expose `accessibilityRole="switch"` and `accessibilityState`.  
- **Focus management** – On validation error, the first invalid `FormField` receives programmatic focus (`ref.current.focus()`). Dialogs trap focus while open.  
- **Visible focus** – 2 dp outline using `theme.colors.outline` appears on `focus-visible` (web) and via `accessibilityState={{ focused: true }}` on native.  
- **Keyboard navigation** – All tappable components reachable via `Tab`/`Shift+Tab`; `Enter`/`Space` activates focused button.  
- **Reduced motion** – `useReducedMotion` disables non‑essential animations (FAB group expansion, snackbar slide).  
- **Live announcements** – Snackbar messages are announced with `announceForAccessibility`.  
- **Alt / accessibilityLabel** – Meaningful icons (chevron, error) receive `accessibilityLabel` (“Navigate”, “Error”). Decorative icons set `accessibilityIgnoresInvertColors`.  
- **No color‑only cues** – Errors combine color with an error icon; disabled controls set `accessibilityState={{ disabled: true }}`.

## Content and microcopy
### DashboardScreen
| UI element | Copy |
|-----------|------|
| FAB group main icon | (plus sign) – no visible label; `accessibilityLabel="Add"` |
| FAB action – receipt | **“Receipt”** |
| FAB action – mileage | **“Mileage”** |
| Snackbar (receipt) | **“Receipt saved”** |
| Snackbar (mileage) | **“Mileage saved”** |
| EmptyState title | **“No activity yet”** |
| EmptyState description | **“Add a receipt or mileage to see recent items.”** |
| EmptyState action button | **“Add receipt”** (PrimaryButton) |
| Recent activity row – title | Dynamic, e.g., “Client lunch” |
| Recent activity row – subtitle | Date formatted *MMM d, yyyy* (e.g., “Oct 12, 2024”) |
| Bottom tab labels | **Dashboard**, **Receipts**, **Mileage**, **Settings** |

### Form fields (Add receipt / mileage)
- **Receipt name / description** – label: **“Description”**, placeholder omitted (label is visible).  
- **Amount** – label: **“Amount”**, keyboardType=`decimal-pad`, autoComplete=`off`.  
- **Date** – label: **“Date”**, keyboardType=`numeric`, autoComplete=`off`.  
- **Mileage distance** – label: **“Distance (mi)”**, keyboardType=`decimal‑pad`.  
- **Save button** – **“Save”** (PrimaryButton). While submitting, button shows loading spinner and is disabled.  
- **Error HelperText** – e.g., **“Amount must be greater than 0”** (displayed under field, linked with `aria-describedby`).  

### SettingsScreen (unchanged)
- Switch accessibility label: **“App lock”**.  
- Delete‑all‑data row label: **“Delete all data”** (error color).  
- Confirmation dialog title: **“Delete all data”**.  
- Dialog body: **“This action cannot be undone. Continue?”**  
- Dialog buttons: **“Cancel”** (text) and **“Delete”** (contained, error color).  

All copy follows title case for UI labels, sentence case for instructional text, and avoids jargon. No placeholder‑only fields; every input has an explicit label.

---  
**End of DESIGN.md**
