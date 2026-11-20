# DESIGN.md: The Bayes Group marketing site (prerendered static)

## Users and goal
**Users:** executives, operations leaders and technical managers at mid-size companies who are weighing outside help with AI. They arrive from referrals, search or a shared link (LinkedIn, Slack, email), often on a phone between meetings, and they are skeptical of hype.

**The one job:** decide within about a minute that this firm is credible and relevant, then book a consultation.

**Success feels like:** "These are serious, hands-on experts who will leave my team capable." Shared links show a real title and description, so the site looks credible before anyone clicks. Pages appear complete at once, with no blank flash. The message is sent without friction and followed by a clear confirmation.

## Primary flow
1. Land on Home (`/`). The prerendered HTML shows the h1 and the value proposition immediately.
2. Press **Book a consultation**. It is in the hero, the header (desktop) and the open Menu (phone), and it goes to `/contact`. The page scrolls to the top and focus moves to `<main>`.
3. Fill in **Name**, **Email** and **Message**. **Company** and **What can we help with?** are optional.
4. Press **Send message**. The site shows "Thanks, we'll be in touch within one business day." and clears the form.

**Secondary path:** Home → **Explore services** or a pillar's **Learn more** → the matching section on `/services`, scrolled below the sticky header → **Book a consultation**. Every page has the header CTA and the footer nav, so no screen is a dead end.

## Screens and states
The site is static. There is no data loading and no network, so no screen has a spinner. Every page is a full HTML file that React hydrates. Long words and the email address use `overflow-wrap: anywhere`.

**Page metadata.** Each file has exactly one title, one description, the og tags, a canonical link and `<link rel="icon" href="/favicon.svg">`.

| Path | Title | Description |
|---|---|---|
| / | The Bayes Group \| Evidence-driven AI | Evidence-driven AI consulting, training and custom development led by two credentialed data scientists. |
| /services | Services \| The Bayes Group | AI enablement, team training and custom AI development that deliver measurable results for your business. |
| /training | Training \| The Bayes Group | Practical AI courses for executives, managers and technical teams, taught by working data scientists. |
| /about | About \| The Bayes Group | Meet the data scientists behind The Bayes Group and the values that guide our work. |
| /contact | Contact \| The Bayes Group | Book a consultation with The Bayes Group and get a reply within one business day. |
| 404 | Page not found \| The Bayes Group | The page you requested could not be found on The Bayes Group website. |

**Navigation states**
- **First load:** no scrolling and no focus change.
- **Later route change without a hash:** the window scrolls to (0,0) and focus moves to `<main id="main" tabIndex=-1>`. The focus outline is suppressed on main through `main:focus { outline: none }`.
- **Route change with a hash:** the page scrolls to the target with `scroll-margin-top: calc(var(--header-h) + 24px)` (96px).

**Header (all pages)**
- Desktop shows the wordmark, the nav links and **Book a consultation**.
- Phone shows the wordmark and a **Menu** button. The panel holds 4 stacked links plus a full-width CTA. It closes on a link click, on Escape and on a second press of Menu.
- The current link has `aria-current="page"` and a 2px teal underline.

**Home**
- Sections in order: hero (navy), three pillar cards, How we work (4 steps, surface background), Why The Bayes Group (4 check points), and a CTA band on navy.

**Services**
- An h1 "Services" and an intro.
- Three sections with ids `enablement`, `training` and `custom-development`. Each has an eyebrow, an h2, an intro, item cards and the line "Typical engagement: …" with a clock icon.

**Training**
- An h1, an intro, a filter bar (All, Executives, Managers, Technical teams), a count and a grid.
- Default: "All" is pressed and the count reads "Showing 6 courses" (`role="status"`).
- Filtered: for example, "Showing 2 courses for Managers".
- Empty: "No courses for this audience yet." with **Show all courses**.
- Many items: the grid wraps and cards in a row have equal height.

**About**
- An h1 "About", Mission, Why Bayes, two founder cards and four value cards.
- Each founder card has an amber **Placeholder** tag and the italic note "Placeholder: replace with founder credentials and bio."

