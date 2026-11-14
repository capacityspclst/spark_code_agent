# DESIGN.md

## Users and goal
- **Primary users** – Decision‑makers (CMOs, CEOs, heads of product), technical leaders (CTOs, data engineers), and HR/learning managers at mid‑size to enterprise organizations who are evaluating an AI partner.
- **Job to be done** – Learn what The Bayes Group offers, assess credibility, and schedule a free consultation.
- **Success** – After a ≤ 2‑minute browse the user clicks **Book a consultation**, submits the contact form without error and sees the success message “Thanks, we’ll be in touch within one business day.” The user feels confident that the firm can help their business.

## Primary flow
1. **Land on Home** (`/`) – Hero with clear value proposition and two CTA buttons.  
2. **Explore services** – Click **Explore services** → `/services`.  
   - Scan the three service sections, read bullet‑point descriptions, note “Typical engagement”.  
3. **Find the right training** – From header or Services page click **Training** → `/training`.  
   - Use filter buttons to surface courses for the user’s audience.  
4. **Book a consultation** – From any page click the persistent **Book a consultation** button (header or CTA band).  
   - Arrive at `/contact`, fill Name, Email, Message (optional Company, optional dropdown), submit.  
5. **Confirmation** – Form validates, shows inline errors if needed, otherwise swaps for the success copy.  
6. **Optional loop** – If the user hits “Back” or navigates elsewhere, the **Menu** (mobile) or header links are always available, never leaving a dead‑end screen.

*All other pages (About, NotFound) include the same header/footer navigation, so the user can always jump to any primary step.*

## Screens and states

| Screen | State | UI Elements | Message / Visual |
|--------|-------|-------------|------------------|
| **Home** | Default | Hero, pillar cards, steps, why‑us list, CTA band | Normal copy as spec |
|  | Loading | *none* (static site) | – |
|  | Empty | *none* | – |
|  | Error | *none* | – |
|  | Edge – very long headings | Text truncates with ellipsis after 2 lines (mobile) or wraps gracefully (desktop) | – |
| **Services** | Default | Three sections with lists, “Typical engagement” line | Normal copy |
|  | Loading | Skeleton bars for each list item (optional) | – |
|  | Empty | *Never* – content is static |
|  | Error | *none* | – |
|  | Edge – many list items | Scrollable vertical area limited to max‑height 400 px, inner scrolling allowed | – |
| **Training** | Default (All filter) | Filter button group (All selected), grid of ≥ 6 course cards | – |
|  | Filtered | Selected audience button has `aria‑pressed="true"` and teal background; non‑selected are white with navy border | – |
|  | No results (hypothetical) | Show empty‑state card: “No courses match the selected audience.” + a button “Show all” (resets filter) | – |
|  | Loading | Skeleton cards | – |
|  | Error | *none* (static) | – |
| **About** | Default | Mission paragraph, “Why Bayes”, two founder cards, value list | – |
|  | Loading | – | – |
| **Contact** | Default (form ready) | Labeled inputs, dropdown, submit button | – |
|  | Validation error (on submit) | Inline error text under each invalid field: “Please enter your name.”, “Please enter a valid email address.”, “Please enter a message.” | – |
|  | Success | Form replaced by “Thanks, we’ll be in touch within one business day.” centered, button hidden | – |
|  | Disabled submit (fields invalid) | Button appears disabled (gray background, low‑opacity text) **but never hidden** | – |
|  | Loading (after submit) | Button shows spinner (CSS animation) and text “Sending…” | – |
| **NotFound** | Default | Large h1 “Page not found”, short copy, link “Return home” | – |
|  | Loading | – | – |

All interactive elements have a **focus-visible** outline (2 px solid `var(--color-accent)`). Hover states change background shade (e.g., teal → `#187777`). Touch targets are ≥ 44 × 44 px.

## Layout
- **Mobile‑first**: design width 390 px (minimum). No horizontal scrolling; all containers use `max-width: 100%`.
- **Desktop breakpoint**: `@media (min-width: 1280px)`. Content width capped at `1120px` (`max-width: 1120px`) and centered.
- **Grid**  
  - Header & Footer: `display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-4);`  
  - Main sections: `display: grid; gap: var(--space-8);` with responsive column counts (`1fr` on mobile, `repeat(3, 1fr)` for cards on desktop).
