# DEPLOYMENT.md

## What this app is
`freelance-finance-tracker-2` is a **FastAPI‑based web service** that lets registered users upload, download and delete financial CSV/Excel files.  
Key features implemented in this version:

| Feature | Implementation |
|---------|----------------|
| JWT authentication (`/token`, `/users`) | `app/auth.py`, `app/routers/auth.py` |
| File uploads with size limit (5 MiB) | `app/routers/upload.py` |
| Secure storage (UUID filenames, `UPLOAD_DIR`) | `app/routers/upload.py` |
| Rate limiting on token & upload endpoints | `slowapi` (`app/limit.py`) |
| Password hashing with bcrypt | `passlib` in `app/auth.py` |
| SQLite dev database (`DATABASE_URL=sqlite:///./app.db`) | `app/database.py` |

The service is intended to run behind HTTPS, store data in a managed PostgreSQL instance, and be deployed as a container.

---

## Architecture
```
┌─────────────────────────────────────────────┐
│                 Client (Web)               │
│  - Sends JSON to /token, /users, /uploads   │
│  - Authenticated requests use Bearer JWT    │
└─────────────────────▲───────────────────────┘
                      │
        HTTPS (TLS)  │  (reverse‑proxy / platform HTTPS)
                      │
┌─────────────────────▼───────────────────────┐
│          FastAPI Application (Uvicorn)      │
│  - app/main.py (FastAPI instance)           │
│  - routers: auth, upload                    │
│  - auth.py (JWT utils, password hashing)   │
│  - limit.py (slowapi rate limiter)          │
│  - models.py (SQLAlchemy ORM)               │
│  - database.py (SQLAlchemy engine)          │
│  - env vars (JWT_*, DATABASE_URL, UPLOAD_DIR)│
└───────────────▲─────────────────────────────┘
                │
                │ SQLAlchemy (async / sync)
                ▼
   ┌─────────────────────────────────────┐
   │   Managed PostgreSQL (e.g. Fly.io) │
   └─────────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────┐
   │   Persistent volume for file blobs │
   │   (mounted to /app/uploaded_files) │
   └─────────────────────────────────────┘
```

---

## Prerequisites
| Item | Command / Note |
|------|----------------|
| **Python** (>=3.11) | `python3 -m venv .venv && source .venv/bin/activate` |
| **Poetry / pip** (to install deps) | `pip install -r requirements.txt` |
| **Docker** (for container build) | Install from <https://docs.docker.com/engine/install/> |
| **PostgreSQL client** (for migrations) | `apt-get install postgresql-client` (Ubuntu) |
| **Git** | `git clone …` |
| **Make** (optional) | `sudo apt-get install make` |
| **Secret manager access** (e.g. Fly.io secrets) | See “Configuration and secrets” |

---

## Configuration and secrets
| Variable | Description | Default / Example | Where to set |
|----------|-------------|--------------------|--------------|
| `JWT_SECRET_KEY` | HMAC secret for signing JWTs | **must be a random 32‑byte base64 string** | Fly.io secrets (`flyctl secrets set JWT_SECRET_KEY=…`) |
| `JWT_ALGORITHM` | Fixed to `HS256` (hard‑coded) – **do not change** | `HS256` | Not needed |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `60` | Fly.io secrets (`ACCESS_TOKEN_EXPIRE_MINUTES=60`) |
| `DATABASE_URL` | SQLAlchemy DB URL | `postgresql+psycopg2://user:pass@host:5432/dbname` | Fly.io secrets |
| `UPLOAD_DIR` | Directory inside the container to store uploads | `uploaded_files` (relative) | Fly.io secrets – must be a **relative path without “..”** |
| `PORT` | Port on which uvicorn should listen (used by many platforms) | `8000` | Platform config (e.g., Fly.toml) |

**Validation at startup**  
`app/auth.py` already raises a `RuntimeError` if `JWT_SECRET_KEY` is missing.  
Add a **TODO** in `app/main.py` to validate `UPLOAD_DIR`:

```python
# TODO: Validate UPLOAD_DIR is a safe relative path
if ".." in UPLOAD_DIR or os.path.isabs(UPLOAD_DIR):
    raise RuntimeError("UPLOAD_DIR must be a relative, safe directory")
```

---

## Build and test
```bash
# 1. Install deps
pip install -r requirements.txt

# 2. Run DB migrations (TODO – see Deploy section)
# Example with Alembic:
# alembic upgrade head

# 3. Run unit / integration tests
pytest -q   # assumes tests/ exist

# 4. Lint & static analysis
ruff check .
semgrep scan --config auto

# 5. Build Docker image
docker build -t freelance-finance-tracker:latest .
```