**Contact**
- An h1 "Book a consultation", an info column and a form card.
- **Default:** empty fields. Name, Email and Message each show one identical "Required" tag.
- **Error:** shown on blur for touched fields and for all fields on submit. Focus moves to the first invalid field. Only the invalid fields get `aria-invalid="true"` and a red border; Company and topic never do. Messages:
  - "Please enter your name."
  - "Please enter a valid email address."
  - "Please enter a message."
- **Success:** a green banner with `role="status"` and `tabIndex=-1`, which receives focus. It reads "Thanks, we'll be in touch within one business day." The form clears. The banner hides on the next edit.
- **Loading:** none. Submit is synchronous and the button is never disabled.

**Not found (dist/404.html)**
- An h1 "Page not found" and the text "The page you're looking for doesn't exist or has moved."
- **Back to home** (primary) and a **View services** link.

## Layout
**Global**
- Container: max-width 1200px, centered. Padding is 24px on phones and 40px at ≥1024px.
- `html, body { overflow-x: hidden }`. SVGs use `max-width: 100%`.
- Breakpoints: below 768px is phone, 768–1023px is tablet, ≥1024px is desktop.
- Header: sticky, 72px, white, with a bottom border.

**Phone (390px)**
- One column, sections padded 64px top and bottom.
- Hero: h1 at 40px, buttons full-width and stacked with a 12px gap.
- Cards: 16px gap.
- Filter chips wrap.
- Contact: the info block sits above the form.
- How we work: steps stack vertically with a 32px gap. Each step has the circle above its title, and there is no line.
- Footer: stacked with a 24px gap.

**Desktop (1280px)**
- Sections padded 112px, on a 12-column grid with 32px gutters.
- Hero: 7/5 split, with a decorative bell-curve SVG on the right.
- Pillars: 3 columns.
- How we work at ≥1024px:
  - The list is `display:grid; grid-template-columns: repeat(4,1fr); gap: 32px; position: relative`.
  - A `::before` line runs at `top: 20px; left: 12.5%; right: 12.5%; height: 2px; background: var(--color-accent)` with `z-index: 0`.
  - The circles have `position: relative; z-index: 1` and a 0 0 0 8px ring in the section background color, so the line appears to pass behind them.
- Why: 4/8 split.
- Services: a sticky 4-column heading next to an 8-column grid of items in 2 columns.
- Training: 3 columns. About: 2 founders and 4 values.
- Contact: 5/7 split.
- Footer: 3 columns (wordmark and line | nav | copyright).

## Design tokens
**Approach:** plain CSS. `src/styles/theme.css` holds the tokens and `global.css` holds the classes. There are no frameworks, web fonts or dark theme.

```css
:root {
  --color-navy: #0B1F3A; --color-white: #FFFFFF;
  --color-accent: #1F8A8A;        /* mark, icons, favicon, step line */
  --color-accent-strong: #17696A; /* buttons, links, focus, input focus border */
  --color-accent-strong-hover: #115455;
  --color-accent-light: #5FC4C4;  /* accents on navy */
  --color-text: #2B3645; --color-muted: #556275; --color-muted-on-dark: #B8C4D6;
  --color-surface: #F4F7FA; --color-chip: #E6F2F2; --color-disabled-bg: #E6EBF1;
  --color-border: #DCE3EB;        /* decorative card borders */
  --color-input-border: #7A8699;  /* all form controls, filter buttons */
  --color-error: #B42318; --color-success: #146C43; --color-success-bg: #E8F5EE;
  --color-placeholder-tag: #8A4B00; --color-placeholder-bg: #FFF4E5;
  --font-serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --text-display: 2.5rem; /* 40/48 → 56/64 */  --text-h1: 2.25rem; /* 36/44 → 48/56 */
  --text-h2: 1.75rem; /* 28/36 → 36/44 */      --text-h3: 1.25rem; /* 20/28 → 22/30 serif */
  --text-lead: 1.125rem; --text-body: 1rem; --text-small: 0.875rem; --text-eyebrow: 0.8125rem;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px;
  --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 80px; --space-10: 112px;
  --radius-sm: 6px; --radius-md: 12px; --radius-pill: 999px;
  --shadow-card: 0 1px 2px rgba(11,31,58,.06), 0 8px 24px rgba(11,31,58,.08);
  --focus-ring: 3px solid var(--color-accent-strong);
  --header-h: 72px;
}
```

**Contrast pairs**

