# DEPLOYMENT.md

*This guide walks John from the first commit of **apps/bayes-group-site** to a production‑ready, secure static‑hosting deployment.*

---

## What this app is

`bayes-group-site` is a **prerendered React + Vite** marketing site for The Bayes Group.  
It outputs a fully‑static `dist/` folder (HTML, CSS, JS, assets) that can be served by any static web host or a tiny containerised web server.

Key pages:

| Path                | Component (src/pages) |
|---------------------|-----------------------|
| `/`                 | `HomePage.tsx`        |
| `/services`         | `ServicesPage.tsx`    |
| `/systems`          | `SystemsPage.tsx` – hero now shows the architecture diagram side‑by‑side on desktop |
| `/training`         | `TrainingPage.tsx`    |
| `/about`            | `AboutPage.tsx`       |
| `/contact`          | `ContactPage.tsx` – navy header band added |
| `/*` (fallback)    | `NotFoundPage.tsx`    |

The site is a **pure front‑end** – there is no backend, database, or authentication required.

---

## Architecture

```
src/
├─ components/          ← Footer, Header, ArchitectureDiagram, etc.
├─ pages/               ← One React component per route
├─ content/             ← Text & link data (e.g. src/content/site.ts)
├─ styles/              ← global.css, theme.css
├─ entry-server.tsx     ← Generates prerendered HTML for each route
└─ main.tsx             ← Client‑side hydration entry point
```

**Build pipeline**

1. `npm run build` → `vite build` → runs `src/entry-server.tsx` for every route → writes static files to `dist/`.
2. `dist/` contains:
   - `index.html`, `services/index.html`, `contact/index.html`, … (one HTML per page)
   - `assets/` (hashed JS/CSS bundles)
   - `robots.txt`, `sitemap.xml`, `favicon.svg`

**Production options**

| Option | What you get | Trade‑offs |
|--------|--------------|------------|
| **Static CDN (Cloudflare Pages, Netlify, Vercel)** | Zero‑ops, global edge caching, automatic HTTPS, built‑in security headers (can be customised) | Limited ability to run a custom health‑check container |
| **S3 + CloudFront** | Cheap, fully AWS‑integrated, fine‑grained cache control | Need to configure TLS, security headers, and invalidations manually |
| **Containerised Nginx (Docker)** | Full control, can run health check, easy to run on Fly.io, Render, or AWS ECS/Fargate | Slightly higher cost, you must maintain the Dockerfile and secret manager |
| **Google Cloud Run (static)** | Autoscaling, per‑request billing, easy IAM | Requires a Docker image even for static content |

The **Dockerfile** below is a **to‑do** (not present in the repo yet) and can be used with any container host.

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | `≥18` | Vite requires modern Node |
| **npm** | `≥9` | Package manager |
| **Git** | any | Source control |
| **Docker** (optional) | `≥20` | If you choose the container route |
| **GitHub CLI** (optional) | `≥2.30` | For CI/CD set‑up scripts |
| **AWS CLI** / **gcloud** / **flyctl** (depending on host) | latest | Deploy to chosen platform |

Install dependencies:

```bash
git clone https://github.com/your-org/bayes-group-site.git
cd apps/bayes-group-site
npm ci          # installs exact versions from package-lock.json
```

---

## Configuration and secrets

The site has **no runtime secrets** – all URLs and the contact e‑mail are hard‑coded (`mailto:hello@thebayesgroup.com`).  

If you later want to inject a base URL (e.g. for analytics) you can add an env var:

```bash
# .env.production (to‑do)
VITE_BASE_URL="https://thebayesgroup.com"
```

Vite automatically injects any `VITE_` prefixed variable into the client bundle.

> **⚠️ TODO** – Add a `.env.production` file and reference `import.meta.env.VITE_BASE_URL` wherever needed.

---

## Build and test

```bash
# Lint & type‑check
npm run lint          # (eslint, if configured)
npm run typecheck     # (tsc --noEmit)

# Run unit / acceptance tests
npm test              # jest reads all __tests__/**/*.test.ts

# Build the prerendered site
npm run build
# Output lives in ./dist
```

