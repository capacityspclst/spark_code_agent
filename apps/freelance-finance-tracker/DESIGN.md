# Freelance Finance Tracker – UI/UX DESIGN

---

## Users and goal
- **Who:** Independent freelancers & contractors who need a quick way to record business expenses (receipts) and mileage, view a financial summary, and export tax‑ready reports.  
- **One job they come to do:** Capture a receipt or mileage entry, instantly see its impact on the dashboard, and download a PDF/CSV for tax filing.  
- **Success feels like:** “I added a receipt in 30 seconds, my dashboard updated instantly, and I can download a ready‑to‑file PDF without any extra steps.”

---

## Primary flow
| Step | Action | Result |
|------|--------|--------|
| 1 | **Sign‑up** – email, password, “Create account” | Account created, auto‑login, lands on Dashboard |
| 2 | **Log‑in** – email + password, “Log in” | JWT stored, redirected to Dashboard |
| 3 | **Dashboard** – totals for income, expenses, mileage deduction, per‑month breakdown | Primary navigation (bottom tab on mobile, top bar on desktop) visible |
| 4a | **Add receipt** – tap FAB “Add Receipt” → Receipt Upload form | Form with image picker, amount, date, vendor, category |
| 4b | **Submit receipt** – “Upload receipt” → loading → success toast → receipt list updates | Dashboard totals refresh |
| 5a | **Add mileage** – tap FAB “Add Mileage” → Mileage form | Form with date, start‑location, end‑location, distance, purpose |
| 5b | **Submit mileage** – “Save mileage” → loading → success toast → mileage list updates | Dashboard totals refresh |
| 6 | **Export** – from Dashboard tap “Export PDF” / “Export CSV” → file download | Export begins, toast confirms |
| 7 | **Log out** – via header menu “Log out” | JWT cleared, returns to Log‑in screen |

*Every screen always shows the primary navigation, so the user is never stranded.*

---

## Screens and states

### 1. Sign‑up
| State | UI |
|-------|----|
| Default | Email, password, confirm‑password fields; “Create account” button (enabled). |
| Validation error | Inline error under the field (e.g., “Invalid email address.”). |
| Loading | Button shows spinner, disabled. |
| Server error | Banner “Unable to create account. Please try again later.” |
| Success | Auto‑login → Dashboard. |

### 2. Log‑in
| State | UI |
|-------|----|
| Default | Email, password fields; “Log in” button. |
| Invalid credentials | Inline error below password: “Incorrect email or password.” |
| Loading | Button spinner, disabled. |
| Server error | Banner “Login failed. Please try again.” |
| Success | → Dashboard. |

### 3. Dashboard
| State | UI |
|-------|----|
| Loading | Full‑screen spinner, “Loading summary…” (aria‑live). |
| Empty | “No data yet. Add a receipt or mileage to get started.” + CTA “Add Receipt”. |
| Error | Banner “Failed to load data. Retry.” |
| Normal | Four summary **cards** (Income, Expenses, Mileage deduction, Net) plus a per‑month bar chart. |
| Offline | Top banner “You’re offline – data will sync when back online.” |
| Success toast | “Export PDF started”, “Receipt uploaded”, etc. |

### 4. Receipts list
| State | UI |
|-------|----|
| Loading | Skeleton placeholders for cards. |
| Empty | “You haven’t added any receipts yet.” + button “Add Receipt”. |
| Error | Banner “Unable to fetch receipts.” |
| Normal | Scrollable **cards**: thumbnail, vendor, amount, date, category, delete (trash icon). |
| Delete confirm | Modal: “Delete this receipt?” – buttons “Cancel”, “Delete”. |
| Delete loading | Delete icon replaced with spinner. |
| Offline | Banner “Offline – changes will sync later.” |

