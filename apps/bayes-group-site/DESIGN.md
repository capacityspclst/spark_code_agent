# DESIGN.md: The Bayes Group marketing site

## Users and goal
**Users:** executives, operations leaders and technical managers at mid-size companies who are weighing outside help with AI. They arrive from referrals or search, often on a phone between meetings, and are skeptical of hype.

**The one job:** decide within about a minute that this firm is credible and relevant, then book a consultation.

**Success feels like:** "These are serious, hands-on experts who will leave my team capable." The visitor finds the right service or course quickly and sends a message without friction. They then see clear confirmation that a reply comes within one business day.

## Primary flow
1. Land on Home (`/`). Read the h1 and value proposition.
2. Press **Book a consultation**. This is in the hero, the header (desktop) and the open Menu (phone), and it goes to `/contact`.
3. Fill in **Name**, **Email** and **Message**. Optionally fill in **Company** and **What can we help with?**.
4. Press **Send message**. The site shows "Thanks, we'll be in touch within one business day." and clears the form.

**Secondary path:** Home → **Explore services** or a pillar's **Learn more** → the matching section on `/services` → **Book a consultation**. Every page has the header CTA and the footer nav, so no screen is a dead end.

## Screens and states
The site is static, with no data loading and no network, so no page has a loading spinner. Content renders immediately. On every page, long words and the email address use `overflow-wrap: anywhere` so nothing overflows at 390px.

**Header (all pages)**
- Desktop shows the wordmark, the nav links and the **Book a consultation** button.
- Phone shows the wordmark and a **Menu** button. When open, a full-width panel slides down below the header with the 4 links stacked and a full-width **Book a consultation** button.
- The panel closes on a link click, on Escape and on a second press of Menu.
- The current page link gets `aria-current="page"` and a 2px teal underline.

**Home**
Sections in order:
1. Hero, on a navy background.
2. Three pillar cards.
3. How we work: 4 numbered steps.
4. Why The Bayes Group: 4 points with check icons.
5. CTA band on navy: "Ready to put AI to work?" with **Book a consultation**.

**Services**
- An h1 "Services" with an intro line.
- Three `<section>` elements with ids `enablement`, `training` and `custom-development`. Each has an eyebrow, an h2, an intro, item cards (name in h3 plus one sentence) and a "Typical engagement: …" line with a clock icon.
- Hash links scroll to the section with `scroll-margin-top: 96px` so the heading is not hidden under the sticky header.

**Training**
- An h1 "Training" with an intro, a filter bar (All, Executives, Managers, Technical teams), a result count and a course grid.
- Default state: "All" is pressed and the count reads "Showing 6 courses" (live region `role="status"`).
- Filtered state: the grid shows only matching cards and the count updates, for example "Showing 2 courses for Managers".
- Empty state (defensive): the text "No courses for this audience yet." and a secondary button **Show all courses**.
- Many items: the grid wraps, and every card has an equal height within its row.

**About**
- An h1 "About", then a Mission section, a Why Bayes section, two founder cards and four value cards.
- Each founder card shows an amber **Placeholder** tag and the italic note "Placeholder: replace with founder credentials and bio."

**Contact**
- An h1 "Book a consultation", an info column and a form card.
- Default: empty fields. The Name, Email and Message labels each have a "Required" tag beside them.
- Field error: shown on blur for touched fields and on submit for all fields. Red error text with an alert icon sits directly under its field. Focus moves to the first invalid field. Nothing is sent. Messages:
  - "Please enter your name."
  - "Please enter a valid email address."
  - "Please enter a message."
- Success: a green banner with a check icon above the form, `role="status"`, reading "Thanks, we'll be in touch within one business day." The form is cleared. Focus moves to the banner (`tabIndex=-1`). The banner hides when the user next edits a field.
- There is no loading state, because submit is synchronous and the button is never disabled.

**Not found (any unknown route)**
An h1 "Page not found", the text "The page you're looking for doesn't exist or has moved.", a primary button **Back to home** (`/`) and a link **View services**.

