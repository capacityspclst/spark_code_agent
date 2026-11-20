# DESIGN.md: The Bayes Group marketing site (prerendered static, redesign)

## Users and goal
**Users:** owners, general managers and operations leads at small and medium-sized businesses (10–500 people) who are weighing outside help with AI. A second group is enterprise leaders who need a senior, governed partner. They arrive from referrals, search or a shared link, often on a phone between meetings, and they are wary of hype.

**The one job:** decide within a minute that this is an established, credible firm that fits a business their size, then book a consultation.

**Success feels like:** "These are senior experts who work with companies like mine, and they will leave my team owning the result." Pages look complete and polished on first paint, shared links show a real title and description, and the message sends with a clear confirmation.

## Primary flow
1. Land on Home (`/`). The prerendered hero shows the h1, the value proposition and **Book a consultation**.
2. Press **Book a consultation**. It is in the hero, the header (desktop), the open Menu (phone) and the closing CTA band, and it goes to `/contact`. The page scrolls to the top and focus moves to `<main>`.
3. Fill in **Name**, **Email** and **Message**. **Company**, **Company size** and **What can we help with?** are optional.
4. Press **Send message**. The site shows "Thanks, we'll be in touch within one business day." and clears the form.

**Secondary paths**
- Home → **See engagements** or **Enterprise engagements** → `/engagements` (or `#enterprise`) → a tier's **Book a consultation** or **Talk to us about enterprise** → `/contact`.
- Home → **Explore services** or a pillar's **Learn more** → the matching `/services` section, scrolled below the sticky header.

The header CTA and the footer nav are on every page, so no page is a dead end.

## Screens and states
The site is static, so nothing loads and no page shows a spinner. Every page is a full HTML file that React hydrates. Long words and the email address use `overflow-wrap: anywhere`. Photos reserve their space with width and height and sit on a navy (`#0B1F3A`) background, so a slow image never shifts the layout or leaves white text on white.

**Page metadata.** Each file has one title, one description, og tags, a canonical link and the favicon.

| Path | Title | Description |
|---|---|---|
| / | The Bayes Group \| Evidence-driven AI | Evidence-driven AI consulting, training and custom development led by two credentialed data scientists. |
| /services | Services \| The Bayes Group | AI enablement, team training and custom AI development that deliver measurable results for your business. |
| /training | Training \| The Bayes Group | Practical AI courses for executives, managers and technical teams, taught by working data scientists. |
| /engagements | Engagements \| The Bayes Group | Right-sized AI engagements for small and medium-sized businesses, with a premium tier for enterprise. |
| /about | About \| The Bayes Group | Meet the data scientists behind The Bayes Group and the values that guide our work. |
| /contact | Contact \| The Bayes Group | Book a consultation with The Bayes Group and get a reply within one business day. |
| 404 | Page not found \| The Bayes Group | The page you requested could not be found on The Bayes Group website. |

**Navigation states**
- **First load:** no scroll and no focus change.
- **Later route change:** the window scrolls to (0,0) and focus moves to `<main id="main" tabIndex=-1>`.
- **Route change with a hash:** the page scrolls to the target, which has `scroll-margin-top: 96px`.
- **Header:** on top it is white with no border. Once `scrollY > 8`, the class `is-scrolled` adds a 1px `#DCE3EB` bottom border. The current link has `aria-current="page"` and a 2px teal underline.

**Home:** sections in this order:
1. Hero
2. Credibility strip
3. Who we serve
4. What we do
5. How we work
6. Client results
7. Testimonial
8. Why The Bayes Group
9. CTA band

**Placeholder content (Home and About)**
- Each case-study card shows an amber **Placeholder** tag and the italic note "Placeholder case study: replace with a real client engagement before launch."
- The testimonial shows the note "Placeholder testimonial: replace with a real client quote before launch."

**Engagements:** a page header (h1, intro), then four tier cards, then the "Not sure which fits?" line.
- Enterprise is the premium card and spans the full width below the three business tiers.
- Many list items: the lists grow and the cards in a row keep equal height, with buttons pinned to the bottom.

**Services:** a page header, then three sections (`enablement`, `training`, `custom-development`). Each section has a photo header, item cards with icons, and the "Typical engagement: …" line.