### 5. Receipt Upload form
| State | UI |
|-------|----|
| Default | Image picker, amount, date picker, vendor, category dropdown, “Upload receipt” button. |
| Field error | Inline error under the offending field. |
| Loading | Button spinner, whole form disabled. |
| Success | Toast “Receipt added successfully!” → navigate back to Receipts list. |
| Server error | Banner “Upload failed. Please try again.” |
| Permission denied (mobile) | Dialog: “Camera access is required to take photos. Open settings?” |

### 6. Mileage list
Identical states to **Receipts list** (fields: date, start, end, distance, purpose).

### 7. Mileage entry form
Same states as Receipt Upload form, fields adapted for mileage.

### 8. Export screen (accessed from Dashboard)
| State | UI |
|-------|----|
| Default | Two large buttons: “Export PDF” (primary), “Export CSV” (secondary). |
| Loading | Button shows spinner, disabled. |
| Success | Toast “PDF download started”. |
| Error | Banner “Export failed. Try again.” |

---

## Layout
| Device | Width | Structure |
|--------|------|------------|
| **Mobile** (≥ 390 px) | 390 px | **Header** (logo left, avatar right) → **Main** (single column) → **Bottom Nav** (fixed). All cards & inputs stretch 100 % width with 16 px side padding. Touch targets ≥ 44 × 44 px. No horizontal scroll (`overflow-x: hidden`). |
| **Desktop** (≥ 1280 px) | 1280 px | **Header Nav** (brand + links) → **Main** centered, max‑width 960 px, grid gaps 24 px. Bottom nav hidden. Dashboard cards in a 2 × 2 grid; larger screens allow up to 4 columns for receipt/mileage lists. |

**Grid used for lists & dashboard cards**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: var(--space-24);
```

**Header** – height 56 px, flex‑centered.  
**Bottom Nav** – height 56 px, fixed to viewport bottom, background `var(--c-bg)`, top border `1px solid var(--c-divider)`.  
**Content** – vertical spacing follows the 4/8 px scale (8 px base).  
All overflow is vertical only.

---

## Design tokens
> **Plain CSS** – paste into `src/index.css` (or a global stylesheet).  
> All colors meet WCAG AA contrast requirements (see Contrast pairs table).

```css
/* ---------- Core palette ---------- */
:root {
  /* Backgrounds & surfaces */
  --c-bg:               #FFFFFF;   /* page & card background */
  --c-surface:          #FFFFFF;   /* same as bg for cards */
  --c-surface-disabled:#F5F5F5;   /* disabled input background */
  --c-btn-disabled-bg: #E0E0E0;   /* disabled button background */
  --c-offline-bg:       #FFF9C4;   /* offline banner background */
  --c-divider:          #E0E0E0;   /* borders & dividers */

  /* Core colors */
  --c-primary:          #0066FF;   /* accent & active nav */
  --c-primary-hover:    #0054CC;   /* button hover */
  --c-primary-active:   #0044AA;   /* button active */
  --c-on-primary:       #FFFFFF;   /* text / icons on primary */

  --c-success-bg:       #1E7C33;   /* success toast background */
  --c-on-success:       #FFFFFF;   /* text on success bg */

  --c-error-bg:         #212121;   /* error toast background */
  --c-on-error:         #FFFFFF;   /* text on error bg */
  --c-error-text:       #D32F2F;   /* inline form error text */

  /* Text colors */
  --c-on-surface:       #212121;   /* primary body text */
  --c-on-surface-secondary:#6D6D6D;/* secondary/placeholder/disabled text */
  --c-link:             var(--c-primary); /* links */
  --c-nav-active:       var(--c-primary); /* active nav icons/labels */
  --c-nav-inactive:     var(--c-on-surface-secondary); /* inactive nav */

  /* Typography */
  --font-base:          'Inter', system-ui, sans-serif;
  --size-12:            0.75rem;   /* 12 px */
  --size-14:            0.875rem;  /* 14 px */
  --size-16:            1rem;      /* 16 px */
  --size-20:            1.25rem;   /* 20 px */
  --size-24:            1.5rem;    /* 24 px */
  --size-32:            2rem;      /* 32 px */

  /* Spacing (4/8 px) */
  --space-4:   4px;
  --space-8:   8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;

  /* Radii */
  --radius-8: 8px;

  /* Elevation */
  --elevation-card: 0 2px 4px rgba(0,0,0,0.1);

  /* Focus */
  --focus-ring: 2px solid var(--c-primary);
}

