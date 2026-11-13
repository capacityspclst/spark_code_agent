## Users and goal

**Who:**  
- Business decision‑makers (CEOs, VPs, product owners)  
- Technical leaders (CTOs, lead data scientists)  
- Managers looking to up‑skill their teams  

**Job they come to do:**  
Find a credible AI consulting partner, understand the services The Bayes Group offers, and schedule a consultation.

**Success feels like:**  
The user lands on any page, easily discovers the service they need, clicks “Book a consultation”, fills the form without friction, submits it, and sees a clear success message confirming the request.

---

## Primary flow

1. **Enter the site** – any entry point (home page, direct link to `/services`, etc.).  
2. **Navigate to “Book a consultation”** – via the persistent top‑right button, the bottom CTA band on the Home page, or any “Book a consultation” link in a service card.  
3. **Contact page (`/contact`) loads** – form is visible, fields are labelled.  
4. **Fill the form** – Name, Email (valid format), optional Company, select “What can we help with?” and Message.  
5. **Submit** – button shows loading spinner, then a thank‑you banner “Thanks, we'll be in touch within one business day.” replaces the form.  
6. **Done** – the user can continue browsing or close the tab.

The flow never requires more than three clicks and the user can backtrack at any point via the persistent header navigation.

---

## Screens and states

| Screen | State | UI elements | Message / copy | Notes |
|--------|-------|-------------|----------------|-------|
| **Home (`/`)** | Default | Hero, pillar cards, steps, values, CTA band | – | No loading state (static). |
| | Empty / Edge | Extremely long headings wrap, cards stack vertically on narrow screens. | – | Content should wrap, no overflow. |
| **Services (`/services`)** | Default | Section headings, list items, “Typical engagement” line. | – | |
| | Edge | Very long service title wraps to two lines. | – | |
| **Training (`/training`)** | Default (All filter) | Filter bar (All selected), grid of ≥6 course cards. | – | |
| | Filter: Executives / Managers / Technical teams | Grid shows only matching cards. | – | |
| | Empty (no match) | Same layout, but shows placeholder card. | “No courses match the selected audience.” | `aria-live="polite"` for screen‑readers. |
| | Loading | Not applicable (static data). |
| **About (`/about`)** | Default | Mission text, founder cards, values list. | – | |
| **Contact (`/contact`)** | Initial | Empty form, enabled “Send message”. | – | |
| | Validation error (on blur or submit) | Inline error under each field. | “Please enter your name.”<br>“Please enter a valid email address.”<br>“Please enter a message.” | `aria-describedby` links error text to input. |
| | Disabled submit (while invalid) | Button appears muted, `aria-disabled="true"`. | – | |
| | Submitting (loading) | Button shows spinner and text “Sending…”. | – | |
| | Success | Form replaced by banner. | “Thanks, we'll be in touch within one business day.” | Form fields cleared. |
| **Header** | Default | Logo, nav links, primary CTA, menu button (mobile). | – | |
| | Mobile menu closed | Only logo and menu icon visible. | – | |
| | Mobile menu open | Overlay with nav links and CTA button. | – | Escape key closes overlay. |
| **NotFound (`*`)** | Default | Large “Page not found” heading, link back home. | – | |

All pages include the same `<header>`, `<main>` (containing page‑specific content), and `<footer>` landmarks.

---

## Layout

### General

- **Mobile‑first**: Design for 390 px viewport width.  
- **Desktop breakpoint**: 1280 px (layout switches at ≥1280 px).  
- **Horizontal scroll**: Never allowed; max‑width containers keep content within the viewport.  
- **Grid system**: 12‑column grid on desktop; 1‑column on mobile.  Gutter = `var(--space-4)` (16 px).  
- **Max content width**: 1120 px (`max-width: 70rem`) centered with auto margins.  
- **Spacing**: 8‑px vertical rhythm (`var(--space-2)` = 8 px, `var(--space-4)` = 16 px, `var(--space-8)` = 32 px, etc.).  
- **Touch targets**: Minimum 44 × 44 px; buttons are 48 px tall with left/right padding ≥ 12 px.