**Training**
- **Default:** "All" is pressed and the count reads "Showing 6 courses" (`role="status"`).
- **Filtered:** for example, "Showing 2 courses for Managers".
- **Empty:** "No courses for this audience yet." with **Show all courses**.

**About:** mission and Why Bayes beside the photo, two founder cards, four values.
- Each founder card has an avatar silhouette with the caption "Photo placeholder", the **Placeholder** tag and the note "Placeholder: replace with founder credentials and bio."

**Contact**
- **Default:** empty fields. Name, Email and Message each show a "Required" tag.
- **Error:** shown on blur for a field you have touched and for all fields on submit. Focus moves to the first invalid field. Messages:
  - "Please enter your name."
  - "Please enter a valid email address."
  - "Please enter a message."
- **Optional fields:** Company, Company size and topic never show an error.
- **Success:** a green banner with `role="status"` and `tabIndex=-1` that receives focus and reads "Thanks, we'll be in touch within one business day." The form clears. The banner hides on the next edit.
- **Loading:** none. Submit is synchronous and the button is never disabled.

**Not found:** a small bell-curve illustration, the h1 "Page not found", the text "The page you're looking for doesn't exist or has moved.", then **Back to home** and **View services**.

## Layout
**Global**
- Container max-width 1200px, centered. Side padding is 24px on phones and 40px at ≥1024px.
- `html, body { overflow-x: hidden }`. `img, svg { max-width: 100%; height: auto }`.
- Breakpoints: phone below 768px, tablet 768–1023px, desktop ≥1024px. The header shows the five links only at ≥1024px; below that it uses the Menu button.
- Header: 72px tall, `position: sticky; top: 0; z-index: 50`.
- Section rhythm: 64px top and bottom on phones, 112px on desktop. Backgrounds alternate white and `#F1F6F6`, with navy bands for the hero, the testimonial, the CTA band and the footer.

**Phone (390px)**
- One column throughout.
- **Hero:** min-height 560px. The photo covers the hero with `object-fit: cover` and a uniform 88% navy overlay. The h1 is 40px. Buttons are full-width and stacked with a 12px gap.
- **Credibility strip:** a 2×2 grid with a 16px gap.
- **Who we serve:** the SMB panel stacks above the Enterprise panel, and each panel has its photo on top (16:9).
- **Steps:** stacked with a 32px gap and no connecting line.
- **Engagement cards:** stacked with a 24px gap.
- **Contact:** the form card comes first, then the photo and "What happens next".
- **Footer:** columns stack with a 32px gap.

**Desktop (1280px)**
- **Hero:** min-height 640px with text in the left 7 of 12 columns. The overlay is `linear-gradient(90deg, rgba(11,31,58,.94) 0%, rgba(11,31,58,.88) 58%, rgba(11,31,58,.45) 100%)`. The bell-curve motif sits on the right at 0.35 opacity. The h1 is 60px, max 14ch.
- **Credibility strip:** one row of four, with 1px dividers. It overlaps the hero bottom by −48px as a white card with the elevation shadow (a layered look).
- **Who we serve:** a 7/5 split.
- **Pillars:** three columns. **Steps:** four columns, joined by a 2px `#1F8A8A` line behind the 48px circles.
- **Case studies:** three columns. **Testimonial:** centered, max 760px.
- **Why The Bayes Group:** a 5/7 split, photo left, 2×2 points right.
- **Interior page header:** a navy band, 112px top and 80px bottom, with the data-grid pattern. Training puts its photo in the right 5 columns.
- **Services:** each section header is a 6/6 split of text and photo (radius 16px), then items in two columns.
- **Engagements:** three business tiers in three columns, then Enterprise full width as a 5/7 split of photo and content.
- **About:** mission and photo in a 7/5 split, two founders, four values.
- **Contact:** a 7/5 split, form left.
- **Footer:** four columns (wordmark block spanning 2 | Services | Company), with the copyright row below a hairline.

## Design tokens
**Approach:** plain CSS. `src/styles/theme.css` holds the tokens (mirrored in `src/theme/tokens.ts`) and `global.css` holds the classes. System fonts only, no dark theme.

