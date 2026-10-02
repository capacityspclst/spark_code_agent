# DESIGN.md

## Users and goal
**Who:** Independent freelancers (writers, designers, developers, consultants) who receive client payments and need to track expenses, mileage, and generate tax‑ready reports.  
**One job they come to do:** Record a receipt or mileage entry, see an up‑to‑date financial summary, and export a PDF/CSV that can be handed to an accountant.  
**Success feels like:** “My dashboard instantly shows total income, expenses, and miles; the receipt I just photographed is listed; I can click Export and get a ready‑to‑file report without error.”

## Primary flow
1. Open the app → JWT check.  
2. No token → show **Log in** (link to **Create account**).  
3. Enter credentials → backend validates, returns JWT → store in `localStorage` → redirect to Dashboard.  
4. Dashboard shows summary cards and recent entries.  
5. **+ Receipt** → Receipt Upload screen → fill fields → Submit → success toast → return to Dashboard.  
6. **+ Mileage** → Mileage Entry screen → fill fields → Submit → success toast → return to Dashboard.  
7. **Export PDF** / **Export CSV** → loading spinner → file download → success toast.  
8. Logout icon → clear JWT → return to Log in.

## Screens and states

| Screen | State | UI elements | Exact message |
|--------|-------|-------------|---------------|
| **Login** | Default | Email, Password, **Log in**, **Create account** link | – |
| | Loading | Inputs disabled, spinner in button | “Signing in…” |
| | Error | Form shake, red banner | “Invalid email or password.” |
| | Success | Redirect to Dashboard | – |
| **Register** | Default | Name, Email, Password, Confirm Password, **Create account**, **Log in** link | – |
| | Loading | Disabled, spinner | “Creating account…” |
| | Error | Inline field errors, red banner | “Email already in use.” |
| **Dashboard** | Default | 4 summary cards, recent list, **+ Receipt**, **+ Mileage**, **Export PDF**, **Export CSV**, logout icon | – |
| | Loading | Full‑screen spinner | “Loading your finance data…” |
| | Empty | Illustration + text | “No receipts or mileage logged yet. Tap + Receipt or + Mileage to start.” |
| | Error (API) | Red banner | “Failed to load data. Retry.” |
| **Receipt Upload** | Default | Image dropzone, Amount, Date, Category, Notes, **Save receipt**, Cancel | – |
| | Loading | Disabled, spinner in button | “Saving receipt…” |
| | Validation error | Inline errors, red banner | “Please fill required fields.” |
| | Success | Toast | “✅ Receipt saved.” |
| **Mileage Entry** | Default | Date picker, Miles, Purpose, Notes, **Save mileage**, Cancel | – |
| | Loading | Disabled, spinner | “Saving mileage…” |
| | Validation error | Inline errors, red banner | “Please enter a numeric mileage.” |
| | Success | Toast | “✅ Mileage saved.” |
| **Export** (triggered from Dashboard) | Loading | Buttons disabled, overlay spinner | “Generating PDF…” / “Generating CSV…” |
| | Success | Toast | “✅ Export downloaded.” |
| | Error | Red banner | “Export failed. Try again.” |
| **404 Not Found** | Default | Large heading, description, link back to Dashboard | “Page not found. Return to Dashboard.” |

All screens are reachable via React Router; illegal routes render the 404 screen.

## Layout
**Mobile‑first (≥ 390 px)**  
- Fixed 44 px high **AppBar** (primary background).  
- `<main>` padded `var(--space-16)` left/right, vertical scroll only.  
- Buttons and tap targets ≥ 44 × 44 px.  

**Desktop (≥ 1280 px)**  
- Max content width `1120px`, centered.  
- Dashboard grid: 4 summary cards in one row (`calc(25% - var(--space-8))`).  
- Below: two‑column layout – recent entries (70 %) left, quick‑action panel (30 %) right with **+ Receipt**, **+ Mileage**, **Export**.  
- Forms constrained to `480px` width and centered.  

**Grid & spacing**  
- Mobile: 4‑column flexible grid for full‑width labels/inputs.  
- Desktop: 8‑column grid (Bootstrap‑like).  
- No horizontal overflow; receipt thumbnails max‑width 100 % height auto.

