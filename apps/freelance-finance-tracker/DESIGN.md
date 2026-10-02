# DESIGN.md

## Users and goal
**Primary user** – Freelance professionals (designers, writers, developers, consultants) who need a quick, secure way to record business expenses and mileage for tax reporting.  
**One job** – After signing in, the user records a receipt or mileage entry, sees an up‑to‑date dashboard summary, and exports a tax‑ready CSV or PDF.  
**Success** – The new entry appears instantly on the dashboard, the totals are correct, and the export file downloads without error.

---

## Primary flow
1. **Open app** – the app lands on the **Login** screen.  
2. **Authenticate** – enter email + password → tap **Log In** (or tap **Sign Up** to register).  
3. **Dashboard** – after token verification the **Dashboard** loads with four summary cards.  
4. **Add receipt** – tap **Upload Receipt** → choose/take a photo → enter *Amount* → optional *Date* → tap **Save**.  
5. **Add mileage** – tap **Add Mileage** → fill *Date*, *Distance (km)*, *Description* → tap **Save**.  
6. **Review** – dashboard cards update instantly; the new receipt and mileage appear in their respective lists.  
7. **Export** – tap **Export CSV** or **Export PDF** → file download starts.  
8. **Log out** – tap avatar → **Log out** returns to the **Login** screen.  

All steps are required; any optional navigation (e.g., viewing a full list) is outside the shortest path.

---

## Screens and states

| Screen | State | UI elements | Exact message |
|--------|-------|-------------|---------------|
| **Login** | Default | Email, Password inputs, **Log In** button, **Sign Up** link | – |
| | Loading | Button spinner, inputs disabled | “Logging in…” |
| | Error | Inline banner (red) | “Invalid email or password.” |
| | Validation | Inline field errors | “Please enter a valid email.” / “Password required.” |
| **Register** | Same as Login, plus **Confirm Password** field | Success banner | “Account created – you can now log in.” |
| **Dashboard** | Default | Header, 4 summary cards, **Upload Receipt**, **Add Mileage**, **Export CSV**, **Export PDF**, avatar menu | – |
| | Loading | Skeleton cards, overlay spinner | “Loading summary…” |
| | Empty data | Card text “0” and description “No receipts yet.” etc. | – |
| | Offline | Top banner (yellow) | “You appear offline – data may be stale.” |
| **Receipt Upload** | Default | Image preview, *Amount* field, *Date* picker, **Save**, **Cancel** | – |
| | Loading (upload) | Button spinner, inputs disabled | “Uploading receipt…” |
| | Error | Inline banner | “Failed to upload receipt. Please try again.” |
| | Empty (no file) | **Save** disabled | – |
| **Mileage Entry** | Default | *Date*, *Distance (km)*, *Description* fields, **Save**, **Cancel** | – |
| | Loading | Button spinner | “Saving mileage…” |
| | Error | Inline banner | “Could not save mileage. Check your connection.” |
| **Export** | Default | **Export CSV**, **Export PDF** buttons | – |
| | Loading | Button spinner, other button disabled | “Generating file…” |
| | Error | Inline banner | “Export failed. Please try again.” |
| **Global** | 500 error | Full‑screen modal | “Something went wrong. Please reload the page.” |
| | Success toast | Top‑right toast | “Saved successfully.” |
| | Error toast | Top‑right toast | “Operation failed. Please try again.” |
| | Keyboard open (mobile) | Bottom safe‑area padding 16 px | – |
| | Long text (receipt description > 30 chars) | Truncate with ellipsis; tap opens modal | – |
| | Many items (≥ 10) | List scrolls; header sticky | – |

All screens are reachable via the top AppBar (mobile: hamburger → optional drawer; desktop: visible tabs). No horizontal scrolling on phone.

---

## Layout
**Mobile‑first (≥ 390 px)**  
- Width: 100 vw, max‑content‑width = 390 px.  
- Single column.  
- Header (56 px) fixed top; content below.  
- Summary cards stack vertically, 16 px vertical gap.  
- Buttons full‑width (minus 16 px side padding).  
- Lists scroll vertically; no horizontal overflow.

**Desktop (≥ 1280 px)**  
- Content centered, max‑width = 1120 px.  
- Header height 64 px.  
- Dashboard cards in a 2 × 2 grid, gutter 24 px.  
- When width ≥ 960 px, receipt and mileage lists sit side‑by‑side in a 2‑column grid.  
- Sidebar not used; navigation stays in AppBar.

**Grid**  
- Mobile: 4‑column 8 px grid for internal spacing.  
- Desktop: 12‑column 24 px grid for breakpoints.

**Touch targets** – minimum 44 × 44 px.  
**Images** – receipt thumbnails maintain 4:3 aspect, max‑width 100 %.  
**No side‑scroll** on any mobile viewport.

---

