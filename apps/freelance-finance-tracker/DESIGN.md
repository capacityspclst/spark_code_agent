# DESIGN.md

## Users and goal
- **Primary persona** – Freelancers, gig workers, and independent contractors who need a quick, private way to track income, expenses, and mileage for tax purposes **without any network connection**.  
- **Goal** – Record a receipt or mileage entry in ≤ 30 seconds, view an up‑to‑date financial summary, and export or back‑up data **entirely on‑device**.  
- **Success feels like**  
  1. Opening the app lands on a clean dashboard with totals instantly visible.  
  2. Adding a receipt (or mileage) feels like filling a short form; after tapping **Save** a brief “saved” snackbar appears and the dashboard updates automatically.  
  3. Exporting a CSV/PDF opens the native share sheet without a loading hitch.  
  4. Backing up produces an encrypted file that can be stored wherever the user chooses, and restoring it works with a single passphrase entry.

## Primary flow
1. **Launch** – App reads the stored policy version.  
2. **Policy gate** (first launch or when the policy version changes) → user reads the short policy, checks “I agree”, taps **Accept**.  
3. **Dashboard** – shows Income, Expenses, Mileage deduction, Estimated tax, and the five most recent entries.  
4. **Add entry** – user taps the **FAB** → chooses **Receipt** or **Mileage** (mini‑FABs).  
5. **Entry form** – user fills required fields (photo optional for receipts), taps **Save receipt** / **Save mileage**.  
6. **Save feedback** – a **Snackbar** (“Receipt saved” / “Mileage saved”) appears; the app returns to the dashboard with updated totals.  
7. At any moment the bottom tab bar (Dashboard | Receipts | Mileage | Settings) and the FAB give direct access to every primary action.

*All unnecessary steps have been omitted – this is the shortest possible path to the core job.*

## Screens and states

| Screen | State | UI element(s) | Message / copy |
|--------|-------|----------------|----------------|
| **PolicyGateScreen** | Loading | Full‑screen `ActivityIndicator` | “Checking policy version…” |
| | Default (agreement) | Scrollable policy text, checkbox, **Accept** button (disabled until checked) | *Policy text* (see Content) |
| | Error | Full‑screen error view with **Retry** button | “Unable to store your acceptance. Please try again.” |
| **DashboardScreen** | Loading | Centered `ActivityIndicator` | – |
| | Empty | `EmptyState` component | Title: “Nothing here yet”<br>Description: “Add a receipt or mileage entry to start tracking your finances.”<br>Primary button: “Add receipt” |
| | Populated | Four `SummaryCard`s (Income, Expenses, Mileage deduction, Estimated tax) + recent‑activity list (max 5) | – |
| | Error | Error view with **Retry** | “Failed to load data. Pull down to retry.” |
| **ReceiptsScreen** | Loading | `ActivityIndicator` | – |
| | Empty | `EmptyState` | Title: “No receipts recorded”<br>Description: “Tap the + button to add your first receipt.”<br>Primary button: “Add receipt” |
| | Loaded | `FlatList` of `ReceiptCard`s | – |
| | Error | Error view | “Could not fetch receipts. Pull to retry.” |
| **ReceiptEntryScreen** | Default | Form fields (photo picker, amount, date, category, type, notes) + disabled **Save receipt** button | – |
| | Validation error (per field) | `HelperText` under the field | Specific messages (see Content) |
| | Saving | **Save receipt** shows spinner, label hidden | – |
| | Save error | `Snackbar` | “Unable to save receipt. Please try again.” |
| **MileageScreen** | Same states as **ReceiptsScreen** (empty‑state “No mileage logged”). |
| **MileageEntryScreen** | Mirrors **ReceiptEntryScreen** (no photo field). |
| **SettingsScreen** | Default | List rows: App lock (switch), Mileage rate, Tax rate, Export, Backup & Restore, View policy, Delete all data | – |
| | Error | `Snackbar` | “Unable to load settings.” |
| **TaxSettingsScreen** | Default | Two `FormField`s (Mileage rate, Tax rate) + **Save** button (disabled until a change) | – |
| | Validation error | `HelperText` | “Enter a positive number.” |
| | Saving | Button shows spinner | – |
| | Save error | `Snackbar` | “Failed to save settings.” |
| **ExportScreen** | Default | Buttons: **Export CSV**, **Export PDF** | – |
| | Generating | Full‑screen `ActivityIndicator` | “Generating export…” |
| | Share opened | `Snackbar` | “Export ready to share.” |
| | Error | `Snackbar` | “Export failed. Try again.” |
| **BackupScreen** | Default | **Create backup** button | – |
| | Passphrase modal | Secure `FormField` (passphrase) + confirm field + **Create backup** (disabled until match) | – |
| | Validation error | `HelperText` | “Passphrases must match and be at least 8 characters.” |
| | Generating | `ActivityIndicator` | “Creating encrypted backup…” |
| | Success | Share sheet + `Snackbar` | “Backup ready to share.” |
| | Error | `Snackbar` | “Backup failed: [reason]” |
| **RestoreScreen** | Default | **Select backup file** button | – |
| | Passphrase modal | Secure `FormField` + **Restore** button | – |
| | Validation error | `HelperText` | “Enter passphrase.” |
| | Restoring | `ActivityIndicator` | “Restoring data…” |
| | Success | `Snackbar` | “Data restored successfully.” |
| | Error | `Snackbar` | “Invalid passphrase or corrupted backup file.” |
| **DeleteAllDataConfirmation** (dialog) | Default | Dialog with **Cancel** / **Delete** | Title: “Delete all data?”<br>Description: “This action cannot be undone.” |
| | Deleting | `ActivityIndicator` inside dialog | – |
| | Success | `Snackbar` | “All data deleted.” |