## Design tokens
```css
:root {
  /* Primary palette */
  --color-primary:          #0A6ED1;   /* main action */
  --color-primary-hover:    #0066B3;   /* hover */
  --color-primary-active:   #00509E;   /* active */
  --color-accent:           #1565C0;   /* secondary action */
  --color-accent-hover:     #0D47A1;
  --color-accent-active:    #0B3C8F;
  --color-success:          #2E7D32;   /* success toast / banner */
  --color-error:            #C62828;   /* error toast / banner */
  --color-background:       #F5F5F5;   /* page background */
  --color-surface:          #FFFFFF;   /* cards, modals, inputs */
  --color-surface-elevated: #FAFAFA;   /* hover rows, elevated cards */
  --color-overlay:          rgba(0,0,0,0.5);

  /* Text */
  --color-text-primary:    #212121;   /* main body */
  --color-text-secondary:  #595959;   /* secondary / help */
  --color-placeholder:     #6D6D6D;   /* input placeholder */
  --color-text-disabled:   #5A5A5A;   /* disabled controls */
  --color-link:            var(--color-primary);

  /* Semantic colors for UI */
  --color-white:           #FFFFFF;
  --color-border:          #757575;

  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-12: 0.75rem;   /* 12px */
  --font-size-14: 0.875rem;  /* 14px */
  --font-size-16: 1rem;      /* 16px */
  --font-size-18: 1.125rem;  /* 18px */
  --font-size-20: 1.25rem;   /* 20px */
  --font-size-24: 1.5rem;    /* 24px */
  --font-size-32: 2rem;      /* 32px */
  --line-height-base: 1.5;

  /* Spacing (4/8 px scale) */
  --space-0: 0;
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-40: 40px;
  --space-48: 48px;

  /* Shape */
  --radius-4: 4px;
  --radius-8: 8px;
  --radius-12: 12px;

  /* Elevation */
  --elevation-1: 0 2px 4px rgba(0,0,0,0.1);
}

/* Contrast pairs table (WCAG 2.1 AA) */
```

### Contrast pairs
| foreground hex | background hex | use | size |
|---|---|---|---|
| #212121 | #FFFFFF | Body, headings, card content, input text | normal |
| #212121 | #F5F5F5 | Body text on page background | normal |
| #212121 | #FAFAFA | Text on elevated surfaces (hover rows) | normal |
| #595959 | #FFFFFF | Secondary/help text, form hints | normal |
| #595959 | #F5F5F5 | Secondary text on page background | normal |
| #595959 | #FAFAFA | Secondary text on elevated surfaces | normal |
| #6D6D6D | #FFFFFF | Input placeholder | normal |
| #5A5A5A | #FFFFFF | Disabled input & button label | normal |
| #0A6ED1 | #FFFFFF | Inline links (Create account, Log in) | normal |
| #FFFFFF | #0A6ED1 | Primary button label, AppBar icons | ui |
| #FFFFFF | #0066B3 | Primary button hover label | ui |
| #FFFFFF | #00509E | Primary button active label | ui |
| #FFFFFF | #1565C0 | Accent button label (Export) | ui |
| #FFFFFF | #0D47A1 | Accent button hover label | ui |
| #FFFFFF | #0B3C8F | Accent button active label | ui |
| #FFFFFF | #2E7D32 | Success toast / banner text | ui |
| #FFFFFF | #C62828 | Error toast / banner text | ui |

All pairs achieve ≥ 4.5:1 for normal text and ≥ 3:1 for UI elements (≥ 44 px high); the pipeline confirms compliance.

## Components

**Button**  
- Variants: Primary (`bg var(--color-primary)`), Accent (`bg var(--color-accent)`), Text (transparent).  
- Sizes: Small 44 × 36 px, Medium 44 × 48 px, Large 44 × 56 px (height ≥ 44 px).  
- States: default, `:hover` (bg `var(--color-primary-hover)` / `var(--color-accent-hover)`), `:focus-visible` (2 px outline `var(--color-primary)`), `:active` (bg `var(--color-primary-active)` / `var(--color-accent-active)`), `disabled` (bg `var(--color-surface)`, label `var(--color-text-disabled)`, cursor `not-allowed`), `loading` (spinner replaces label).  

**TextInput**  
- Height 44 px, width 100 %, border 1 px solid `var(--color-border)`, radius `var(--radius-4)`, padding `var(--space-12)`.  
- States: default, `:hover` (border `var(--color-primary)`), `:focus-visible` (outline 2 px solid `var(--color-primary)`), `error` (border `var(--color-error)`), `disabled` (bg `var(--color-surface)`, text `var(--color-text-disabled)`).  
- Placeholder color `var(--color-placeholder)`.  

**TextArea** – same as TextInput, min‑height 80 px, vertical resize only.  

**Select** (Category dropdown) – styled like TextInput, trailing chevron SVG `aria-hidden="true"`. Options panel: max‑height 240 px, overflow‑y auto, elevation `var(--elevation-1)`, radius `var(--radius-4)`.  

**FileDrop** (receipt image) – dashed border `2px dashed var(--color-border)`, radius `var(--radius-8)`, min‑height 120 px, centered instruction text. States: default, `dragover` (border `var(--color-primary)`), `error` (border `var(--color-error)`), `loading` (overlay spinner).  

**Card** – bg `var(--color-surface)`, radius `var(--radius-8)`, box‑shadow `var(--elevation-1)`, padding `var(--space-16)`. Hover: shadow `0 4px 8px rgba(0,0,0,0.12)`.  

