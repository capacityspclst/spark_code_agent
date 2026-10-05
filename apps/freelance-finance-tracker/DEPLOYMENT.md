# DEPLOYMENT.md

> **Audience:** John – the developer who has a working prototype of the **Freelance Finance Tracker** (Expo React Native app + FastAPI backend) and wants to move it to production.

---  

## What this app is
- **Mobile front‑end** – an Expo (React Native) app (`expo-app/`) that runs on iOS, Android and the web. It uses:
  - `expo-secure-store` for JWT storage
  - `expo-image-picker` for receipt photos
  - `expo-sharing` to share CSV/PDF exports
  - React Navigation for a stack + bottom‑tab UI
- **API backend** – a FastAPI service (`backend/app/`) providing:
  - JWT auth (`/auth/signup`, `/auth/login`)
  - CRUD for receipts & mileage
  - Dashboard summary, CSV/PDF export
  - SQLite in development (`DATABASE_URL=sqlite:///./test.db`) and PostgreSQL in production
- **Data** – persisted in PostgreSQL (production) or SQLite (dev). Receipt images live under the `MEDIA_ROOT` directory on the server.

---  

## Architecture
```
+-------------------+          HTTPS          +-------------------+
|   Expo App (iOS)  | <---------------------> |   FastAPI Backend |
|   Expo App (Android)                 |   (Docker)       |
|   Expo Web (optional)                |   - PostgreSQL   |
+-------------------+          (REST)       +-------------------+
        |                                    |
        |  API_URL (env var)                 |
        v                                    v
   Secure Store                         Managed DB (e.g. Supabase)
```

Key components:

| Component | Path | Runtime | Port | Notes |
|-----------|------|---------|------|-------|
| Expo app | `expo-app/` | Expo Go / EAS Build | N/A (bundled) | Uses `process.env.API_URL` (default `http://localhost:8000`) |
| FastAPI  | `backend/app/` | Python 3.12 (slim) | **8000** (dev) – **8080** (container) | Reads env vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `MEDIA_ROOT`, `FRONTEND_ORIGIN` |
| DB       | - | PostgreSQL 15 (managed) | 5432 | `DATABASE_URL=postgresql://user:pwd@host:5432/dbname` |
| Media storage | `MEDIA_ROOT` on the container | Filesystem (can be backed by a cloud bucket) | – | Served via `/media/{filename}` |

---  

## Prerequisites
| Tool | Minimum version | Install command |
|------|----------------|-----------------|
| **Git** | 2.30+ | `git clone <repo>` |
| **Docker** | 24+ | `brew install --cask docker` (mac) or `apt-get install docker.io` |
| **Docker Compose** (optional) | 2.20+ | `docker compose version` |
| **Python** | 3.11+ | `pyenv install 3.12 && pyenv global 3.12` |
| **Node** | 20+ | `brew install node` |
| **Expo CLI** | latest (`npm i -g expo-cli`) |
| **EAS CLI** | latest (`npm i -g eas-cli`) |
| **psql** (for local migrations) | any | `brew install libpq` |
| **PostgreSQL client** (if you use a managed DB) | any | – |
| **GitHub (or GitLab) account** | – | – |
| **Apple Developer / Google Play Console** | – | – for app store submission |

---  

## Configuration and secrets
1. **Create a `.env.example` at the repository root** (already referenced by the code). Add the following (keep secrets out of source control):
   ```dotenv
   # Backend
   DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>
   JWT_SECRET_KEY=replace-with-strong-random-256bit-base64
   MEDIA_ROOT=./media                # optional – change for cloud bucket
   FRONTEND_ORIGIN=https://<your-domain>   # e.g. https://app.myfinance.io

   # Expo (optional, for web builds)
   API_URL=https://api.myfinance.io   # production API endpoint
   ```
2. **Copy to `.env` on the server** (or use the platform’s secret manager).  
   Example for Fly.io:
   ```bash
   fly secrets set DATABASE_URL=postgresql://... JWT_SECRET_KEY=... MEDIA_ROOT=/var/media FRONTEND_ORIGIN=https://app.myfinance.io
   ```
3. **Local development** – create `backend/.env` (or export env vars) with:
   ```dotenv
   DATABASE_URL=sqlite:///./test.db
   JWT_SECRET_KEY=dev-secret
   FRONTEND_ORIGIN=http://localhost:19006
   ```
   Then run `source backend/.env` before starting the server.

---  

## Build and test
### Backend
```bash
# 1️⃣ Install deps
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2️⃣ Run unit / integration tests (pytest assumed)
pytest          # (you can add tests under backend/tests/)
```
> **Note:** No test framework is currently in the repo; add `pytest` and write tests under `backend/tests/`.

### Mobile app
```bash
cd expo-app

# Install JS deps
npm ci

# Run Jest unit tests
npm run test

# Run the Expo dev server (iOS/Android simulators)
npm run start   # shows QR codes for device
```

### Production build (EAS)
1. **Add `eas.json` (to‑do).** Minimal example:
   ```json
   {
     "cli": { "version": ">=2.0.0" },
     "build": {
       "production": {
         "android": {
           "workflow": "managed"
         },
         "ios": {
           "workflow": "managed"
         }
       }
     }
   }
   ```