- **Header**  
  - Logo left, nav links right on desktop.  
  - Mobile (`< 420px`) shows a hamburger icon button labelled “Menu”. Clicking toggles a slide‑down panel (`<nav>` list) that occupies full width and height‑auto.
- **Footer** mirrors header layout, stacked vertically on mobile, two‑column grid on desktop.
- **Hero** – full‑width vertical padding `var(--space-12)` (mobile) / `var(--space-16)` (desktop), centered text.
- **Cards** – max‑width `360px` on mobile, `280px` on desktop columns, pad `var(--space-6)`.
- **CTA band** – full‑width bar with navy background, white centered text, vertical padding `var(--space-6)`.
- **Form fields** – full‑width inputs on mobile, max‑width `480px` on desktop, margin `var(--space-4)` between fields.
- **No element** exceeds the viewport width; images (SVG logo) are responsive (`max-width: 100%; height: auto`).

## Design tokens
All tokens are defined as CSS custom properties on `:root`. The web build uses plain CSS.

```css
/* --- COLORS --- */
:root {
  /* Core palette */
  --color-primary: #0B1F3A;   /* deep navy – main text & header/footer background */
  --color-accent:  #1F8A8A;   /* teal – buttons, icons, focus ring */
  --color-bg:      #FFFFFF;   /* page background */
  --color-surface: #F5F5F5;   /* light gray for secondary surfaces (cards) */
  --color-error:   #D32F2F;   /* error messages */
  --color-placeholder: #6B7280; /* input placeholder */

  /* Text on surfaces */
  --color-on-primary: #FFFFFF; /* white on navy (if used) */
  --color-on-accent:  #FFFFFF; /* white on teal (primary buttons) */
  --color-on-bg:      var(--color-primary);
}

/* --- TYPOGRAPHY --- */
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;

  /* Type scale (rem) */
  --size-xxs: 0.75rem;   /* 12px */
  --size-xs:  0.875rem;  /* 14px */
  --size-sm:  1rem;      /* 16px */
  --size-base:1.125rem;  /* 18px – used for large UI text (buttons) */
  --size-lg:  1.25rem;   /* 20px */
  --size-xl:  1.5rem;    /* 24px */
  --size-xxl: 2rem;      /* 32px */
  --size-xxxl: 2.5rem;   /* 40px – h1 on desktop */
}

/* --- SPACING (4/8px grid) --- */
:root {
  --space-0:   0;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-7:  40px;
  --space-8:  48px;
}

/* --- RADIUS & ELEVATION --- */
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --elevation-card: 0 4px 6px rgba(0,0,0,0.08);
}

/* --- TRANSITIONS (prefers‑reduced‑motion handled in CSS) --- */
:root {
  --duration-fast: 150ms;
  --duration-medium: 250ms;
}
```

### Contrast pairs
| Foreground | Background | Use | Size |
|------------|------------|-----|------|
| #0B1F3A | #FFFFFF | body text, headings, nav links, footer text | normal |
| #1F8A8A | #FFFFFF | icon color, accent elements, link underline (non‑text) | normal |
| #FFFFFF | #1F8A8A | primary button label (“Book a consultation”, “Send message”) – **large** (18 px, bold) | large |
| #0B1F3A | #F5F5F5 | text on card surface | normal |
| #6B7280 | #FFFFFF | input placeholder | normal |
| #D32F2F | #FFFFFF | form error message | normal |
| #FFFFFF | #0B1F3A | optional inverted header (not used) – listed for completeness | normal |
| #0B1F3A | #1F8A8A | secondary button label (if ever used) – **large** | large |
| #FFFFFF | #0B1F3A | potential white text on navy band (CTA band) – **large** | large |

All pairs meet WCAG AA: normal text ≥ 4.5:1, large text ≥ 3:1, UI icons ≥ 3:1 (teal on white = 4.15).

## Components

### Global
- **Container** – `max-width: 1120px; width: 100%; margin: 0 auto; padding: 0 var(--space-4);`
- **Visually hidden** – `.sr-only` class for screen‑reader only text (e.g., skip‑link).

### Wordmark
- **SVG** – 24 × 24 px bell‑curve path + text “The Bayes Group”.  
- **States** – static (no interaction).  
- **Accessibility** – `alt="The Bayes Group logo"` on the `<svg>` via `aria-label`.