**AppBar** – fixed 44 px, full‑width, bg `var(--color-primary)`. Title: `var(--font-size-20)`, white. Logout icon button: 44 × 44 px, `aria-label="Log out"`, white icon.  

**Table** (recent entries) – full‑width, `border-collapse: separate; border-spacing: 0 var(--space-8)`. Row height 44 px, hover bg `var(--color-surface-elevated)`. First column (type icon) 24 px, centered.  

**Modal** (receipt & mileage) – centered, max‑width 480 px, bg `var(--color-surface)`, radius `var(--radius-12)`, shadow `var(--elevation-1)`. Overlay `var(--color-overlay)`, click outside or ESC to close, focus trap active.  

**Toast** – fixed bottom‑center, min‑width 280 px, padding `var(--space-12)`, radius `var(--radius-8)`, bg `var(--color-surface)`, shadow `var(--elevation-1)`. Success variant bg `var(--color-success)`, error variant bg `var(--color-error)`, label white. Auto‑dismiss after 4 s; manual close X button (44 × 44 px).  

**LoadingSpinner** – 24 px diameter, CSS border spinner (`border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite`). Respects `prefers-reduced-motion` (animation disabled).  

All components enforce a minimum touch target of 44 × 44 px.

## Accessibility
- **Landmarks:** `<header>` (AppBar) and `<main>` on every screen.  
- **Heading hierarchy:** Exactly one `<h1>` per view (`Log in`, `Create your FinTrack account`, `Dashboard`, `Add a receipt`, `Log mileage`). Subsequent headings use `<h2>`, `<h3>` in logical order.  
- **Form labeling:** Every `<input>`, `<textarea>`, `<select>` paired with `<label>` using `for`/`id`. Icon‑only buttons (logout, modal close) have `aria-label`.  
- **Error handling:** Invalid fields get `aria-invalid="true"` and `aria-describedby` pointing to an error element inside a live region (`role="alert"`).  
- **Focus management:** Visible focus ring (`outline: 2px solid var(--color-primary)`). Modal open moves focus to first field and traps focus; ESC closes modal.  
- **Keyboard navigation:** Tab order matches DOM order; `Enter` activates buttons; space toggles checkboxes/radios.  
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables spinner animation and other non‑essential transitions.  
- **Alt text:** Receipt thumbnails get descriptive `alt="Receipt for $X.XX on YYYY‑MM‑DD"`. Decorative icons have `aria-hidden="true"`.  
- **No color‑only info:** Errors include ❗, success includes ✅ alongside color cues.  
- **Contrast:** All colour pairs listed in the Contrast pairs table meet WCAG 2.1 AA (≥ 4.5:1 normal text, ≥ 3:1 UI).  

## Content and microcopy

| Element | Copy |
|---|---|
| **Login page title** | “Log in to FinTrack” |
| Email placeholder | “you@example.com” |
| Password placeholder | “Your password” |
| Login button | “Log in” |
| Register link (under login) | “Create an account” |
| **Register page title** | “Create your FinTrack account” |
| Name placeholder | “Full name” |
| Email placeholder (register) | “you@example.com” |
| Password placeholder (register) | “Create a password” |
| Confirm password placeholder | “Confirm password” |
| Register button | “Create account” |
| **Dashboard heading** | “Dashboard” |
| Summary card titles | “Total income”, “Total expenses”, “Net profit”, “Mileage (mi)” |
| Empty‑state description | “No financial entries yet. Tap + Receipt or + Mileage to start tracking.” |
| **Add receipt title** | “Add a receipt” |
| FileDrop instruction | “Drag a photo or click to browse” |
| Amount placeholder | “$0.00” |
| Date placeholder | “Select date” |
| Category placeholder | “Choose category” |
| Notes placeholder (receipt) | “Optional notes…” |
| Save receipt button | “Save receipt” |
| Cancel link (receipt) | “Cancel” |
| **Log mileage title** | “Log mileage” |
| Miles placeholder | “e.g. 12.5” |
| Purpose placeholder | “Why you traveled” |
| Notes placeholder (mileage) | “Optional notes…” |
| Save mileage button | “Save mileage” |
| Cancel link (mileage) | “Cancel” |
| **Export buttons** | “Export PDF”, “Export CSV” |
| Loading spinner aria‑label | “Loading…” |
| Success toast (generic) | “✅ Saved successfully.” |
| Error toast (generic) | “❌ Something went wrong. Please try again.” |
| Logout tooltip | “Log out” |
| Form field required error | “This field is required.” |
| Form field numeric error | “Enter a valid number.” |
| 404 page title | “Page not found” |
| 404 description | “The page you’re looking for doesn’t exist.” |
| 404 link back to dashboard | “Return to Dashboard” |

All copy is concise, imperative, and free of jargon. Buttons use sentence‑case (first word capitalised). Error messages are plain English.