### Header

| Viewport | Layout |
|----------|--------|
| ≤ 390 px | Logo left, hamburger button right. Clicking opens a full‑screen overlay that slides down. |
| ≥ 1280 px | Logo left, horizontal nav links centered, “Book a consultation” button right. No hamburger. |

### Footer

| Viewport | Layout |
|----------|--------|
| ≤ 390 px | Stack: Logo + tagline, nav links list, copyright. |
| ≥ 1280 px | Two‑column flex: left column (logo + tagline), right column (nav links stacked vertically, copyright below). |

### Home page sections

| Section | Mobile | Desktop |
|---------|--------|---------|
| Hero | Full‑width column, centered text, two stacked buttons. | Two‑column: text left, optional decorative graphic right (optional). |
| Pillar cards | Stacked vertically (full width). | 3‑column grid, equal height, gap `var(--space-6)`. |
| “How we work” steps | Stacked list with numbers. | 4‑column row, equal height cards. |
| “Why The Bayes Group” values | Stacked cards. | 2‑column grid. |
| CTA band | Full‑width band with centered text and button. | Same, but width constrained by max‑content. |

### Services page

- Sections (`#enablement`, `#training`, `#custom-development`) flow vertically.  
- Each list item is a card with title, description, and a “Typical engagement: X weeks” line.  
- On desktop, cards are arranged in a 2‑column grid.

### Training page

- Filter bar: horizontal flex, wrap if needed, selected button highlighted.  
- Card grid: 1 column (mobile), 2 columns (≥ 768 px), 3 columns (≥ 1280 px).  
- Each card has a subtle elevation; hover lifts the card by 2 px.

### Contact page

- Form container: max‑width 420 px, centered.  
- Labels sit **above** inputs.  
- Inputs stretch full width, `height: 48px`.  
- “Send message” button full width, min‑height 48 px.

---

## Design tokens

All tokens are exposed as **CSS custom properties** in `src/theme.css`. The app uses plain CSS (no framework).

```css
/* src/theme.css */
:root {
  /* Colors */
  --color-primary: #0B1F3A;           /* Deep navy – main text, headings, nav links */
  --color-background: #FFFFFF;       /* Page background */
  --color-accent: #1F8A8A;           /* Brand teal – used for hover/active states */
  --color-accent-darker: #156B71;    /* Darker teal – primary button background, focus outlines */
  --color-muted: #6B7C93;            /* Secondary/placeholder text */
  --color-surface: #F7FAFC;          /* Light gray – cards, forms background */
  --color-border: #E2E8F0;           /* Subtle borders */
  --color-error: #C53030;            /* Error messages */
  --color-success: #156B71;          /* Success highlights (same as accent‑darker) */
  --color-on-primary: #FFFFFF;       /* Text/icon on primary button */
  --color-on-surface: var(--color-primary);

  /* Typography */
  --font-heading: "Georgia", "Times New Roman", serif;
  --font-body: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  --type-h1: 2.5rem;   /* 40px */
  --type-h2: 2rem;    /* 32px */
  --type-h3: 1.75rem; /* 28px */
  --type-h4: 1.5rem;  /* 24px */
  --type-body: 1rem;  /* 16px */
  --type-small: 0.875rem; /* 14px */

  --line-height-solid: 1.2;
  --line-height-regular: 1.5;

  /* Spacing – 4/8px scale */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;
  --space-10: 64px;

  /* Radii */
  --radius-1: 8px;

  /* Elevation */
  --elevation-1: 0 2px 8px rgba(0, 0, 0, 0.05);

  /* Focus outline */
  --focus-outline: 2px solid var(--color-accent-darker);
}

/* Global resets */
*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  font-family: var(--font-body);
  color: var(--color-primary);
  background-color: var(--color-background);
}
h1, h2, h3, h4 {
  font-family: var(--font-heading);
  line-height: var(--line-height-solid);
}
h1 { font-size: var(--type-h1); }
h2 { font-size: var(--type-h2); }
h3 { font-size: var(--type-h3); }
h4 { font-size: var(--type-h4); }
p, li, button, input, textarea, select { font-size: var(--type-body); line-height: var(--line-height-regular); }
button, input, textarea, select { font-family: inherit; }

## Components

### 1. Logo
- **Structure:** Inline SVG (`<svg>`), aria‑label “The Bayes Group”.
- **States:** none (static).  
- **Size:** Height 32 px; scalable via `width: auto`.

### 2. Header
| Element | Default | Hover | Focus‑visible | Active | Disabled | Loading |
|---------|---------|-------|--------------|--------|----------|---------|
| Nav link | navy text | navy + underline | `var(--focus-outline)` | navy (pressed) | n/a | n/a |
| Primary CTA button | `background: var(--color-accent-darker); color: var(--color-on-primary)` | darken background 5 % | `var(--focus-outline)` | slightly inset box‑shadow | `opacity: 0.5` | spinner + “Sending…” |
| Menu button (icon) | navy stroke | teal stroke (`var(--color-accent)`) | `var(--focus-outline)` | navy background 10 % | n/a | n/a |
| Header background | `var(--color-background)` | – | – | – | – | – |

- **Touch target:** min 44 × 44 px (icons padded to 48 × 48 px).

### 3. ResponsiveMenu (mobile overlay)
| State | Description |
|-------|-------------|
| Closed | Hidden (`display:none`), focus trapped outside. |
| Open | Full‑screen overlay (`position:fixed; inset:0; background:#fff; z-index:1000`) with vertical list of nav links + CTA button. Escape key or clicking outside closes it. Focus moves to first link. |