| foreground hex | background hex | use | size (normal, large or ui) |
|---|---|---|---|
| #0B1F3A | #FFFFFF | headings, nav links, wordmark, form labels, secondary button label, card titles | normal |
| #0B1F3A | #F4F7FA | headings, step and pillar titles on surface | normal |
| #2B3645 | #FFFFFF | body text, input text | normal |
| #2B3645 | #F4F7FA | body text on surface | normal |
| #556275 | #FFFFFF | muted text, placeholder, Required tag, hints | normal |
| #556275 | #F4F7FA | muted text on surface | normal |
| #556275 | #E6EBF1 | disabled button text | normal |
| #17696A | #FFFFFF | links, eyebrows, Learn more, engagement line | normal |
| #17696A | #F4F7FA | links and eyebrows on surface | normal |
| #17696A | #E6F2F2 | audience chip text | normal |
| #FFFFFF | #17696A | primary button label, step numerals | normal |
| #FFFFFF | #115455 | primary button label on hover | normal |
| #1F8A8A | #FFFFFF | bell-curve mark, favicon, icons | ui |
| #1F8A8A | #F4F7FA | icons and How-we-work line on surface | ui |
| #7A8699 | #FFFFFF | form control and filter borders | ui |
| #17696A | #FFFFFF | focus ring, focused input border | ui |
| #17696A | #F4F7FA | focus ring on surface | ui |
| #FFFFFF | #0B1F3A | hero h1, CTA text, footer links, selected filter label, skip link | normal |
| #B8C4D6 | #0B1F3A | hero value prop, footer line, copyright | normal |
| #5FC4C4 | #0B1F3A | eyebrow, link hover, mark on dark | normal |
| #5FC4C4 | #0B1F3A | focus ring on dark | ui |
| #0B1F3A | #FFFFFF | on-dark primary button label | normal |
| #B42318 | #FFFFFF | field error text and icon | normal |
| #B42318 | #FFFFFF | invalid input border | ui |
| #146C43 | #E8F5EE | success banner text and icon | normal |
| #8A4B00 | #FFF4E5 | Placeholder tag | normal |

## Components
**General rules**
- Touch targets are at least 44×44px.
- Focus-visible uses `--focus-ring` with a 2px offset (light teal on navy).
- Transitions are 150ms and are removed under reduced motion.
- Every class used in the markup has a CSS rule.

**Wordmark**
- A 28×20 bell-curve SVG followed by "The Bayes Group" in serif 600 at 20px.
- The SVG has `role="img"` and `aria-label="The Bayes Group"`, and the text is `aria-hidden`.
- The header link's name is "The Bayes Group home".

**Favicon (`public/favicon.svg`)**
- The same bell-curve path with stroke `#1F8A8A`, stroke-width 2.5, `fill="none"`, `xmlns` and a viewBox.

**Button**
- 48px tall (44px in the header), padding 0 24px, radius 6px, sans 600 at 16px.
- Primary: `#17696A`, hover `#115455`, active translateY(1px).
- Secondary: white with a 1.5px navy border.
- On-dark primary: white with navy text.
- On-dark secondary: a white border.
- Disabled: `#E6EBF1` with `#556275` text.

**Text link**
- `#17696A`, underline on hover. "Learn more" has an → arrow that nudges 4px.

**Menu toggle**
- The label "Menu" plus an icon (an X when open), with `aria-expanded` and `aria-controls="mobile-nav"`. Panel links are 48px tall.

**Card**
- White, 1px `--color-border`, radius 12px, padding 24px (32px on desktop), `--shadow-card`.
- Cards that contain links lift −2px on hover.

**Pillar card**
- `.pillar-icon`: 40px teal, 16px margin below.
- `.pillar-title` (h3): its own rule, `font-family: var(--font-serif)`, `--text-h3`, weight 600, navy, `margin: 0 0 8px`. This matches `.course-title` and `.service-title`.
- `.pillar-text`: then 16px space before "Learn more".
- Keep the class names the existing markup uses and style exactly those.

**Step**
- `.steps` is an `ol` with no list style.
- `.step-number`: a 40px circle in `#17696A` with a white serif numeral.
- `.step-title` is an h3 with 16px above it; `.step-text` is one sentence.

**Course card**
- An audience chip and the format, then an h3, a clock-icon meta row, a divider and "You will learn" with 3 checks.