```css
:root {
  --color-navy: #0B1F3A; --color-navy-deep: #071629; --color-white: #FFFFFF;
  --color-accent: #1F8A8A;           /* icons, motifs, step line, premium outline */
  --color-accent-strong: #17696A;    /* buttons, links, focus */
  --color-accent-strong-hover: #115455;
  --color-accent-light: #5FC4C4;     /* eyebrows, links, Premium label on navy */
  --color-text: #2B3645; --color-muted: #556275; --color-muted-on-dark: #B8C4D6;
  --color-surface: #F1F6F6;          /* alternate sections */
  --color-chip: #E6F2F2; --color-disabled-bg: #E6EBF1;
  --color-border: #DCE3EB; --color-input-border: #7A8699;
  --color-error: #B42318; --color-success: #146C43; --color-success-bg: #E8F5EE;
  --color-placeholder-tag: #8A4B00; --color-placeholder-bg: #FFF4E5;
  --overlay-photo: linear-gradient(90deg, rgba(11,31,58,.94), rgba(11,31,58,.88) 58%, rgba(11,31,58,.45));
  --font-serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --text-display: 2.5rem;  /* 40/46; 3.75rem 60/66 at ≥1024 */
  --text-h1: 2.25rem;      /* 36/44; 3rem at ≥1024 */
  --text-h2: 1.875rem;     /* 30/38; 2.5rem at ≥1024 */
  --text-h3: 1.25rem;      /* 20/28; 1.375rem at ≥1024 */
  --text-lead: 1.125rem;   /* 1.25rem at ≥1024 */
  --text-body: 1rem; --text-small: 0.875rem;
  --text-eyebrow: 0.8125rem; /* uppercase, .08em tracking */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px;
  --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 80px; --space-10: 112px;
  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 16px; --radius-pill: 999px;
  --shadow-card: 0 1px 2px rgba(11,31,58,.06), 0 8px 24px rgba(11,31,58,.08);
  --shadow-card-hover: 0 2px 4px rgba(11,31,58,.08), 0 16px 32px rgba(11,31,58,.12);
  --focus-ring: 3px solid var(--color-accent-strong);
  --header-h: 72px;
}
```

**Contrast pairs**

`#283A52` is the worst case for any text on a photo: 88% navy over a white pixel. Text on photos sits only in that zone.

| foreground hex | background hex | use | size (normal, large or ui) |
|---|---|---|---|
| #0B1F3A | #FFFFFF | headings, nav links, labels, secondary button label | normal |
| #0B1F3A | #F1F6F6 | headings on surface | normal |
| #2B3645 | #FFFFFF | body text, input text | normal |
| #2B3645 | #F1F6F6 | body text on surface | normal |
| #556275 | #FFFFFF | muted text, input placeholder, Required tag, placeholder notes | normal |
| #556275 | #F1F6F6 | muted text on surface | normal |
| #556275 | #E6EBF1 | disabled button text | normal |
| #17696A | #FFFFFF | links, eyebrows, Learn more, engagement line | normal |
| #17696A | #F1F6F6 | links and eyebrows on surface | normal |
| #17696A | #E6F2F2 | audience chip text | normal |
| #FFFFFF | #17696A | primary button label, step numerals | normal |
| #FFFFFF | #115455 | primary button label on hover | normal |
| #1F8A8A | #FFFFFF | icons, step line, premium outline | ui |
| #1F8A8A | #F1F6F6 | icons on surface | ui |
| #1F8A8A | #0B1F3A | icons and motif on navy | ui |
| #1F8A8A | #071629 | premium card outline and icons | ui |
| #7A8699 | #FFFFFF | form control and filter borders | ui |
| #17696A | #FFFFFF | focus ring, focused input border | ui |
| #17696A | #F1F6F6 | focus ring on surface | ui |
| #FFFFFF | #0B1F3A | hero and band headings, footer links, testimonial quote, selected filter | normal |
| #FFFFFF | #283A52 | hero h1 and text over the photo overlay | normal |
| #B8C4D6 | #283A52 | hero value proposition over the photo overlay | normal |
| #B8C4D6 | #0B1F3A | value proposition, footer line, attribution, notes on navy | normal |
| #FFFFFF | #071629 | Enterprise card heading and text | normal |
| #B8C4D6 | #071629 | Enterprise card muted text | normal |
| #5FC4C4 | #0B1F3A | eyebrows, links, Premium label on navy | normal |
| #5FC4C4 | #071629 | Premium label, check icons in Enterprise card | normal |
| #5FC4C4 | #0B1F3A | focus ring on dark | ui |
| #5FC4C4 | #071629 | focus ring in Enterprise card | ui |
| #0B1F3A | #FFFFFF | on-dark primary button label | normal |
| #B42318 | #FFFFFF | field error text, icon | normal |
| #B42318 | #FFFFFF | invalid input border | ui |
| #146C43 | #E8F5EE | success banner text and icon | normal |
| #8A4B00 | #FFF4E5 | Placeholder tag | normal |

