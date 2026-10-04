## Users and goal
**Who:** Independent freelancers (designers, developers, writers, etc.) who need a quick, low‑friction way to record income and expenses on‑the‑go.  
**One job they come to do:** Add a new transaction (income or expense) and see an up‑to‑date net‑income summary.  
**Success feels like:** After logging in, the user lands on the dashboard, sees an empty‑state with a clear “Add first transaction” button, taps it, fills a short form, saves, and instantly sees the new entry in the list with the net total updated. No errors, no confusing dialogs, and the app remembers the login.

## Primary flow
1. **Open app** – if a valid JWT exists, skip to Dashboard; otherwise show the Sign‑In screen.  
2. **Sign‑In** – enter email & password → press **Log in** → on success store JWT in `localStorage` and navigate to Dashboard.  
3. **Sign‑Up** (optional) – from Sign‑In tap **Create account** → fill email, password, **Confirm password** → press **Sign up** → auto‑login and land on Dashboard.  
4. **Dashboard** – view list of transactions (empty state if none). Primary action always visible: floating **+** button (FAB).  
5. **Add transaction** – tap FAB → modal opens → fill **Amount**, **Description**, **Date**, **Type** (Income/Expense) → press **Save** → modal closes, list updates, toast “Transaction added”.  
6. **Edit / Delete** – each list row has edit (pencil) and delete (trash) icon buttons; edit opens the same modal pre‑filled, delete shows a confirmation dialog.  
7. **Logout** – accessible from the Profile tab → tap **Log out** → JWT cleared, redirect to Sign‑In.  

*Every screen always offers a forward path: the bottom tab bar (mobile) or top navigation (desktop) includes Dashboard and Profile tabs; the FAB is present on Dashboard; error messages include retry actions.*

## Screens and states
| Screen | State | UI elements & exact message |
|--------|-------|-----------------------------|
| **Sign‑In** | default | Email field, Password field, **Log in** button (disabled until both fields non‑empty). |
| | loading | Full‑screen overlay spinner; button shows spinner, label “Signing in…”. |
| | error | Inline alert (red) above form: “Invalid email or password.” |
| **Sign‑Up** | default | Email, Password, **Confirm password**, **Sign up** button (disabled until validation passes). |
| | loading | Overlay spinner; button label “Creating account…”. |
| | validation error | Under fields: “Passwords must match”, “Password must be at least 12 characters, include upper‑case, lower‑case, digit and symbol.” |
| | server error | Alert: “An account with this email already exists.” |
| **Dashboard** | default (has data) | Header with app name, net‑total badge, list of transaction cards, FAB (+) at bottom‑right, bottom‑nav (Dashboard, Profile). |
| | empty | Centered empty state: icon, title “No transactions yet”, subtitle “Start tracking your income or expenses.”, CTA **Add first transaction**. |
| | loading | List area shows three skeleton cards. |
| | error (fetch) | Inline alert: “Failed to load transactions. Retry”. |
| | offline | Banner top: “You’re offline – showing cached data”. |
| **Transaction Form (modal)** | default (add) | Fields: Amount (number), Description (text), Date (date picker), Type (segmented Income/Expense), **Save** and **Cancel** buttons. |
| | default (edit) | Same fields pre‑filled; title reads “Edit transaction”. |
| | loading | Save button shows spinner, disabled; background overlay dimmed. |
| | validation error | Under field: “Amount must be a positive number.” |
| | server error | Toast (red) top: “Could not save transaction. Please try again.” |
| **Profile** | default | Header, **Log out** button (primary). |
| | loading | Overlay spinner while logging out. |
| | error | Toast: “Logout failed. Please retry.” |

### Edge cases
* **Long description** – text wraps inside card, max 3 lines shown with ellipsis.  
* **Many items** – list scrolls vertically; lazy‑load after 20 items.  
* **Offline add** – modal saves locally and queues sync; shows banner “Saved offline – will sync when online”.

## Layout
### Mobile (390 – 600 px)
* **Grid:** 4‑column fluid grid, 8 px gutters.  
* **Auth screens:** centered column, max width **420 px**, vertical padding **64 px**.  
* **Dashboard:** `<header>` 56 px tall (app name left, profile icon right). Transaction list occupies remaining height. FAB positioned `right: 16px; bottom: 80px` (above bottom tab bar).  
* **Bottom navigation:** 64 px tall, fixed bottom, safe‑area inset, two tabs (Dashboard, Profile) each ≥ 44 × 44 px touch target.  
* **Modal:** 90 % width, max 380 px, vertical centering with 24 px side margin.

