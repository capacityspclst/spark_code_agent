# DEPLOYMENT.md

> **Audience:** John — the developer who has a working prototype of **Freelance Finance Tracker** (Expo React Native app + FastAPI backend) and wants to push it to production.

---  

## What this app is
- **Mobile front‑end** – an Expo (React Native) app in `expo-app/` that runs on iOS and Android. It uses:
  - `expo-secure-store` for JWT storage on device
  - `expo-image-picker` for receipt photos (camera or library fallback)
  - `expo-sharing` to open the native share sheet for CSV/PDF export
  - React Navigation (stack) for navigation flow
- **API backend** – a FastAPI service in `backend/app/` that provides:
  - JWT auth (`/auth/signup`, `/auth/login`)
  - CRUD for receipts (`/receipts`) and mileage (`/mileage`)
  - Dashboard summary (`/dashboard`)
  - CSV/PDF export (`/export/csv`, `/export/pdf`)
  - A protected `/media/{filename}` endpoint that serves receipt images (to be hardened for prod)
- **Data layer** – PostgreSQL in production, SQLite (`sqlite:///./test.db`) for local dev and tests. Receipt images are stored under `MEDIA_ROOT` (default `./media`).

---  

## Architecture
```
+-------------------+          HTTPS          +-------------------+
|   Expo app (iOS)  | <---------------------> |   FastAPI API    |
|   Expo app (Android)               |   (Docker)       |
|   Expo web (optional)              |   - PostgreSQL   |
+-------------------+          (REST)       +-------------------+
        |                                   |
        |  API_URL (env var)                |
        v                                   v
   Secure Store                     Managed DB (Postgres)
```

| Component | Path                | Runtime                     | Port                          | Notes |
|-----------|---------------------|-----------------------------|------------------------------|-------|
| Expo app  | `expo-app/`         | Expo Go / EAS Build         | N/A (bundled)                 | `process.env.API_URL` defaults to `http://localhost:8000` |
| FastAPI   | `backend/app/`      | Python 3.12 (sl slim)       | **8000** (dev) – **8080** (container) | Reads `DATABASE_URL`, `JWT_SECRET_KEY`, `MEDIA_ROOT`, `FRONTEND_ORIGIN` |
| DB        | –                   | PostgreSQL 15 (managed)     | **5432**                     | `DATABASE_URL=postgresql://user:pwd@host:5432/dbname` |
| Media     | `MEDIA_ROOT` (container) | Filesystem or cloud bucket | –                            | Served via `/media/{filename}` (replace with signed URLs in prod) |

---  

## Prerequisites
| Tool | Minimum version | Install command |
|------|-----------------|-----------------|
| Git | 2.30+ | `git clone <repo>` |
| Docker | 24+ | macOS: `brew install --cask docker` or Linux: `sudo apt-get install docker.io` |
| Docker Compose (optional) | 2.20+ | `docker compose version` |
| Python | 3.11+ | `pyenv install 3.12 && pyenv global 3.12` |
| Node | 20+ | `brew install node` |
| Expo CLI | latest (`npm i -g expo-cli`) | – |
| EAS CLI | latest (`npm i -g eas-cli`) | – |
| PostgreSQL client (`psql`) | any | `brew install libpq` |
| Apple Developer / Google Play Console | – | required for app‑store submission |
| GitHub (or GitLab) account | – | CI/CD integration |

---  

## Configuration and secrets
1. **Template** – create `.env.example` at the repository root:
   ```dotenv
   # FastAPI backend
   DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>
   JWT_SECRET_KEY=replace-with-strong-256bit-base64
   MEDIA_ROOT=./media               # change to a bucket URL in prod
   FRONTEND_ORIGIN=https://app.myfinance.io   # CORS allowed origin

   # Expo (web builds only)
   API_URL=https://api.myfinance.io
   ```
2. **Local dev** – copy the example to `backend/.env` (or export the variables) and source it before running the server:
   ```dotenv
   DATABASE_URL=sqlite:///./test.db
   JWT_SECRET_KEY=dev-secret
   FRONTEND_ORIGIN=http://localhost:19006
   ```
   ```bash
   source backend/.env
   ```
3. **Platform secret manager** – set the same variables on the hosting platform (example for Fly.io):
   ```bash
   fly secrets set \
     DATABASE_URL=postgresql://user:pwd@my-db.internal:5432/finance \
     JWT_SECRET_KEY=$(openssl rand -base64 32) \
     MEDIA_ROOT=/var/media \
     FRONTEND_ORIGIN=https://app.myfinance.io
   ```

