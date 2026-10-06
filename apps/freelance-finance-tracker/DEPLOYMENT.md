# DEPLOYMENT.md

> **Audience:** John – the developer who has a working prototype of the **Freelance Finance Tracker** (Expo React Native app + FastAPI backend) and wants to move it to production.

---  

## What this app is
- **Mobile front‑end** – an Expo (React Native) app in `expo-app/` that runs on iOS, Android (and optionally web). It uses:
  - `expo-secure-store` for JWT storage  
  - `expo-image-picker` for receipt photos (camera + library fallback)  
  - `expo-sharing` to open the native share sheet for CSV/PDF export  
  - React Navigation (stack + bottom‑tab) for navigation  
- **API backend** – a FastAPI service in `backend/app/` that provides:
  - JWT auth (`/auth/signup`, `/auth/login`)  
  - CRUD for receipts & mileage (`/receipts`, `/mileage`)  
  - Dashboard summary (`/dashboard`)  
  - CSV/PDF export (`/export/csv`, `/export/pdf`)  
  - Serves media files under `/media/{filename}`  
- **Data** – persisted in PostgreSQL in production, SQLite (`sqlite:///./test.db`) in development. Receipt images are stored on the server under `MEDIA_ROOT` (default `./media`).

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
   Secure Store                         Managed DB
```

| Component | Path | Runtime | Port | Notes |
|-----------|------|---------|------|-------|
| Expo app | `expo-app/` | Expo Go / EAS Build | N/A (bundled) | Uses `process.env.API_URL` (default `http://localhost:8000`) |
| FastAPI | `backend/app/` | Python 3.12 (slim) | **8000** (dev) – **8080** (container) | Reads env vars `DATABASE_URL`, `JWT_SECRET_KEY`, `MEDIA_ROOT`, `FRONTEND_ORIGIN` |
| DB | – | PostgreSQL 15 (managed) | 5432 | `DATABASE_URL=postgresql://user:pwd@host:5432/dbname` |
| Media storage | `MEDIA_ROOT` inside container | Filesystem (or cloud bucket) | – | Served via `/media/{filename}` |

---  

## Prerequisites
| Tool | Minimum version | Install command |
|------|----------------|-----------------|
| **Git** | 2.30+ | `git clone <repo>` |
| **Docker** | 24+ | `brew install --cask docker` (mac) or `apt-get install docker.io` |
| **Docker Compose** (optional) | 2.20+ | `docker compose version` |
| **Python** | 3.11+ | `pyenv install 3.12 && pyenv global 3.12` |
| **Node** | 20+ | `brew install node` |
| **Expo CLI** | latest (`npm i -g expo-cli`) | |
| **EAS CLI** | latest (`npm i -g eas-cli`) | |
| **psql** (for local migrations) | any | `brew install libpq` |
| **Apple Developer / Google Play Console** | – | for app‑store submission |
| **GitHub (or GitLab) account** | – | for CI/CD |

---  

## Configuration and secrets
1. **Create a template** at the repo root: `.env.example`
   ```dotenv
   # FastAPI backend
   DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>
   JWT_SECRET_KEY=replace-with-strong-256bit-base64
   MEDIA_ROOT=./media                # change to a bucket mount point in prod
   FRONTEND_ORIGIN=https://app.myfinance.io   # UI origin for CORS

   # Expo (optional, for web builds)
   API_URL=https://api.myfinance.io   # production API endpoint
   ```
2. **Supply real values** on the host platform (Docker, Fly, Render, etc.) via its secret manager.  
   Example for Fly.io:
   ```bash
   fly secrets set \
     DATABASE_URL=postgresql://user:pwd@my-db.internal:5432/finance \
     JWT_SECRET_KEY=$(openssl rand -base64 32) \
     MEDIA_ROOT=/var/media \
     FRONTEND_ORIGIN=https://app.myfinance.io
   ```
3. **Local development** – copy the example to `backend/.env` (or export vars):
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
# 1️⃣ Install dependencies
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2️⃣ Run tests (add pytest if not present)
pip install pytest
pytest backend/tests/   # expects tests under backend/tests/
```

### Mobile app
```bash
cd expo-app

# 1️⃣ Install JS dependencies
npm ci

# 2️⃣ Run unit/integration tests
npm run test

# 3️⃣ Start Expo dev server (iOS/Android simulators)
npm run start   # shows QR codes for device
```

### Production build (EAS)
1. **Add `eas.json`** (to‑do – minimal example):
   ```json
   {
     "cli": { "version": ">=2.0.0" },
     "build": {
       "production": {
         "android": { "workflow": "managed" },
         "ios":     { "workflow": "managed" }
       }
     }
   }
   ```
2. Login & build:
   ```bash
   eas login
   eas build --profile production --platform all
   ```
3. Submit after credentials are configured:
   ```bash
   eas submit --platform ios     # Apple App Store Connect
   eas submit --platform android # Google Play Console
   ```

---  

## Deploy
### 1️⃣ Production Dockerfile (`backend/Dockerfile`) – **to‑do**
```Dockerfile
# ---- Build stage ----
FROM python:3.12-slim AS builder