### Desktop (≥ 1280 px)
* **Max content width:** 800 px centered.  
* **Header navigation:** fixed top bar 72 px, app name left, links “Dashboard”, “Profile” right. No bottom nav.  
* **Dashboard:** two‑column layout – left (list, 70 %) and right (summary card, 30 %).  
* **Modal:** fixed width 480 px, centered.  
* **No horizontal overflow** – all containers use `max-width: 100%` and responsive margins.

## Design tokens
*Plain CSS custom properties – paste into a global stylesheet (e.g., `tokens.css`).*

## Components
| Component | Variants / Sizes | States (default, hover, focus‑visible, active, disabled, loading) | Minimum touch target |
|-----------|------------------|-------------------------------------------------------------------|----------------------|
| **Button** | Primary (solid), Secondary (outline), Text | default: bg `var(--c-primary)`, border `var(--c-primary)`, label `var(--c-on-primary)`; hover: bg `var(--c-primary-hover)`; focus‑visible: `2px solid var(--c-primary)`; active: opacity 0.85; disabled: bg `var(--c-primary-bg)`, label `var(--c-on-primary-disabled)`; loading: spinner replaces label, button disabled. | ≥ 44 × 44 px |
| **InputField** | Text, Email, Password, Number, Date (full‑width) | default: border `var(--c-border)`, bg `var(--c-background)`; focus: border `var(--c-primary)`; error: border `var(--c-error)` + error icon `var(--c-on-error)`; disabled: bg `var(--c-primary-bg)`, text `var(--c-text-secondary)`; loading: overlay spinner centered. | Height 44 px (incl. vertical padding) |
| **Card** | Surface (list item), Modal (dialog) | default: bg `var(--c-surface)`, box‑shadow `var(--shadow-card)`, radius `var(--radius-2)`; hover (list‑only): translateY(‑2px); focus‑visible: outline `2px solid var(--c-primary)`. | N/A |
| **TransactionRow** | Regular, Selected | default: bg `transparent`; hover: bg `var(--c-primary-bg)`; focus‑visible: outline `2px solid var(--c-primary)`; edit/delete icons `var(--c-text-secondary)`; selected accent bar `var(--c-primary)` on left. | N/A |
| **BottomNav** | Fixed bar with two tabs (Dashboard, Profile) | default: icon & label `var(--c-text-secondary)`; selected: icon & label `var(--c-primary)`; hover: bg `var(--c-primary-bg)`; focus‑visible: outline `2px solid var(--c-primary)`. | Each tab ≥ 44 × 44 px |
| **FAB** | Circular primary action (add transaction) | default: bg `var(--c-primary)`, icon `var(--c-on-primary)`; hover: bg `var(--c-primary-hover)`; focus‑visible: `2px solid var(--c-primary)`; active: opacity 0.85; disabled: bg `var(--c-primary-bg)`, icon `var(--c-on-primary-disabled)`; loading: spinner replaces icon, button disabled. | Visual 56 × 56 px; touch area 64 × 64 px |
| **Modal** | Centered overlay (form) | backdrop `rgba(0,0,0,0.4)`; open/close slide & fade (reduced‑motion disabled via `prefers-reduced-motion`); traps focus; closes on Escape; max width 480 px (mobile 90 % width, max 380 px). | N/A |
| **Toast** | Success, Error, Warning | bg `var(--c-success)` / `var(--c-error)` / `var(--c-warning)`; text `var(--c-on-success)` / `var(--c-on-error)` / `var(--c-on-warning)`; appears top‑center, auto‑dismiss after 4 s; `role="alert"`; visible focus outline `2px solid var(--c-primary)`. | N/A |
| **EmptyState** | Icon + title + subtitle + CTA button | static layout; CTA uses Primary button style; icon `var(--c-primary)`; text `var(--c-text-secondary)`. | N/A |
| **Spinner** | Small (12 px), Medium (24 px) | color `var(--c-primary)`; rotates unless `prefers-reduced-motion: reduce` (then shows static progress). | N/A |

All components use the 4/8 px spacing scale (`--space-1` = 4 px … `--space-8` = 48 px), the radius `--radius-2`, and elevation `--elevation-1`. Interactive elements meet the 44 × 44 px minimum target for touch.