2. **Login to EAS**: `eas login`
3. **Build**: `eas build --profile production --platform all`
4. **Submit** (once credentials are set):
   ```bash
   eas submit --platform ios   # Apple App Store Connect
   eas submit --platform android   # Google Play Console
   ```

---  

## Deploy
### 1️⃣ Production Dockerfile (to‑do)
Create `backend/Dockerfile`:
```Dockerfile
# ---------- TO-DO ----------
# 1. Use a slim python base
FROM python:3.12-slim AS builder

# 2. Create non‑root user
RUN addgroup --system app && adduser --system --ingroup app app

# 3. Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# 4. Install app deps
WORKDIR /app
COPY backend/requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# 5. Copy source
COPY backend/ .

# 6. Create media dir
RUN mkdir -p /var/media && chown app:app /var/media

# 7. Runtime stage
FROM python:3.12-slim
ENV PATH="/opt/venv/bin:$PATH"
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app
COPY --from=builder /var/media /var/media
WORKDIR /app

# 8. Non‑root user
USER app

# 9. Expose port
EXPOSE 8080

# 10. Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

# 11. Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 2️⃣ Choose a hosting platform  
| Platform | Pros | Cons | Typical cost (USD/mo) |
|----------|------|------|-----------------------|
| **Fly.io** | Simple Docker deployment, global edge, free tier (up to 3 shared‑CPU VMs) | Limited storage – you’ll need an external bucket for media | $0‑$20 (free tier + optional Postgres add‑on) |
| **Render.com** | Managed PostgreSQL, automatic SSL, easy to add cron jobs | Slightly higher baseline price | $7 (free web) + $7 for Postgres starter |
| **Google Cloud Run** | Autoscaling to zero, fully managed, integrates with Cloud SQL | More GCP knowledge needed | $0‑$30 (pay per request + Cloud SQL) |
| **AWS ECS Fargate** | Fine‑grained scaling, IAM integration | Complex networking, higher base cost | $15‑$40 (depends on vCPU & memory) |

#### Example: Deploy to Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Initialise the app (creates fly.toml)
fly launch --copy-config --name finance-mate-api --region iad --no-deploy

# Set secrets (read from .env.example)
fly secrets set $(cat .env | grep -v '^#' | xargs)

# Deploy (first time builds Dockerfile)
fly deploy --remote-only
```
- The generated `fly.toml` will expose port `8080`.  
- Add a **Postgres** instance on Fly (`fly postgres create`) and set its URL in `DATABASE_URL`.  

#### Example: Deploy to Render (no Docker)
1. Create a **New Web Service** → point to `backend/` → set **Build Command** `pip install -r requirements.txt` and **Start Command** `uvicorn app.main:app --host 0.0.0.0 --port 8080`.
2. Add a **PostgreSQL** instance and copy its connection string into the service’s **Environment** tab.
3. Enable **Auto‑Deploy** from your Git repo.

### 3️⃣ Media storage (to‑do)
- For production you likely want a cloud bucket (e.g., AWS S3, Google Cloud Storage) instead of local disk.
- Update `backend/app/main.py` to serve from S3 or configure a reverse proxy to expose a bucket URL.
- Set `MEDIA_ROOT` to the bucket mount point or use a signed URL generator.

### 4️⃣ Migrations (to‑do)
Consider adding **Alembic**:
```bash
pip install alembic
alembic init alembic
# edit alembic.ini to use ${DATABASE_URL}
alembic revision --autogenerate -m "init"
alembic upgrade head
```
Add a migration step in your CI/CD pipeline.

---  

## Security checklist
[ ] **TLS termination** – Ensure the hosting platform provides HTTPS (Fly, Render, Cloud Run all do).  
[ ] **Secret management** – Store `JWT_SECRET_KEY`, `DATABASE_URL`, `MEDIA_ROOT` in the platform’s secret store, never in repo.  
[ ] **Non‑root container user** – Dockerfile uses `USER app`.  
[ ] **Health check** – Dockerfile includes `HEALTHCHECK` and `/health` endpoint.  
[ ] **CORS locking** – `FRONTEND_ORIGIN` env var restricts allowed origins.  
[ ] **JWT hardening** – Tokens use HS256 with a 256‑bit secret, expire in 30 days.  
[ ] **Password hashing** – `passlib` with `pbkdf2_sha256` (secure, no external libs).  
[ ] **Rate limiting / brute‑force protection** – (to‑do) add middleware like `slowapi` or configure at the edge CDN.  
[ ] **Database connection encryption** – Use `sslmode=require` in the PostgreSQL URL for cloud providers.  
[ ] **File upload validation** – Current code trusts any uploaded image; add validation of mime/type and size (to‑do).  
[ ] **Dependency updates** – Run `npm audit` & `pip list --outdated` regularly; address known CVEs (see SECURITY.md warnings).  
[ ] **Content Security Policy** – For the optional Expo web build, configure CSP headers via the reverse proxy (to‑do).  
[ ] **Backup strategy** – Schedule automated backups of the Postgres instance (most managed services provide daily snapshots).  