### 4. Footer
- Static container, no interactive states beyond link hover (same as nav link hover).

### 5. Button (base class `.btn`)
| State | Styles |
|-------|--------|
| Default | `background: var(--color-accent-darker); color: var(--color-on-primary); border:none; border-radius: var(--radius-1); height:48px; padding:0 var(--space-4);` |
| Hover | `background: #0E5F5F;` (5 % darker) |
| Focus‑visible | `outline: var(--focus-outline);` |
| Active | `transform: translateY(1px);` |
| Disabled | `background: var(--color-accent-darker); opacity:0.5; cursor:not-allowed;` |
| Loading | `background: var(--color-accent-darker); color: transparent; position:relative;` with an absolutely positioned spinner (CSS animation). |

### 6. Secondary Button (`.btn--secondary`)
| State | Styles |
|-------|--------|
| Default | `background: var(--color-surface); color: var(--color-primary); border: 2px solid var(--color-accent-darker);` |
| Hover | `background: var(--color-surface); border-color: var(--color-accent);` |
| Focus‑visible | `outline: var(--focus-outline);` |
| Active | `transform: translateY(1px);` |
| Disabled | `opacity:0.5; cursor:not-allowed;` |

### 7. Card (base `.card`)
- **Default:** `background: var(--color-surface); border-radius: var(--radius-1); box-shadow: var(--elevation-1); padding: var(--space-6);`  
- **Hover:** `box-shadow: 0 4px 12px rgba(0,0,0,0.08);`  
- **Focus‑visible:** `outline: var(--focus-outline);`  
- **Active:** slight downward translate.  
- **Disabled:** not applicable.

Specific cards inherit `.card` and add minor tweaks (e.g., `.card--pillar`, `.card--service`, `.card--course`).

### 8. PillarCard (`.card--pillar`)
- Shows icon (optional SVG), title, short description, “Learn more” link.  
- Link uses primary link style (nav‑link).  

### 9. ServiceCard (`.card--service`)
- Title (h3), one‑sentence description, “Typical engagement: X weeks” line.  

### 10. StepCard (`.card--step`)
- Numbered circle (background `var(--color-accent-darker)`, white number), short sentence below.  

### 11. ValueCard (`.card--value`)
- Icon (optional), title, short paragraph.  