# create non‑root user
RUN addgroup --system app && adduser --system --ingroup app app

# build deps
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# copy source
COPY backend/ .

# runtime dir for media
RUN mkdir -p /var/media && chown app:app /var/media

# ---- Runtime stage ----
FROM python:3.12-slim
ENV PATH="/opt/venv/bin:$PATH"
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app
COPY --from=builder /var/media /var/media
WORKDIR /app

# use non‑root
USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 2️⃣ Choose a hosting platform  
| Platform | Pros | Cons | Typical cost (USD/mo) |
|----------|------|------|-----------------------|
| **Fly.io** | Global edge, Docker ready, free tier (3 shared‑CPU VMs) | Small amount of persistent storage → need external bucket for media | $0 – $20 (free tier + optional managed Postgres) |
| **Render.com** | Managed Postgres, automatic HTTPS, simple UI | Slightly higher baseline price | $7 (free web) + $7 for starter Postgres |
| **Google Cloud Run** | Autoscaling to zero, fully managed, integrates with Cloud SQL | More GCP knowledge required | $0 – $30 (pay‑as‑you‑go + Cloud SQL) |
| **AWS ECS Fargate** | Fine‑grained scaling, IAM integration | More complex networking, higher base cost | $15 – $40 (depends on vCPU & memory) |

#### Example: Deploy to Fly.io
```bash
# install Fly CLI
curl -L https://fly.io/install.sh | sh

# login
fly auth login

# initialise the app (creates fly.toml)
fly launch \
  --copy-config \
  --name finance-mate-api \
  --region iad \
  --no-deploy

# set secrets (read from .env.example)
fly secrets set $(cat .env.example | grep -v '^#' | xargs)

# create a managed Postgres instance and attach it
fly postgres create --name finance-mate-db --region iad --initial-cluster-size 1
# copy the generated DATABASE_URL into Fly secrets
fly secrets set DATABASE_URL=$(fly postgres connect --url finance-mate-db)

# first deploy (builds Dockerfile)
fly deploy --remote-only
```
- `fly.toml` will expose port **8080** as declared in the Dockerfile.  

#### Example: Deploy to Render (no Docker)
1. **New Web Service** → point to `backend/` →  
   - **Build Command**: `pip install -r requirements.txt`  
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
2. **Add PostgreSQL** instance → copy its connection string into the service’s **Environment** tab (`DATABASE_URL`).  
3. Enable **Auto‑Deploy** from the Git repo.

### 3️⃣ Media storage – **to‑do**
Production should store receipt images in a durable object store (AWS S3, GCS, Azure Blob).  
- Add `boto3` (or `google-cloud-storage`) to `backend/requirements.txt`.  
- Replace the local‑disk save logic in `backend/app/main.py` with an upload to the bucket and store the resulting public/ signed URL in `image_path`.  
- Set `MEDIA_ROOT` to the bucket URL (e.g., `s3://finance-mate-receipts/`).  

### 4️⃣ Database migrations – **to‑do**
```bash
cd backend
pip install alembic
alembic init alembic          # creates alembic/ and alembic.ini
# edit alembic.ini: replace sqlalchemy.url with ${DATABASE_URL}
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```
Add `alembic upgrade head` as a step in the CI/CD pipeline before the new container starts.

---  

## Security checklist
- [ ] **TLS termination** – ensure the platform (Fly, Render, Cloud Run) provides HTTPS automatically.  
- [ ] **Secret management** – store `JWT_SECRET_KEY`, `DATABASE_URL`, `MEDIA_ROOT`, `FRONTEND_ORIGIN` in the platform’s secret store (never commit).  
- [ ] **Non‑root container user** – Dockerfile uses `USER app`.  
- [ ] **Health check** – Dockerfile includes `HEALTHCHECK` and `/health` endpoint.  
- [ ] **CORS restriction** – `FRONTEND_ORIGIN` env var limits allowed origins in `backend/app/main.py`.  
- [ ] **JWT hardening** – HS256 with a 256‑bit secret, expires in 30 days (`create_access_token`).  
- [ ] **Password hashing** – `passlib` with `pbkdf2_sha256`.  
- [ ] **Rate limiting / brute‑force protection** – **to‑do**: add `slowapi` middleware or configure at edge CDN.  
- [ ] **Database connection encryption** – use `sslmode=require` in the `DATABASE_URL` for cloud Postgres.  
- [ ] **File upload validation** – **to‑do**: verify MIME type, enforce size limits (e.g., ≤5 MiB), scan with ClamAV.  
- [ ] **Dependency updates** – run `npm audit` and `pip list --outdated` regularly; address CVEs.  
- [ ] **Content Security Policy** – **to‑do**: for optional Expo web build, configure CSP headers via reverse proxy (e.g., Fly edge).  
- [ ] **Backup strategy** – enable automated daily snapshots of the managed Postgres instance; test restores quarterly.  

---  