/* Global focus style */
:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

/* Reduced motion guard */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

## Components

### Button
| Variant | Appearance | States (default → hover → focus-visible → active → disabled → loading) |
|---------|------------|---------------------------------------------------|
| **Primary** | Filled `var(--c-primary)` background, `var(--c-on-primary)` label. | `bg-primary` → `bg-primary-hover` → `--focus-ring` → `bg-primary-active` → opacity 0.5 / `cursor:not-allowed` → spinner replaces label |
| **Secondary** | Transparent background, `1px solid var(--c-primary)` border, label `var(--c-primary)`. | Border darken on hover, `--focus-ring`, subtle background tint on active, disabled (opacity 0.5, `border-color: var(--c-divider)`), loading (spinner). |
| **Disabled** | Same colors as variant but 50 % opacity, no pointer events. |
| **Loading** | Spinner (`LoadingSpinner`) replaces label; button size unchanged. |
| **Size** | Height 48 px, min‑width 120 px, horizontal padding `var(--space-12) var(--space-16)`. |
| **Touch target** | ≥ 44 × 44 px (height already meets requirement). |
| **Typography** | `font-size: var(--size-16); font-weight: 500;` |

### Floating Action Button (FAB)
- Circular, 56 px diameter, background `var(--c-primary)`, white “+” icon (or context‑specific icon).  
- **States:** default → hover (`box-shadow: 0 4px 8px rgba(0,0,0,0.15)`), focus-visible (`--focus-ring`), active (background `var(--c-primary-active)`), disabled (opacity 0.4).  
- **Touch target:** 56 × 56 px (covers required 44 × 44 px).

### InputField (text, number, date)
- **Structure:** `<label>` (visible) → `<input>` (or `<textarea>`).  
- **Base:** Height 48 px, padding `var(--space-12)`, border `1px solid var(--c-divider)`, border‑radius `var(--radius-8)`.  
- **States:**  
  - *default*: border `var(--c-divider)`  
  - *focus-visible*: border `var(--c-primary)`, `--focus-ring`  
  - *error*: border `var(--c-error-text)`, `aria-invalid="true"` and error message below (`font-size: var(--size-12)`, color `var(--c-error-text)`)  
  - *disabled*: background `var(--c-surface-disabled)`, text `var(--c-on-surface-secondary)`, `cursor:not-allowed`  
- **Typography:** `font-size: var(--size-16);`

### Select / Dropdown
- Styled identically to InputField, with a right‑aligned chevron (`aria-hidden`). Same states as InputField.

### Card
- Background `var(--c-surface)`, border‑radius `var(--radius-8)`, box‑shadow `var(--elevation-card)`.  
- Padding `var(--space-16)`.  
- **States:** default; hover → subtle upward translate `transform: translateY(-2px)`; focus-visible → `--focus-ring`.

### ListItem (Receipt / Mileage)
- Implemented as a Card with internal grid: left area (thumbnail or icon, 56 × 56 px), right area (stacked text).  
- Delete button: 44 × 44 px hit area, trash icon (white on `var(--c-error-text)` when hovered).  
- **States:** default; hover → background `var(--c-divider)`; focus-visible → `--focus-ring` on whole item; delete button hover/active with error color (`var(--c-error-text)`).

### HeaderNav (desktop)
- Flex container, height 56 px, background `var(--c-bg)`.  
- Left: logo text “Freelance Finance Tracker”.  
- Center: navigation links (`<a>`).  
- Right: user avatar (opens dropdown menu).  
- Links: default `var(--c-on-surface-secondary)`, active `var(--c-primary)`, hover `var(--c-primary-hover)`.  
- Focus: `--focus-ring`.