**Filter button**
- Pill, 44px tall, 1.5px `#7A8699` border.
- Selected: navy background, white text, a check icon and `aria-pressed="true"`.

**Form field**
- The `<label>` (14px 600 navy) sits on the same row as `<span class="required-tag">Required</span>`, which is placed outside the label in an identical structure for Name, Email and Message.
- Every input, select and textarea has `.form-control`: 48px tall (textarea 160px), `border: 1.5px solid var(--color-input-border)`, radius 6px, 16px text.
- `.form-control:focus-visible`: `border-color: var(--color-accent-strong)` plus the ring.
- `.form-control[aria-invalid="true"]`: `border-color: var(--color-error)`. No other rule makes a border red.
- The error is `<p id="{field}-error">`, 8px below, with an icon, and is linked by `aria-describedby`.
- The select has a chevron, and its first option is "Choose a topic".

**Alert banner**
- Success colors, radius 6px, padding 16px, with an icon.

**Footer**
- Navy, padding 64px (80px on desktop).
- Contains only:
  - the wordmark home link,
  - "AI enablement, training and custom development." (exactly once),
  - `<nav aria-label="Footer">` with Services, Training, About and Contact,
  - "© 2026 The Bayes Group".

## Accessibility
- **Landmarks:** a skip link "Skip to main content" leads to `<main id="main" tabIndex=-1>`. The page uses `<header>`, `<nav aria-label="Main">`, `<main>`, `<footer>` and `<nav aria-label="Footer">`.
- **Headings:** one h1 per page, then h2 and h3 with no skipped levels.
- **Language:** `<html lang="en">`.
- **Hydration:** the prerendered markup equals the client render. Window and document are read only in effects, so content and focus order are complete without JavaScript.
- **Labels:** every control has a `<label for>`. Required fields carry `required`, `aria-required` and the visible "Required" text. The form uses `noValidate`. Decorative SVGs are `aria-hidden="true"` and `focusable="false"`.
- **Keyboard:**
  - Tab, Enter and Space work throughout.
  - Escape closes the Menu and returns focus to the toggle.
  - After a route change, focus goes to main and the window scrolls to the top (or to the hash target), but not on first load.
- **Status:** the filter count and the success banner use `role="status"`.
- **Not color alone:** the selected filter has a check icon, errors have an icon and text, the current nav link has an underline, and required fields have the "Required" text.
- **Motion:** `prefers-reduced-motion` removes transforms, transitions and smooth scroll.
- **Images:** no raster images.

## Content and microcopy
**Hero**
- h1: "Evidence-driven AI, built for your business."
- Value proposition: "We help your team find, build and own AI that delivers measurable results, guided by two credentialed data scientists."
- Buttons: **Book a consultation**, **Explore services**.

**Home**
- h2 headings: "What we do", "How we work", "Why The Bayes Group".
- Steps:
  1. Assess: "We map your data, processes and goals to find where AI pays off."
  2. Design: "We define the solution, success metrics and a realistic plan."
  3. Build: "We develop, test and deploy working AI alongside your team."
  4. Enable: "We train your people so they own and extend what we built."
- Why points: "Credentialed data scientists", "Hands-on builders", "Vendor-neutral advice", "Your team owns the result".
- CTA band: "Ready to put AI to work?" with "Tell us about your goals. We'll reply within one business day." and **Book a consultation**.

**Services and Training**
- Services intro: "Three ways we help, from first strategy to production systems."
- Engagement line: "Typical engagement: 2 to 6 weeks".
- Training intro: "Practical courses for every level, taught by working data scientists."
- Filter label (visually hidden): "Filter courses by audience".

**Contact**
- Intro: "Tell us what you're working on and we'll reply within one business day."
- Email line: "Prefer email? hello@thebayesgroup.com" (a mailto link).
- Note: "Fields marked Required must be filled in."
- Tag: "Required".
- Button: **Send message**.
- Errors and success text exactly as listed in Screens and states.

**Not found**
- **Back to home**, **View services**.

**Footer**
- "AI enablement, training and custom development." and "© 2026 The Bayes Group". There is no other paragraph.

**robots.txt**
- `User-agent: *`, `Allow: /`, `Sitemap: https://thebayesgroup.com/sitemap.xml`.