### Header
| State | Visual |
|-------|--------|
| Default | White background, navy logo, navy nav links, primary button teal background, white text. |
| Mobile (collapsed) | Hamburger button (24 × 24 px) labelled “Menu”. Panel slides down with vertical list, each link 44 × 44 px tappable. |
| Hover (desktop links) | Text underline, color unchanged. |
| Focus-visible | Outline `2px solid var(--color-accent)` on links & button. |
| Active (button) | Slightly darker teal (`#187777`). |
| Disabled – N/A (header never disabled). |

### Footer
- Mirrors header layout. Links are navy on white background. No interactive state beyond hover/focus.

### Button (primary)
- **Size** – min‑height 44 px, horizontal padding `var(--space-5)` (24 px). Font `var(--size-base)` (18 px) bold.
- **States**  
  - Default: background `var(--color-accent)`, text `var(--color-on-accent)`.  
  - Hover: background `#187777`.  
  - Focus-visible: outline `2px solid var(--color-primary)`.  
  - Active: background `#146666`.  
  - Disabled: background `#E5E5E5`, text `rgba(0,0,0,0.4)`, cursor `not-allowed`.  
  - Loading: shows CSS spinner (border‑top 2 px solid white, animation `spin var(--duration-medium) linear infinite`).

### Secondary button (used for “Explore services”)
- White background, navy text, teal border (2 px). Hover swaps to teal background, white text.

### Card (generic)
- **Base** – `background: var(--color-bg); box-shadow: var(--elevation-card); border-radius: var(--radius-md); padding: var(--space-5);`  
- **States** – Hover lifts shadow (`0 6px 10px rgba(0,0,0,0.12)`), focus-visible outline teal.

### HeroSection
- Full‑width container with vertical padding (`var(--space-12)` mobile, `var(--space-16)` desktop). Centered text, h1 uses `var(--size-xxxl)` on desktop, `var(--size-xxl)` on mobile.

### PillarCard
- Extends Card. Includes a small inline SVG icon (teal), title (h3), 2‑3 sentence paragraph, CTA link (“Learn more”) styled as an inline button with underline. Link color navy, hover teal underline.

### HowWeWorkStep
- Number circle: `width: 48px; height: 48px; border-radius: 50%; background: var(--color-accent); color: var(--color-on-accent); display: flex; align-items: center; justify-content: center; font-weight: 600;`. Text description beside circle.

### CTA Band
- Background `var(--color-primary)`, white centered text (`var(--size-lg)`), primary button (same as Header CTA). Padding `var(--space-6)`.

### FilterButtonGroup (Training page)
- Buttons are `display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 var(--space-4); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-bg);`  
- **Selected** – `background: var(--color-accent); color: var(--color-on-accent); border-color: var(--color-accent);` `aria-pressed="true"`.  
- Hover/focus-visible similar to primary button.

### CourseCard
- Uses Card. Title (`h4`), audience badge (small pill with teal background, white text), format line, duration line, unordered list of three “You will learn” items (`var(--size-xs)`). Bottom CTA “Read more” (link style, navy).

### Form Elements
| Element | Default | Focus-visible | Error | Disabled |
|---------|---------|----------------|-------|----------|
| Input / textarea | border `1px solid var(--color-primary)`, padding `var(--space-2)`, font `var(--size-sm)` | outline `2px solid var(--color-accent)` | border `1px solid var(--color-error)`; error text `var(--color-error)` shown below | background `var(--color-surface)`, text `rgba(0,0,0,0.4)`, cursor `not-allowed` |
| Select | same as input, arrow icon `var(--color-primary)` | same focus | same error border | same disabled |
| Labels | `font-weight: 600; margin-bottom: var(--space-1);` |
| Error text | `color: var(--color-error); font-size: var(--size-xs); margin-top: var(--space-1);` |

All interactive elements have a minimum tap area of `44 × 44 px`. The submit button follows the **Primary button** component.

### NotFound Page
- Simple centered column, h1 (`var(--size-xxl)`), paragraph, link styled as primary button.

## Accessibility
- **Landmarks** – `<header>`, `<nav>`, `<main>`, `<footer>`. The “Skip to content” link (`.sr-only`) appears at top of body.
- **Headings** – One `<h1>` per page, hierarchy (`h2`, `h3`, `h4`) follows logical order.
- **Labels** – Every form control has a `<label for="id">`. The select label reads “What can we help with?”.
- **ARIA** –  
  - Hamburger button: `aria-controls="mobile-nav"` `aria-expanded="false"` toggled on click.  
  - Filter buttons: `role="button"` + `aria-pressed="true|false"`.  
  - Error messages linked via `aria-describedby`.