### BottomNav (mobile)
- Fixed to viewport bottom, height 56 px, background `var(--c-bg)`, top border `1px solid var(--c-divider)`.  
- Four `<button>` tabs, each with an icon and label stacked vertically.  
- Active tab: icon & label `var(--c-primary)`. Inactive: `var(--c-nav-inactive)`.  
- **States:** hover, focus-visible (`--focus-ring`).

### Modal / Dialog
- Backdrop: `rgba(0,0,0,0.4)`.  
- Centered modal card: `var(--c-bg)`, radius `var(--radius-8)`, max‑width 480 px, padding `var(--space-24)`.  
- **Header:** Title using `var(--size-20)`, color `var(--c-on-surface)`.  
- **Body:** Scrollable if content overflows.  
- **Footer actions:** Primary button (confirm), secondary button (cancel).  
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, focus trap, initial focus on first focusable element, `Esc` closes.

### Toast
- Fixed top‑center, max‑width 320 px, margin `var(--space-12)`.  
- **Success:** background `var(--c-success-bg)`, white text, check‑mark icon (`aria-hidden`).  
- **Error:** background `var(--c-error-bg)`, white text, error icon.  
- Slides in from top (transform animation) respecting `prefers-reduced-motion`.  
- Auto‑dismiss after 4 s; `role="status"` with `aria-live="polite"`.

### LoadingSpinner
- 24 px SVG circle, stroke `var(--c-primary)`.  
- Rotates via CSS keyframes; animation disabled when `prefers-reduced-motion`.  
- `role="status"` and `aria-live="polite"`.

### Touch Target Guidelines
All interactive elements (buttons, list‑item delete icons, navigation tabs, form controls) have a minimum hit area of **44 × 44 px**. Visual padding may be smaller, but the invisible hit box must meet the size requirement.

## Accessibility

| Guideline | Implementation |
|-----------|----------------|
| **Landmarks** | `<header>`, `<nav aria-label="Main navigation">` (top bar or bottom tab bar), `<main>`, optional `<footer>`. |
| **Heading hierarchy** | Exactly one `<h1>` per page (e.g., “Dashboard”, “Receipts”). Subsequent sections use `<h2>` for cards, `<h3>` for list headings. No skipped heading levels. |
| **Form labeling** | Every `<input>`/`<select>` has a visible `<label for="…">`. Labels are never placeholder‑only. `autocomplete` attributes set (`email`, `new-password`, `current-password`, `off` for numeric fields). |
| **Icon‑only buttons** | Include descriptive `aria-label` (e.g., `<button aria-label="Delete receipt">`). Decorative icons have `aria-hidden="true"`. |
| **Focus management** | Global `:focus-visible { outline: var(--focus-ring); }`. Modal dialogs trap focus; on open, focus moves to the first focusable element. On close, focus returns to the element that triggered the dialog. `Esc` closes dialogs and toasts. |
| **Keyboard navigation** | All controls reachable via Tab; Space/Enter activate buttons; Arrow keys can navigate list items if needed. |
| **Reduced motion** | Non‑essential animations (toast slide, card hover lift, spinner rotation) are wrapped in `@media (prefers-reduced-motion: reduce) { animation: none; }`. |
| **Alt text & image semantics** | Receipt thumbnails get meaningful `alt` text (e.g., “Receipt from Acme Corp – 2023‑09‑15”). Icons that convey meaning have `aria-label`; purely decorative icons have `aria-hidden`. |
| **No color‑only cues** | Errors show red text **and** an error message; success confirmations include a check icon plus text; disabled state includes visual dimming **and** `aria-disabled="true"`. |
| **Live regions** | Loading spinners, error banners, and success toasts use `role="status"` (polite) or `role="alert"` (assertive) with appropriate `aria-live`. |
| **Contrast compliance** | All foreground/background pairs listed in the **Contrast pairs** table meet WCAG AA (≥ 4.5:1 normal text, ≥ 3:1 UI). |
| **ARIA roles** | Buttons use default `role="button"`; navigation tabs use `role="tablist"`/`role="tab"`; receipt list uses `role="list"`/`role="listitem"`; dialogs use `role="dialog"` with `aria-labelledby` and `aria-describedby`. |
| **Error handling** | Invalid fields receive `aria-invalid="true"`; error messages linked via `aria-describedby`; focus moves to first invalid field after submit. Submit button never silently disabled – it shows a loading spinner instead. |

