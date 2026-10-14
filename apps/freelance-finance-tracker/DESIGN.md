# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, and independent contractors who need a quick, private, offline‑first way to track receipts, mileage, and the integrity of their data.  
- **Goal** – Capture a receipt or mileage entry, edit it, and be assured that every change is recorded tamper‑evidently on‑device. The user can view a complete immutable history of any record, verify exported CSV/PDF files, and trust that backups have not been altered.  
- **Success feels like** – “I edited a receipt, opened its History and saw the correction stamped with date‑time, then checked Settings and saw **Verified • 12 345 entries • intact**. When I export a CSV I see a verification line, and the app tells me the file is authentic.”

## Primary flow
1. **Launch → Policy gate** (unchanged).  
2. **Dashboard** – bottom tab bar always visible.  
3. **Add or edit a receipt / mileage** – same flow as before (scan/photo, fill fields, Save).  
4. **Open History** – on the receipt‑detail or mileage‑detail screen tap the **History** button (top‑right icon). The History screen lists the original ledger entry and every subsequent `*.corrected` entry, newest last.  
5. **Inspect a history entry** – tap an entry to expand a JSON preview (read‑only).  
6. **Settings → Ledger status** – the Settings screen shows a LedgerStatusCard with the verification text.  
7. **Verify an export** – from Settings tap **Verify an export**, choose a CSV file (file picker) **or** paste a PDF verification code. The app reports: (a) whether the code matches an export made by this app, (b) if the file has been altered, (c) whether any records were corrected or deleted after the export.  
8. **Backup / Restore** – unchanged UI, but restore now runs `verifyLedger` first; a failed verification shows a modal with a friendly error and aborts the restore.

*Every screen in the flow surfaces a forward action (History, Verify Export, Ledger Status) via the bottom tab bar or a prominent button, ensuring the user never feels stranded.*

## Screens and states

| Screen | State | UI element(s) | Message / copy |
|--------|-------|----------------|----------------|
| **PolicyGateScreen** | Loading | Full‑screen `ActivityIndicator` | “Checking policy version…” |
| | Default | Policy text, checkbox, **Accept** (disabled until checked) | – |
| | Error | Full‑screen error view + **Retry** button | “Unable to store your acceptance. Please try again.” |
| **DashboardScreen** | Loading | Centered `ActivityIndicator` | – |
| | Empty | `EmptyState` component | Title *Nothing here yet*; Description *Add a receipt or mileage entry to start tracking your finances.*; Primary button **Add receipt** |
| | Populated | 4 `SummaryCard`s + recent‑activity list | – |
| **ReceiptDetailScreen** (edit) | Default (form) | Photo picker, **Scan receipt** button, outlined `FormField`s (Amount, Date, Category, Type, Notes), **History** icon button (top‑right), **Save receipt** (disabled until valid) | – |
| | OCR loading | Overlay `ActivityIndicator` + label “Analyzing receipt…” | – |
| | OCR success | Fields pre‑filled with helper “Check these details” | – |
| | OCR no data | Alert dialog | “No details could be extracted — please enter manually.” |
| | Validation error (field) | `HelperText type="error"` under field | Amount, Date, Category, Type messages (see Content) |
| | Saving | **Save receipt** shows spinner, label hidden | – |
| | Save error | `Snackbar` | “Unable to save receipt. Please try again.” |
| **MileageDetailScreen** (edit) | Same as ReceiptDetailScreen but without photo & category; Date picker allows future dates. |
| **HistoryScreen** (for receipt or mileage) | Default | Header with record title, `HistoryList` component (list of ledger entries), **Close** button (top‑left) | – |
| | Empty (should never happen) | Centered empty view | “No history found.” (fallback) |
| | Loading | `ActivityIndicator` overlay | – |
| **SettingsScreen** | Default | List rows (App lock, Mileage rate, Tax rate, Export, Backup & Restore, Categories, Policy, Delete all data) + **LedgerStatusCard** at top, **Verify an export** button at bottom | LedgerStatusCard text varies (see below) |
| | Ledger verification failed | LedgerStatusCard shows warning icon, red background (`error` color) and text “⚠︎ Ledger verification failed – first bad entry #23 – data may be tampered.” | – |
| | Verify Export dialog open | Dialog with file picker button **Pick CSV file**, TextInput “Or paste PDF verification code”, **Verify** button (disabled until input) | – |
| | Verify Export result (valid) | Dialog shows “✅ Export verified. Created 2024‑01‑15, 12 345 entries, no post‑export changes.” | – |
| | Verify Export result (invalid) | Dialog shows “❌ The code does not match any export from this app.” or “❌ File has been altered since export.” | – |
| **BackupRestoreScreen** (existing) | Restore error (ledger verification) | Modal with error “Backup verification failed – data may be tampered. Restore aborted.” | – |
| | Restore success | Snackbar “Backup restored successfully.” | – |
| **Any screen** | Offline banner | Full‑screen banner at top | “You are offline. Some actions require an internet connection.” |