## Layout
- **Mobile‑first**: design viewport **390 dp** wide (typical iPhone 12/13). No horizontal scrolling on phones.  
- **Global container** – `Screen` component = `SafeAreaView` + `ScrollView` with **horizontal padding 16 dp** (`spacing * 2`).  
- **Content width** – max 420 dp for any column; on desktop (1280 dp viewport) the column stays centered (`margin: auto`) and never stretches.  
- **Vertical rhythm** – spacing follows an **8 dp grid** (4, 8, 12, 16, 24, 32 dp).  
- **Bottom Tab Bar** – fixed height 56 dp, icons + labels centered, anchored to the bottom on all platforms.  
- **FAB** – 56 × 56 dp, positioned **16 dp** inset from right & bottom; expands to two 40 × 40 dp mini‑FABs (Receipt / Mileage).  
- **Cards** – `Card` with **margin‑bottom 16 dp**, border‑radius 8 dp, elevation 1, internal padding 16 dp.  
- **Forms** – each `FormField` spans full width; vertical gap 12 dp. Labels sit above the outlined input (Paper default).  
- **Desktop breakpoint** – at **1280 dp** the layout does **not** change structure; the bottom navigation remains, preserving a phone‑first experience.

## Design tokens
> **Implementation** – exported as a Material‑3 theme object for React‑Native‑Paper (`src/theme.ts`). The same values are mirrored as CSS custom properties for the web (`public/theme.css`).