## Content and microcopy

| UI Element | Copy |
|------------|------|
| **App name** | “Freelance Finance Tracker” |
| **Tagline (auth screens)** | “Track expenses & mileage in seconds – get tax‑ready reports.” |
| **Sign‑up heading** | `<h1>Create your account</h1>` |
| **Log‑in heading** | `<h1>Welcome back</h1>` |
| **Form field labels** | Email, Password, Confirm password, Amount (USD), Date, Vendor, Category, Start location, End location, Distance (miles), Purpose (optional). |
| **Field placeholders** | “you@example.com”, “Create password”, “Repeat password”, “12.34”, “2023‑09‑15”, “Acme Corp”, “Office, Travel, Supplies”, “123 Main St”, “456 Oak Ave”, “34.2”, “Client meeting (optional)”. |
| **Button labels** | “Create account”, “Log in”, “Add Receipt”, “Upload receipt”, “Add Mileage”, “Save mileage”, “Export PDF”, “Export CSV”, “Cancel”, “Delete”. |
| **Input error messages** | “Please enter a valid email.”, “Password must be at least 8 characters.”, “Passwords do not match.”, “Amount must be a positive number.”, “Date is required.”, “All fields are required.” |
| **Server error banner** | “Something went wrong. Please try again later.” |
| **Empty receipt list** | “You haven’t added any receipts yet.” |
| **Empty mileage list** | “No mileage entries recorded yet.” |
| **Empty dashboard** | “No data yet. Add a receipt or mileage to start tracking.” |
| **Success toasts** | “Receipt added successfully!”, “Mileage saved!”, “PDF download started.” |
| **Delete confirmation modal** | Title: “Delete receipt?”<br>Body: “This action cannot be undone.” |
| **Offline banner** | “You’re offline – changes will sync when you’re back online.” |
| **Navigation labels (bottom tab)** | Dashboard, Receipts, Mileage, Export |
| **Header avatar menu** | “Profile”, “Log out” |
| **Export button tooltips** | “Download a PDF ready for tax filing”, “Download CSV for accounting software” |
| **Loading spinner accessible label** | `aria-label="Loading"` (visually hidden). |
| **Toast accessibility** | `role="status"` with `aria-live="polite"` – no extra copy needed. |
| **Help text (receipt upload)** | “You can take a photo or select a file from your library.” |
| **Mileage rate hint** | “Current rate: $0.58 per mile (U.S. IRS standard).” |
| **Password rules (sign‑up)** | “8+ characters, at least one number, one uppercase letter.” |
| **Link to switch auth mode** | Under sign‑in: “Don’t have an account? Create one.”<br>Under sign‑up: “Already have an account? Log in.” |
| **File input description** | “Supported formats: JPG, PNG, PDF. Max size 5 MB.” |
| **Date picker instruction** | “Select the date the receipt was issued.” |
| **Export description (dashboard)** | “Generate a PDF or CSV of all your financial data for the selected period.” |

All copy uses a clear, friendly tone, imperative verbs for actions, and avoids jargon. Errors are specific and actionable; empty‑states always include a call‑to‑action. Icons are accompanied by text where they aid scanning, ensuring equivalent information for screen‑reader users.