---  

## Build and test
### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # fastapi, uvicorn[standard], sqlalchemy, pydantic[email], python-multipart, pyjwt, python-dotenv, reportlab, passlib, slowapi, pillow
pip install pytest                      # test runner
pytest backend/tests/                   # unit & integration tests
```

### Mobile app
```bash
cd expo-app
npm ci                                   # installs deps from package.json
npm run test                             # Jest + React Native Testing Library
npm run start                             # starts Expo dev server (QR code)
```

### Production build (EAS)
1. **Add `eas.json`** – **to‑do** (minimal example):
   ```json
   {
     "cli": { "version": ">=2.0.0" },
     "build": {
       "production": {
         "android": { "workflow": "managed" },
         "ios":    { "workflow": "managed" }
       }
     }
   }
   ```
2. Login & build:
   ```bash
   eas login
   eas build --profile production --platform all
   ```
3. Submit (after configuring signing credentials):
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

---  

## Deploy
### 1️⃣ Production Dockerfile (`backend/Dockerfile`) – **to‑do**
```Dockerfile
# ---- Build stage -------------------------------------------------
FROM python:3.12-slim AS builder

# create non‑root user
RUN addgroup --system app && adduser --system --ingroup app app

# build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# copy source
COPY backend/ .

# runtime media dir (will be overridden by bucket mount in prod)
RUN mkdir -p /var/media && chown app:app /var/media

# ---- Runtime stage -----------------------------------------------
FROM python:3.12-slim
ENV PATH="/opt/venv/bin:$PATH"

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app
COPY --from=builder /var/media /var/media

WORKDIR /app
USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 2️⃣ Choose a hosting platform
| Platform | Pros | Cons | Typical monthly cost |
|----------|------|------|----------------------|
| **Fly.io** | Global edge, native Docker support, free tier (3 shared‑CPU VMs) | Small persistent storage → need external bucket for media | $0 – $20 (free tier + optional managed Postgres) |
| **Render.com** | Managed Postgres, automatic HTTPS, simple UI | Slightly higher baseline price | $7 (free web) + $7 for starter Postgres |
| **Google Cloud Run** | Autoscaling to zero, fully managed, Cloud SQL integration | More GCP knowledge required | $0 – $30 (pay‑as‑you‑go + Cloud SQL) |
| **AWS ECS Fargate** | Fine‑grained scaling, IAM integration | More complex networking, higher base cost | $15 – $40 (depends on vCPU & memory) |

#### Example: Deploy to Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Initialise the app (creates fly.toml)
fly launch \
  --copy-config \
  --name finance-mate-api \
  --region iad \
  --no-deploy

# Set secrets (read from .env.example)
fly secrets set $(cat .env.example | grep -v '^#' | xargs)

# Create a managed Postgres instance and attach it
fly postgres create --name finance-mate-db --region iad --initial-cluster-size 1
fly secrets set DATABASE_URL=$(fly postgres connect --url finance-mate-db)

# First deploy (Dockerfile is built remotely)
fly deploy --remote-only
```
`fly.toml` will expose **port 8080** as declared in the Dockerfile.

#### Example: Deploy to Render (no Dockerfile needed)
1. **New Web Service** → point to `backend/`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
2. **Add PostgreSQL** → copy its connection string into the service **Environment** tab (`DATABASE_URL`).
3. Enable **Auto‑Deploy** from the Git repo.

### 3️⃣ Media storage – **to‑do**
Production should store receipt images in a durable object store (S3, GCS, Azure Blob) instead of the local filesystem.

```bash
# Add AWS SDK (or GCS SDK) to the backend
pip install boto3          # for S3
# or
pip install google-cloud-storage
```

Create a new module `backend/app/storage.py` (or extend `main.py`) that:
- uploads the received file to the bucket,
- stores the signed URL in `Receipt.image_path`,
- reads `MEDIA_ROOT` as the bucket URL (e.g. `s3://finance-mate-receipts/`).

Update the `/receipts` endpoint to use this storage helper instead of writing to the local `MEDIA_ROOT`.

### 4️⃣ Database migrations – **to‑do**
```bash
cd backend
pip install alembic
alembic init alembic                 # creates alembic/ and alembic.ini
# In alembic.ini replace sqlalchemy.url with ${DATABASE_URL}
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```
Add `alembic upgrade head` as a pre‑start step in the CI/CD pipeline (see below).