**Dockerfile (production – to‑do)**  
Create `Dockerfile` at the repo root:

```dockerfile
# TODO: Add production Dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
# Create non‑root user
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .
RUN chown -R app:app /app
USER app

# Environment
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Deploy
Below are two practical hosting paths; choose one that matches budget and operational preferences.

### 1️⃣ Fly.io (recommended for quick dev → prod)

1. **Install Fly CLI**  
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Initialize the app** (run inside the repo)  
   ```bash
   fly launch \
     --name freelance-finance-tracker \
     --region iad \
     --dockerfile ./Dockerfile \
     --internal-port 8000 \
     --ha=false   # single instance for now
   ```

3. **Set secrets** (replace `<random‑base64>` and DB URL with real values)  
   ```bash
   fly secrets set JWT_SECRET_KEY=<random-base64>
   fly secrets set ACCESS_TOKEN_EXPIRE_MINUTES=60
   fly secrets set DATABASE_URL=postgresql://user:pass@flypg.example.com:5432/fintracker
   fly secrets set UPLOAD_DIR=uploaded_files
   ```

4. **Add a managed PostgreSQL volume**  
   ```bash
   fly pg create freelance-finance-tracker-pg --region iad --initial-cluster-size=1
   fly pg attach freelance-finance-tracker-pg
   ```

5. **Run migrations** (once)  
   ```bash
   fly ssh console -C "alembic upgrade head"
   ```

6. **Deploy**  
   ```bash
   fly deploy
   ```

7. **Health check** – Fly automatically pings `/health`. Add a simple endpoint:

   ```python
   # in app/main.py
   @app.get("/health")
   async def health():
       return {"status": "ok"}
   ```

### 2️⃣ Render (alternative)

- Create a **Web Service** with Docker, set the same env vars in the Render dashboard, and enable **Auto‑Deploy** from the GitHub repo.
- Add a **PostgreSQL** managed instance, connect via `DATABASE_URL`.
- Render automatically provisions HTTPS and health checks (`/health`).

### 3️⃣ Google Cloud Run / AWS ECS Fargate

- Push the Docker image to **Artifact Registry** (GCP) or **ECR** (AWS).
- Create a **Cloud Run** service (or **Fargate task**) with the same env vars, attach a **CloudSQL** (Postgres) connection, enable **HTTPS**.
- For Cloud Run, set `--port $PORT` (environment variable passed automatically).

---

## Security checklist
- [ ] **Rate limiting** on download & delete endpoints (`GET /uploads/{file_id}`, `DELETE /uploads/{file_id}`) – add `@limiter.limit("5/minute")`.
- [ ] **Sanitize `UPLOAD_DIR`** – reject values containing `..` or absolute paths; enforce a sub‑directory inside the container.
- [ ] **Hide internal error details** – replace raw exception messages with generic `"Failed to save upload"` / `"Failed to delete file"` and log the traceback.
- [ ] **Validate JWT `sub` claim** – ensure it is an integer string before casting; return 401 on malformed tokens.
- [ ] **Health endpoint** (`/health`) returns 200 OK without leaking info.
- [ ] **Non‑root container user** – Dockerfile uses `app` user.
- [ ] **TLS termination** – enforced by platform (Fly.io, Render, Cloud Run, etc.).
- [ ] **Secret storage** – all secrets loaded from platform secret manager, never committed.
- [ ] **Database migrations** – run in CI/CD before deployment (`alembic upgrade head` or similar).
- [ ] **Backup strategy** – enable automated backups for managed Postgres (Fly.io/Render/CloudSQL).
- [ ] **Structured logging** – configure uvicorn JSON logs (`--log-config uvicorn_logging.json` in Docker CMD if desired).
- [ ] **Monitoring / alerts** – set up Prometheus + Grafana or platform‑native metrics (Fly.io metrics, Render health alerts).

---

## Operations
| Concern | Recommended implementation |
|---------|-----------------------------|
| **Logging** | Use `uvicorn[standard]` with JSON log format. Add a `logging.yml` and point `uvicorn` via `--log-config`. |
| **Metrics** | Install `prometheus-fastapi-instrumentator` and expose `/metrics`. |
| **Health checks** | `/health` endpoint (see Deploy). |
| **Scaling** | Fly.io auto‑scales vCPU/memory; set `fly.toml` `autoscale = { min_processes = 1, max_processes = 3 }`. |
| **Backups** | Enable daily snapshots on managed Postgres (Fly.io or Render provide one‑click). Store upload volume snapshots via Fly.io volume backups. |
| **Disaster recovery** | Document `fly backup restore` steps; keep SQL dump in S3/GS for extra safety. |
| **Alerting** | Platform alerts on health‑check failures, high CPU, or rate‑limit breach. |
| **File retention policy** | (TODO) Add a cron job or background task to purge files older than X days. |
| **Audit logging** | Record every upload/download/delete with user ID, timestamp, and file ID in a separate `audit` table. |

---

## CI/CD
The following GitHub Actions workflow (`.github/workflows/ci-cd.yml`) is a solid starting point:

```yaml
name: CI / CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install deps
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest -q
      - name: Lint
        run: ruff check .
      - name: Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to Fly.io Container Registry
        run: |
          curl -L https://fly.io/install.sh | sh
          fly auth login --access-token ${{ secrets.FLY_API_TOKEN }}
      - name: Build & push Docker image
        run: |
          docker build -t registry.fly.io/freelance-finance-tracker:latest .
          docker push registry.fly.io/freelance-finance-tracker:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Fly.io
        run: |
          fly deploy --app freelance-finance-tracker --image registry.fly.io/freelance-finance-tracker:latest
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