- **Focus** – Visible outlines (`2px solid var(--color-accent)`). Focus order logical (header → main → footer).  
- **Keyboard** – All interactive elements reachable via `Tab`. The menu can be opened with `Enter`/`Space`.  
- **Reduced motion** – `@media (prefers-reduced-motion: reduce)` disables button spinner animation and any slide‑down transitions (uses `transform: none`).  
- **Alt text** – SVG wordmark has `role="img"` + `aria-label`. No decorative images without `alt`.  
- **Color‑only** – Status information (error, success) also uses icons (exclamation, checkmark) with appropriate `aria-live="assertive"`.

## Content and microcopy
| Element | Copy |
|---------|------|
| Site title (home) | “The Bayes Group | Evidence-driven AI” |
| Page titles | “Services \| The Bayes Group”, “Training \| The Bayes Group”, “About \| The Bayes Group”, “Book a consultation \| The Bayes Group”, “Page not found \| The Bayes Group” |
| Hero h1 | “Evidence-driven AI, built for your business.” |
| Hero subtitle | “We partner with organizations to turn data into actionable intelligence.” |
| Hero primary CTA | “Book a consultation” |
| Hero secondary CTA | “Explore services” |
| Pillar card “Learn more” links | “Learn more” |
| How‑we‑work steps | Assess – “We evaluate data maturity and business goals.”<br>Design – “We co‑design a roadmap aligned with impact.”<br>Build – “We deliver production‑ready AI solutions.”<br>Enable – “We transfer knowledge and embed processes.” |
| Why‑us points | “Credentialed data scientists”, “Hands‑on builders”, “Vendor‑neutral advice”, “Knowledge transfer so your team owns the result.” |
| CTA band text | “Ready to put AI to work?” |
| CTA band button | “Book a consultation” |
| Services section titles | “AI Enablement”, “Training”, “Custom Development” |
| Services list items – example | **AI readiness assessment** – “A structured review of data, talent, and infrastructure.” |
| Services “Typical engagement” line | “Typical engagement: 2 to 6 weeks” (adjust per section as needed) |
| Training filter buttons | “All”, “Executives”, “Managers”, “Technical teams” (selected has visual teal fill) |
| Course card – example titles | “AI for Executives”, “Data‑Driven Decision‑Making for Managers”, “Deep‑Learning Foundations for Technical Teams”, etc. |
| Course card fields | Audience (badge), Format (e.g., “Half‑day briefing”), Duration (e.g., “4 hours”), “You will learn” list (3 bullet items). |
| About – mission paragraph | “Our mission is to empower businesses with evidence‑driven AI solutions that create measurable value.” |
| About – why Bayes paragraph | “We apply Bayesian reasoning—updating beliefs as evidence arrives—to every engagement, ensuring decisions are always data‑backed.” |
| Founder card placeholder name | “Founder Name” |
| Founder card placeholder role | “Co‑founder & Principal Data Scientist” |
| Founder credentials placeholder | “Ph.D. in Statistics, 10+ years industry experience” |
| Founder bio placeholder | “[Short bio to be added]” |
| Values list items | “Evidence over hype”, “Build to transfer”, “Vendor‑neutral”, “Responsible by design” |
| Contact page – heading | “Book a consultation” |
| Contact email line | “hello@thebayesgroup.com” |
| Form field labels | “Name”, “Email”, “Company”, “What can we help with?”, “Message” |
| Form placeholder texts | “Your name”, “you@example.com”, “Your company (optional)”, “Select an option”, “Your message” |
| Validation messages | “Please enter your name.”, “Please enter a valid email address.”, “Please enter a message.” |
| Submit button (default) | “Send message” |
| Submit button (loading) | “Sending…” |
| Success message after submit | “Thanks, we’ll be in touch within one business day.” |
| NotFound page copy | “Oops! The page you’re looking for doesn’t exist.” |
| NotFound link | “Return home” |
| Footer tagline | “AI enablement, training and custom development.” |
| Footer copyright | “© 2026 The Bayes Group” |
| Skip‑to‑content link | “Skip to main content” |

All copy is plain English, uses sentence case for headings, and avoids jargon beyond the domain. Buttons and links use the exact wording above so the test scripts can locate them reliably.

---  

*End of DESIGN.md – this specification provides the exact UI/UX blueprint the implementation team must follow to pass automated visual, accessibility, and functional checks.*