## Design tokens
```css
:root {
  /* Palette */
  --color-primary: #006D77;               /* Teal – primary actions */
  --color-primary-contrast: #FFFFFF;      /* Text on primary */
  --color-secondary: #EF8354;             /* Orange – secondary outline */
  --color-success: #006400;               /* Dark green – success */
  --color-error: #D6001C;                 /* Red – error */
  --color-background: #FAFAFA;           /* Page background */
  --color-surface: #FFFFFF;               /* Cards, modals */
  --color-muted: #F5F5F5;                 /* Disabled surfaces */
  --color-disabled-bg: #F5F5F5;           /* Disabled button bg */
  --color-disabled-fg: #222222;           /* Disabled button label */
  --color-disabled-input-fg: #4A4A4A;     /* Disabled input text */
  --color-text-primary: #222222;          /* Body text */
  --color-text-muted: #555555;            /* Placeholder / secondary text */
  --color-text-inverse: #FFFFFF;          /* Text on dark surfaces */
  --color-text-secondary: #006D77;        /* Links & secondary button text */
  --color-border: #E0E0E0;                /* Input & card borders */
  --color-icon-secondary: #222222;        /* Accent icon on secondary button */

  /* Typography */
  --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-size-base: 16px;
  --font-size-h1: 48px;
  --font-size-h2: 32px;
  --font-size-h3: 24px;
  --font-size-h4: 20px;
  --font-size-body: 16px;
  --font-size-sm: 14px;
  --line-height-base: 1.5;

  /* Spacing (4/8 px scale) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;

  /* Elevation */
  --elevation-card: 0 2px 4px rgba(0,0,0,0.1);

  /* Motion */
  --duration-short: 150ms;
  --duration-medium: 300ms;
  --ease-standard: cubic-bezier(0.4,0,0.2,1);

  /* Focus */
  --focus-ring: 2px solid var(--color-primary);
}

/* Contrast pairs – every text/icon color on each background it appears on */
```

### Contrast pairs
| Foreground hex | Background hex | Use | Size |
|----------------|----------------|-----|------|
| #FFFFFF | #006D77 | Primary button label | large |
| #222222 | #FFFFFF | Body text | normal |
| #555555 | #FFFFFF | Placeholder text | normal |
| #222222 | #F5F5F5 | Disabled primary button label | normal |
| #4A4A4A | #F5F5F5 | Disabled input / disabled placeholder | normal |
| #006D77 | #FFFFFF | Secondary button label & links | normal |
| #D6001C | #FFFFFF | Error message text | normal |
| #006400 | #FFFFFF | Success message text | normal |
| #333333 | #FFFFFF | Card titles | normal |
| #555555 | #FFFFFF | Card body text | normal |
| #FFFFFF | #D6001C | Error toast text | normal |
| #FFFFFF | #006400 | Success toast text | normal |
| #222222 | #EF8354 | Accent icon on secondary button | large |
| #FFFFFF | #006D77 | Close (X) icon in modals | UI |
| #222222 | #FAFAFA | Page background body text | normal |
| #555555 | #FAFAFA | Sub‑text on page background | normal |
| #006D77 | #F5F5F5 | Disabled primary button text (if visible) | UI |

All pairs meet WCAG AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI elements).

---

## Components

### AppBar
- `<header role="banner">` with logo, navigation icons, avatar menu.  
- Height: 56 px (mobile) / 64 px (desktop).  
- Touch target ≥ 44 × 44 px.  
- States: default, hover (icon opacity 0.85), focus-visible (focus‑ring on avatar), active (pressed).

### Buttons
| Variant | Background | Text | Border | States (default/hover/focus-visible/active/disabled/loading) |
|--------|------------|------|--------|-------------------------------------------------------------|
| Primary | `var(--color-primary)` | `var(--color-primary-contrast)` | none | Hover: darken 5 %; Focus: `--focus-ring`; Active: darken 10 %; Disabled: `var(--color-disabled-bg)` / `var(--color-disabled-fg)`; Loading: spinner overlay |
| Secondary (outline) | transparent | `var(--color-text-secondary)` | `2px solid var(--color-primary)` | Hover: `var(--color-muted)` background; Focus: `--focus-ring`; Active: same as hover with 0.8 opacity; Disabled: `var(--color-disabled-bg)` / `var(--color-disabled-fg)`; Loading: spinner |
| Danger | `var(--color-error)` | `#FFFFFF` | none | Same as Primary but red palette |
| Text/Link | transparent | `var(--color-primary)` | none | Hover: underline; Focus: `--focus-ring`; Disabled: `#A0A0A0` (non‑interactive) |

- Size: height 48 px, min‑width 120 px, padding `0 var(--space-4)`.  
- Icon‑only button: 44 × 44 px hit area, SVG fill follows the button’s text color.