### 12. TrainingCourseCard (`.card--course`)
- Title, audience badge (`.badge`), format badge, duration line, “You will learn” list (3 items), “Learn more” link (optional).  
- Badge styles: background `var(--color-accent-darker)` with white text, border‑radius `var(--radius-1)`.

### 13. FilterButton (`.filter-btn`)
| State | Styles |
|-------|--------|
| Unselected | `background: var(--color-surface); color: var(--color-primary); border: 2px solid var(--color-accent-darker);` |
| Selected (`[aria-pressed="true"]`) | `background: var(--color-accent-darker); color: var(--color-on-primary); border:none;` |
| Hover (unselected) | `border-color: var(--color-accent);` |
| Focus‑visible | `outline: var(--focus-outline);` |
| Disabled | `opacity:0.5; cursor:not-allowed;` |

- **Touch target:** min 44 × 44 px (`padding: var(--space-2) var(--space-4)`).

### 14. Form Elements
| Element | Default | Focus‑visible | Error | Disabled |
|---------|---------|---------------|-------|----------|
| Input / Textarea / Select | `border: 1px solid var(--color-border); background: var(--color-surface); padding: var(--space-2) var(--space-3); border-radius: var(--radius-1); height:48px;` | `border-color: var(--color-accent-darker); outline: var(--focus-outline);` | `border-color: var(--color-error);` | `background: #F2F2F2; color: #BBBBBB;` |
| Label | `margin-bottom: var(--space-1); font-weight:600;` | – | – | – |
| Error text | `color: var(--color-error); font-size: var(--type-small); margin-top: var(--space-1);` | – | – | – |
| Submit button | Primary button style (see Button) | – | – | Disabled when form invalid (opacity 0.5). |

All inputs have `autocomplete` attributes (`name`, `email`, `organization`, `message`). The select has `autocomplete="off"` (no native suggestions needed). The submit button shows a spinner element when the form is in the loading state.

---

## Accessibility

- **Landmarks:** `<header>`, `<nav aria-label="Main navigation">`, `<main>`, `<footer>`.  
- **Heading structure:** Exactly one `<h1>` per page; subsequent headings use `<h2>`, `<h3>`, etc., preserving hierarchy.  
- **Labels:** Every form control has a `<label for="…">`. The “What can we help with?” select is labelled similarly.  
- **Keyboard:** All interactive elements (`<button>`, `<a>`, `<input>`, `<select>`) are reachable via `Tab`. Focus order follows visual order.  
- **Focus indicator:** Visible outline defined by `--focus-outline`.  
- **ARIA:**  
  - Hamburger button: `aria-controls="mobile-menu"` and `aria-expanded="false/true"`.  
  - Mobile menu overlay: `role="dialog"` and `aria-modal="true"`.  
  - Filter buttons: `role="button"` with `aria-pressed="true/false"`.  
  - Form errors: `<div id="error-name" role="alert">` and each input has `aria-describedby="error-name"` when error present.  
- **Reduced motion:** Global `@media (prefers-reduced-motion: reduce)` disables non‑essential transitions and spinner animation speed.  
- **Alt text:** SVG logo has `aria-label="The Bayes Group"`; any decorative images get `alt=""`.  
- **Color‑only information:** Statuses (error, success) are indicated with icons (SVG exclamation or check) plus text.  
- **Tab‑index order:** Prevents focus trapping in the mobile menu; when opened, focus is moved to first link and restored on close.

---

## Content and microcopy

### Global copy
- **Site title (document.title):** “The Bayes Group | Evidence‑driven AI” (home); “Services | The Bayes Group”, “Training | The Bayes Group”, “About | The Bayes Group”, “Book a consultation | The Bayes Group”.
- **Wordmark alt/ARIA:** “The Bayes Group”.