```ts
// src/theme.ts
export const theme = {
  roundness: 8,
  spacing: 8, // base unit (8 dp)

  // ==== Color palette (single accent) ====
  colors: {
    // Primary (deep blue)
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFE5FF',
    onPrimaryContainer: '#001D35',

    // Secondary (darker teal) – used for switches, mini‑FAB background, etc.
    secondary: '#015958',            // NEW – darker teal for sufficient contrast
    onSecondary: '#FFFFFF',          // NEW – white text/icon on secondary
    secondaryContainer: '#C8F4EF',
    onSecondaryContainer: '#00201A',

    // Surfaces & background
    surface: '#FFFFFF',
    surfaceVariant: '#F2F2F2',
    background: '#F5F5F5',
    onSurface: '#212121',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    outlineVariant: '#C4C4C4',

    // Disabled / placeholder
    disabled: '#E0E0E0',
    onDisabled: '#212121',
    placeholder: '#6F6F6F',

    // Status
    error: '#B00020',
    onError: '#FFFFFF',
  },

  // ==== Typography (MD3 type scale) ====
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

**Web fallback (CSS custom properties)** – `public/theme.css`

```css
:root {
  --color-primary: #0061A4;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #CFE5FF;
  --color-on-primary-container: #001D35;

  --color-secondary: #015958;          /* NEW */
  --color-on-secondary: #FFFFFF;       /* NEW */
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
| #FFFFFF | #0061A4 | Primary button label (contained) | normal (16 sp) |
| #0061A4 | #FFFFFF | Text button / outlined button label | normal |
| #212121 | #FFFFFF | Body text on cards & screens | normal |
| #49454F | #FFFFFF | Secondary text (captions, dates) | normal |
| #0061A4 | #F5F5F5 | Bottom‑tab selected icon & label | normal |
| #49454F | #FFFFFF | Unselected tab icon & label | normal |
| #B00020 | #FFFFFF | HelperText error / Snackbar error text | normal |
| #FFFFFF | #B00020 | Snackbar label on error background | normal |
| #212121 | #E0E0E0 | Disabled button label | normal |
| #FFFFFF | #015958 | Switch thumb (on) | ui |
| #015958 | #FFFFFF | Switch track (on) | ui |
| #212121 | #E0E0E0 | Switch thumb (off) | ui |
| #FFFFFF | #0061A4 | Primary FAB icon (large) | large (icon) |
| #FFFFFF | #015958 | Mini‑FAB icon (large) | large (icon) |
| #6F6F6F | #FFFFFF | TextInput placeholder | normal |
| #212121 | #CFE5FF | Card title on primary‑container surface | normal |
| #212121 | #F2F2F2 | Card title on surface‑variant | normal |
| #212121 | #FFFFFF | Dialog title | large (headline) |
| #FFFFFF | #015958 | Mini‑FAB background (secondary) with white icon | large (icon) |

All pairs meet **WCAG AA** (≥ 4.5:1 for normal text, ≥ 3:1 for UI elements).

## Components
All UI components are thin wrappers around **React‑Native‑Paper** primitives, placed in `src/components/ui/`. Each wrapper respects the design tokens and provides the required interaction states.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `secureTextEntry`, `error` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible (2 dp outline `outline`), active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` (`{label,value,icon}`) | 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange` | 44 × 44 dp tappable area | default (off), on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | – | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | `photoUri?`, `amount`, `date`, `category`, `type`, `notes`, `onPress` | – | default, pressed (elev 2), focus |
| **MileageCard** | `Card` | `date`, `miles`, `purpose`, `deduction`, `onPress` | – | default, pressed, focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` (`{key,title,icon}`) | – | selected (primary), unselected (onSurfaceVariant), ripple |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` (opens mini‑FABs) | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` / `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **Dialog** | `Portal` + `Dialog` | `visible`, `onDismiss`, `title`, `children`, `actions` | – | default, focus‑visible on actions |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | – | default |
| **HelperText** | `HelperText` | `type="error"` | – | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | – | default |

All interactive elements guarantee a **minimum 44 × 44 dp** touch area (or larger for buttons). Hover/focus visual styles appear on web; native platforms use ripple effects.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), followed by a `<ScrollView>` (`role="main"`). Bottom navigation has `accessibilityLabel="Bottom navigation"` (`role="navigation"`).  
- **Headings** – Each screen has a single `<Text variant="headlineMedium">` as the **h1**. Sub‑sections use `titleMedium` (`h2`) and `bodyLarge` (`p`). No heading level skips.  
- **Labels** – All `TextInput`s receive a visible `label` prop; the label is automatically linked (`accessibilityLabel`). Icon‑only buttons (FAB, close icons) include `accessibilityLabel` (“Add receipt”, “Close dialog”, etc.).  
- **Focus management** – On validation failure the first invalid field receives focus (`ref.focus()`). Dialogs trap focus while open.  
- **Visible focus** – Focus‑visible style: 2 dp outline using `theme.colors.outline`.  
- **Keyboard navigation** – All tappable components are reachable via `Tab`/`Shift+Tab`; `Enter` activates the focused button.  
- **Reduced motion** – `useReducedMotion` hook disables non‑essential animations when `prefers-reduced-motion` is true.  
- **Alt text / accessibilityLabel** – Receipt thumbnails: `accessibilityLabel="Receipt photo"`; placeholder illustrations: `accessibilityLabel="Empty state illustration"`.  
- **No color‑only cues** – Error states also show an error icon (`AlertCircle`) and helper text. Disabled controls have `accessibilityState={{ disabled: true }}`.  
- **Announcements** – After a successful save, `announceForAccessibility('Receipt saved')` is fired; `Snackbar` automatically announces its message.  
- **Haptics** – On successful actions (save, export, backup) trigger `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` on supported devices; on web the call is a no‑op.  