### Input fields
- Types: text, email, password, number, date, file.  
- Base: `1px solid var(--color-border)`, radius `var(--radius-sm)`, padding `var(--space-2) var(--space-3)`.  
- **States**:  
  - Default.  
  - Hover: border `var(--color-primary)`.  
  - Focus-visible: `--focus-ring`.  
  - Disabled: background `var(--color-disabled-bg)`, text `var(--color-disabled-fg)`.  
  - Error: border `var(--color-error)`, error message below.  
- File input: hidden native control, custom primary button triggers it.

### Card (Receipt / Mileage entry)
- Background `var(--color-surface)`, box‑shadow `var(--elevation-card)`, radius `var(--radius-md)`.  
- States: default, hover (elevate to `0 4px 8px rgba(0,0,0,0.12)`), focus-visible (`--focus-ring`), selected (border `var(--color-primary)`).  
- Action icons (delete/edit) 44 × 44 px, appear on hover.

### Summary Card (Dashboard)
- Same visual as Card, larger title (`var(--font-size-h3)`).  
- Background `var(--color-muted)` when data is missing.

### Modal / Dialog
- Overlay `rgba(0,0,0,0.4)`.  
- Container max‑width 480 px, radius `var(--radius-md)`.  
- Close icon 44 × 44 px, color `var(--color-text-inverse)` on `var(--color-primary)`.  
- Focus trap and return‑focus behavior.

### Toast
- Top‑right, padding `var(--space-3)`, radius `var(--radius-sm)`.  
- Background: success `var(--color-success)`, error `var(--color-error)`.  
- Text `var(--color-text-inverse)`.  
- Auto‑dismiss after 4 s, `role="status"` with `aria-live="polite"`.

### Avatar menu
- Circle 40 px, click opens dropdown list of actions (Log out).  
- Dropdown items have height 48 px, hover background `var(--color-muted)`.

All components respect the 4 / 8 px spacing system and have touch targets ≥ 44 × 44 px.

---

## Accessibility
- **Landmarks**: `<header role="banner">`, `<nav aria-label="Primary navigation">`, `<main role="main">`, `<footer role="contentinfo">`.  
- **Headings**: one `<h1>` (“Freelance Finance Tracker”) per page; subsequent headings follow logical order (`<h2>` Dashboard, `<h3>` Receipts, etc.).  
- **Labels**: Every `<input>` has a `<label>` (`for`/`id`). Icon‑only buttons have `aria-label` (e.g., “Upload receipt image”, “Delete receipt”).  
- **Focus**: Visible focus ring (`--focus-ring`) on all focusable elements; focus order is logical; focus is trapped in modals.  
- **Keyboard**: All interactions reachable via Tab; Enter activates primary actions; Escape closes dialogs.  
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` disables non‑essential transitions.  
- **Alt text**: Receipt thumbnails use `alt="Receipt preview – {date}"`; decorative icons set `aria-hidden="true"`.  
- **No color‑only meaning**: Errors show an icon + text; disabled state shows lowered opacity plus text color change; success shows a check icon.  
- **ARIA live regions**: Toasts use `role="status"` with `aria-live="polite"`.

---

## Content and microcopy
- **Login**  
  - Heading: “Welcome back”  
  - Email placeholder: “you@example.com”  
  - Password placeholder: “Enter your password”  
  - Button: **Log In**  
  - Link: “Don’t have an account? **Sign Up**”

- **Register**  
  - Heading: “Create your account”  
  - Email placeholder: “you@example.com”  
  - Password placeholder: “Create a password (min 8 chars)”  
  - Confirm password placeholder: “Repeat password”  
  - Button: **Sign Up**  

- **Dashboard**  
  - Card titles: “Receipts”, “Total Amount”, “Mileage (km)”, “Estimated Reimbursement”  
  - Empty receipt text: “No receipts uploaded yet. Tap **Upload Receipt** to get started.”  
  - Empty mileage text: “No mileage entries recorded. Use **Add Mileage** to log trips.”  

- **Receipt Upload**  
  - Heading: “Add a receipt”  
  - File button label: “Choose image”  
  - Amount placeholder: “e.g. 45.67”  
  - Date placeholder: “Auto‑detect or select date”  
  - Buttons: **Save**, **Cancel**  

- **Mileage Entry**  
  - Heading: “Log mileage”  
  - Date placeholder: “Select date”  
  - Distance placeholder: “Enter km (e.g. 12.5)”  
  - Description placeholder: “Trip purpose (optional)”  
  - Buttons: **Save**, **Cancel**  

- **Export**  
  - Heading: “Export your data”  
  - Buttons: **Export CSV**, **Export PDF**  
  - Tooltip CSV: “Comma‑separated values, ready for spreadsheets”  
  - Tooltip PDF: “Formatted PDF for tax filing”  

- **Toasts**  
  - Success: “Saved successfully.”  
  - Error: “Operation failed. Please try again.”  

- **Error banners**  
  - Network: “Unable to reach the server. Check your connection.”  
  - Validation: “All required fields must be filled.”  

All copy uses sentence case for button labels, plain language, and avoids jargon.

--- 

*End of DESIGN.md*