## Layout
**Global rules**
- Container: `max-width: 1200px`, centered, horizontal padding 24px on phone and 40px at ≥1024px.
- `html, body { overflow-x: hidden }`. Images and SVGs use `max-width: 100%`. No fixed widths over 342px on phones.
- Breakpoints: phone below 768px, tablet 768–1023px, desktop ≥1024px. The nav collapses below 768px.
- Header: sticky, 72px tall, white, with a bottom border in `--color-border`.

**Phone (390px)**
- All content is a single column.
- Section padding is 64px top and bottom.
- Hero: h1 at 40px, buttons stacked full-width with 12px gap.
- Cards stack with 16px gap.
- Training filters form a horizontally wrapping row of chips (wrapping, not scrolling).
- Contact: the info block sits above the form.
- Footer: stacked.

**Desktop (1280px)**
- Section padding is 112px top and bottom, on a 12-column grid with 32px gutters.
- Hero: a 7/5 split. The text sits left (h1 at 56px, max 640px wide) and a large decorative SVG bell-curve with teal posterior lines sits right (`aria-hidden`).
- Pillars: 3 columns. How we work: 4 columns with a connecting hairline.
- Why: a 2×2 grid next to a left heading column (4/8 split).
- Services: each section's heading and intro sit in a sticky left column (4 cols) and the items form a 2-column grid on the right (8 cols).
- Training: 3-column course grid. About: founders in 2 columns, values in 4.
- Contact: info column (5 cols) and form card (7 cols, max 640px).
- Footer: 3 columns (wordmark and line | nav | copyright).

## Design tokens
**Styling approach:** plain CSS. `src/styles/theme.css` holds the tokens below. `global.css` holds the component classes. There are no frameworks, no web fonts and no dark theme (the brand is navy and white).

```css
:root {
  --color-navy: #0B1F3A;          /* headings, header text, hero, CTA band, footer */
  --color-white: #FFFFFF;         /* page background, text on navy */
  --color-accent: #1F8A8A;        /* bell-curve mark, icons, decorative lines only (not small text) */
  --color-accent-strong: #17696A; /* primary buttons, links, eyebrows, focus ring on light */
  --color-accent-strong-hover: #115455;
  --color-accent-light: #5FC4C4;  /* mark, eyebrow, link hover, focus ring on navy */
  --color-text: #2B3645;          /* body text */
  --color-muted: #556275;         /* secondary text, placeholder, disabled text */
  --color-muted-on-dark: #B8C4D6; /* secondary text on navy */
  --color-surface: #F4F7FA;       /* alternating section background */
  --color-chip: #E6F2F2;          /* audience chip background */
  --color-disabled-bg: #E6EBF1;
  --color-border: #DCE3EB;        /* decorative card borders */
  --color-input-border: #7A8699;  /* inputs, filter buttons (3:1) */
  --color-error: #B42318;
  --color-success: #146C43;
  --color-success-bg: #E8F5EE;
  --color-placeholder-tag: #8A4B00;
  --color-placeholder-bg: #FFF4E5;

  --font-serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* type scale: size/line-height (mobile → desktop) */
  --text-display: 2.5rem;  /* 40/48 → 3.5rem 56/64, hero h1, serif 600 */
  --text-h1: 2.25rem;      /* 36/44 → 3rem 48/56, page h1 */
  --text-h2: 1.75rem;      /* 28/36 → 2.25rem 36/44 */
  --text-h3: 1.25rem;      /* 20/28 → 1.375rem 22/30, serif */
  --text-lead: 1.125rem;   /* 18/30 → 1.25rem 20/32 */
  --text-body: 1rem;       /* 16/26 → 1.0625rem 17/28 */
  --text-small: 0.875rem;  /* 14/22 */
  --text-eyebrow: 0.8125rem; /* 13/20, uppercase, 600, letter-spacing .08em */

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 80px; --space-10: 112px;

  --radius-sm: 6px;   /* inputs, buttons, chips */
  --radius-md: 12px;  /* cards */
  --radius-pill: 999px;
  --shadow-card: 0 1px 2px rgba(11,31,58,.06), 0 8px 24px rgba(11,31,58,.08);
  --focus-ring: 3px solid var(--color-accent-strong);
  --header-h: 72px;
}
```