---  

## Operations
| Area | What to monitor | How to set up |
|------|----------------|---------------|
| **API health** | `/health` HTTP 200, container restarts | Fly/Render health checks, Cloud Run health probes |
| **CPU / Memory** | CPU > 70 % or RAM > 80 % for >5 min | Platform dashboards; set alerts via PagerDuty or Slack webhook |
| **Database** | Connection count, replication lag (if applicable) | Managed DB console – enable alerts |
| **Log aggregation** | Structured JSON logs from FastAPI | Use `uvicorn --log-config` to emit JSON, forward to Logtail / Papertrail |
| **Error tracking** | Uncaught exceptions, 5xx responses | Add Sentry SDK to FastAPI (`sentry-sdk`) and to Expo (`@sentry/react-native`) |
| **Media storage** | Disk usage / bucket size | Set quota alerts in cloud storage |
| **SSL cert renewal** | Automatic via platform | No manual action if you use Fly/Render/Cloud Run |

**Routine tasks**

```bash
# 1️⃣ Pull latest image (Fly)
fly deploy --remote-only

# 2️⃣ Run DB migrations (if Alembic is added)
docker run --rm \
  -e DATABASE_URL=$DATABASE_URL \
  finance-mate-backend alembic upgrade head

# 3️⃣ Verify backup
pg_dump $DATABASE_URL > backup_$(date +%F).sql
# (store backup in a secure bucket)
```

---  

## CI/CD
A typical GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
name: CI / CD

on:
  push:
    branches: [main]
  pull_request:

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install deps
        run: |
          python -m venv .venv
          source .venv/bin/activate
          pip install -r backend/requirements.txt pytest
      - name: Run tests
        run: |
          source .venv/bin/activate
          pytest backend/tests/

  backend-docker:
    needs: backend-test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USER }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build & push Docker image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USER }}/finance-mate-backend:latest backend/
          docker push ${{ secrets.DOCKERHUB_USER }}/finance-mate-backend:latest

  deploy-fly:
    needs: backend-docker
    runs-on: ubuntu-latest
    steps:
      - uses: superfly/flyctl-action@v1
        with:
          args: "deploy --remote-only"
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  mobile-build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - name: Install npm deps
        run: cd expo-app && npm ci
      - name: Run Jest
        run: cd expo-app && npm run test
      - name: Build with EAS
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
        run: |
          cd expo-app
          npm i -g eas-cli
          eas login --token $EXPO_TOKEN
          eas build --profile production --platform all
```

*Adjust the workflow for Render or Cloud Run by swapping the `deploy-fly` step with the appropriate CLI commands.*

---  

## Costs
| Item | Low‑end (Free/Starter) | Mid‑range (Typical) | High‑end (Scalable) |
|------|------------------------|---------------------|----------------------|
| **FastAPI hosting** | Fly free tier (3 shared VMs) – $0 | Render Free Web + $7 Postgres starter | GCP Cloud Run (pay‑as‑you‑go) ≈ $15‑$30 |
| **PostgreSQL** | Fly managed DB free tier (up to 5 GB) | Render Postgres Starter $7 | Cloud SQL (high‑availability) $30‑$80 |
| **Media bucket** | Local `MEDIA_ROOT` (no cost) | AWS S3 Standard 20 GB ≈ $0.5 | S3 + CloudFront CDN $5‑$10 |
| **CI/CD** | GitHub Actions free (2 k jobs/mo) | Same + optional self‑hosted runner | Enterprise tier or additional paid minutes |
| **EAS Build** | 100 min free per month; $0.13/min thereafter | $25/mo (EAS Build) | $100+/mo for large parallel builds |
| **Monitoring / Sentry** | Free tier (5 k events) | $29/mo (20 k events) | $199/mo (200 k events) |
| **Total estimate** | **≈ $0‑$15/mo** | **≈ $60‑$120/mo** | **≈ $300+/mo** |

---  

## Before production
1. **🔧 Add a production‑ready Dockerfile** (non‑root user, health check).  
2. **🔧 Implement database migrations** (Alembic) and a migration step in the deploy pipeline.  
3. **🔧 Move receipt image storage to a durable cloud bucket** (S3/Google Cloud Storage) and secure it with signed URLs.  
4. **🔧 Harden file uploads** – validate MIME type, enforce size limits, scan for viruses (e.g., ClamAV).  
5. **🔧 Add rate‑limiting / brute‑force protection** on auth endpoints.  
6. **🔧 Set up structured logging & error tracking** (Sentry or similar).  
7. **🔧 Enable automated backups & test restores** for PostgreSQL.  
8. **🔧 Create `eas.json` and app signing credentials** for iOS/Android store submission.  
9. **🔧 Perform a security audit of the deployed environment** (TLS certs, firewall rules, least‑privilege IAM).  
10. **🔧 Run end‑to‑end smoke tests** against the live API (e.g., via Postman/Newman or pytest `httpx` tests).  

Once the above items are addressed, the app will be ready for a public release. Good luck, John! 🚀