## Components
**General rules**
- Touch targets are at least 44×44px.
- Focus-visible uses `--focus-ring` with a 2px offset (`#5FC4C4` on navy).
- Transitions are 150–200ms.
- Sections use the `.reveal` class: `animation: rise 500ms ease-out both` (opacity 0→1, translateY 16px→0). It is pure CSS, so content is never hidden in the markup.
- `@media (prefers-reduced-motion: reduce)` sets animation, transition and transform to none and turns off smooth scroll.

**Photo:** a plain `<img>` with srcset (768w, 1344w) and sizes, for example `(min-width:1024px) 50vw, 100vw`. It has width 1344, height 768, decoding async, and lazy loading except the hero. `object-fit: cover`, radius 16px except in full-bleed areas.

**Icon:** 24px viewBox, stroke 1.75, round caps and joins, `currentColor`, `aria-hidden`.
- On cards it sits in a 48px `#E6F2F2` rounded square in teal.
- On navy it sits in a navy-deep square.

**Motifs**
- BellCurveMotif: three overlapping curves, stroke 1.5, teal.
- DataGridPattern: a 24px grid, stroke `#1F8A8A` at 0.15 opacity.
- Both are decorative and `aria-hidden`.

**Button**
- 48px tall (44px in the header), padding 0 24px, radius 6px, sans 600 at 16px.
- Primary: `#17696A`, hover `#115455`, active translateY(1px).
- Secondary: white with a 1.5px navy border.
- On dark: white with navy text, or outline with a white border and white text.
- Disabled: `#E6EBF1` with `#556275` text.
- No loading state.

**Card**
- White, 1px `#DCE3EB` border, radius 12px, padding 24px (32px on desktop), `--shadow-card`.
- Cards with links: on hover, translateY(−4px) and `--shadow-card-hover`.

**Pillar card:** a photo strip on top (16:9, top radius 12px), then an icon, an h3, the text and **Learn more →**. The arrow nudges 4px on hover.

**Audience panel**
- SMB: a white card with photo, h3, text and link.
- Enterprise: `#071629` background with a 1.5px `#1F8A8A` outline, a Premium label and links in `#5FC4C4`.

**Premium label:** a pill, 28px tall, 1.5px `#5FC4C4` border, `#5FC4C4` text, uppercase 13px with a star icon.

**Placeholder tag:** a pill with `#FFF4E5` background, `#8A4B00` text, 13px 600 uppercase.

**Step:** a 48px circle in `#17696A` with a white serif numeral and a 0 0 0 8px ring in the section color. The line is drawn with `.steps::before` at ≥1024px.

**Tier card:** an icon, the h2 name (serif 28px), the audience, a clock-icon timeline, a hairline divider, the h3 "What's included", a check list, then the button pinned to the bottom.
- Enterprise: `#071629` background, teal outline, 40px padding, full width, with the photo on the left.

**Case-study card:** an industry eyebrow and Placeholder tag, h3 "Challenge", h3 "Our approach", the result in bold, and the note in italic muted text.

**Testimonial:** a `<blockquote>` with a serif 24/34 quote and a large teal quote-mark icon, a `<cite>` attribution, the note and the Placeholder tag.

**Filter button:** a pill, 44px tall, 1.5px `#7A8699` border. Selected: navy with white text, a check icon and `aria-pressed="true"`.