**Contrast pairs**

| foreground hex | background hex | use | size (normal, large or ui) |
|---|---|---|---|
| #0B1F3A | #FFFFFF | headings, nav links, wordmark text, secondary button label | normal |
| #0B1F3A | #F4F7FA | headings and card titles on surface sections | normal |
| #2B3645 | #FFFFFF | body text | normal |
| #2B3645 | #F4F7FA | body text on surface | normal |
| #556275 | #FFFFFF | muted text, input placeholder, form hints | normal |
| #556275 | #F4F7FA | muted text on surface | normal |
| #556275 | #E6EBF1 | disabled button text | normal |
| #17696A | #FFFFFF | links, eyebrows, "Learn more", engagement line | normal |
| #17696A | #F4F7FA | links and eyebrows on surface | normal |
| #17696A | #E6F2F2 | audience chip text | normal |
| #FFFFFF | #17696A | primary button label, step number digits | normal |
| #FFFFFF | #115455 | primary button label on hover | normal |
| #1F8A8A | #FFFFFF | bell-curve mark, pillar and check icons | ui |
| #1F8A8A | #F4F7FA | icons on surface | ui |
| #7A8699 | #FFFFFF | input and filter button borders | ui |
| #17696A | #FFFFFF | focus ring on light | ui |
| #FFFFFF | #0B1F3A | hero h1, CTA band text, footer links, wordmark on dark, filter selected label, skip link | normal |
| #B8C4D6 | #0B1F3A | hero value prop, footer line, copyright | normal |
| #5FC4C4 | #0B1F3A | eyebrow and link hover on dark, mark on dark | normal |
| #5FC4C4 | #0B1F3A | focus ring on dark | ui |
| #0B1F3A | #FFFFFF | on-dark primary button label (white button on navy) | normal |
| #B42318 | #FFFFFF | field error text and icon | normal |
| #B42318 | #FFFFFF | invalid input border | ui |
| #146C43 | #E8F5EE | success banner text and icon | normal |
| #8A4B00 | #FFF4E5 | Placeholder tag | normal |

## Components
All interactive elements are at least 44×44px. Every interactive element shows a focus-visible outline (`--focus-ring`, 2px offset; light-teal on navy). Transitions run 150ms ease and are disabled under `prefers-reduced-motion`.

- **Wordmark:** an inline SVG bell curve (28×20, stroke 2.5px, `--color-accent`; `--color-accent-light` on navy) followed by "The Bayes Group" in serif 600 at 20px. The SVG has `role="img"` and `aria-label="The Bayes Group"`. The text is `aria-hidden`, so the name is announced once. The header link's accessible name is "The Bayes Group home".
- **Button**, height 48px (44px for the header CTA), padding 0 24px, radius 6px, sans 600 at 16px:
  - Primary: `#17696A` with white text. Hover `#115455`. Active: translateY(1px).
  - Secondary: white with a navy 1.5px border and navy text. Hover: surface background.
  - On-dark primary: white with navy text. Hover `#F4F7FA`.
  - On-dark secondary: transparent with a white 1.5px border and white text.
  - Disabled (unused for submit): `#E6EBF1` with `#556275` text and `cursor: not-allowed`.
- **Text link:** `#17696A`, underline on hover. "Learn more" is followed by an → icon that nudges 4px on hover.
- **Menu toggle (phone):** 44×44 minimum, the label "Menu" plus a hamburger icon (an X when open), `aria-expanded`, `aria-controls="mobile-nav"`. Nav links in the panel are 48px tall.
- **Card:** white, 1px `--color-border`, radius 12px, padding 24px (32px desktop), `--shadow-card`. Hover (cards containing links only): translateY(-2px).
- **Pillar card:** a 40px teal icon, an h3, 2–3 sentences, then "Learn more".
- **Step:** a 40px circle in `#17696A` with a white serif numeral, an h3 and one sentence.
- **Service item card:** an h3 and one sentence.
- **Course card:**
  - Top row: an audience chip (pill, `#E6F2F2` background, `#17696A` text, 13px 600) and the format.
  - Title in h3.
  - A meta row with clock-icon duration and format text.
  - A divider, then "You will learn" (h4-style label) with a 3-item check list.
