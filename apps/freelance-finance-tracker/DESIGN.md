# DESIGN.md

## Users and goal
- **Primary persona** – freelancers, gig workers, contractors, and small‑business owners who must keep **tamper‑evident, offline financial records** (receipts, mileage) for tax, reimbursement, or audit purposes.  
- **Goal** – capture a receipt or mileage entry, edit it, and have every creation, correction, and deletion automatically logged in an append‑only, cryptographically‑linked ledger that can be verified at any time.  
- **Success feels like** – “I edited a receipt, opened its History and saw a timestamped correction; in Settings the ledger shows *Verified · 123 entries · intact*; the CSV export I sent contains a verification line and the accountant can confirm it matches my app.”

## Primary flow
1. **Launch → Policy gate** (unchanged).  
2. **Dashboard** – bottom tab bar always visible.  
3. **Edit receipt** – tap a receipt card → **ReceiptDetailScreen** → **Edit** → change a field → **Save receipt** (creates a `receipt.corrected` ledger entry).  
4. **View History** – tap the **History** button on the edit screen → **ReceiptHistoryScreen** lists the original `receipt.created` entry plus every later `receipt.corrected`/`receipt.deleted` entry (newest last).  
5. **Settings** – bottom tab → **SettingsScreen** shows a **VerificationStatus** component at the top: “Verified · N entries · intact” or a warning with the first bad entry.  
6. **Verify an export** – Settings → **Verify export** button → **VerifyExportScreen**; pick a CSV file or paste a PDF verification code; the screen reports whether the file matches an export made by this app, whether it has been altered, and whether any records changed after that export.  
7. All primary actions are reachable from the bottom tab bar or Settings; the user never lands on a screen without a forward path.

## Screens and states

| Screen | State | UI elements | Message / copy |
|--------|-------|-------------|----------------|
| **PolicyGateScreen** | Loading | `ActivityIndicator` | “Checking policy version…” |
| | Default | Policy text, checkbox, **Accept** (disabled until checked) | – |
| | Error | Full‑screen error view, **Retry** | “Unable to store your acceptance. Please try again.” |
| **DashboardScreen** | Loading | Centered `ActivityIndicator` | – |
| | Empty | `EmptyState` – title *Nothing here yet*, description *Add a receipt or mileage entry to start tracking your finances.*, primary button **Add receipt** | – |
| | Populated | 4 `SummaryCard`s + recent‑activity list | – |
| **ReceiptDetailScreen** | View | Card with receipt fields, **Edit** button, **History** button (icon + label) | – |
| | Edit (form) | `FormField`s (Amount, Date, Category, Type, Notes), **Save receipt** (disabled until valid) | – |
| | Saving | **Save receipt** shows spinner, label hidden | – |
| | Save error | `Snackbar` | “Unable to save receipt. Please try again.” |
| **ReceiptHistoryScreen** | Loading | `ActivityIndicator` | “Loading history…” |
| | Empty | `EmptyState` – title *No changes yet*, description *This receipt has never been edited.*, primary button **Back** | – |
| | Populated | `HistoryList` of `HistoryItem`s (date, kind badge, optional preview) | – |
| | Error | `Snackbar` | “Failed to load history. Check your device storage.” |
| **MileageHistoryScreen** | Same states as ReceiptHistoryScreen, filtered for mileage entries | – | – |
| **SettingsScreen** | Default | List rows (App lock, Mileage rate, Export, Backup & Restore, **Categories**, **Verify export**, Ledger status) | – |
| | Ledger verified | `VerificationStatus` – “Verified · 123 entries · intact” (green check) | – |
| | Ledger compromised | `VerificationStatus` – “⚠ Ledger corrupted at entry # 42: hash mismatch.” (red warning) | – |
| **VerifyExportScreen** | Default | Toggle: **Pick CSV file** / **Enter PDF code**. CSV tab: **Pick CSV** button (opens document picker). PDF tab: `TextInput` label *Verification code* + **Check** button. Result panel below. | – |
| | Loading (file) | `ActivityIndicator` | “Reading file…” |
| | Success (match) | Result panel + `Snackbar` | “Export verified. 45 entries exported on 2024‑09‑15. No changes after export.” |
| | File altered | Result panel | “File hash does not match export. The CSV was modified after export.” |
| | Code not found | `Snackbar` | “Code not found in this app’s export history.” |
| | No matching export | `Snackbar` | “No export with this verification code exists.” |
| **Any screen** | Offline banner | Full‑width banner | “You are offline. Some actions require an internet connection.” |