## Costs
| Component | Approx. monthly cost (USD) | Notes |
|-----------|---------------------------|-------|
| **Fly.io VM (shared‑cpu‑2x)** | $5 – $15 | 1 vCPU, 256 MiB RAM; sufficient for low traffic. |
| **Fly.io Managed PostgreSQL (small)** | $15 – $30 | 1 vCPU, 1 GiB RAM, 20 GB storage; includes automatic backups. |
| **Fly.io Volume for uploads (10 GB)** | $0.10 / GB → ≈ $1 | Persistent disk attached to the VM. |
| **Render Standard instance** | $7 – $25 | Comparable to Fly.io; includes free TLS. |
| **Google Cloud Run** | $10 – $100 (depends on request volume & memory) | Pay‑as‑you‑go; add CloudSQL Postgres $15 – $50. |
| **AWS ECS Fargate** | $20 – $150 (task + RDS) | More complex, higher baseline cost. |
| **Domain registration & DNS** | $10 – $15 | One‑year registration for a custom domain. |
| **Observability (optional SaaS)** | $0 – $50 | e.g., Datadog, New Relic, or free Grafana Cloud for metrics/logs. |

*Recommendation*: Start with Fly.io’s free tier (1 GB RAM, 3 GB storage) for prototyping, then upgrade to a paid plan once usage grows.

## Before production
The current repository is a **development prototype**. The most critical gaps that must be resolved before handling real user data are:

1. **Production Dockerfile** – add the production Dockerfile (non‑root user, health check, minimal layers) as described in the “Deploy” section.
2. **Managed PostgreSQL** – replace the SQLite dev DB with a hosted PostgreSQL instance; add Alembic (or similar) migration scripts and ensure migrations run on each deploy.
3. **Rate limiting on download & delete** – apply `@limiter.limit("5/minute")` (or a global policy) to `GET /uploads/{file_id}` and `DELETE /uploads/{file_id}`.
4. **Sanitize `UPLOAD_DIR`** – validate that the environment variable is a safe relative path (no `..` or absolute paths) at startup; reject unsafe values.
5. **Generic error responses** – stop leaking internal exception messages; log the full traceback internally and return a user‑friendly message like `"Failed to save upload"` or `"Failed to delete file"`.
6. **Validate JWT `sub` claim** – ensure the claim is an integer string before converting; raise `HTTPException 401` on malformed tokens.
7. **Health endpoint** – implement `/health` returning `{ "status": "ok" }` for platform liveness probes.
8. **Structured JSON logging & metrics** – configure `uvicorn` to emit JSON logs; expose Prometheus metrics (`/metrics`) via `prometheus-fastapi-instrumentator`.
9. **Backup & restore procedures** – enable automated snapshots for the managed Postgres instance and Fly.io volume; document restore steps.
10. **File retention / purge policy** – add a periodic task (e.g., Celery beat, APScheduler) to delete files older than a configurable TTL.
11. **CI/CD pipeline hardened** – ensure migrations run before the container starts, secrets are never written to the image, and the pipeline fails on any lint/security issue.
12. **Domain & TLS** – configure a custom domain (e.g., `finance.example.com`) and let the platform provision free TLS certificates.
13. **Load testing** – run a simple load test (e.g., `locust` or `k6`) to verify the service can handle expected concurrent uploads/downloads.
14. **Runbooks & documentation** – write operational runbooks for scaling, incident response, and backup restoration.

Addressing items **1‑6** is the **minimum** required for a secure production launch. The remaining items are best‑practice hardening steps that should be implemented before the service goes live for real users.