### LedgerStatusCard (new component)
- **Default (verified)**: surface background, primary text `headlineMedium` “Verified • 12 345 entries • intact”, small check‑mark icon in `primary` color.  
- **Warning**: surface background, error text `headlineMedium` as above with warning icon, background remains surface (no new color).  

All messaging is kept in sentence case for body text, title case for button labels.

## Layout
- **Mobile‑first**: viewport **390 dp** wide, no horizontal scrolling.  
- **Global container** – `Screen` component: `SafeAreaView` + `ScrollView` with **horizontal padding 16 dp** (`spacing*2`).  
- **Content width** – max **420 dp**; centered on desktop (breakpoint **1280 dp**). Desktop still shows phone‑first UI, not a stretched layout.  
- **Vertical rhythm** – 8 dp grid (4, 8, 12, 16, 24, 32 dp spacing).  
- **Bottom Tab Bar** – fixed 56 dp height, icons + labels centered; anchored bottom on all platforms.  
- **FAB** – 56 × 56 dp, inset 16 dp from right & bottom; mini‑FABs 40 × 40 dp.  
- **Forms** – each `FormField` full width, vertical gap **12 dp**.  
- **HistoryScreen** – header height 56 dp, list occupies remaining height, each list item has min height **56 dp** and left‑aligned icon.  
- **LedgerStatusCard** – full‑width card, vertical padding **12 dp**, horizontal padding **16 dp**, margin bottom **16 dp**.  
- **Verify Export Dialog** – max width **360 dp**, content padded **16 dp**.  

All touch targets ≥ 44 × 44 dp (minimum 48 dp height on buttons for comfortable tap).