### Home page
- **Hero H1:** “Evidence‑driven AI, built for your business.”
- **Hero sub‑copy:** “We turn data into actionable intelligence through custom AI solutions, hands‑on training, and end‑to‑end enablement.”
- **Primary CTA button:** “Book a consultation” (links to `/contact`).
- **Secondary CTA button:** “Explore services” (links to `/services`).
- **Pillar cards:**  
  - *AI Enablement* – “Assess readiness, design strategy, and embed AI responsibly across your organization.” – “Learn more” → `/services#enablement`.  
  - *Training* – “Empower teams with practical AI skills, from executive briefings to deep‑learning bootcamps.” – “Learn more” → `/services#training`.  
  - *Custom Development* – “Build production‑ready AI applications tailored to your business challenges.” – “Learn more” → `/services#custom-development`.
- **How we work steps:**  
  1. *Assess* – “We evaluate data, people, and processes to define AI opportunities.”  
  2. *Design* – “Co‑create solution architectures aligned with business goals.”  
  3. *Build* – “Develop, test, and iterate fast using proven ML pipelines.”  
  4. *Enable* – “Transfer knowledge and embed governance for sustainable impact.”
- **Why The Bayes Group values:**  
  - “Credentialed data scientists”  
  - “Hands‑on builders”  
  - “Vendor‑neutral advice”  
  - “Knowledge transfer so your team owns the result”
- **Final CTA band:**  
  - Text: “Ready to put AI to work?”  
  - Button: “Book a consultation” (same as primary CTA).

### Services page
- **Section headings:** “AI Enablement”, “Training”, “Custom Development”.  
- **Service items (example entry):**  
  - *AI readiness assessment* – “Identify data gaps, talent needs, and quick‑win opportunities.”  
  - *Use‑case discovery and prioritization* – “Map business problems to feasible AI solutions.”  
  - *AI strategy and roadmap* – “Define a phased plan with measurable milestones.”  
  - *AI governance and responsible‑AI policy* – “Establish ethics, compliance, and risk controls.”  
  - *Executive AI briefings* – “Convey impact and feasibility to leadership in under an hour.”  
  - *Hands‑on team workshops* – “Build end‑to‑end pipelines with your engineers in a day.”  
  - *(continue similarly for all items listed in the brief)*  
- **Typical engagement line:** “Typical engagement: 2 to 6 weeks”.

### Training page
- **Filter buttons:** “All” (selected by default), “Executives”, “Managers”, “Technical teams”.  
- **Course card fields:**  
  - *Title* – e.g., “Intro to Machine Learning for Executives”.  
  - *Audience badge* – “Executives”.  
  - *Format badge* – “Half‑day briefing”.  
  - *Duration* – “0.5 day”.  
  - *You will learn* list (3 bullet points).  
- **Empty‑state text (when filter yields no results):** “No courses match the selected audience.”  
- **Select button states:** `aria-pressed="true"` on the active filter.

### About page
- **Mission paragraph:** “Our mission is to democratize AI by delivering evidence‑driven solutions that create measurable business value.”  
- **Why Bayes paragraph:** “We apply Bayesian reasoning—updating beliefs as evidence arrives—to every engagement, ensuring decisions stay data‑grounded.”  
- **Founder cards (placeholders):**  
  - **Name:** “Founder Name”  
  - **Role:** “Co‑founder & Principal Data Scientist”  
  - **Credentials:** “Ph.D. in Statistics, 10+ years in AI product development” (placeholder).  
  - **Bio:** “[Brief bio to be added]”.  
- **Values list:** “Evidence over hype”, “Build to transfer”, “Vendor‑neutral”, “Responsible by design”.

### Contact page
- **Page H1:** “Book a consultation”.  
- **Contact email line:** “Email us at hello@thebayesgroup.com”.  
- **Form field labels:** “Name”, “Email”, “Company”, “What can we help with?”, “Message”.  
- **Select options:** “AI Enablement”, “Training”, “Custom Development”, “Not sure yet”.  
- **Submit button:** “Send message”.  
- **Validation error messages:** “Please enter your name.”; “Please enter a valid email address.”; “Please enter a message.”  
- **Loading state button text:** “Sending…”.  
- **Success banner:** “Thanks, we'll be in touch within one business day.”  

### 404 page
- **H1:** “Page not found”  
- **Link text:** “Back to home”.

All copy uses plain, active voice and avoids jargon beyond necessary AI terminology.