## Operations
| Area | What to monitor | How to set up |
|------|----------------|---------------|
| **API health** | `/health` returns 200, container restarts | Platform health checks (Fly, Render) or Cloud Run liveness probe |
| **CPU / Memory** | CPU > 70 % or RAM > 80 % for >5 min | Dashboard alerts; optional Slack/PagerDuty webhook |
| **Database** | Connections, replication lag (if applicable) | Managed DB console alerts |
| **Logs** | Structured JSON logs | Set `uvicorn --log-config` to JSON; forward to Logtail, Papertrail, or CloudWatch |
| **Error tracking** | Uncaught exceptions, 5xx responses | Add `sentry-sdk` to FastAPI (`sentry_sdk.init(dsn=…)`) and `@sentry/react-native` to Expo |
| **Media storage** | Bucket usage / quota | Enable alerts in S3/Google Cloud Storage console |
| **SSL cert renewal** | Automatic via platform | No manual action if using Fly/Render/Cloud Run |
| **Backup verification** | Successful DB dump & restore | Daily `pg_dump $DATABASE_URL > backup_$(date +%F).sql`; store in a secure bucket and run a restoration test monthly |

### Routine operational tasks
```bash
# Pull latest Docker image (Fly)
fly deploy --remote-only

# Run DB migrations (once Alembic is added)
docker run --rm \
  -e DATABASE_URL=$DATABASE_URL \
  finance-mate-backend alembic upgrade head

# Verify latest DB backup
pg_dump $DATABASE_URL > backup_$(date +%F).sql
# upload backup_*.sql to protected bucket (e.g., s3://finance-mate-backups/)
```

---  

## CI/CD
A GitHub Actions workflow (`.github/workflows/ci.yml`) that builds, tests, containers, and deploys:

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
      - name: Setup Python
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
      - name: Build & push image
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

  mobile-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - name: Install npm deps
        run: cd expo-app && npm ci
      - name: Run Jest tests
        run: cd expo-app && npm run test

  mobile-build:
    runs-on: macos-latest
    needs: mobile-test
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - name: Install dependencies
        run: cd expo-app && npm ci
      - name: Install EAS CLI
        run: npm i -g eas-cli
      - name: Login to EAS
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
        run: eas login --token $EXPO_TOKEN
      - name: Build production binaries
        run: cd expo-app && eas build --profile production --platform all
```

*Swap the `deploy-fly` step with Render (`render deploy`) or Cloud Run (`gcloud run deploy`) as needed.*

---  

## Costs
| Item | Low‑end (Free/Starter) | Mid‑range (Typical) | High‑end (Scalable) |
|------|------------------------|---------------------|----------------------|
| **FastAPI hosting** | Fly free tier (3 shared VMs) – $0 | Render Free Web + $7 Postgres starter | GCP Cloud Run (pay‑as‑you‑go) ≈ $15‑$30 |
| **PostgreSQL** | Fly managed DB free tier (≤5 GB) | Render Postgres Starter $7 | Cloud SQL (HA) $30‑$80 |
| **Media bucket** | Local `MEDIA_ROOT` – $0 | AWS S3 Standard 20 GB ≈ $0.5 | S3 + CloudFront CDN $5‑$10 |
| **CI/CD** | GitHub Actions free (2 k jobs/mo) | Same + optional self‑hosted runner | Enterprise tier / extra minutes |
| **EAS Build** | 100 min free/mo; $0.13/min thereafter | $25/mo (EAS Build) | $100+/mo for parallel builds |
| **Monitoring / Sentry** | Free tier (5 k events) | $29/mo (20 k events) | $199/mo (200 k events) |
| **Total estimate** | **≈ $0‑$15/mo** | **≈ $60‑$120/mo** | **≈ $300+/mo** |

---  

## Before production
> The following items are **must‑do** before a public launch. Address them in the listed order (most important first).

1. ✅ **Add a production‑ready Dockerfile** (non‑root user, health check) – already drafted, just commit.  
2. ✅ **Implement database migrations** with Alembic and integrate them into the CI/CD pipeline.  
3. ✅ **Move receipt image storage to a durable cloud bucket** (S3, GCS, or Azure) and secure with signed URLs.  
4. ✅ **Harden file uploads** – validate MIME type, enforce size limits (e.g., ≤5 MiB), and optionally scan with ClamAV.  
5. ✅ **Add rate‑limiting / brute‑force protection** on auth routes (e.g., `slowapi` or edge‑CDN limits).  
6. ✅ **Configure structured logging and error tracking** (Sentry for backend & Expo).  
7. ✅ **Enable automated backups** of the PostgreSQL instance and test restore procedures.  
8. ✅ **Create and commit `eas.json`** with proper build profiles and set up signing credentials for iOS/Android store submission.  
9. ✅ **Perform a full security audit of the deployed environment** (TLS certs, firewall rules, least‑privilege IAM roles).  
10. ✅ **Run end‑to‑end smoke tests** against the live API (Postman/Newman or pytest + httpx) to verify auth, receipt upload, mileage entry, dashboard, and export flows.  

Once these steps are completed, the Freelance Finance Tracker will be ready for a production release. Good luck, John! 🚀