## Design tokens
> **Implementation** – exported as a Material 3 theme object for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`). The same tokens cover the new UI.

```ts
// src/theme.ts
export const theme = {
  roundness: 8,
  spacing: 8, // base unit (8 dp)

  colors: {
    // Primary (deep blue) – accent for actions, verified status
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
| #212121 | #E0E0E0 | LedgerStatusCard warning text (error) | normal |
| #212121 | #FFFFFF | LedgerStatusCard verified text | normal |
| #212121 | #F5F5F5 | Export verification code input (body) | normal |

All pairs meet **WCAG AA** (≥ 4.5:1 for normal text, ≥ 3:1 for UI elements).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus-visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus-visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` + `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus-visible, disabled |
| **DatePickerField** | `DatePickerModal` + trigger `TextInput` | `value`, `onConfirm`, `label="Date"`; disallow future dates for receipts | ≥ 44 × 44 dp (input) | closed, open, error |
| **CategorySelect** | `Menu` anchored to `TextInput` | `value`, `onSelect`, `categories`, `label="Category"` | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | – | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | – | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | receipt props + `onPress` | – | default, pressed (elev 2), focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` | – | selected, unselected |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **Dialog** | `Portal` + `Dialog` | `visible`, `onDismiss`, `title`, `children`, `actions` | – | default, focus-visible |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | – | default |
| **HelperText** | `HelperText` | `type="error"` | – | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | – | default |
| **HistoryList** | `FlatList` of `Card`s | `entries: LedgerEntry[]` (sorted oldest→newest) | – | default |
| **LedgerStatusCard** | `Card` | `status: "verified" | "warning"`, `entryCount`, `message` | – | default |
| **VerifyExportDialog** | `Dialog` | `visible`, `onDismiss`, `onPickFile`, `onSubmitCode`, `loading`, `result?` | – | default, loading, success, error |

All interactive elements meet the **44 × 44 dp** minimum touch area. Hover/focus styles appear on web; native platforms use ripple or elevation changes.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), `<ScrollView>` (`role="main"`), `BottomNavigation` (`role="navigation"`).  
- **Heading hierarchy** – One `<Text variant="headlineMedium">` per screen (acts as `<h1>`). Sub‑sections use `titleMedium` (`<h2>`), `bodyLarge` (`<p>`). No skipped levels.  
- **Labels** – Every `TextInput` has a visible `label`. Icon‑only buttons (FABs, Scan, History, Verify Export) have `accessibilityLabel` (“Add receipt”, “Scan receipt”, “History”, “Verify export”).  
- **Focus management** – On validation failure the first invalid field receives programmatic focus (`ref?.focus()`). Dialogs trap focus. LedgerStatusCard’s warning text is announced via `announceForAccessibility`.  
- **Visible focus** – 2 dp outline (`theme.colors.outline`) appears on focus-visible for buttons, fields, and list items.  
- **Keyboard navigation** – All tappable components reachable via `Tab`/`Shift+Tab`; `Enter` activates focused button.  
- **Reduced motion** – `useReducedMotion` disables non‑essential animations (e.g., History list expand/collapse) when `prefers-reduced-motion` is true.  
- **Live announcements** – OCR start/end, save success, export verification result, and backup verification failures are announced.  
- **Alt / accessibilityLabel** – Receipt thumbnail: “Receipt photo”. Empty‑state illustration: “Empty state illustration”. Ledger entry icons have `accessibilityLabel` derived from `kind` (e.g., “Receipt created”).  
- **No color‑only cues** – Errors also show an alert icon; disabled controls have `accessibilityState={{ disabled: true }}`. LedgerStatusCard warning includes a warning icon.  

## Content and microcopy

### Receipt / Mileage Detail screens
- **History button** – Icon button (eye) with `accessibilityLabel="History"` placed top‑right of the app bar.  
- **History screen title** – `headlineMedium` “History”.  
- **Ledger entry list** – Each item shows:  
  - **Date & time** – e.g., “2024‑03‑12 14:27”.  
  - **Kind** – “receipt.created”, “receipt.corrected”, etc.  
  - **Preview** – Collapsed JSON preview (first 2‑3 fields) with a “Show more” toggle.  
- **Empty History (fallback)** – “No history found.” (should not appear for existing records).  

### Settings → Ledger status
- **Verified state** – “✅ Verified • 12 345 entries • intact”.  
- **Warning state** – “⚠︎ Ledger verification failed – first bad entry #23 – data may be tampered.”  
- **Verify an export button** – **Verify an export** (primary button).  

### Verify Export dialog
- **Pick CSV file** – Button label **Pick CSV file** (`accessibilityLabel="Pick CSV file"`).  
- **Or paste PDF verification code** – TextInput with label “PDF verification code”.  
- **Verify button** – **Verify** (disabled until a file is selected *or* a non‑empty code is entered).  
- **Result messages**:  
  - Success: “✅ Export verified. Created 2024‑01‑15, 12 345 entries, no post‑export changes.”  
  - File altered: “❌ The file has been changed since export.”  
  - Unknown code: “❌ The code does not match any export from this app.”  
  - No matching export: “❌ No export with this code was found.”  

### Backup / Restore
- **Restore error modal** – Title **Backup verification failed**, body “The backup’s ledger could not be verified. The restore has been aborted to protect your data.”, primary button **OK**.  
- **Restore success snackbar** – “Backup restored successfully.”  

### General
- **Snackbar success** – “Receipt saved”, “Mileage saved”, “Category added”, “Category renamed”, “Category hidden”, “Export created”, “Backup created”.  
- **Snackbar error** – Existing messages (save error, export error, backup error) remain unchanged.  
- **Form field helpers** – “Check these details” (OCR pre‑fill), “Select a date (future dates not allowed)”, “Select a category”.  
- **Validation messages** – Same as existing spec (amount must be > 0, date required, category required, etc.).  

All copy follows title case for buttons, sentence case for body text, and avoids jargon. Autocomplete and keyboard types are set appropriately (email, numeric, password). Validation runs on blur and on submit; focus shifts to the first invalid field. The UI meets the quality bar: clear visual hierarchy, generous whitespace on the 8 px scale, restrained palette (single accent – primary), proper type scale, cards grouping related items, icons for scanning, history, and warnings, and a polished look on both phone and desktop widths.

---  

**End of DESIGN.md**