---  

## Security checklist
> Tick each box once the corresponding mitigation is implemented and verified in the production environment.

- [ ] **TLS termination** – ensure the platform (Fly, Render, Cloud Run) provides automatic HTTPS.
- [ ] **Secret management** – store `JWT_SECRET_KEY`, `DATABASE_URL`, `MEDIA_ROOT`, `FRONTEND_ORIGIN` in the platform’s secret manager (never commit plaintext).
- [ ] **Non‑root container user** – Dockerfile uses `USER app`.
- [ ] **Health check** – Dockerfile includes `HEALTHCHECK` and `/health` endpoint.
- [ ] **CORS restriction** – `FRONTEND_ORIGIN` env var restricts origins in `backend/app/main.py`.
- [ ] **JWT hardening** – HS256 with a 256‑bit secret, 30‑day expiry (`create_access_token`).
- [ ] **Password hashing** – `passlib` with `pbkdf2_sha256`.
- [ ] **Rate limiting / brute‑force protection** – `slowapi` middleware added; verify limits (`5/minute` signup, `10/minute` login, etc.).
- [ ] **Database connection encryption** – use `sslmode=require` in production `DATABASE_URL`.
- [ ] **File upload validation** – **to‑do**: enforce size ≤ 5 MiB, allow only `image/jpeg`/`image/png`, limit pixel count (`Image.MAX_IMAGE_PIXELS = 10_000_000`) and optionally scan with ClamAV.
- [ ] **Secure `/media/{filename}` endpoint** – **to‑do**: replace with signed URLs from the object store; keep current ownership checks as a fallback.
- [ ] **Security HTTP headers** – `SecurityHeadersMiddleware` injects `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`.
- [ ] **Dependency updates** – run `npm audit` & `pip list --outdated`; upgrade or replace:
  - `braces` 3.0.3 – **to‑do**: wait for a patched version or replace.
  - `node‑forge` 1.4.0 – **to‑do**: replace with `@stablelib` or Web Crypto API.
  - `decode-uri-component` 0.2.2 – upgrade to `>=0.5.0`.
  - `uuid` 7.0.3 – upgrade to `>=11.1.1`.
  - `sprintf-js` 1.0.3 – replace with native template literals.
- [ ] **Web token storage (Expo web)** – **to‑do**: use httpOnly, Secure cookies instead of AsyncStorage/local storage.
- [ ] **OpenAPI schema exposure** – **to‑do**: keep `openapi_url=None` (already set) or protect behind auth/IP whitelist.
- [ ] **Signup email enumeration** – **to‑done**: generic success message already implemented.
- [ ] **Backup strategy** – enable automated daily snapshots of the managed PostgreSQL instance; test restores quarterly.
- [ ] **Logging & monitoring** – configure JSON logs (`uvicorn --log-config uvicorn_logging.json`) and forward to a log service (Logtail, Papertrail, CloudWatch).
- [ ] **Error tracking** – add `sentry-sdk` to FastAPI and `@sentry/react-native` to Expo (add to `requirements.txt` / `package.json` and init in code).

---  

## Operations
| Area | What to monitor | How to set up |
|------|----------------|---------------|
| **API health** | `/health` returns `200`, container restarts | Platform health checks (Fly, Render) or Cloud Run liveness probe |
| **CPU / Memory** | CPU > 70 % or RAM > 80 % for >5 min | Dashboard alerts; optional Slack/PagerDuty webhook |
| **Database** | Connections, replication lag (if any) | Managed DB console alerts |
| **Logs** | Structured JSON logs | `uvicorn --log-config uvicorn_logging.json`; forward to Logtail / Papertrail / CloudWatch |
| **Error tracking** | Uncaught exceptions, 5xx responses | `sentry-sdk.init(dsn=…)` in FastAPI; `@sentry/react-native` in Expo |
| **Media storage** | Bucket usage / quota | Enable alerts in S3 / GCS console |
| **SSL cert renewal** | Automatic via platform | No manual action needed if using Fly/Render/Cloud Run |
| **Backups** | Successful DB dump & restore | Daily `pg_dump $DATABASE_URL > backup_$(date +%F).sql`; store in a protected bucket; run a restore test monthly |