## Layout
- **Mobile‑first**: base viewport **390 dp** wide; no horizontal scroll.  
- **Global container** – `Screen` component = `SafeAreaView` + `ScrollView` with horizontal padding **16 dp** (`spacing × 2`).  
- **Content max width** – **420 dp**, centered on desktop breakpoint **1280 dp**.  
- **Vertical rhythm** – 8 dp base grid (spacing values 4, 8, 12, 16, 24, 32 dp).  
- **Bottom Tab Bar** – fixed **56 dp** height, icons + labels centered, anchored bottom on all platforms.  
- **FAB** – 56 × 56 dp, inset 16 dp from right & bottom; expands to two 40 × 40 dp mini‑FABs.  
- **Forms** – each `FormField` full width, vertical gap **12 dp**.  
- **HistoryScreen** – header with back button, `HistoryList` fills remaining height; each `HistoryItem` padded **12 dp** vertically, divider line between items.  
- **SettingsScreen** – top `VerificationStatus` card (16 dp padding), then the list rows.  
- **Desktop** – layout unchanged; content remains phone‑first appearance, centered within the wider viewport.

## Design tokens
> **Implementation** – exported as a Material 3 theme for React‑Native‑Paper (`src/theme.ts`) and mirrored as CSS custom properties (`public/theme.css`).  