## Content and microcopy
**PolicyGateScreen**  
- Title: “Privacy & Terms”  
- Body (concise):  
  > “Your data stays on this device. We never see, store, or transmit it. You are responsible for backing up your records. This app is not tax, legal, or financial advice.”  
- Checkbox label: “I have read and agree to the Terms of Use and Privacy Policy.”  
- Accept button: **Accept**

**DashboardScreen**  
- Title: “Dashboard”  
- SummaryCard titles: “Income”, “Expenses”, “Mileage deduction”, “Estimated tax”  
- Recent activity title: “Recent activity”  
- Empty‑state title: “Nothing here yet”  
- Empty‑state description: “Add a receipt or mileage entry to start tracking your finances.”  
- FAB primary action: **Add receipt** (mini‑FAB label “Receipt”), **Add mileage** (mini‑FAB label “Mileage”)

**ReceiptsScreen / MileageScreen**  
- Titles: “Receipts” / “Mileage”  
- Empty‑state titles: “No receipts recorded” / “No mileage logged”  
- Empty‑state description: “Tap the + button to add your first receipt.” / “Tap the + button to log your first mileage entry.”  

**ReceiptEntryScreen**  
- Field labels: “Photo (optional)”, “Amount”, “Date”, “Category”, “Type”, “Notes”  
- Type segmented buttons: “Expense”, “Income”  
- Save button: **Save receipt**  
- Validation messages:  
  - Amount: “Enter a positive amount.”  
  - Date: “Select a date.”  
  - Category: “Choose a category.”  
  - Type: “Select expense or income.”  
- Photo picker button: “Add photo”  
- Photo remove icon: “Remove photo”

**MileageEntryScreen**  
- Field labels: “Date”, “Miles”, “Purpose”  
- Save button: **Save mileage**  
- Validation messages:  
  - Miles: “Enter a positive number of miles.”  
  - Date: “Select a date.”  
  - Purpose: “Enter a purpose for the trip.”

**SettingsScreen**  
- Section headings:  
  - “App lock”  
  - “Mileage rate”  
  - “Tax rate”  
  - “Export data”  
  - “Backup & restore”  
  - “Policy”  
  - “Delete all data”  
- Switch label: “Require biometric authentication on launch”  
- Mileage rate placeholder: “e.g., 0.655 $ per mile”  
- Tax rate placeholder: “e.g., 22 %”  
- Export buttons: “Export CSV”, “Export PDF”  
- Backup button: “Create encrypted backup”  
- Restore button: “Restore from backup”  
- Delete data button: “Delete all data”

**ExportScreen**  
- Snackbar after share: “Export ready to share”

**BackupScreen**  
- Passphrase field label: “Backup passphrase”  
- Confirm passphrase label: “Confirm passphrase”  
- Create backup button: **Create backup**  
- Validation: “Passphrases must match and be at least 8 characters.”  
- Snackbar after share: “Backup ready to share”

**RestoreScreen**  
- Select file button: **Select backup file**  
- Passphrase field label: “Backup passphrase”  
- Restore button: **Restore**  
- Snackbar on success: “Data restored successfully.”

**DeleteAllDataConfirmation** (dialog)  
- Title: “Delete all data?”  
- Description: “This action cannot be undone.”  
- Buttons: **Cancel**, **Delete**

**Global Snackbars**  
- Success: “Receipt saved”, “Mileage saved”, “Export CSV generated”, “Export PDF generated”, “Backup created”, “Data restored successfully”, “All data deleted”.  
- Error variants: “Unable to save receipt. Please try again.”, “Export failed. Try again.”, “Backup failed: [reason]”, “Invalid passphrase or corrupted backup file.”, “Something went wrong. Please try again.”  

All copy follows title‑case for button labels, sentence case for body text, and avoids jargon. No field relies on placeholder‑only text; every input has a visible label. Autocomplete & keyboard types are set appropriately (numeric for amounts/miles, `secureTextEntry` for passphrases). The UI meets the quality bar: clear visual hierarchy, generous 8 dp whitespace, restrained palette with a single accent (primary), a coherent type scale, cards grouping related items, icons where they aid scanning, and a polished look on both phone and desktop widths.

---  

**End of DESIGN.md**
