# DESIGN.md: The Bayes Group marketing site (prerendered static)

> **Scope of the current change:** documentation only. `DEPLOYMENT.md` is updated so that it matches the seven-page site described below. No UI, copy, token, component or route changes. Every screen, state and acceptance test stays exactly as specified here.

## Users and goal
**Users:** owners, operations leaders and technical managers at small and medium-sized businesses (first), plus enterprise leaders buying a premium program. They arrive from referrals, search or shared links, often on a phone, and they distrust AI hype.

**The one job:** see within a minute that this is a senior engineering firm that builds specific, observable, sustainable AI systems at the right size for them, then book a consultation.

**Success feels like:** "They have built this before, they will show me how it runs, and my team will own it." Shared links show real titles. Pages render complete with no flash. The message sends and is confirmed.

## Primary flow
1. Land on Home (`/`). The prerendered hero shows the h1, the value proposition, **Book a consultation** and **See how we build**.
2. Press **Book a consultation** (hero, header, Menu panel, every CTA band) to go to `/contact`. The page scrolls to the top and focus moves to `<main>`.
3. Fill in **Name**, **Email** and **Message**. **Company**, **Company size** and **What can we help with?** are optional.
4. Press **Send message**. The banner reads "Thanks, we'll be in touch within one business day." and the form clears.

**Secondary paths**
- **See how we build** → `/systems` → **Book a consultation**.
- Who we serve → **See engagements** / **Enterprise engagements** → `/engagements` → a tier button → `/contact`.

The header holds all six links and the CTA on every page. The footer's Services and Company columns also reach every page, so no page is a dead end.

## Screens and states
The site is static: no data loading, no network, no spinners. React hydrates the prerendered HTML. Long words and the email use `overflow-wrap:anywhere`. Photos reserve their space with width/height (no layout shift). If an image fails to load, its alt text shows on the navy fallback background `#0B1F3A`.

**Pages and built files** (what `npm run build` writes; `DEPLOYMENT.md` lists exactly these)

| Path | Prerendered file |
|---|---|
| / | dist/index.html |
| /services | dist/services/index.html |
| /systems | dist/systems/index.html |
| /training | dist/training/index.html |
| /engagements | dist/engagements/index.html |
| /about | dist/about/index.html |
| /contact | dist/contact/index.html |
| any unknown address | dist/404.html (status 404, "Page not found") |

`sitemap.xml` lists the seven pages at https://thebayesgroup.com. `robots.txt`, `favicon.svg` and `dist/images/` (the site's photos) are copied from `public/`.

**Page metadata.** Each page has one title, a description, og:title, og:description, og:url, og:type, a canonical link and the favicon.

| Path | Title | Description |
|---|---|---|
| / | The Bayes Group \| Evidence-driven AI | Evidence-driven AI consulting, training and custom development led by two credentialed data scientists. |
| /services | Services \| The Bayes Group | (as now) |
| /systems | Systems engineering \| The Bayes Group | Agentic and multi-system AI, designed to be observable from day one and built to be sustained by your team. |
| /training | Training \| The Bayes Group | (as now) |
| /engagements | Engagements \| The Bayes Group | Right-sized AI engagements for small and medium-sized businesses, and a premium enterprise tier. |
| /about, /contact, 404 | (as now) | (as now) |

**Navigation states (as now)**
- First load: no scroll and no focus change.
- Route change: scroll to (0,0) and focus `<main id="main" tabIndex=-1>`.
- Route change with a hash: scroll to the target with `scroll-margin-top: 96px`.
- Header: when `scrollY > 0`, `.is-scrolled` adds a white background and a 1px `#E3E8EF` bottom border.

**Home (in order, background in brackets)**
1. Hero [photo + navy overlay]
2. Credibility strip [white bar, overlapping the hero by 48px]
3. Who we serve [white]
4. Systems band [navy]
5. Pillars [pale]
6. How we work [white]
7. Example engagements [pale]
8. Testimonial [navy]
9. Why The Bayes Group [white]
10. CTA band [navy-deep + bell-curve motif]

The last heading in main is the CTA h2. The last link in main is **Book a consultation**.

**Systems**
1. Navy hero: text (eyebrow, h1, lead) and the architecture diagram. They sit side by side on desktop and stack text-then-diagram on phones and tablets.
2. `#agentic` [white]
3. `#architecture` [pale]
4. `#observability` [white]
5. `#sustainability` [pale]
6. Deliverables [navy]
7. CTA "Have a system in mind?" [pale]