The test suite includes the new layout checks (`three-fixes-render.test.ts`) that verify:

* Footer now has exactly three columns.
* `/contact` page uses the navy header band.
* `/systems` hero displays a two‑column grid on desktop.

If any of those tests fail, the build should be considered broken.

---

## Deploy

### 1. Choose a host

Below are quick‑start commands for three common static‑hosting options.

#### a) Cloudflare Pages (recommended for easiest TLS & security headers)

```bash
# In Cloudflare dashboard → Pages → Create a Project
# Connect the GitHub repo, set build command and output folder:
#   Build command: npm run build
#   Build directory: dist
# Enable “Production branch” = main
# Add custom headers (see Security checklist) in the “Headers” UI.
```

#### b) Netlify

```bash
# From the Netlify UI → New site from Git
# Build command: npm run build
# Publish directory: dist
# Add a `_headers` file in the repo root (to‑do) with the required security headers:

# _headers (to‑do)
/*
  Content-Security-Policy: default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; frame-ancestors 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

#### c) Docker + Fly.io (full control, health‑check)

1. **Create Dockerfile** (to‑do, placed at repo root):

   ```Dockerfile
   # Dockerfile (to‑do)
   FROM nginx:alpine-slim

   # Add a non‑root user
   RUN addgroup -g 101 -S appgroup && adduser -S appuser -G appgroup -u 101
   USER appuser

   # Copy built files
   COPY ./dist /usr/share/nginx/html

   # Replace default config with a minimal one that serves 404.html for unknown routes
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   # Health‑check
   HEALTHCHECK --interval=30s --timeout=3s \
       CMD wget -qO- http://localhost/ || exit 1

   EXPOSE 80
   ```

2. **nginx.conf** (to‑do, next to Dockerfile):

   ```nginx
   # nginx.conf (to‑do)
   server {
     listen 80;
     server_name _;
     root /usr/share/nginx/html;

     location / {
       try_files $uri $uri/ =404;
     }
     error_page 404 /404.html;
   }
   ```

3. Build & push:

   ```bash
   # Build locally
   docker build -t thebayesgroup/site:latest .
   # Tag for Fly.io registry (replace <app-name>)
   docker tag thebayesgroup/site:latest registry.fly.io/<app-name>:latest
   # Push
   docker push registry.fly.io/<app-name>:latest
   ```

4. Deploy with Fly.io (requires `flyctl`):

   ```bash
   flyctl launch                     # creates a minimal Fly.toml
   # Edit Fly.toml to set the image:
   #   image = "registry.fly.io/<app-name>:latest"
   flyctl deploy
   ```

All three options automatically serve HTTPS (except the raw Docker + Nginx, where you must enable TLS via the host’s load balancer).

---

## Security checklist

- [ ] **Upgrade React Router** – bump `react-router-dom` to `^7.18.0` (see `package.json`). Run `npm install` and verify no breaking changes in the app.
- [ ] **Add security headers** – configure the chosen host (Cloudflare, Netlify, or Nginx) to emit:
  - `Content-Security-Policy: default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] **Enable HSTS preload** (optional) – add `preload` flag to the HSTS header and submit to the preload list.
- [ ] **Set up a Content‑Security‑Policy Report‑URI** (to‑do) if you want violation reports.
- [ ] **Run a final Trivy scan on the Docker image** (if using Docker) to confirm no new CVEs.
- [ ] **Verify the health‑check endpoint** (`/`) returns `200` after deployment.

---

## Operations