```ts
// src/theme.ts
export const theme = {
  roundness: 8,
  spacing: 8, // base unit (8 dp)

  colors: {
    /* Primary – accent */
    primary: '#0061A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFE5FF',
    onPrimaryContainer: '#001D35',

    /* Secondary – used for switches, mini‑FABs, active menu items */
    secondary: '#015958',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#C8F4EF',
    onSecondaryContainer: '#00201A',

    /* Surfaces & background */
    surface: '#FFFFFF',
    surfaceVariant: '#F2F2F2',
    background: '#F5F5F5',
    onSurface: '#212121',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    disabled: '#E0E0E0',
    onDisabled: '#212121',
    placeholder: '#6F6F6F',

    /* Status */
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

  elevation: { level1: { elevation: 1, shadowOpacity: 0.20 } },
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
| #FFFFFF | #015958 | Mini‑FAB icon | UI |
| #FFFFFF | #0061A4 | Primary FAB icon | UI |
| #0061A4 | #FFFFFF | Bottom‑tab selected icon & label | UI |
| #49454F | #FFFFFF | Bottom‑tab unselected icon & label | UI |
| #212121 | #FFFFFF | Body text on screens & cards | normal |
| #49454F | #FFFFFF | Secondary text (captions, dates) | normal |
| #001D35 | #CFE5FF | Card title on primary‑container surface | normal |
| #212121 | #F2F2F2 | Card title on surface‑variant surface | normal |
| #212121 | #FFFFFF | Dialog title | large |
| #FFFFFF | #B00020 | HelperText error / Snackbar error text | normal |
| #212121 | #E0E0E0 | Disabled button label | normal |
| #FFFFFF | #015958 | Switch thumb (on) | UI |
| #015958 | #FFFFFF | Switch track (on) | UI |
| #212121 | #E0E0E0 | Switch thumb (off) | UI |
| #6F6F6F | #FFFFFF | TextInput placeholder | normal |
| #001D35 | #CFE5FF | Snackbar success text (on primary‑container background) | normal |
| #79747E | #FFFFFF | Focus/outline border for inputs (focus‑visible) | UI |
| #212121 | #FFFFFF | HistoryItem date & kind text | normal |
| #212121 | #FFFFFF | VerificationStatus text (verified state) | normal |
| #212121 | #FFFFFF | VerificationStatus text (compromised state) | normal |

All pairs meet **WCAG AA** (≥ 4.5:1 for normal text, ≥ 3:1 for UI elements).

## Components
All UI wrappers live in `src/components/ui/` and use React‑Native‑Paper primitives.

| Component | Paper base | Props / defaults | Touch target | States |
|-----------|------------|------------------|--------------|--------|
| **Screen** | `SafeAreaView` + `ScrollView` | `children`, `style` | – | default |
| **FormField** | `TextInput` (`mode="outlined"`) | `label`, `value`, `onChangeText`, `keyboardType`, `error` | – | default, error |
| **PrimaryButton** | `Button` (`mode="contained"`) | `onPress`, `children`, `disabled`, `loading` | ≥ 44 × 44 dp (48 dp height) | default, hover, focus‑visible, active, disabled, loading |
| **TextButton** | `Button` (`mode="text"`) | same as PrimaryButton | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled, loading |
| **ScanButton** | `Button` (`mode="contained"` + `icon="camera"`) | `onPress`, `disabled` (web) | ≥ 44 × 44 dp | default, hover, focus‑visible, disabled |
| **DatePickerField** | `DatePickerModal` + trigger `TextInput` | `value`, `onConfirm`, `label="Date"` | ≥ 44 × 44 dp | closed, open, error |
| **CategorySelect** | `Menu` anchored to a `TextInput` | `value`, `onSelect`, `categories`, `label="Category"` | ≥ 44 × 44 dp | closed, open, error |
| **AddCategoryDialog** | `Dialog` + `TextInput` | `visible`, `onDismiss`, `onAdd`, `error` | – | default, error, loading |
| **ChoiceField** | `SegmentedButtons` | `value`, `onValueChange`, `buttons` | ≥ 44 × 44 dp per segment | default, selected, hover, focus, disabled |
| **CheckboxField** | `Checkbox.Android` / `Checkbox.IOS` | `status`, `onPress`, `label` | ≥ 44 × 44 dp | default, checked, hover, disabled |
| **SettingSwitch** | `Switch` | `value`, `onValueChange`, `label` | ≥ 44 × 44 dp (touch area) | off, on, disabled |
| **SummaryCard** | `Card` | `title`, `value`, `icon` | – | default, hover (elev 2), focus |
| **ReceiptCard** | `Card` | receipt props + `onPress` | – | default, pressed (elev 2), focus |
| **EmptyState** | custom view | `icon`, `title`, `description`, `actionLabel`, `onActionPress` | – | default |
| **BottomTabBar** | `BottomNavigation` | `state`, `onIndexChange`, `routes` | – | selected, unselected |
| **FABAdd** | `FAB` (`size="large"`) | `icon="plus"`, `onPress` | 56 × 56 dp | default, hover, focus, active, disabled |
| **MiniFAB** | `FAB` (`size="small"` `mode="secondary"`) | `icon`, `label`, `onPress` | 40 × 40 dp | default, hover, active |
| **Snackbar** | `Snackbar` | `visible`, `onDismiss`, `duration`, `children` | – | default |
| **HelperText** | `HelperText` | `type="error"` | – | default |
| **ActivityIndicator** | `ActivityIndicator` | `size="large"` / `"small"` | – | default |
| **HistoryItem** | `List.Item` | `date`, `kind`, `preview?` | ≥ 44 × 44 dp | default, hover, focus‑visible |
| **HistoryList** | `FlatList` of `HistoryItem`s | `entries` (sorted asc) | – | default |
| **VerificationStatus** | `Surface` (card) | `status` (`verified` | `compromised`), `entryCount`, `firstBadSeq?`, `reason?` | – | verified, compromised |
| **VerifyExportForm** | custom layout | `mode` (`csv` | `pdf`), file picker / code input, **Check** button | ≥ 44 × 44 dp | default, loading, error, success |

All interactive elements satisfy the **44 × 44 dp** minimum touch target. Hover/focus styles appear on web; native platforms use ripple or elevation cues.

## Accessibility
- **Landmarks** – `Appbar.Header` (`role="banner"`), main `ScrollView` (`role="main"`), bottom navigation (`role="navigation"`).  
- **Headings** – one `<Text variant="headlineMedium">` per screen (acts as `<h1>`). Sub‑sections use `titleMedium` (`h2`) and `bodyLarge` (`p`). No level skipping.  
- **Labels** – every `TextInput` has a visible `label`; icon‑only buttons (`FABAdd`, `MiniFAB`, `ScanButton`) provide `accessibilityLabel` (“Add receipt”, “Scan receipt”, “History”, “Verify export”).  
- **Focus management** – on validation failure the first invalid field receives programmatic focus; dialogs trap focus; after a successful save focus returns to the list.  
- **Visible focus** – 2 dp outline (`theme.colors.outline`) on focus‑visible states for buttons, fields, and list items.  
- **Keyboard navigation** – all tappable components reachable via `Tab`/`Shift+Tab`; `Enter` activates the focused button.  
- **Reduced motion** – UI respects `prefers-reduced-motion`; non‑essential animations are disabled when the media query is true.  
- **Live announcements** – OCR start/end, save success, ledger verification results are announced via `announceForAccessibility`.  
- **Alt / accessibilityLabel** – receipt thumbnail: “Receipt photo”; empty‑state illustration: “Empty state illustration”.  
- **No color‑only cues** – errors also show an alert icon; disabled controls expose `accessibilityState={{ disabled: true }}`.  
- **History items** – each announces “<Kind> on <date>”, adding “preview available” when a data preview exists.  
- **VerificationStatus** – announces “Ledger verified with N entries” or “Ledger compromised at entry #X, reason …”.

## Content and microcopy
### Global
- **Snackbar success** – “Receipt saved”, “Mileage saved”, “Category added”, “Export created”, “Backup complete”.  
- **Snackbar error** – reuse existing messages (save error, export error, backup error).  

### ReceiptDetailScreen
- **Edit button** – **Edit**  
- **History button** – **History** (icon + label)  
- **Save button** – **Save receipt**  
- **Field labels** – Photo (optional), Amount, Date, Category, Type, Notes.  
- **OCR loading** – “Analyzing receipt…”  
- **OCR no‑data alert** – “No details could be extracted – please enter manually.”  

### ReceiptHistoryScreen
- **Screen title** – **Receipt history**  
- **Empty state title** – *No changes yet*  
- **Empty state description** – *This receipt has never been edited.*  
- **Back button** – **Back**  

### MileageHistoryScreen
- **Screen title** – **Mileage history** (same empty‑state copy).  

### SettingsScreen
- **Ledger status card title** – **Ledger verification**  
- **Verified text** – “Verified · {entryCount} entries · intact” (green check icon).  
- **Compromised text** – “⚠ Ledger corrupted at entry #{firstBadSeq}: {reason}”.  
- **Verify export button** – **Verify export**  

### VerifyExportScreen
- **Tab / toggle labels** – **Pick CSV file**, **Enter PDF code**  
- **Pick file button** – **Pick CSV**  
- **Code input label** – **Verification code**  
- **Check button** – **Check**  
- **Result messages**:  
  - Success: “Export verified. {entries} entries exported on {date}. No changes after export.”  
  - File altered: “File hash does not match export. The CSV was modified after export.”  
  - Code not found: “Code not found in this app’s export history.”  
  - No matching export: “No export with this verification code exists.”  

### VerificationStatus component
- **Verified badge** – green check icon + “Verified”.  
- **Compromised badge** – red warning icon + “Compromised”.  

All copy follows title case for actions, sentence case for body text, and avoids jargon. Autocomplete & keyboard types are set appropriately (numeric for amount, date picker for dates, etc.). Validation runs on blur and on submit, moving focus to the first invalid field. The UI meets the quality bar: clear visual hierarchy, generous 8 dp whitespace, restrained palette with a single accent, consistent type scale, cards grouping related content, icons where they improve scanning, and a polished look on both mobile and desktop breakpoints.  

---  
**End of DESIGN.md**