**Engagements**
- Header [white]: h1 and intro.
- Tiers [pale]: three business cards, then the full-width Enterprise card `#enterprise`.
- A "Not sure which fits?" line [white].

**Services**
- Navy page header band with the data-grid motif.
- Three sections [white, pale, white], each with a two-column header and a grid of item cards.

**Training:** photo banner, then filter and grid.
- Default count: "Showing 6 courses".
- Filtered count, for example: "Showing 2 courses for Managers".
- Empty: "No courses for this audience yet." with **Show all courses**.

**About:** mission beside the photo, two founder cards and four value cards. Each founder card has:
- an amber **Placeholder** tag;
- an avatar marked "Photo placeholder";
- the note "Placeholder: replace with founder credentials and bio."

**Contact (in order)**
1. Navy page header band [navy + data-grid motif]: eyebrow "CONTACT", h1 "Book a consultation", the lead and the "Prefer email?" mailto line. No form in the band.
2. Form section [page's normal background, usual section padding]: the two-column form and the "What happens next" card, unchanged.

Form states:
- Default: empty fields, with the "Required" tag on Name, Email and Message.
- Error: shown on blur and on submit; focus moves to the first invalid field. Messages: "Please enter your name." / "Please enter a valid email address." / "Please enter a message."
- Success: green status banner, focused, form cleared.
- Loading: none. The button is never disabled.
- Company size never errors.

**Not found:** bell-curve illustration, h1 "Page not found", "The page you're looking for doesn't exist or has moved.", **Back to home** and **View services**.

## Layout
**Global**
- Container max-width 1200px, centered. Side padding 24px (phone) / 40px (≥1024px).
- `html, body { overflow-x:hidden }`. All SVG and img: `max-width:100%; height:auto`.
- Breakpoints: <768 phone, 768–1023 tablet, ≥1024 desktop.
- Section padding 64px (phone) / 96px (desktop). Eyebrow 12px above the h2; h2 16px above the intro; 48px from the intro to the content.

**Phone (390px)**
- Single column throughout.
- Hero: min-height 560px; text bottom-aligned; buttons full-width and stacked, with a 12px gap.
- Credibility strip: a 2×2 grid inside a white card, margin-top −48px.
- Who we serve: panels stacked, SMB first.
- Systems band: diagram on top (the stacked variant), capabilities below.
- Systems hero: `.systems-hero__grid` is one column with a 32px gap: text first, diagram below (phone svg).
- How we work: steps stacked, no connecting line.
- Two-column blocks stack photo-first.
- Contact: navy header band, then the form, then the "What happens next" photo card.
- Footer: the three groups stack (brand, Services, Company) with a 32px gap, then the hairline and copyright.

**Desktop (1280–1440px):** 12-column grid with 32px gutters.
- Hero: min-height 680px. Text spans columns 1–7. The overlay is a left→right gradient.
- Credibility strip: 4 columns in one bar, 24px padding.
- Who we serve: SMB panel 7 columns, Enterprise panel 5 columns, equal height.
- Systems band: diagram 7 columns; capabilities 5 columns, stacked as 4 rows.
- Systems hero (≥1024px): `.systems-hero__grid { grid-template-columns: minmax(0,2fr) minmax(0,3fr); align-items:center; gap:48px }`. Text column (eyebrow, h1, lead) on the left, about 40%; diagram on the right, vertically centered. The base rule has no multi-column template.
- Pillars: 3 columns. Examples: 3 columns.
- Steps: a 4-column `ol`. A 2px `#1F8A8A` line runs behind the 48px circles at `top:24px; left:12.5%; right:12.5%`. "Operate & improve" sits below as a full-width card, 32px margin-top.
- Why: photo 5 columns; a 2×2 points grid in 7 columns.
- Systems sections: text 7 columns, illustration 5 columns (sides alternate). Deliverables: 3×2 grid.
- Engagements: business tiers in 3 columns. Enterprise is full width as 2 columns (photo 5 | content 7).
- Services headers: photo 5 columns | text 7 columns. Items: a 2-column grid.
- Page header bands (Services, Systems-style inner pages, Training, Engagements, About, Contact): text block max-width 760px, left-aligned in the container.
- Contact: form 7 columns | aside 5 columns, in the section below the band.
- Footer (≥1024px): `.footer-grid { grid-template-columns: 2fr 1fr 1fr; gap:48px }` (brand | Services | Company), with the copyright row below a hairline. No 4-track footer rule exists.

**No empty half-columns:** every text column beside a photo holds an eyebrow, an h2, a paragraph and a list, link or meta line, vertically centered.

## Design tokens
**Approach:** plain CSS. Tokens live in `src/styles/theme.css` and are mirrored in `src/theme/tokens.ts`. Component classes live in `global.css`. Fonts are system fonts only. There is no dark theme.

```css
:root {
  --color-navy:#0B1F3A; --color-navy-deep:#071528; --color-navy-raised:#102A4C;
  --color-white:#FFFFFF; --color-accent:#1F8A8A; --color-accent-strong:#17696A;
  --color-accent-strong-hover:#115455; --color-accent-light:#5FC4C4;
  --color-text:#2B3645; --color-muted:#556275; --color-muted-on-dark:#B8C4D6;
  --color-surface-teal:#F2F7F7; --color-tile:#E6F2F2; --color-hairline:#E3E8EF;
  --color-input-border:#7A8699; --color-disabled-bg:#E6EBF1;
  --color-error:#B42318; --color-success:#146C43; --color-success-bg:#E8F5EE;
  --color-placeholder-tag:#8A4B00; --color-placeholder-bg:#FFF4E5;
  --overlay-hero:linear-gradient(90deg,rgba(11,31,58,.94) 0%,rgba(11,31,58,.85) 55%,rgba(11,31,58,.55) 100%);
  --overlay-hero-phone:linear-gradient(180deg,rgba(11,31,58,.85),rgba(11,31,58,.94));
  --font-serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
  --font-sans:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --text-hero:2.375rem;   /* 38/46 phone → 4rem 64/70 at ≥1024 */
  --text-h1:2.25rem;      /* 36/44 → 3rem 48/56 (inner pages) */
  --text-h2:1.875rem;     /* 30/38 → 2.625rem 42/50 */
  --text-h3:1.25rem;      /* 20/28 → 1.375rem 22/30, serif 600 */
  --text-lead:1.1875rem;  /* 19 → 21 */
  --text-body:1.0625rem;  /* 17 → 1.125rem 18, line-height 1.6 */
  --text-small:0.875rem; --text-eyebrow:0.8125rem; /* mono, uppercase, .12em tracking, 600 */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --space-6:32px; --space-7:48px; --space-8:64px; --space-9:80px; --space-10:96px;
  --radius-sm:6px; --radius-md:12px; --radius-lg:16px; --radius-pill:999px;
  --shadow-card:0 1px 2px rgba(11,31,58,.06),0 8px 24px rgba(11,31,58,.08);
  --shadow-card-hover:0 2px 4px rgba(11,31,58,.08),0 16px 32px rgba(11,31,58,.12);
  --focus-ring:3px solid var(--color-accent-strong); --header-h:72px;
}
```

**Token usage**
- Eyebrows: teal `#17696A` on light, `#5FC4C4` on navy.
- Icons: `#17696A` inside `#E6F2F2` tiles.
- `#1F8A8A`: decorative lines, diagram strokes and motifs only (never text on light).
- Motifs (data-grid, bell curve): `#5FC4C4` at 12% opacity, `aria-hidden`.
- Page header band: `--color-navy` background; h1 white; lead `#B8C4D6`; links `#5FC4C4`.

**Contrast pairs**

| foreground hex | background hex | use | size (normal, large or ui) |
|---|---|---|---|
| #0B1F3A | #FFFFFF | headings, nav links, labels, card titles, light diagram labels | normal |
| #0B1F3A | #F2F7F7 | headings and diagram group labels on pale | normal |
| #2B3645 | #FFFFFF | body, input text | normal |
| #2B3645 | #F2F7F7 | body on pale | normal |
| #556275 | #FFFFFF | muted text, input placeholder, Required tag, example note | normal |
| #556275 | #F2F7F7 | muted text on pale | normal |
| #556275 | #E6EBF1 | disabled button text, avatar silhouette | normal |
| #17696A | #FFFFFF | links, eyebrows, Learn more, mono deliverable names on light | normal |
| #17696A | #F2F7F7 | links, eyebrows on pale | normal |
| #17696A | #E6F2F2 | icons in tiles, audience chip, Illustrative example tag | normal |
| #FFFFFF | #17696A | primary button label, step numerals | normal |
| #FFFFFF | #115455 | primary button label hover | normal |
| #1F8A8A | #FFFFFF | diagram arrows, step line, bell mark | ui |
| #1F8A8A | #F2F7F7 | diagram arrows and step line on pale | ui |
| #1F8A8A | #0B1F3A | diagram arrows on navy | ui |
| #7A8699 | #FFFFFF | form control and filter borders | ui |
| #17696A | #FFFFFF | focus ring, focused input border | ui |
| #17696A | #F2F7F7 | focus ring on pale | ui |
| #FFFFFF | #0B1F3A | headings, page-band h1, body, selected filter, testimonial | normal |
| #FFFFFF | #071528 | CTA band and footer text, footer links, Enterprise card text | normal |
| #FFFFFF | #102A4C | dark diagram box labels, deliverable cards | normal |
| #FFFFFF | #304158 | hero h1 over photo (worst case of overlay) | large |
| #B8C4D6 | #304158 | hero value prop over photo | normal |
| #5FC4C4 | #304158 | hero eyebrow over photo | normal |
| #B8C4D6 | #0B1F3A | page-band lead, "Prefer email?" text, muted text on navy | normal |
| #B8C4D6 | #071528 | footer line, copyright | normal |
| #B8C4D6 | #102A4C | capability and deliverable descriptions | normal |
| #5FC4C4 | #0B1F3A | eyebrows (incl. CONTACT), mailto link, links and hover on navy | normal |
| #5FC4C4 | #071528 | footer column headings, links on deep navy | normal |
| #5FC4C4 | #102A4C | dark diagram group labels | normal |
| #5FC4C4 | #0B1F3A | focus ring, diagram strokes on dark | ui |
| #0B1F3A | #5FC4C4 | Premium label | normal |
| #0B1F3A | #FFFFFF | on-dark primary button label | normal |
| #17696A | #E6F2F2 | icon tiles on navy cards (tile on navy) | ui |
| #B42318 | #FFFFFF | field error text and icon | normal |
| #B42318 | #FFFFFF | invalid input border | ui |
| #146C43 | #E8F5EE | success banner | normal |
| #8A4B00 | #FFF4E5 | Placeholder tag | normal |

## Components
**General**
- Every touch target is at least 44×44px.
- Focus-visible: `--focus-ring` with a 2px offset; the ring is `#5FC4C4` on navy.
- Transitions are 200ms ease-out.
- Sections fade in and slide up 16px once when they enter the view. This uses an IntersectionObserver in an effect, and the content is visible without JS.
- `prefers-reduced-motion: reduce` removes all transitions, animations and transforms, and smooth scroll.

**Header**
- Sticky, 72px tall. It holds the wordmark; the links Services, Systems, Training, Engagements, About and Contact (15px, 600); and **Book a consultation** (44px tall).
- Current link: `aria-current="page"` plus a 2px teal underline.
- Below 1024px: the **Menu** button (`aria-expanded`, `aria-controls="mobile-nav"`). Its panel holds 48px links plus a full-width CTA. The panel closes on a link click, on Escape and on a second press of Menu.

**Page header band** (shared by Services, Training, Engagements, About and Contact; same classes everywhere)
- First section in main. `--color-navy` background, with the data-grid motif as an `aria-hidden` svg. Padding 64px (phone) / 96px (desktop), plus the header offset.
- Content: `.eyebrow` (`#5FC4C4`, uppercase), h1 white at `--text-h1`, and the lead in `#B8C4D6` at `--text-lead`, 16px below the h1.
- Contact adds a second line, 12px below the lead: "Prefer email?" in `#B8C4D6`, followed by `<a href="mailto:hello@thebayesgroup.com">`. The link is `#5FC4C4`, underlined, white on hover, with `overflow-wrap:anywhere`.

**Systems hero**
- Navy, with the same padding as the band.
- One `.systems-hero__grid` with exactly two children:
  - `.systems-hero__text` (eyebrow, h1, lead `<p>`), first in the DOM;
  - `.systems-hero__diagram`, holding `<ArchitectureDiagram>` with its current variant.
- The diagram is unchanged.

**Button**
- 48px tall, 0 24px padding, radius 6px, sans 600 at 16px.
- Primary: `#17696A`, hover `#115455`, active translateY(1px).
- Secondary: white with a 1.5px navy border.
- On dark: the primary is white with navy text; the secondary has a 1.5px white border.
- Disabled styling exists but is never used on submit. There is no loading state (static site).

**Eyebrow (`.eyebrow`):** mono, 13px, uppercase, 600. It is the first child of every section header.

**Icon (`Icons.tsx`):** 24px grid, 1.75px stroke, round caps, `currentColor`, `aria-hidden`, `focusable="false"`.

**Icon tile (`.icon-tile`):** 44×44, radius 10px, `#E6F2F2`. Holds a 24px `#17696A` icon, with 16px margin below.

**Card**
- White, 1px `#E3E8EF` border, radius 12px, padding 24px (32px desktop), `--shadow-card`.
- Hover (linked cards): translateY(−2px) plus `--shadow-card-hover`.
- Dark card: `#102A4C` with a 1px `rgba(95,196,196,.25)` border.

**Photo (`Photo.tsx`)**
- srcset 768w/1344w, with `sizes` per slot: hero `100vw`; half-width slots `(min-width:1024px) 50vw, 100vw`.
- width 1344, height 768, `decoding="async"`, lazy loading except the hero.
- `object-fit:cover`, radius 12px except the hero.
- Photo strips on pillar cards are 180px tall.

**Credibility strip:** white card, radius 12px, `--shadow-card-hover`. Each point is an icon tile plus a 16px/600 navy label.

**Audience panel:** a photo on top (240px) and a body padded 32px. The SMB panel is white. The Enterprise panel is `#071528` with the `#5FC4C4` **Premium** pill (12px mono, 4px 10px padding) and its link in `#5FC4C4`.

**ArchitectureDiagram** (unchanged)
- Light and dark variants.
- Desktop svg `viewBox="0 0 960 600"`:
  - "Your systems" (y 24, 4 boxes);
  - "Agent orchestration" (y 200, x 0–620, 3 boxes);
  - a right stack (x 660–960) with "Models (vendor-neutral)" and "Guardrails & evaluations";
  - "Observability" full width (y 440, 4 boxes).
- Boxes have radius 8. Labels are mono 15px; group labels are 13px uppercase.
- Lines: solid 2px teal arrows from top to middle; a double-ended arrow between orchestration and Models; dashed `4 4` 1.5px lines from every box to Observability.
- Phone svg `viewBox="0 0 340 820"`, stacked, labels 13px, used below 768px. The desktop svg is used at 768px and up. The inactive one is `display:none`.
- Each svg has `role="img"` and `aria-labelledby` pointing to its own `<title>` and `<desc>` (useId).

**Steps:** an `ol` of 48px `#17696A` circles with white serif numerals, each with an h3 title and one sentence. "Operate & improve" is a card with an infinity icon tile.

**Example card:** the "Illustrative example" tag, a mono industry line, an h3 system name, and a `dl` with Challenge / System / Observed and sustained (labels 13px mono uppercase). The section note sits below the grid in 14px muted text.

**Testimonial:** a `figure` with a 64px teal-light quote mark, a 24px serif `blockquote` and a `figcaption`. The placeholder note sits above it in 14px `#B8C4D6`.

**Tier card:** an h2 name, the audience, a clock icon with the timeline, the h3 "What's included", check-icon list items and a full-width button. Enterprise: `#071528` background, 2px `#5FC4C4` outline, radius 16px, the photo and the Premium pill.

**Filter button, course card, form field, alert banner:** as now.
- Filter pills are 44px.
- `.form-control` is 48px with a 1.5px `#7A8699` border.
- Each error is a `<p id="{field}-error">` linked by `aria-describedby`.
- Selects have a chevron.
- Course cards have a format icon tile.

**Avatar placeholder:** an 80px `#E6EBF1` circle with a `#556275` silhouette, `role="img" aria-label="Photo placeholder"`, and visible "Photo placeholder" text.

**Footer**
- `#071528`, padding 64/80px, bell-curve motif at 8% opacity.
- `.footer-grid` has exactly three children:
  1. brand group: wordmark, the line, the mailto link;
  2. Services group: h2 "Services" and its links;
  3. Company group: h2 "Company" and its links.
- If `<nav aria-label="Footer">` wraps groups 2 and 3, it uses `display: contents` so the grid still sees three tracks.
- Headings are 13px mono uppercase `#5FC4C4`. Links are 15px white, 32px tall, with a 44px hit area via padding.
- The copyright row sits outside the grid, below a 1px `rgba(255,255,255,.12)` hairline with 32px above it.

## Accessibility
- **Landmarks:** the skip link "Skip to main content", then `<header>`, `<nav aria-label="Main">`, `<main id="main" tabIndex=-1>`, `<footer>` and `<nav aria-label="Footer">`.
- **Headings:**
  - One h1 per page, in order h1→h2→h3 with no skipped levels.
  - On Contact the h1 is in the band; the form section's headings follow as h2.
  - The only footer headings are "Services" and "Company", as h2 styled at 13px.
- **Labels:**
  - Every control has a `<label for>`.
  - Required fields carry `required`, `aria-required` and the visible "Required" text.
  - The form uses `noValidate`.
  - The Menu button has a text label.
- **Images:**
  - Every photo has descriptive alt text (e.g. "Business owner reviewing figures on a laptop in a workshop").
  - Photos are never presented as the firm's team or clients.
  - Motifs and icons are `aria-hidden`. Diagrams use title and desc.
- **Keyboard:**
  - Tab order follows the visual order (Systems hero: text, then diagram; footer: brand email, Services links, Company links).
  - Escape closes the Menu and returns focus to the toggle.
  - After a route change, focus moves to main.
  - Hash links land below the header.
- **Status:** the filter count and the success banner use `role="status"`.
- **Not color alone:**
  - The selected filter has a check icon.
  - Errors have an icon and text.
  - The current nav link and on-navy links are underlined.
  - Premium and Placeholder are text labels.
  - The diagram desc explains dashed versus solid lines.
- **Hydration:** the server and client render the same markup. Window is read only in effects.
- **Language:** `<html lang="en">`.

## Content and microcopy
**Hero**
- h1: "Evidence-driven AI, built for your business."
- Value proposition: "We design, build and run AI systems for small and medium-sized businesses, from single agents to multi-system architectures, with enterprise-grade rigor and senior data scientists on every engagement."
- Buttons: **Book a consultation**, **See how we build**.

**Credibility points:** "Credentialed data scientists", "Vendor-neutral advice", "Built for small and medium-sized businesses", "Enterprise-grade governance".

**Who we serve** (eyebrow "WHO WE SERVE", h2 "Right-sized for you")
- SMB panel: "Practical, right-sized AI that solves a real problem in weeks, not quarters. We build it with your people so your team owns it afterwards." → **See engagements**.
- Enterprise panel: "A dedicated senior team for multi-system and agentic programs across your organization. Governance, security reviews and responsible-AI policy come built in." → **Enterprise engagements**.

**Systems band** (eyebrow "WHAT WE BUILD", h2 "Systems built to be observed and sustained")
- Agentic development: "Agents that plan, use your tools and hand off to people for approval."
- Multi-system architecture: "AI that connects your CRM, ERP, data and documents instead of adding another silo."
- Observable by design: "Tracing, metrics, cost and evaluation dashboards from day one."
- Sustainable to run: "Runbooks, cost budgets, model-agnostic design and a team trained to own it."
- Link: **How we build systems**.

**Home section eyebrows and headings**
- "WHAT WE DO" / "What we do", with **Learn more** links.
- "HOW WE WORK" / "How we work". Operate & improve: "We monitor, evaluate and improve what we built, or hand it to your team with runbooks."
- Example engagements: as now.
- "TESTIMONIAL" / "What clients say", with the placeholder note and the attribution "Client name, Title, Company".
- "WHY US" / "Why The Bayes Group", with the points as now.
- "GET STARTED" / CTA band as now.

**Systems:** the hero eyebrow, h1 and lead, and the four sections' items and deliverables, stay as now. CTA: "Have a system in mind?" with "Tell us what it needs to connect to. We'll reply within one business day." and **Book a consultation**.

**Engagements:** h1, intro, tier names, timelines and items as now. Buttons: **Book a consultation** and **Talk to us about enterprise**. Closing line: "Not sure which fits? **Talk to us**".

**Services:** the custom-development item "Agentic systems and multi-system integration" with **See how we build**. Engagement lines stay as now.

**Contact**
- Band eyebrow: "Contact" (rendered uppercase as "CONTACT").
- h1: "Book a consultation".
- Lead: "Tell us what you're working on and we'll reply within one business day."
- Email line: "Prefer email? hello@thebayesgroup.com" (the address is the mailto link).
- Field label "Company size": first option "Choose a size", then the four size options.
- "What happens next": "We reply within one business day", "A 30-minute call about your goals", "A written recommendation, no obligation".
- Button **Send message**. Success: "Thanks, we'll be in touch within one business day." All other copy as now.

**Footer**
- Brand: wordmark, "AI enablement, training and custom development.", hello@thebayesgroup.com.
- "Services": AI Enablement, Training, Custom Development, Systems engineering, Engagements.
- "Company": About, Contact.
- "© 2026 The Bayes Group"