## Accessibility
- **Landmarks & heading hierarchy** – Every page contains one `<h1>` (e.g., “Log in to your account”, “Create your account”, “Freelance Finance” on the dashboard). Sections use `<h2>`/`<h3>` in logical order. Semantic landmarks `<header>`, `<nav>`, `<main>`, `<footer>` (where applicable) enable efficient screen‑reader navigation.  
- **Form labeling** – Each input has a visible `<label>` linked via `for`/`id`. The “Confirm password” field uses `id="confirmPassword"` and a matching label. Icon‑only buttons (FAB, edit, delete) provide an `aria-label` (e.g., `aria-label="Add transaction"`).  
- **Focus management** – Focusable elements render a visible focus ring `2px solid var(--c-primary)`. Modals trap focus when opened and restore focus to the invoking element on close. The **Esc** key closes modals.  
- **Keyboard operability** – All interactive controls are reachable via **Tab**. **Enter** activates focused buttons; **Space** toggles checkable controls such as the Income/Expense segmented control.  
- **Reduced motion** – `@media (prefers-reduced-motion: reduce)` disables slide/fade transitions and swaps animated spinners for a static progress indicator.  
- **Alternative text** – Decorative SVG icons have `aria-hidden="true"`. The app logo includes `alt="Freelance Finance logo"`.  
- **No color‑only cues** – Status messages include icons (error, success, warning) in addition to color.  
- **Contrast compliance** – All foreground/background pairs listed in the *Contrast pairs* table meet WCAG AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text/UI).  
- **Live regions & validation** – Password‑strength hints and validation messages reside in `aria-live="polite"` containers. Errors have `role="alert"` and are referenced by inputs via `aria-describedby`. On submit, focus automatically moves to the first invalid field.  
- **Autocomplete & placeholders** – Email inputs use `autocomplete="email"`. Password fields use `autocomplete="new-password"` for sign‑up and `autocomplete="current-password"` for sign‑in. Placeholders use the `--c-placeholder` color and never replace visible labels.  
- **Screen‑reader announcements** – Toasts use `role="alert"` and are announced automatically. Inline alerts also use `role="alert"`.

## Content and microcopy
### Branding
- **App name:** *Freelance Finance*  
- **Tagline (optional):** *Track your income and expenses in seconds.*

### Authentication
| Element | Copy |
|--------|------|
| Sign‑In heading | **Log in to your account** |
| Email label | **Email address** |
| Email placeholder | `you@example.com` |
| Password label | **Password** |
| Password placeholder | `••••••••` |
| Log in button | **Log in** |
| Sign‑In error (invalid) | “Invalid email or password.” |
| Switch to Sign‑Up link | “Don’t have an account? **Create account**” |
| Sign‑Up heading | **Create your account** |
| Confirm password label | **Confirm password** |
| Sign‑Up button | **Sign up** |
| Password strength hint | “Password must be ≥ 12 characters, include upper‑case, lower‑case, number & symbol.” |
| Password mismatch error | “Passwords do not match.” |
| Sign‑Up error (email exists) | “An account with this email already exists.” |
| Success toast after sign‑up | “Account created! Welcome.” |

### Dashboard
| Element | Copy |
|--------|------|
| Empty state title | **No transactions yet** |
| Empty state subtitle | “Start tracking your income or expenses.” |
| Empty state CTA button | **Add first transaction** |
| Net total label | **Net total:** |
| Transaction list header | **Recent transactions** |
| FAB tooltip (`aria-label`) | **Add transaction** |
| Edit icon tooltip | **Edit** |
| Delete icon tooltip | **Delete** |
| Delete confirmation dialog title | **Delete transaction?** |
| Delete confirmation dialog message | “This cannot be undone.” |
| Delete dialog buttons | **Cancel**, **Delete** |
| Success toast (add) | “Transaction added.” |
| Success toast (edit) | “Transaction updated.” |
| Success toast (delete) | “Transaction removed.” |
| Error toast (save) | “Could not save transaction. Please try again.” |
| Error toast (delete) | “Could not delete transaction. Please try again.” |

### Transaction Form (modal)
| Field | Placeholder / Helper |
|-------|----------------------|
| Amount | Placeholder: **$0.00** • Helper: “Enter a positive number.” |
| Description | Placeholder: **e.g., “Website redesign for Acme Corp.”** |
| Date | Default today – picker format `DD/MM/YYYY`. |
| Type selector | Segmented control: **Income** | **Expense** (default **Income**) |
| Save button | **Save** |
| Cancel button | **Cancel** |
| Loading state (button) | Spinner replaces label, button disabled. |

### Profile / Settings
| Element | Copy |
|--------|------|
| Profile heading | **Account** |
| Log out button | **Log out** |
| Log out confirmation title | **Log out?** |
| Log out confirmation message | “You will need to log in again to access your data.” |
| Log out dialog buttons | **Cancel**, **Log out** |

All copy follows plain‑language best practices: title‑case for button labels, concise error messages, and clear calls to action. Toasts are brief, appear at the top of the viewport, and auto‑dismiss after a few seconds. Icons are used where they aid scanning without relying on color alone.```