| Concern | Recommended Implementation |
|---------|----------------------------|
| **TLS** | All CDN options (Cloudflare, Netlify, Vercel) provide free automated TLS. For Docker/Nginx, terminate TLS at the platform load‑balancer (e.g., Fly.io TLS termination). |
| **Caching** | Static assets are hashed, so set long `Cache‑Control` headers (`max-age=31536000, immutable`). HTML files get `Cache‑Control: public, max-age=0, must-revalidate`. CDNs handle this automatically. |
| **Monitoring** | Enable the host’s built‑in analytics (Netlify Analytics, Cloudflare Site Analytics) or add a client‑side analytics snippet (e.g., Plausible). |
| **Logs** | For container deployments, ship Nginx access logs to a log aggregation service (e.g., Papertrail) via `docker run -e LOGS=papertrail`. Not needed on pure CDN hosts. |
| **Backups** | The site is immutable; backup the Git repository and the `dist/` folder (e.g., `aws s3 sync dist/ s3://bayes-backups/$(date +%F)`). |
| **Scaling** | CDN scales automatically. For Docker, the host (Fly.io, Render) will auto‑scale containers based on request volume. |
| **Incident response** | Keep a `CHANGELOG.md` and tag releases (`git tag -a v1.2.0 -m "footer, contact, systems fixes"`). Roll back by redeploying the previous tag. |

---

## CI/CD

A minimal **GitHub Actions** workflow (`.github/workflows/deploy.yml`) can automate build, test, and deployment.

```yaml
# .github/workflows/deploy.yml (to‑do)
name: CI/CD

on:
  push:
    branches: [main]

jobs:
  build-test-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install deps
        run: npm ci

      - name: Lint & typecheck
        run: |
          npm run lint
          npm run typecheck

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      # ------- Choose one of the following deploy steps -------
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_PAGES_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: bayes-group-site
          directory: ./dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

      # - name: Deploy to Netlify
      #   uses: nwtgck/actions-netlify@v2
      #   with:
      #     publish-dir: ./dist
      #     production-branch: main
      #     auth-token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
      #     site-id: ${{ secrets.NETLIFY_SITE_ID }}

      # - name: Deploy Docker to Fly.io
      #   run: |
      #     docker build -t registry.fly.io/bayes-site:$(git rev-parse --short HEAD) .
      #     docker push registry.fly.io/bayes-site:$(git rev-parse --short HEAD)
      #     flyctl deploy --image registry.fly.io/bayes-site:$(git rev-parse --short HEAD)
      #   env:
      #     FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Add the required secrets (`CF_PAGES_TOKEN`, `CF_ACCOUNT_ID`, etc.) in the repository settings.

---

## Costs

| Service | Approx. Monthly Cost (USD) | Notes |
|---------|----------------------------|-------|
| **Cloudflare Pages (Free tier)** | $0 | Unlimited sites, 500 k page‑views, free SSL. |
| **Netlify Free** | $0 | 100 GB bandwidth, 300 build minutes/month. |
| **Vercel Hobby** | $0 | 100 GB bandwidth, 125 k serverless‑function executions (not used). |
| **AWS S3 + CloudFront** | $0‑$5 | $0.023/GB storage + $0.085/GB data transfer; cheap for low traffic. |
| **Fly.io (shared‑CPU instance)** | $5‑$10 | 1 CPU, 256 MiB RAM, includes TLS and outbound traffic. |
| **Render Static Site** | $0‑$7 | Free tier includes HTTPS; paid tier for custom domains on a paid plan. |
| **Domain registration** | $12‑$15 per year | e.g., `thebayesgroup.com` through Namecheap/Google Domains. |

Pick the **free CDN option** for initial launch; upgrade to a paid tier only if traffic exceeds the free limits.

---

## Before production

1. **Dockerfile & nginx.conf** – create the files shown above (marked *to‑do*) if you plan to use a container host.
2. **Upgrade react‑router-dom** to `^7.18.0` and verify no breaking changes.
3. **Add security‑header configuration** for the chosen host (Netlify `_headers`, Cloudflare “Custom Headers”, or Nginx `add_header` directives).
4. **Set up a CI/CD pipeline** (GitHub Actions file) and store required secrets.
5. **Confirm caching strategy** – verify that hashed assets have `Cache‑Control: immutable` and HTML files are not aggressively cached.
6. **Run a final end‑to‑end test** against a staging deployment (e.g., a preview branch on Cloudflare Pages) to ensure the three layout changes render correctly on both desktop (`min-width:1024px`) and phone breakpoints.
7. **Document the release** – tag the commit (`git tag -a v1.2.0 -m "Footer, Contact, Systems layout fixes"`), push tags, and note the version in `CHANGELOG.md`.

Once the above items are checked off, the site can be considered production‑ready. 🎉