### Routine operational tasks
```bash
# Pull latest container image (Fly)
fly deploy --remote-only

# Run DB migrations (once Alembic is added)
docker run --rm \
  -e DATABASE_URL=$DATABASE_URL \
  finance-mate-backend alembic upgrade head

# Verify latest DB backup
pg_dump $DATABASE_URL > backup_$(date +%F).sql
# Upload backup_*.sql to a protected bucket (e.g., s3://finance-mate-backups/)
```

---  

## CI/CD
A GitHub Actions workflow (`.github/workflows/ci.yml`) that builds, tests, containers, and deploys.

```yaml
name: CI / CD

on:
  push:
    branches: [main]
  pull_request:

jobs:
  # ---------- Backend ----------
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install deps & run tests
        run: |
          python -m venv .venv
          source .venv/bin/activate
          pip install -r backend/requirements.txt pytest
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

  # ---------- Mobile ----------
  mobile-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - name: Install JS deps
        run: cd expo-app && npm ci
      - name: Run Jest tests
        run: cd expo-app && npm run test

  mobile-build:
    needs: mobile-test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - name: Install JS deps
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

*Swap the `deploy-fly` step with a Render or Cloud Run deployment step as needed.*

---  

## Costs
| Item | Low‑end (Free/Starter) | Mid‑range (Typical) | High‑end (Scalable) |
|------|------------------------|---------------------|----------------------|
| **FastAPI hosting** | Fly free tier (3 shared‑CPU VMs) ≈ $0 | Render Free Web + $7 Postgres starter | GCP Cloud Run ≈ $15‑$30 (pay‑as‑you‑go + Cloud SQL) |
| **PostgreSQL** | Fly managed DB free tier (≤ 5 GB) | Render Postgres Starter $7 | Cloud SQL HA $30‑$80 |
| **Media bucket** | Local `MEDIA_ROOT` ≈ $0 | AWS S3 Standard 20 GB ≈ $0.5 | S3 + CloudFront CDN ≈ $5‑$10 |
| **CI/CD** | GitHub Actions free (2 k min/mo) | Same + optional self‑hosted runner | Enterprise tier / extra minutes |
| **EAS Build** | 100 min free/mo; $0.13/min thereafter | $25/mo (EAS Build) | $100+/mo for parallel builds |
| **Monitoring / Sentry** | Free tier (5 k events) | $29/mo (20 k events) | $199/mo (200 k events) |
| **Total estimate** | **≈ $0‑$15 /mo** | **≈ $60‑$120 /mo** | **≈ $300+ /mo** |

---  

## Before production
> Items are ordered by criticality – address them **before** a public launch.

1. **✅ Replace local `/media/{filename}` storage** – integrate S3/GCS signed‑URL storage (see “Media storage” section).  
2. **✅ Add file‑upload validation** – enforce size, MIME type, pixel limits, and (optionally) ClamAV scanning.  
3. **✅ Implement full rate‑limiting** – audit every unauthenticated endpoint and add appropriate `limiter.limit` rules.  
4. **✅ Confirm security headers** – verify they appear in production responses (`curl -I <url>`).  
5. **✅ Set up Alembic migrations** – generate initial schema migration and ensure CI runs `alembic upgrade head` before starting the service.  
6. **✅ Upgrade vulnerable npm dependencies** – replace `braces`, `node‑forge`; upgrade `decode-uri-component`, `uuid`; remove `sprintf-js`. Commit updated `package-lock.json`.  
7. **✅ Secure JWT storage on Expo web** – replace `expo-secure-store` usage with httpOnly, Secure cookies via a server‑set `Set-Cookie` header.  
8. **✅ Add Sentry error tracking** – add `sentry-sdk` init in `backend/app/main.py` and `@sentry/react-native` in the Expo app; verify events appear in the dashboard.  
9. **✅ Configure automated DB backups** – enable daily snapshots on the managed Postgres service; write a restore‑test script and schedule a monthly test run.  
10. **✅ Run end‑to‑end smoke tests** against a staging deployment (e.g., using Postman/Newman or `pytest‑httpx`) covering auth, receipt upload, mileage entry, dashboard, and export flows.  
11. **✅ Review firewall / IAM policies** – ensure the DB only allows connections from the container VPC, no public SSH, inbound traffic limited to 443 (HTTPS) only.  
12. **✅ Verify TLS certificates** – confirm platform‑provided certificates are valid and renew automatically.  
13. **✅ Perform a manual security audit** – run `npm audit`, `pip-audit`, and a quick penetration test on the staging URL.  

Once all the above are completed, **Freelance Finance Tracker** will be ready for a secure, production‑grade release. Good luck, John! 🚀