**Form field**
- A label (14px 600 navy) with a "Required" tag beside it.
- `.form-control`: 48px tall (textarea 160px), 1.5px `#7A8699` border, radius 6px.
- Focus: `#17696A` border plus the ring. Invalid (`[aria-invalid="true"]`): `#B42318` border only.
- The error is `<p id="{field}-error">` with an icon, linked by `aria-describedby`.
- Selects have a chevron.

**Menu toggle:** "Menu" plus an icon (an X when open), with `aria-expanded` and `aria-controls="mobile-nav"`. The panel holds five 48px links and a full-width CTA.

## Accessibility
- **Landmarks:** a "Skip to main content" link leads to `<main id="main" tabIndex=-1>`. The page uses `<header>`, `<nav aria-label="Main">`, `<main>`, `<footer>` and `<nav aria-label="Footer">`.
- **Headings and language:** one h1 per page, then h2 and h3 with no skipped levels. `<html lang="en">`.
- **Hydration:** the prerendered markup equals the client render. Window is read only in effects.
- **Labels:** every control has a `<label for>`, including "Company size". Required fields have `required`, `aria-required` and the visible text. The form uses `noValidate`.
- **Keyboard:** Tab, Enter and Space work everywhere. Escape closes the Menu and returns focus to the toggle.
- **Status:** the filter count and the success banner use `role="status"`.
- **Images:** descriptive scene alt text, for example "Meeting room with a wall screen showing data visualizations". Photos are never presented as the firm's team or clients. SVGs are `aria-hidden` and `focusable="false"`, except the wordmark (`role="img"`, `aria-label="The Bayes Group"`).
- **Not color alone:** the Premium and Placeholder labels are text, the selected filter has a check icon, errors have an icon and text, and the current link has an underline.
- **Contrast:** text on photos only sits over overlay that is at least 88% navy.

## Content and microcopy
**Header and footer**
- Nav: Services, Training, Engagements, About, Contact, plus **Book a consultation**.
- Footer:
  - the line "AI enablement, training and custom development." and hello@thebayesgroup.com;
  - a Services column: AI Enablement, Training, Custom Development, Engagements;
  - a Company column: About, Contact;
  - "© 2026 The Bayes Group".

**Home**
- **Hero**
  - h1: "Evidence-driven AI, built for your business."
  - Value proposition: "We help small and medium-sized businesses put AI to work, with enterprise-grade rigor and senior data scientists on every engagement."
  - Buttons: **Book a consultation**, **Explore services**.
- **Credibility strip:** "Credentialed data scientists", "Vendor-neutral advice", "Built for small and medium-sized businesses", "Enterprise-grade governance".
- **Who we serve** (h2 "Who we serve")
  - SMB panel: "Practical, right-sized AI that fits your budget and your systems. You see results in weeks, and your team owns the solution afterwards." → **See engagements**.
  - Enterprise panel, with the **Premium** label: "A dedicated senior team with custom scope for larger organizations. Governance, security and responsible-AI practices are built in from day one." → **Enterprise engagements**.
- **Sections:** h2 headings "What we do", "How we work", "Client results", "Why The Bayes Group".
- **Case studies:** each result reads "Result: to be added from a real engagement."
- **Testimonial:** "Working with The Bayes Group gave our team the confidence to use AI in our daily operations." Attributed to "Client name, Title, Company".
- **CTA band:** "Ready to put AI to work?" with "Tell us about your goals. We'll reply within one business day." and **Book a consultation**.

**Engagements**
- Intro: "Right-sized engagements for small and medium-sized businesses, and a premium tier for enterprise."
- Tiers, timelines and included items exactly as in the plan. Buttons: **Book a consultation** on the three business tiers, **Talk to us about enterprise** on Enterprise.
- Closing line: "Not sure which fits? Tell us about your business and we'll recommend one." The link text is "Tell us about your business".

**Contact**
- Intro: "Tell us what you're working on and we'll reply within one business day."
- Email line: "Prefer email? hello@thebayesgroup.com"
- Fields: Name, Email, Company, Company size ("Choose a size"), What can we help with? ("Choose a topic"), Message. Button: **Send message**.
- "What happens next":
  1. "We reply within one business day"
  2. "A 30-minute call about your goals"
  3. "A written recommendation, no obligation"

**Not found:** **Back to home**, **View services**.