- **Filter button:** pill, height 44px, padding 0 20px.
  - Default: white, 1.5px `#7A8699` border, navy text.
  - Selected: navy background, white text, a leading check icon and `aria-pressed="true"`.
  - Hover: surface background.
- **Form field:** the label (14px 600 navy) sits above the control, with the "Required" tag (12px muted) outside the `<label>`. Controls are 48px tall (the textarea is 160px), with a 1.5px `#7A8699` border, radius 6px and 16px text.
  - Focus: the ring plus a teal border.
  - Invalid: a `#B42318` border with `aria-invalid="true"`. The error `<p id="{field}-error">` sits 8px below with an icon and is linked through `aria-describedby`.
  - The select uses a custom chevron. The first option reads "Choose a topic" (value "").
- **Alert banner:** success style, radius 6px, padding 16px, with an icon.
- **Placeholder tag:** an amber pill reading "Placeholder".
- **Footer:** navy, padding 64px (desktop 80px) top and bottom, with the wordmark, the line, a `<nav aria-label="Footer">` and the copyright.

## Accessibility
- Landmarks: a skip link "Skip to main content" (visible on focus) jumps to `<main id="main" tabIndex=-1>`. The page uses `<header>`, `<nav aria-label="Main">`, `<main>` and `<footer>`.
- Headings: exactly one h1 per page, then h2 for sections and h3 for cards, with no skipped levels.
- Labels: every input uses a `<label for>`. Required fields use `required` and `aria-required`, and the form sets `noValidate`. The Menu button has a visible text label. Decorative SVGs are `aria-hidden="true"` and `focusable="false"`.
- Keyboard: the full flow works with Tab, Enter and Space. The Menu panel closes on Escape and returns focus to the toggle.
- Route changes: on navigation, focus moves to `<main>` and the page scrolls to the top (or to the hash target).
- Status messages: the filter count and the success banner use `role="status"`.
- Color is never the only signal: the selected filter has a check icon and `aria-pressed`, errors have an icon and text, the current nav item has an underline, and the placeholder tag has text.
- Motion: `@media (prefers-reduced-motion: reduce)` removes transforms, transitions and smooth scrolling.
- Images: there are no raster images. Each page sets its document title per the plan.

## Content and microcopy
**Hero**
- h1: "Evidence-driven AI, built for your business."
- Value proposition: "We help your team find, build and own AI that delivers measurable results, guided by two credentialed data scientists."
- Buttons: **Book a consultation**, **Explore services**.

**Home sections**
- Section headings (h2): "What we do", "How we work", "Why The Bayes Group".
- Steps:
  1. Assess: "We map your data, processes and goals to find where AI pays off."
  2. Design: "We define the solution, success metrics and a realistic plan."
  3. Build: "We develop, test and deploy working AI alongside your team."
  4. Enable: "We train your people so they own and extend what we built."
- Why points (h3):
  - "Credentialed data scientists"
  - "Hands-on builders"
  - "Vendor-neutral advice"
  - "Your team owns the result"
- CTA band: "Ready to put AI to work?" with the line "Tell us about your goals. We'll reply within one business day." and **Book a consultation**.

**Services and Training**
- Services intro: "Three ways we help, from first strategy to production systems."
- Engagement line format: "Typical engagement: 2 to 6 weeks".
- Training intro: "Practical courses for every level, taught by working data scientists."
- Filter group label (visually hidden): "Filter courses by audience".

**Contact**
- Intro: "Tell us what you're working on and we'll reply within one business day."
- Email line: "Prefer email? hello@thebayesgroup.com" (as a mailto link).
- Required-fields note: "Fields marked Required must be filled in."
- Button: **Send message**.
- Error and success text exactly as listed in Screens and states.

**Footer**
"AI enablement, training and custom development." and "© 2026 The Bayes Group".
